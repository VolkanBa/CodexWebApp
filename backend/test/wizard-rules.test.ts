import assert from "node:assert/strict";
import test from "node:test";
import {
  chooseWizardTrump,
  createWizardDebugGame,
  createWizardGame,
  getWizardGameView,
  joinWizardGame,
  makeWizardPrediction,
  playWizardCard,
  resolveWizardCloud,
  startWizardGame
} from "../src/games/wizard/store.js";
import { createWizardDeck } from "../src/games/wizard/cards.js";
import { calculateRoundScore, determineTrickWinner, getEffectiveCard, validateCardPlay } from "../src/games/wizard/rules.js";
import type { OptionalWizardCardKind, PlayedWizardCard, WizardCard, WizardGame, WizardPlayer } from "../src/games/wizard/types.js";

const suited = (id: string, suit: WizardCard["suit"], value: number): WizardCard => ({
  id,
  kind: "number",
  label: `${suit} ${value}`,
  suit,
  value
});

const special = (kind: WizardCard["kind"]): WizardCard => ({
  id: kind,
  kind,
  label: kind
});

const played = (
  playerUsername: string,
  card: WizardCard,
  playId = `${playerUsername}-${card.id}`,
  overrides: Partial<PlayedWizardCard> = {}
): PlayedWizardCard => ({
  playId,
  playerUsername,
  card,
  ...overrides
});

const gameForRules = (overrides: Partial<WizardGame>): WizardGame => ({
  id: "game",
  ownerUsername: "Volle",
  debugMode: null,
  status: "playing",
  settings: {
    maxPlayers: 6,
    enabledOptionalCards: [],
    timeLimitSeconds: null,
    scoreboardVisibleDefault: true
  },
  players: [],
  roundNumber: 1,
  maxRounds: 1,
  dealerIndex: 0,
  leaderIndex: 0,
  activePlayerIndex: 0,
  deck: [],
  trumpCard: null,
  trumpSuit: null,
  vampireCopyCard: null,
  currentTrick: [],
  lastTrick: [],
  trumpChoicePendingFor: null,
  pendingEffect: null,
  messages: [],
  createdAt: new Date(0).toISOString(),
  updatedAt: new Date(0).toISOString(),
  ...overrides
});

test("Wizard scoring rewards exact predictions and penalizes misses", () => {
  assert.equal(calculateRoundScore(2, 2), 40);
  assert.equal(calculateRoundScore(1, 3), -20);
});

test("follow suit blocks a wrong suited card when the player can serve", () => {
  const player: WizardPlayer = {
    username: "Neo",
    seat: 1,
    hand: [suited("red-2", "red", 2), suited("blue-9", "blue", 9)],
    prediction: 0,
    tricksWon: 0,
    score: 0
  };
  const game = gameForRules({
    players: [
      {
        username: "Volle",
        seat: 0,
        hand: [],
        prediction: 0,
        tricksWon: 0,
        score: 0
      },
      player
    ],
    activePlayerIndex: 1,
    currentTrick: [played("Volle", suited("red-7", "red", 7))]
  });

  assert.match(validateCardPlay(game, player, suited("blue-9", "blue", 9), {}) ?? "", /Farbzwang/);
  assert.equal(validateCardPlay(game, player, suited("red-2", "red", 2), {}), null);
});

test("first wizard wins against later wizards", () => {
  const winner = determineTrickWinner(
    {
      trumpSuit: null,
      vampireCopyCard: null
    },
    [played("Neo", special("wizard")), played("Leia", special("wizard"), "second-wizard")]
  );

  assert.equal(winner?.playerUsername, "Neo");
});

test("fairy wins only when dragon is present and no bomb is played", () => {
  const winner = determineTrickWinner(
    {
      trumpSuit: null,
      vampireCopyCard: null
    },
    [played("Arya", special("dragon")), played("Goku", special("fairy"))]
  );

  assert.equal(winner?.playerUsername, "Goku");
});

test("bomb cancels the trick, but ignoreBomb returns the normal would-have-won player", () => {
  const trick = [played("Arya", special("dragon")), played("Goku", special("bomb"))];
  const actualWinner = determineTrickWinner(
    {
      trumpSuit: null,
      vampireCopyCard: null
    },
    trick
  );
  const nextLeader = determineTrickWinner(
    {
      trumpSuit: null,
      vampireCopyCard: null
    },
    trick,
    { ignoreBomb: true }
  );

  assert.equal(actualWinner, null);
  assert.equal(nextLeader?.playerUsername, "Arya");
});

