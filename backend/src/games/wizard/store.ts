import { randomUUID } from "node:crypto";
import { createWizardDeck, getCardLabel, optionalWizardCards, shuffleCards, suitLabels } from "./cards.js";
import {
  calculateRoundScore,
  determineTrickWinner,
  getEffectiveCard,
  getValidCardsForPlayer,
  validateCardPlay
} from "./rules.js";
import {
  type OptionalWizardCardKind,
  type PlayedWizardCard,
  type WizardCard,
  type WizardCreateGameInput,
  type WizardGame,
  type WizardGameListItem,
  type WizardGameSettings,
  type WizardGameView,
  type WizardLogEntryType,
  type WizardPendingEffect,
  type WizardPlayCardInput,
  type WizardPlayer,
  type WizardSuit,
  wizardSuits
} from "./types.js";

const games = new Map<string, WizardGame>();

const defaultSettings: WizardGameSettings = {
  maxPlayers: 6,
  enabledOptionalCards: optionalWizardCards,
  timeLimitSeconds: null,
  scoreboardVisibleDefault: true
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

const now = () => new Date().toISOString();

const createGameId = () => randomUUID().slice(0, 8);

const createLogId = () => randomUUID().slice(0, 10);

const createPlayId = () => randomUUID().slice(0, 12);

const inactiveGameTtlMs = 60 * 60 * 1000;

const suitSortOrder: Record<WizardSuit, number> = {
  red: 0,
  green: 1,
  blue: 2,
  yellow: 3
};

const maxRoundsByPlayerCount: Record<number, number> = {
  2: 30,
  3: 20,
  4: 15,
  5: 12,
  6: 10
};

const getMaxRoundsForPlayerCount = (playerCount: number) => maxRoundsByPlayerCount[playerCount] ?? 10;

const sortHandCards = (cards: WizardCard[]) =>
  cards.sort((left, right) => {
    const leftSuitOrder = left.suit ? suitSortOrder[left.suit] : 99;
    const rightSuitOrder = right.suit ? suitSortOrder[right.suit] : 99;

    if (leftSuitOrder !== rightSuitOrder) {
      return leftSuitOrder - rightSuitOrder;
    }

    const leftValue = typeof left.value === "number" ? left.value : 99;
    const rightValue = typeof right.value === "number" ? right.value : 99;

    if (leftValue !== rightValue) {
      return leftValue - rightValue;
    }

    return left.label.localeCompare(right.label, "de");
  });

const sortAllHands = (game: WizardGame) => {
  for (const player of game.players) {
    sortHandCards(player.hand);
  }
};

const pruneInactiveGames = () => {
  const cutoff = Date.now() - inactiveGameTtlMs;

  for (const [gameId, game] of games.entries()) {
    if (new Date(game.updatedAt).getTime() < cutoff) {
      games.delete(gameId);
    }
  }
};

const getStoredGame = (gameId: string) => {
  pruneInactiveGames();
  return games.get(gameId);
};

const inactivePruneInterval = setInterval(pruneInactiveGames, 60 * 1000);
inactivePruneInterval.unref();

const normalizeSettings = (input: WizardCreateGameInput | undefined): WizardGameSettings => {
  const enabledOptionalCards = input?.enabledOptionalCards?.filter((kind): kind is OptionalWizardCardKind =>
    optionalWizardCards.includes(kind as OptionalWizardCardKind)
  );
  const normalizedOptionalCards =
    enabledOptionalCards === undefined ? defaultSettings.enabledOptionalCards : [...new Set(enabledOptionalCards)];

  return {
    maxPlayers: clamp(input?.maxPlayers ?? defaultSettings.maxPlayers, 2, 6),
    enabledOptionalCards: normalizedOptionalCards,
    timeLimitSeconds:
      typeof input?.timeLimitSeconds === "number" && input.timeLimitSeconds > 0
        ? clamp(Math.round(input.timeLimitSeconds), 15, 3600)
        : null,
    scoreboardVisibleDefault: input?.scoreboardVisibleDefault ?? defaultSettings.scoreboardVisibleDefault
  };
};

const getPlayer = (game: WizardGame, username: string) =>
  game.players.find((player) => player.username.toLowerCase() === username.toLowerCase());

const getPlayerIndex = (game: WizardGame, username: string) =>
  game.players.findIndex((player) => player.username.toLowerCase() === username.toLowerCase());

const canControlPlayer = (game: WizardGame, player: WizardPlayer, username: string) => {
  if (player.username.toLowerCase() === username.toLowerCase()) {
    return true;
  }

  return (
    game.debugMode?.enabled === true &&
    game.debugMode.controllerUsername.toLowerCase() === username.toLowerCase() &&
    player.controlledByUsername?.toLowerCase() === username.toLowerCase()
  );
};

const getControlledPlayers = (game: WizardGame, username: string) =>
  game.players.filter((player) => canControlPlayer(game, player, username));

const resolveControlledPlayer = (
  game: WizardGame,
  username: string,
  requestedUsername?: string
) => {
  if (requestedUsername) {
    const requestedPlayer = getPlayer(game, requestedUsername);

    if (requestedPlayer && canControlPlayer(game, requestedPlayer, username)) {
      return requestedPlayer;
    }

    return undefined;
  }

  const directPlayer = getPlayer(game, username);

  if (directPlayer) {
    return directPlayer;
  }

  if (game.debugMode?.controllerUsername.toLowerCase() !== username.toLowerCase()) {
    return undefined;
  }

  if (game.status === "trumpSelection" && game.trumpChoicePendingFor) {
    return getPlayer(game, game.trumpChoicePendingFor);
  }

  if (game.status === "playing") {
    return game.players[game.activePlayerIndex];
  }

  if (game.status === "effect" && game.pendingEffect) {
    if (game.pendingEffect.type === "cloud" || game.pendingEffect.type === "witch") {
      return getPlayer(game, game.pendingEffect.username);
    }
  }

  if (game.status === "prediction") {
    return getControlledPlayers(game, username).find((player) => player.prediction === null);
  }

  return getControlledPlayers(game, username)[0];
};

const getNextPlayerIndex = (game: WizardGame, currentIndex: number) => (currentIndex + 1) % game.players.length;

const setUpdated = (game: WizardGame) => {
  game.updatedAt = now();
};

const addMessage = (
  game: WizardGame,
  message: string,
  details: {
    type?: WizardLogEntryType;
    emoji?: string;
    playerUsername?: string;
    winnerUsername?: string;
    card?: WizardCard;
    chosenSuit?: WizardSuit;
    scoreChanges?: Array<{
      username: string;
      delta: number;
      total: number;
    }>;
  } = {}
) => {
  game.messages = [
    {
      id: createLogId(),
      type: details.type ?? "system",
      emoji: details.emoji ?? "ℹ️",
      message,
      playerUsername: details.playerUsername,
      winnerUsername: details.winnerUsername,
      card: details.card,
      chosenSuit: details.chosenSuit,
      scoreChanges: details.scoreChanges,
      createdAt: now()
    },
    ...game.messages
  ].slice(0, 16);
};

const getJoinPath = (gameId: string) => `/private/games/wizard/join/${gameId}`;

const getPublicPendingEffect = (pendingEffect: WizardPendingEffect | null): WizardPendingEffect | null => {
  if (pendingEffect?.type !== "juggler") {
    return pendingEffect;
  }

  return {
    ...pendingEffect,
    selectedCardIds: Object.fromEntries(Object.keys(pendingEffect.selectedCardIds).map((username) => [username, "selected"]))
  };
};

const formatScoreDelta = (delta: number) => (delta >= 0 ? `+${delta}` : String(delta));

const hasActiveBomb = (game: WizardGame, trick: PlayedWizardCard[]) =>
  trick.some((playedCard, index) => index > 0 && !playedCard.effectSuppressed && getEffectiveCard(game, playedCard).kind === "bomb");

const drawRandomDeckCard = (game: WizardGame) => {
  if (!game.deck.length) {
    return null;
  }

  const cardIndex = Math.floor(Math.random() * game.deck.length);
  return game.deck.splice(cardIndex, 1)[0] ?? null;
};

const applyTrumpCard = (game: WizardGame, card: WizardCard | null) => {
  game.trumpCard = card;
  game.vampireCopyCard = card;
  game.trumpSuit = card?.suit ?? null;
};

const activateStartingWerewolf = (game: WizardGame, revealedTrumpCard: WizardCard | null) => {
  for (const player of game.players) {
    const werewolfIndex = player.hand.findIndex((card) => card.kind === "werewolf");

    if (werewolfIndex < 0) {
      continue;
    }

    const werewolf = player.hand.splice(werewolfIndex, 1)[0];

    if (!werewolf) {
      return false;
    }

    if (revealedTrumpCard) {
      player.hand.push(revealedTrumpCard);
    }

    sortHandCards(player.hand);
    game.trumpCard = werewolf;
    game.vampireCopyCard = werewolf;
    game.trumpSuit = null;
    game.trumpChoicePendingFor = player.username;
    addMessage(
      game,
      `Werwolf von ${player.username} wurde automatisch auf den Trumpfplatz gezogen und mit ${getCardLabel(revealedTrumpCard)} getauscht. ${player.username} bestimmt die Trumpffarbe vor der Vorhersage.`,
      {
        type: "trump",
        emoji: "🐺",
        playerUsername: player.username,
        card: werewolf
      }
    );
    return true;
  }

  return false;
};

const resetRoundPlayers = (players: WizardPlayer[]) => {
  for (const player of players) {
    player.hand = [];
    player.prediction = null;
    player.tricksWon = 0;
  }
};

const setTrumpFromCard = (
  game: WizardGame,
  card: WizardCard | null,
  chooserUsername: string,
  flexibleCardChooserUsername = chooserUsername
) => {
  applyTrumpCard(game, card);
  game.trumpChoicePendingFor = null;

  if (!card) {
    game.trumpSuit = null;
    addMessage(game, "Es wurde keine Trumpfkarte aufgedeckt.", { type: "trump", emoji: "🎨" });
    return;
  }

  if (card.suit) {
    game.trumpSuit = card.suit;
    addMessage(game, `${getCardLabel(card)} wurde aufgedeckt. ${suitLabels[card.suit]} ist Trumpf.`, {
      type: "trump",
      emoji: "🎨",
      card
    });
    return;
  }

  if (card.kind === "werewolf") {
    game.trumpSuit = null;
    game.trumpChoicePendingFor = chooserUsername;
    addMessage(game, `Werwolf wurde zu Rundenbeginn automatisch aktiviert. ${chooserUsername} bestimmt die Trumpffarbe vor der Vorhersage.`, {
      type: "trump",
      emoji: "🐺",
      playerUsername: chooserUsername,
      card
    });
    return;
  }

  if (card.kind === "juggler" || card.kind === "cloud") {
    game.trumpSuit = null;
    game.trumpChoicePendingFor = flexibleCardChooserUsername;
    addMessage(game, `${getCardLabel(card)} wurde aufgedeckt. ${flexibleCardChooserUsername} bestimmt die Trumpffarbe.`, {
      type: "trump",
      emoji: card.kind === "juggler" ? "🔁" : "☁️",
      playerUsername: flexibleCardChooserUsername,
      card
    });
    return;
  }

  if (card.kind === "wizard" || card.kind === "shapeshifter" || card.kind === "vampire") {
    game.trumpSuit = null;
    game.trumpChoicePendingFor = chooserUsername;
    addMessage(game, `${getCardLabel(card)} wurde aufgedeckt. ${chooserUsername} bestimmt die Trumpffarbe.`, {
      type: "trump",
      emoji: "🎨",
      playerUsername: chooserUsername,
      card
    });
    return;
  }

  game.trumpSuit = null;
  addMessage(game, `${getCardLabel(card)} wurde aufgedeckt. In dieser Runde gibt es keine Trumpffarbe.`, {
    type: "trump",
    emoji: "🚫",
    card
  });
};

const beginRound = (game: WizardGame) => {
  const baseDeck = createWizardDeck(game.settings);
  const shuffledDeck = shuffleCards(baseDeck);
  const cardsPerPlayer = game.roundNumber;
  const requiredCards = cardsPerPlayer * game.players.length;

  if (requiredCards > shuffledDeck.length) {
    game.status = "finished";
    addMessage(game, "Das Spiel ist beendet, weil nicht genug Karten für eine weitere Runde vorhanden sind.", {
      type: "round",
      emoji: "🏁"
    });
    return;
  }

  resetRoundPlayers(game.players);

  for (let cardIndex = 0; cardIndex < cardsPerPlayer; cardIndex += 1) {
    for (const player of game.players) {
      const nextCard = shuffledDeck.shift();

      if (nextCard) {
        player.hand.push(nextCard);
      }
    }
  }

  sortAllHands(game);

  game.deck = shuffledDeck;
  game.currentTrick = [];
  game.lastTrick = [];
  game.pendingEffect = null;
  game.dealerIndex = (game.roundNumber - 1) % game.players.length;
  game.leaderIndex = getNextPlayerIndex(game, game.dealerIndex);
  game.activePlayerIndex = game.leaderIndex;
  const revealedTrumpCard = game.deck.shift() ?? null;
  const werewolfActivated = activateStartingWerewolf(game, revealedTrumpCard);

  if (!werewolfActivated) {
    setTrumpFromCard(
      game,
      revealedTrumpCard,
      game.players[game.dealerIndex]?.username ?? game.ownerUsername,
      game.players[game.activePlayerIndex]?.username ?? game.ownerUsername
    );
  }
  game.status = game.trumpChoicePendingFor ? "trumpSelection" : "prediction";
  addMessage(game, `Runde ${game.roundNumber} beginnt. Jede Person erhält ${cardsPerPlayer} Karte(n).`, {
    type: "round",
    emoji: "🔄"
  });
};

const allPredictionsDone = (game: WizardGame) => game.players.every((player) => player.prediction !== null);

const startPlayingIfReady = (game: WizardGame) => {
  if (game.status === "prediction" && allPredictionsDone(game)) {
    game.status = "playing";
    game.activePlayerIndex = game.leaderIndex;
    addMessage(game, `${game.players[game.activePlayerIndex]?.username} eröffnet den ersten Stich.`, {
      type: "round",
      emoji: "▶️",
      playerUsername: game.players[game.activePlayerIndex]?.username
    });
  }
};

const finishRound = (game: WizardGame) => {
  const scoreChanges = game.players.map((player) => {
    const delta = calculateRoundScore(player.prediction ?? 0, player.tricksWon);
    player.score += delta;

    return {
      username: player.username,
      delta,
      total: player.score
    };
  });
  const scoreSummary = scoreChanges
    .map((change) => `${change.username}: ${formatScoreDelta(change.delta)} Punkte (${change.total} gesamt)`)
    .join(" · ");

  if (game.roundNumber >= game.maxRounds) {
    game.status = "finished";
    addMessage(game, `Das Spiel ist beendet. Punkte in Runde ${game.roundNumber}: ${scoreSummary}.`, {
      type: "round",
      emoji: "🏁",
      scoreChanges
    });
    return;
  }

  addMessage(game, `Runde ${game.roundNumber} ist beendet. Punkte: ${scoreSummary}.`, {
    type: "round",
    emoji: "📊",
    scoreChanges
  });
  game.roundNumber += 1;
  beginRound(game);
};

const getJugglerPlayersNeedingChoice = (game: WizardGame) => game.players.filter((player) => player.hand.length > 0);

const applyJugglerEffect = (game: WizardGame, selectedCardIds: Record<string, string>) => {
  const outgoingCards = game.players.map((player) => {
    const selectedCardId = selectedCardIds[player.username];

    if (!selectedCardId) {
      return null;
    }

    const cardIndex = player.hand.findIndex((card) => card.id === selectedCardId);

    if (cardIndex < 0) {
      throw new Error(`${player.username} hat keine gültige Jongleur-Karte gewählt.`);
    }

    return player.hand.splice(cardIndex, 1)[0] ?? null;
  });

  outgoingCards.forEach((card, index) => {
    if (!card) {
      return;
    }

    const receiver = game.players[getNextPlayerIndex(game, index)];
    receiver?.hand.push(card);
  });
  sortAllHands(game);

  addMessage(game, "Jongleur: Alle gewählten Handkarten wurden nach links weitergegeben.", {
    type: "effect",
    emoji: "🔁"
  });
};

const continueAfterEffects = (
  game: WizardGame,
  nextLeaderUsername: string,
  trick: PlayedWizardCard[],
  resolvedEffects: { juggler?: boolean; witch?: boolean } = {},
  winningPlay: PlayedWizardCard | null = null
) => {
  const hasWinningJuggler = winningPlay?.card.kind === "juggler" && !winningPlay.effectSuppressed;
  const witchCard = trick.find((playedCard) => playedCard.card.kind === "witch");

  if (hasWinningJuggler && !resolvedEffects.juggler && getJugglerPlayersNeedingChoice(game).length > 0) {
    game.pendingEffect = {
      type: "juggler",
      nextLeaderUsername,
      trick,
      selectedCardIds: {}
    };
    game.status = "effect";
    return;
  }

  if (witchCard && !resolvedEffects.witch) {
    const witchPlayer = getPlayer(game, witchCard.playerUsername);
    const exchangeTargets = trick.filter((playedCard) => playedCard.playId !== witchCard.playId);

    if (witchPlayer && witchPlayer.hand.length > 0 && exchangeTargets.length > 0) {
      game.pendingEffect = {
        type: "witch",
        username: witchCard.playerUsername,
        nextLeaderUsername,
        trick
      };
      game.status = "effect";
      return;
    }
  }

  game.pendingEffect = null;
  game.lastTrick = trick;
  game.currentTrick = [];

  if (game.players.every((player) => player.hand.length === 0)) {
    finishRound(game);
    return;
  }

  const nextLeaderIndex = getPlayerIndex(game, nextLeaderUsername);
  game.leaderIndex = nextLeaderIndex >= 0 ? nextLeaderIndex : game.leaderIndex;
  game.activePlayerIndex = game.leaderIndex;
  game.status = "playing";
  addMessage(game, `${game.players[game.activePlayerIndex]?.username} eröffnet den nächsten Stich.`, {
    type: "round",
    emoji: "▶️",
    playerUsername: game.players[game.activePlayerIndex]?.username
  });
};

const resolveCompletedTrick = (game: WizardGame) => {
  const trick = [...game.currentTrick];
  const actualWinner = determineTrickWinner(game, trick);
  const fallbackWinner = determineTrickWinner(game, trick, { ignoreBomb: true });
  const nextLeaderUsername = (actualWinner ?? fallbackWinner)?.playerUsername ?? game.players[game.leaderIndex]?.username;
  const hasBomb = hasActiveBomb(game, trick);
  const hasWinningCloud = actualWinner?.card.kind === "cloud" && !actualWinner.effectSuppressed;

  if (actualWinner && !hasBomb) {
    const player = getPlayer(game, actualWinner.playerUsername);

    if (player) {
      player.tricksWon += 1;
    }

    addMessage(game, `${actualWinner.playerUsername} gewinnt den Stich.`, {
      type: "winner",
      emoji: "🏆",
      winnerUsername: actualWinner.playerUsername,
      card: actualWinner.card,
      chosenSuit: actualWinner.chosenSuit
    });
  } else {
    addMessage(game, "Bombe: Niemand gewinnt diesen Stich.", { type: "effect", emoji: "💥" });
  }

  if (hasWinningCloud && actualWinner && !hasBomb) {
    game.pendingEffect = {
      type: "cloud",
      username: actualWinner.playerUsername,
      nextLeaderUsername,
      trick
    };
    game.status = "effect";
    return;
  }

  continueAfterEffects(game, nextLeaderUsername, trick, {}, actualWinner);
};

export const listWizardGames = (): WizardGameListItem[] => {
  pruneInactiveGames();

  return [...games.values()].map((game) => ({
    id: game.id,
    ownerUsername: game.ownerUsername,
    status: game.status,
    playerCount: game.players.length,
    maxPlayers: game.settings.maxPlayers,
    roundNumber: game.roundNumber,
    joinPath: getJoinPath(game.id)
  }));
};

export const createWizardGame = (username: string, input?: WizardCreateGameInput) => {
  const gameId = createGameId();
  const createdAt = now();
  const settings = normalizeSettings(input);
  const game: WizardGame = {
    id: gameId,
    ownerUsername: username,
    debugMode: null,
    status: "lobby",
    settings,
    players: [
      {
        username,
        seat: 0,
        hand: [],
        prediction: null,
        tricksWon: 0,
        score: 0
      }
    ],
    roundNumber: 0,
    maxRounds: 0,
    dealerIndex: 0,
    leaderIndex: 0,
    activePlayerIndex: 0,
    deck: [],
    trumpCard: null,
    trumpSuit: null,
    vampireCopyCard: null,
    trumpChoicePendingFor: null,
    currentTrick: [],
    lastTrick: [],
    pendingEffect: null,
    messages: [],
    createdAt,
    updatedAt: createdAt
  };

  games.set(game.id, game);
  addMessage(game, "Lobby wurde erstellt.", { type: "system", emoji: "🏠" });
  return game;
};

export const createWizardDebugGame = (username: string, input?: WizardCreateGameInput) => {
  const gameId = createGameId();
  const createdAt = now();
  const settings = normalizeSettings({
    ...input,
    maxPlayers: 4
  });
  const debugPlayers: WizardPlayer[] = Array.from({ length: 4 }, (_, index) => ({
    username: `${username} ${index + 1}`,
    controlledByUsername: username,
    seat: index,
    hand: [],
    prediction: null,
    tricksWon: 0,
    score: 0
  }));
  const game: WizardGame = {
    id: gameId,
    ownerUsername: username,
    debugMode: {
      enabled: true,
      controllerUsername: username
    },
    status: "lobby",
    settings: {
      ...settings,
      maxPlayers: 4
    },
    players: debugPlayers,
    roundNumber: 0,
    maxRounds: 0,
    dealerIndex: 0,
    leaderIndex: 0,
    activePlayerIndex: 0,
    deck: [],
    trumpCard: null,
    trumpSuit: null,
    vampireCopyCard: null,
    trumpChoicePendingFor: null,
    currentTrick: [],
    lastTrick: [],
    pendingEffect: null,
    messages: [],
    createdAt,
    updatedAt: createdAt
  };

  games.set(game.id, game);
  addMessage(game, "Admin-Debugmodus wurde gestartet.", { type: "system", emoji: "🧪" });
  return game;
};

export const getWizardGame = (gameId: string) => getStoredGame(gameId);

export const deleteWizardGame = (gameId: string) => {
  pruneInactiveGames();
  return games.delete(gameId);
};

export const joinWizardGame = (gameId: string, username: string) => {
  const game = getStoredGame(gameId);

  if (!game) {
    throw new Error("Wizard-Lobby wurde nicht gefunden.");
  }

  if (
    getPlayer(game, username) ||
    game.debugMode?.controllerUsername.toLowerCase() === username.toLowerCase()
  ) {
    return game;
  }

  if (game.debugMode?.enabled) {
    throw new Error("Debug-Lobbys können nicht von weiteren Accounts betreten werden.");
  }

  if (game.status !== "lobby") {
    throw new Error("Dieses Wizard-Spiel wurde bereits gestartet.");
  }

  if (game.players.length >= game.settings.maxPlayers) {
    throw new Error("Diese Wizard-Lobby ist voll.");
  }

  game.players.push({
    username,
    seat: game.players.length,
    hand: [],
    prediction: null,
    tricksWon: 0,
    score: 0
  });
  addMessage(game, `${username} ist der Lobby beigetreten.`, { type: "system", emoji: "➕", playerUsername: username });
  setUpdated(game);
  return game;
};

export const startWizardGame = (gameId: string, username: string) => {
  const game = getStoredGame(gameId);

  if (!game) {
    throw new Error("Wizard-Spiel wurde nicht gefunden.");
  }

  if (game.ownerUsername.toLowerCase() !== username.toLowerCase()) {
    throw new Error("Nur die Person, die die Lobby erstellt hat, kann das Spiel starten.");
  }

  if (game.status !== "lobby" && game.status !== "roundEnded") {
    throw new Error("Das Spiel kann gerade nicht gestartet werden.");
  }

  if (game.players.length < 2) {
    throw new Error("Wizard benötigt mindestens 2 Personen.");
  }

  game.maxRounds = getMaxRoundsForPlayerCount(game.players.length);
  game.roundNumber = game.status === "roundEnded" ? game.roundNumber + 1 : 1;
  beginRound(game);
  setUpdated(game);
  return game;
};

export const chooseWizardTrump = (gameId: string, username: string, suit: WizardSuit) => {
  const game = getStoredGame(gameId);

  if (!game) {
    throw new Error("Wizard-Spiel wurde nicht gefunden.");
  }

  const actingPlayer = resolveControlledPlayer(game, username);

  if (
    game.status !== "trumpSelection" ||
    !actingPlayer ||
    game.trumpChoicePendingFor?.toLowerCase() !== actingPlayer.username.toLowerCase()
  ) {
    throw new Error("Du darfst die Trumpffarbe gerade nicht bestimmen.");
  }

  if (!wizardSuits.includes(suit)) {
    throw new Error("Ungültige Trumpffarbe.");
  }

  game.trumpSuit = suit;
  game.trumpChoicePendingFor = null;
  game.status = "prediction";
  addMessage(game, `${actingPlayer.username} bestimmt ${suitLabels[suit]} als Trumpf.`, {
    type: "trump",
    emoji: "🎨",
    playerUsername: actingPlayer.username,
    card: game.trumpCard ?? undefined,
    chosenSuit: suit
  });
  setUpdated(game);
  return game;
};

export const makeWizardPrediction = (
  gameId: string,
  username: string,
  prediction: number,
  playerUsername?: string
) => {
  const game = getStoredGame(gameId);

  if (!game) {
    throw new Error("Wizard-Spiel wurde nicht gefunden.");
  }

  if (game.status !== "prediction") {
    throw new Error("Vorhersagen sind gerade nicht möglich.");
  }

  const player = resolveControlledPlayer(game, username, playerUsername);

  if (!player) {
    throw new Error("Du bist nicht in diesem Wizard-Spiel.");
  }

  if (player.prediction !== null) {
    throw new Error("Diese Stichvorhersage wurde bereits abgegeben.");
  }

  if (!Number.isInteger(prediction) || prediction < 0 || prediction > game.roundNumber) {
    throw new Error(`Die Vorhersage muss zwischen 0 und ${game.roundNumber} liegen.`);
  }

  player.prediction = prediction;
  addMessage(game, `${player.username} sagt ${prediction} Stich(e) voraus.`, {
    type: "system",
    emoji: "🔮",
    playerUsername: player.username
  });
  startPlayingIfReady(game);
  setUpdated(game);
  return game;
};

export const playWizardCard = (gameId: string, username: string, input: WizardPlayCardInput) => {
  const game = getStoredGame(gameId);

  if (!game) {
    throw new Error("Wizard-Spiel wurde nicht gefunden.");
  }

  const player = resolveControlledPlayer(game, username, input.playerUsername);

  if (!player) {
    throw new Error("Du bist nicht in diesem Wizard-Spiel.");
  }

  const cardIndex = player.hand.findIndex((card) => card.id === input.cardId);
  const card = player.hand[cardIndex];

  if (!card || cardIndex < 0) {
    throw new Error("Diese Karte liegt nicht auf deiner Hand.");
  }

  const validationError = validateCardPlay(game, player, card, input);

  if (validationError) {
    throw new Error(validationError);
  }

  player.hand.splice(cardIndex, 1);

  const playedCard: PlayedWizardCard = {
    playId: createPlayId(),
    playerUsername: player.username,
    card,
    shapeshifterMode: input.shapeshifterMode,
    chosenTrumpSuit: input.chosenTrumpSuit,
    chosenSuit: input.chosenSuit
  };

  if (card.kind === "vampire") {
    const copiedTrumpCard = drawRandomDeckCard(game);

    if (copiedTrumpCard) {
      applyTrumpCard(game, copiedTrumpCard);
      addMessage(game, `Vampir: ${player.username} deckt ${copiedTrumpCard.label} aus dem Restdeck auf. Diese Karte ist jetzt die neue Trumpfkarte.`, {
        type: "trump",
        emoji: "🧛",
        playerUsername: player.username,
        card: copiedTrumpCard,
        chosenSuit: copiedTrumpCard.suit
      });
    } else {
      game.vampireCopyCard = null;
      addMessage(game, `Vampir: ${player.username} findet keine Karte mehr im Restdeck und zählt als Narr.`, {
        type: "trump",
        emoji: "🧛",
        playerUsername: player.username,
        card
      });
    }
  }

  game.currentTrick.push(playedCard);

  const effectiveCard = getEffectiveCard(game, playedCard);

  if (effectiveCard.kind === "werewolf" && input.chosenTrumpSuit) {
    game.trumpSuit = input.chosenTrumpSuit;
    addMessage(game, `${player.username} spielt ${card.label}. ${suitLabels[input.chosenTrumpSuit]} ist ab sofort bis Rundenende Trumpf.`, {
      type: "play",
      emoji: "🃏",
      playerUsername: player.username,
      card,
      chosenSuit: input.chosenSuit
    });
  } else if ((card.kind === "juggler" || card.kind === "cloud") && input.chosenSuit) {
    addMessage(game, `${player.username} spielt ${card.label} als ${suitLabels[input.chosenSuit]}.`, {
      type: "play",
      emoji: "🃏",
      playerUsername: player.username,
      card,
      chosenSuit: input.chosenSuit
    });
  } else {
    addMessage(game, `${player.username} spielt ${card.label}.`, {
      type: "play",
      emoji: "🃏",
      playerUsername: player.username,
      card
    });
  }

  if (game.currentTrick.length === game.players.length) {
    resolveCompletedTrick(game);
  } else {
    game.activePlayerIndex = getNextPlayerIndex(game, game.activePlayerIndex);
  }

  setUpdated(game);
  return game;
};

export const resolveWizardCloud = (gameId: string, username: string, delta: 1 | -1) => {
  const game = getStoredGame(gameId);

  if (!game || game.pendingEffect?.type !== "cloud") {
    throw new Error("Es wartet aktuell keine Wolken-Entscheidung.");
  }

  const actingPlayer = resolveControlledPlayer(game, username);

  if (!actingPlayer || game.pendingEffect.username.toLowerCase() !== actingPlayer.username.toLowerCase()) {
    throw new Error("Nur der Stichgewinner darf die Wolke auflösen.");
  }

  const player = actingPlayer;

  if (!player || player.prediction === null) {
    throw new Error("Vorhersage konnte nicht angepasst werden.");
  }

  const nextPrediction = player.prediction + delta;

  if (nextPrediction < 0) {
    throw new Error("Die Vorhersage kann nicht unter 0 fallen.");
  }

  player.prediction = nextPrediction;
  addMessage(game, `Wolke: ${player.username} verändert die Vorhersage um ${delta > 0 ? "+1" : "-1"}.`, {
    type: "effect",
    emoji: "☁️",
    playerUsername: player.username
  });
  const { nextLeaderUsername, trick } = game.pendingEffect;
  game.pendingEffect = null;
  continueAfterEffects(game, nextLeaderUsername, trick);
  setUpdated(game);
  return game;
};

export const resolveWizardJuggler = (
  gameId: string,
  username: string,
  input: { playerUsername?: string; cardId: string }
) => {
  const game = getStoredGame(gameId);

  if (!game || game.pendingEffect?.type !== "juggler") {
    throw new Error("Es wartet aktuell kein Jongleur-Effekt.");
  }

  const pendingEffect = game.pendingEffect;
  const player = resolveControlledPlayer(game, username, input.playerUsername);

  if (!player) {
    throw new Error("Du bist nicht in diesem Wizard-Spiel.");
  }

  if (player.hand.length === 0) {
    throw new Error("Du hast keine Handkarte für den Jongleur-Effekt.");
  }

  if (pendingEffect.selectedCardIds[player.username]) {
    throw new Error("Du hast für den Jongleur-Effekt bereits eine Karte gewählt.");
  }

  if (!player.hand.some((card) => card.id === input.cardId)) {
    throw new Error("Diese Jongleur-Karte liegt nicht auf deiner Hand.");
  }

  pendingEffect.selectedCardIds[player.username] = input.cardId;
  addMessage(game, `Jongleur: ${player.username} hat eine Karte zum Weitergeben gewählt.`, {
    type: "effect",
    emoji: "🔁",
    playerUsername: player.username
  });

  const playersNeedingChoice = getJugglerPlayersNeedingChoice(game);

  if (playersNeedingChoice.some((candidate) => !pendingEffect.selectedCardIds[candidate.username])) {
    setUpdated(game);
    return game;
  }

  const { nextLeaderUsername, trick } = pendingEffect;
  applyJugglerEffect(game, pendingEffect.selectedCardIds);
  game.pendingEffect = null;
  continueAfterEffects(game, nextLeaderUsername, trick, { juggler: true });
  setUpdated(game);
  return game;
};

export const resolveWizardWitchExchange = (
  gameId: string,
  username: string,
  input: { handCardId: string; trickPlayId: string }
) => {
  const game = getStoredGame(gameId);

  if (!game || game.pendingEffect?.type !== "witch") {
    throw new Error("Es wartet aktuell kein Hexen-Tausch.");
  }

  const actingPlayer = resolveControlledPlayer(game, username);

  if (!actingPlayer || game.pendingEffect.username.toLowerCase() !== actingPlayer.username.toLowerCase()) {
    throw new Error("Nur die Person mit der Hexe darf jetzt tauschen.");
  }

  const player = actingPlayer;

  if (!player) {
    throw new Error("Du bist nicht in diesem Wizard-Spiel.");
  }

  const handCardIndex = player.hand.findIndex((card) => card.id === input.handCardId);
  const handCard = player.hand[handCardIndex];
  const trickCardIndex = game.pendingEffect.trick.findIndex((playedCard) => playedCard.playId === input.trickPlayId);
  const trickCard = game.pendingEffect.trick[trickCardIndex];

  if (!handCard || handCardIndex < 0) {
    throw new Error("Diese Handkarte existiert nicht.");
  }

  if (!trickCard || trickCardIndex < 0 || trickCard.card.kind === "witch") {
    throw new Error("Diese Stichkarte kann nicht genommen werden.");
  }

  player.hand.splice(handCardIndex, 1);
  player.hand.push(trickCard.card);
  sortHandCards(player.hand);
  game.pendingEffect.trick[trickCardIndex] = {
    playId: createPlayId(),
    playerUsername: player.username,
    card: handCard,
    effectSuppressed: true
  };
  addMessage(game, `Hexe: ${player.username} tauscht eine Handkarte gegen ${trickCard.card.label}.`, {
    type: "effect",
    emoji: "🪄",
    playerUsername: player.username,
    card: trickCard.card,
    chosenSuit: trickCard.chosenSuit
  });

  const { nextLeaderUsername, trick } = game.pendingEffect;
  game.pendingEffect = null;
  continueAfterEffects(game, nextLeaderUsername, trick, { witch: true });
  setUpdated(game);
  return game;
};

export const getWizardGameView = (game: WizardGame, username: string): WizardGameView => {
  const controlledPlayers = getControlledPlayers(game, username);
  const activePlayer = game.players[game.activePlayerIndex];
  const self =
    controlledPlayers.find((player) => player.username === activePlayer?.username) ??
    controlledPlayers.find((player) => player.prediction === null) ??
    controlledPlayers[0];

  return {
    id: game.id,
    ownerUsername: game.ownerUsername,
    debugMode: game.debugMode,
    status: game.status,
    settings: game.settings,
    players: game.players.map((player) => ({
      username: player.username,
      controlledBySelf: canControlPlayer(game, player, username),
      seat: player.seat,
      handCount: player.hand.length,
      prediction: player.prediction,
      tricksWon: player.tricksWon,
      score: player.score,
      isSelf: canControlPlayer(game, player, username)
    })),
    selfHand: self?.hand ?? [],
    selfHandOwnerUsername: self?.username ?? null,
    validCardIds: self ? getValidCardsForPlayer(game, self) : [],
    controlledHands: controlledPlayers.map((player) => ({
      username: player.username,
      hand: player.hand,
      validCardIds: getValidCardsForPlayer(game, player)
    })),
    roundNumber: game.roundNumber,
    maxRounds: game.maxRounds,
    dealerUsername: game.players[game.dealerIndex]?.username ?? null,
    leaderUsername: game.players[game.leaderIndex]?.username ?? null,
    activeUsername: game.players[game.activePlayerIndex]?.username ?? null,
    trumpCard: game.trumpCard,
    trumpSuit: game.trumpSuit,
    vampireCopyCard: game.vampireCopyCard,
    trumpChoicePendingFor: game.trumpChoicePendingFor,
    currentTrick: game.currentTrick,
    lastTrick: game.lastTrick,
    pendingEffect: getPublicPendingEffect(game.pendingEffect),
    messages: game.messages,
    joinPath: getJoinPath(game.id)
  };
};
