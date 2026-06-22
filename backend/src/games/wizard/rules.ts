import { getCardLabel, suitLabels } from "./cards.js";
import {
  type PlayedWizardCard,
  type ShapeshifterMode,
  type WizardCard,
  type WizardGame,
  type WizardPlayer,
  type WizardSuit,
  wizardSuits
} from "./types.js";

type EffectiveCard = {
  kind: WizardCard["kind"];
  suit?: WizardSuit;
  value?: number;
  label: string;
  isSpecial: boolean;
};

const specialKinds = new Set<WizardCard["kind"]>([
  "wizard",
  "jester",
  "dragon",
  "fairy",
  "bomb",
  "werewolf",
  "witch",
  "shapeshifter",
  "vampire"
]);

export const isSpecialCard = (card: WizardCard) => specialKinds.has(card.kind);

const isFlexibleSuitCard = (card: WizardCard) => card.kind === "juggler" || card.kind === "cloud";

export const calculateRoundScore = (prediction: number, tricksWon: number) => {
  if (prediction === tricksWon) {
    return 20 + 10 * tricksWon;
  }

  return -10 * Math.abs(prediction - tricksWon);
};

export const getEffectiveCard = (
  game: Pick<WizardGame, "vampireCopyCard">,
  playedCard: Pick<PlayedWizardCard, "card" | "shapeshifterMode" | "chosenSuit" | "effectSuppressed">
): EffectiveCard => {
  if (playedCard.effectSuppressed) {
    return {
      kind: playedCard.card.kind,
      suit: playedCard.chosenSuit ?? playedCard.card.suit,
      value: playedCard.card.value,
      label: `${playedCard.card.label} (ohne Effekt)`,
      isSpecial: false
    };
  }

  if (playedCard.card.kind === "shapeshifter") {
    const mode: ShapeshifterMode = playedCard.shapeshifterMode ?? "jester";

    return {
      kind: mode === "wizard" ? "wizard" : "jester",
      label: mode === "wizard" ? "Gestaltwandler als Wizard" : "Gestaltwandler als Narr",
      isSpecial: true
    };
  }

  if (isFlexibleSuitCard(playedCard.card)) {
    return {
      kind: playedCard.card.kind,
      suit: playedCard.chosenSuit ?? playedCard.card.suit,
      value: playedCard.card.value,
      label: playedCard.chosenSuit
        ? `${playedCard.card.label} als ${suitLabels[playedCard.chosenSuit]}`
        : playedCard.card.label,
      isSpecial: false
    };
  }

  if (playedCard.card.kind === "vampire") {
    const copiedCard = game.vampireCopyCard;

    if (!copiedCard) {
      return {
        kind: "jester",
        label: "Vampir ohne Kopie als Narr",
        isSpecial: true
      };
    }

    return {
      kind: copiedCard.kind,
      suit: copiedCard.suit,
      value: copiedCard.value,
      label: `Vampir als ${copiedCard.label}`,
      isSpecial: isSpecialCard(copiedCard)
    };
  }

  return {
    kind: playedCard.card.kind,
    suit: playedCard.card.suit,
    value: playedCard.card.value,
    label: playedCard.card.label,
    isSpecial: isSpecialCard(playedCard.card)
  };
};

export const getLedSuit = (
  game: Pick<WizardGame, "currentTrick" | "vampireCopyCard">,
  trick: PlayedWizardCard[] = game.currentTrick
) => {
  for (const playedCard of trick) {
    const effectiveCard = getEffectiveCard(game, playedCard);

    if (!effectiveCard.isSpecial && effectiveCard.suit) {
      return effectiveCard.suit;
    }
  }

  return null;
};

const cardCanServeSuit = (
  game: Pick<WizardGame, "vampireCopyCard">,
  card: WizardCard,
  suit: WizardSuit
) => {
  if (isFlexibleSuitCard(card)) {
    return true;
  }

  if (card.kind === "vampire") {
    const copiedCard = getEffectiveCard(game, { card });
    return !copiedCard.isSpecial && copiedCard.suit === suit;
  }

  return !isSpecialCard(card) && card.suit === suit;
};

export const getValidCardsForPlayer = (game: WizardGame, player: WizardPlayer) => {
  if (game.status !== "playing" || game.players[game.activePlayerIndex]?.username !== player.username) {
    return [];
  }

  const ledSuit = getLedSuit(game);

  if (!ledSuit) {
    return player.hand.map((card) => card.id);
  }

  const hasLedSuit = player.hand.some((card) => cardCanServeSuit(game, card, ledSuit));

  return player.hand
    .filter((card) => {
      if (!hasLedSuit) {
        return true;
      }

      if (card.kind === "vampire") {
        const effectiveCard = getEffectiveCard(game, { card });
        return effectiveCard.isSpecial || effectiveCard.suit === ledSuit;
      }

      if (isFlexibleSuitCard(card)) {
        return true;
      }

      return isSpecialCard(card) || card.suit === ledSuit;
    })
    .map((card) => card.id);
};