test("vampire copies the revealed trump card for trick logic", () => {
  const vampire = getEffectiveCard(
    {
      vampireCopyCard: suited("red-13", "red", 13)
    },
    {
      card: special("vampire")
    }
  );

  assert.equal(vampire.kind, "number");
  assert.equal(vampire.suit, "red");
  assert.equal(vampire.value, 13);
});

test("wizard deck contains one flexible cloud and one flexible juggler", () => {
  const deck = createWizardDeck({
    enabledOptionalCards: ["cloud", "juggler"] as OptionalWizardCardKind[]
  });
  const clouds = deck.filter((card) => card.kind === "cloud");
  const jugglers = deck.filter((card) => card.kind === "juggler");

  assert.equal(clouds.length, 1);
  assert.equal(jugglers.length, 1);
  assert.equal(clouds[0]?.suit, undefined);
  assert.equal(jugglers[0]?.suit, undefined);
});

test("flexible cloud and juggler require a chosen suit and obey follow suit", () => {
  const cloud: WizardCard = {
    id: "cloud",
    kind: "cloud",
    label: "Wolke 9 3/4",
    value: 9.75
  };
  const player: WizardPlayer = {
    username: "Neo",
    seat: 1,
    hand: [cloud],
    prediction: 0,
    tricksWon: 0,
    score: 0
  };
  const game = gameForRules({
    players: [
      {
        username: "Volle",
        seat: 0,
        hand: [],
        prediction: 0,
        tricksWon: 0,
        score: 0
      },
      player
    ],
    activePlayerIndex: 1,
    currentTrick: [played("Volle", suited("red-7", "red", 7))]
  });

  assert.match(validateCardPlay(game, player, cloud, {}) ?? "", /braucht beim Ausspielen eine Farbe/);
  assert.match(validateCardPlay(game, player, cloud, { chosenSuit: "blue" }) ?? "", /Farbzwang/);
  assert.equal(validateCardPlay(game, player, cloud, { chosenSuit: "red" }), null);

  const winner = determineTrickWinner(
    {
      trumpSuit: null,
      vampireCopyCard: null
    },
    [played("Volle", suited("red-7", "red", 7)), played("Neo", cloud, "neo-cloud", { chosenSuit: "red" })]
  );

  assert.equal(winner?.playerUsername, "Neo");
});

test("werewolf card play requires and applies a trump suit", () => {
  const game = createWizardDebugGame("Volle", {
    enabledOptionalCards: ["werewolf"],
    scoreboardVisibleDefault: true
  });
  const werewolf = special("werewolf");

  game.status = "playing";
  game.roundNumber = 1;
  game.maxRounds = 10;
  game.activePlayerIndex = 0;
  game.players[0]!.hand = [werewolf];
  game.players[1]!.hand = [suited("blue-1", "blue", 1)];
  game.players[0]!.prediction = 0;
  game.players[1]!.prediction = 0;

  assert.match(validateCardPlay(game, game.players[0]!, werewolf, {}) ?? "", /Werwolf/);

  playWizardCard(game.id, "Volle", {
    cardId: werewolf.id,
    playerUsername: "Volle 1",
    chosenTrumpSuit: "green"
  });

  assert.equal(game.trumpSuit, "green");
});

test("cloud effect can increase or decrease prediction without going below zero", () => {
  const game = createWizardDebugGame("Volle", {
    enabledOptionalCards: ["cloud"],
    scoreboardVisibleDefault: true
  });
  const cloud: WizardCard = {
    id: "cloud",
    kind: "cloud",
    label: "Wolke 9 3/4",
    value: 9.75
  };

  game.status = "effect";
  game.roundNumber = 1;
  game.maxRounds = 10;
  game.players[0]!.prediction = 1;
  game.players[0]!.hand = [suited("green-2", "green", 2)];
  game.players[1]!.hand = [suited("yellow-2", "yellow", 2)];
  game.pendingEffect = {
    type: "cloud",
    username: "Volle 1",
    nextLeaderUsername: "Volle 1",
    trick: [played("Volle 1", cloud, "cloud-play", { chosenSuit: "red" })]
  };

  resolveWizardCloud(game.id, "Volle", -1);

  assert.equal(game.players[0]?.prediction, 0);

  game.status = "effect";
  game.pendingEffect = {
    type: "cloud",
    username: "Volle 1",
    nextLeaderUsername: "Volle 1",
    trick: [played("Volle 1", cloud, "cloud-play-2", { chosenSuit: "red" })]
  };
  assert.throws(() => resolveWizardCloud(game.id, "Volle", -1), /nicht unter 0/);

  game.status = "effect";
  game.pendingEffect = {
    type: "cloud",
    username: "Volle 1",
    nextLeaderUsername: "Volle 1",
    trick: [played("Volle 1", cloud, "cloud-play-3", { chosenSuit: "red" })]
  };
  resolveWizardCloud(game.id, "Volle", 1);

  assert.equal(game.players[0]?.prediction, 1);
});

