import {
  type OptionalWizardCardKind,
  type WizardCard,
  type WizardGameSettings,
  type WizardSuit,
  wizardSuits
} from "./types.js";

export const suitLabels: Record<WizardSuit, string> = {
  red: "Rot",
  blue: "Blau",
  green: "Grün",
  yellow: "Gelb"
};

export const optionalWizardCards: OptionalWizardCardKind[] = [
  "juggler",
  "cloud",
  "dragon",
  "fairy",
  "bomb",
  "werewolf",
  "witch",
  "shapeshifter",
  "vampire"
];

const getCardImagePath = (designKey: string) => `/private/wizard/cards/${encodeURIComponent(designKey)}/image`;

const repeatedSpecialDesignKeys = [
  "wizard",
  "jester",
  "wizard-2",
  "jester-2",
  "wizard-3",
  "jester-3",
  "wizard-4",
  "jester-4"
];

export const wizardSpecialCardDesignKeys = [
  "joseph-joestar-wizard-jester",
  "witch",
  "vampire",
  "werewolf",
  "dragon",
  "fairy",
  "bomb",
  "juggler-7-5",
  "cloud-9-75",
  ...repeatedSpecialDesignKeys
] as const;

export const wizardCardDesignKeys = [
  ...wizardSpecialCardDesignKeys,
  ...wizardSuits.flatMap((suit) => Array.from({ length: 13 }, (_, index) => `${suit}-${index + 1}`))
] as const;

const createNumberCard = (suit: WizardSuit, value: number): WizardCard => ({
  id: `${suit}-${value}`,
  kind: "number",
  label: `${suitLabels[suit]} ${value}`,
  designKey: `${suit}-${value}`,
  imagePath: getCardImagePath(`${suit}-${value}`),
  suit,
  value
});

const createJugglerCard = (): WizardCard => ({
  id: "juggler",
  kind: "juggler",
  label: "Jongleur 7 1/2",
  designKey: "juggler-7-5",
  imagePath: getCardImagePath("juggler-7-5"),
  value: 7.5
});

const createCloudCard = (): WizardCard => ({
  id: "cloud",
  kind: "cloud",
  label: "Wolke 9 3/4",
  designKey: "cloud-9-75",
  imagePath: getCardImagePath("cloud-9-75"),
  value: 9.75
});

const createSpecialCard = (kind: WizardCard["kind"], index = 1): WizardCard => {
  const labels: Record<Exclude<WizardCard["kind"], "number" | "juggler" | "cloud">, string> = {
    wizard: "Wizard",
    jester: "Narr",
    dragon: "Drache",
    fairy: "Fee",
    bomb: "Bombe",
    werewolf: "Werwolf",
    witch: "Hexe",
    shapeshifter: "Gestaltwandler",
    vampire: "Vampir"
  };

  if (kind === "number" || kind === "juggler" || kind === "cloud") {
    throw new Error("createSpecialCard only accepts special cards.");
  }

  const designKey =
    kind === "shapeshifter" ? "joseph-joestar-wizard-jester" : index > 1 ? `${kind}-${index}` : kind;

  return {
    id: index > 1 ? `${kind}-${index}` : kind,
    kind,
    label: index > 1 ? `${labels[kind]} ${index}` : labels[kind],
    designKey,
    imagePath: getCardImagePath(designKey)
  };
};

export const createWizardDeck = (settings: Pick<WizardGameSettings, "enabledOptionalCards">) => {
  const enabled = new Set(settings.enabledOptionalCards);
  const cards: WizardCard[] = [];

  for (const suit of wizardSuits) {
    for (let value = 1; value <= 13; value += 1) {
      cards.push(createNumberCard(suit, value));
    }

  }

  if (enabled.has("juggler")) {
    cards.push(createJugglerCard());
  }

  if (enabled.has("cloud")) {
    cards.push(createCloudCard());
  }

  for (let index = 1; index <= 4; index += 1) {
    cards.push(createSpecialCard("wizard", index));
    cards.push(createSpecialCard("jester", index));
  }

  for (const kind of optionalWizardCards) {
    if (kind !== "juggler" && kind !== "cloud" && enabled.has(kind)) {
      cards.push(createSpecialCard(kind));
    }
  }

  return cards;
};

export const shuffleCards = (cards: WizardCard[]) => {
  const shuffled = [...cards];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
};

export const getCardLabel = (card: WizardCard | null | undefined) => card?.label ?? "keine Karte";