export const validateCardPlay = (
  game: WizardGame,
  player: WizardPlayer,
  card: WizardCard,
  options: { shapeshifterMode?: ShapeshifterMode; chosenTrumpSuit?: WizardSuit; chosenSuit?: WizardSuit }
) => {
  if (game.status !== "playing") {
    return "Es läuft gerade keine spielbare Stichphase.";
  }

  if (game.players[game.activePlayerIndex]?.username !== player.username) {
    return "Du bist gerade nicht am Zug.";
  }

  if (card.kind === "shapeshifter" && !options.shapeshifterMode) {
    return "Der Gestaltwandler muss als Wizard oder Narr gespielt werden.";
  }

  if (isFlexibleSuitCard(card) && !options.chosenSuit) {
    return `${card.label} braucht beim Ausspielen eine Farbe.`;
  }

  if (options.chosenSuit && !wizardSuits.includes(options.chosenSuit)) {
    return "Ungültige Kartenfarbe.";
  }

  if (options.chosenTrumpSuit && !wizardSuits.includes(options.chosenTrumpSuit)) {
    return "Ungültige Trumpffarbe.";
  }

  const effectiveCard = getEffectiveCard(game, {
    card,
    shapeshifterMode: options.shapeshifterMode,
    chosenSuit: options.chosenSuit
  });

  if (effectiveCard.kind === "werewolf" && !options.chosenTrumpSuit) {
    return "Der Werwolf muss sofort eine neue Trumpffarbe bestimmen.";
  }

  const ledSuit = getLedSuit(game);
  const hasLedSuit = ledSuit ? player.hand.some((candidate) => cardCanServeSuit(game, candidate, ledSuit)) : false;

  if (ledSuit && hasLedSuit && !effectiveCard.isSpecial && effectiveCard.suit !== ledSuit) {
    return `Farbzwang: ${suitLabels[ledSuit]} muss bedient werden.`;
  }

  const validCardIds = getValidCardsForPlayer(game, player);

  if (!validCardIds.includes(card.id)) {
    return ledSuit
      ? `Farbzwang: ${suitLabels[ledSuit]} muss bedient werden.`
      : "Diese Karte kann aktuell nicht gespielt werden.";
  }

  return null;
};

const getFirstByKind = (
  game: Pick<WizardGame, "vampireCopyCard">,
  trick: PlayedWizardCard[],
  kind: WizardCard["kind"]
) => trick.find((playedCard) => getEffectiveCard(game, playedCard).kind === kind);

const getHighestSuitedCard = (
  game: Pick<WizardGame, "vampireCopyCard">,
  trick: PlayedWizardCard[],
  suit: WizardSuit | null
) => {
  if (!suit) {
    return undefined;
  }

  return trick
    .filter((playedCard) => {
      const effectiveCard = getEffectiveCard(game, playedCard);
      return !effectiveCard.isSpecial && effectiveCard.suit === suit;
    })
    .sort((left, right) => {
      const leftValue = getEffectiveCard(game, left).value ?? 0;
      const rightValue = getEffectiveCard(game, right).value ?? 0;
      return rightValue - leftValue;
    })[0];
};

export const determineTrickWinner = (
  game: Pick<WizardGame, "trumpSuit" | "vampireCopyCard">,
  trick: PlayedWizardCard[],
  options: { ignoreBomb: boolean } = { ignoreBomb: false }
) => {
  const consideredTrick = options.ignoreBomb
    ? trick.map((playedCard, index) => {
        if (playedCard.card.kind !== "bomb") {
          return playedCard;
        }

        return {
          ...playedCard,
          card: {
            id: `${playedCard.card.id}-as-jester-${index}`,
            kind: "jester" as const,
            label: "Bombe als Narr"
          }
        };
      })
    : trick;

  const hasBomb = consideredTrick.some((playedCard) => getEffectiveCard(game, playedCard).kind === "bomb");

  if (hasBomb && !options.ignoreBomb) {
    return null;
  }

  const fairy = getFirstByKind(game, consideredTrick, "fairy");
  const dragon = getFirstByKind(game, consideredTrick, "dragon");

  if (fairy && dragon) {
    return fairy;
  }

  if (dragon) {
    return dragon;
  }

  const wizard = getFirstByKind(game, consideredTrick, "wizard");

  if (wizard) {
    return wizard;
  }

  const trumpWinner = getHighestSuitedCard(game, consideredTrick, game.trumpSuit);

  if (trumpWinner) {
    return trumpWinner;
  }

  const ledSuit = getLedSuit({ currentTrick: consideredTrick, vampireCopyCard: game.vampireCopyCard }, consideredTrick);
  const ledSuitWinner = getHighestSuitedCard(game, consideredTrick, ledSuit);

  if (ledSuitWinner) {
    return ledSuitWinner;
  }

  return (
    getFirstByKind(game, consideredTrick, "jester") ??
    getFirstByKind(game, consideredTrick, "fairy") ??
    getFirstByKind(game, consideredTrick, "witch") ??
    consideredTrick[0] ??
    null
  );
};

export const getTrumpDescription = (game: Pick<WizardGame, "trumpSuit" | "trumpCard">) => {
  if (!game.trumpCard) {
    return "Keine Trumpfkarte verfügbar.";
  }

  if (!game.trumpSuit) {
    return `${getCardLabel(game.trumpCard)}: keine Trumpffarbe.`;
  }

  return `${getCardLabel(game.trumpCard)}: ${suitLabels[game.trumpSuit]} ist Trumpf.`;
};