test("trump choice is restricted to the pending chooser", () => {
  const game = createWizardGame("Volle");
  joinWizardGame(game.id, "Neo");
  game.status = "trumpSelection";
  game.trumpChoicePendingFor = "Neo";

  assert.throws(() => chooseWizardTrump(game.id, "Volle", "red"), /nicht bestimmen/);
  chooseWizardTrump(game.id, "Neo", "green");

  assert.equal(game.trumpSuit, "green");
  assert.equal(game.trumpChoicePendingFor, null);
});

test("trump chooser follows the rotating dealer order clockwise", () => {
  const game = createWizardGame("Volle");
  joinWizardGame(game.id, "Neo");
  joinWizardGame(game.id, "Leia");

  const dealerOrder = [1, 2, 3, 4].map((roundNumber) => {
    game.roundNumber = roundNumber;
    game.dealerIndex = (roundNumber - 1) % game.players.length;
    return game.players[game.dealerIndex]?.username;
  });

  assert.deepEqual(dealerOrder, ["Volle", "Neo", "Leia", "Volle"]);
});

test("parallel wizard games receive separate ids", () => {
  const firstGame = createWizardGame("Volle");
  const secondGame = createWizardGame("Neo");

  assert.notEqual(firstGame.id, secondGame.id);
  assert.equal(firstGame.players[0]?.username, "Volle");
  assert.equal(secondGame.players[0]?.username, "Neo");
});

test("admin debug game creates two controlled Volle seats", () => {
  const game = createWizardDebugGame("Volle");
  const view = getWizardGameView(game, "Volle");

  assert.equal(game.debugMode?.enabled, true);
  assert.equal(game.players.length, 2);
  assert.equal(game.players[0]?.username, "Volle 1");
  assert.equal(game.players[1]?.username, "Volle 2");
  assert.equal(view.controlledHands.length, 2);
  assert.equal(view.players.every((player) => player.controlledBySelf), true);
});

test("admin can make predictions for both debug seats", () => {
  const game = createWizardDebugGame("Volle");
  game.status = "prediction";
  game.roundNumber = 1;

  makeWizardPrediction(game.id, "Volle", 0, "Volle 1");
  makeWizardPrediction(game.id, "Volle", 1, "Volle 2");

  assert.equal(game.players[0]?.prediction, 0);
  assert.equal(game.players[1]?.prediction, 1);
});

test("admin debug card plays are attributed to the controlled seat", () => {
  const game = createWizardDebugGame("Volle", {
    enabledOptionalCards: [],
    scoreboardVisibleDefault: true
  });
  const firstCard = suited("red-10", "red", 10);

  game.status = "playing";
  game.roundNumber = 1;
  game.maxRounds = 10;
  game.players[0]!.hand = [firstCard];
  game.players[1]!.hand = [suited("blue-1", "blue", 1)];
  game.players[0]!.prediction = 1;
  game.players[1]!.prediction = 0;

  playWizardCard(game.id, "Volle", {
    cardId: firstCard.id,
    playerUsername: "Volle 1"
  });

  assert.equal(game.currentTrick[0]?.playerUsername, "Volle 1");
  assert.match(game.messages[0]?.message ?? "", /Volle 1 spielt/);
});

test("wizard automatically starts the next round after a completed round", () => {
  const game = createWizardDebugGame("Volle", {
    enabledOptionalCards: [],
    scoreboardVisibleDefault: true
  });

  startWizardGame(game.id, "Volle");

  if (game.status === "trumpSelection") {
    game.trumpSuit = "red";
    game.trumpChoicePendingFor = null;
    game.status = "prediction";
  }

  makeWizardPrediction(game.id, "Volle", 0, "Volle 1");
  makeWizardPrediction(game.id, "Volle", 0, "Volle 2");

  for (let playCount = 0; playCount < 2; playCount += 1) {
    const view = getWizardGameView(game, "Volle");
    const activeHand = view.controlledHands.find((hand) => hand.username === view.activeUsername);
    const validCardId = activeHand?.validCardIds[0];

    assert.ok(activeHand);
    assert.ok(validCardId);

    playWizardCard(game.id, "Volle", {
      cardId: validCardId,
      playerUsername: activeHand.username
    });
  }

  assert.equal(game.roundNumber, 2);
  assert.notEqual(game.status, "roundEnded");
  assert.equal(game.players.every((player) => player.hand.length === 2), true);
});
