export const wizardSuits = ["red", "blue", "green", "yellow"] as const;

export type WizardSuit = (typeof wizardSuits)[number];

export type WizardCardKind =
  | "number"
  | "juggler"
  | "cloud"
  | "wizard"
  | "jester"
  | "dragon"
  | "fairy"
  | "bomb"
  | "werewolf"
  | "witch"
  | "shapeshifter"
  | "vampire";

export type OptionalWizardCardKind =
  | "juggler"
  | "cloud"
  | "dragon"
  | "fairy"
  | "bomb"
  | "werewolf"
  | "witch"
  | "shapeshifter"
  | "vampire";

export type ShapeshifterMode = "wizard" | "jester";

export type WizardCard = {
  id: string;
  kind: WizardCardKind;
  label: string;
  designKey?: string;
  suit?: WizardSuit;
  value?: number;
};

export type PlayedWizardCard = {
  playId: string;
  playerUsername: string;
  card: WizardCard;
  shapeshifterMode?: ShapeshifterMode;
  chosenTrumpSuit?: WizardSuit;
  effectSuppressed?: boolean;
};

export type WizardPlayer = {
  username: string;
  seat: number;
  hand: WizardCard[];
  prediction: number | null;
  tricksWon: number;
  score: number;
};

export type WizardGameStatus =
  | "lobby"
  | "trumpSelection"
  | "prediction"
  | "playing"
  | "effect"
  | "roundEnded"
  | "finished";

export type WizardPendingEffect =
  | {
      type: "cloud";
      username: string;
      nextLeaderUsername: string;
      trick: PlayedWizardCard[];
    }
  | {
      type: "juggler";
      nextLeaderUsername: string;
      trick: PlayedWizardCard[];
    }
  | {
      type: "witch";
      username: string;
      nextLeaderUsername: string;
      trick: PlayedWizardCard[];
    };

export type WizardGameSettings = {
  maxPlayers: number;
  enabledOptionalCards: OptionalWizardCardKind[];
  timeLimitSeconds: number | null;
  scoreboardVisibleDefault: boolean;
};

export type WizardGame = {
  id: string;
  ownerUsername: string;
  status: WizardGameStatus;
  settings: WizardGameSettings;
  players: WizardPlayer[];
  roundNumber: number;
  maxRounds: number;
  dealerIndex: number;
  leaderIndex: number;
  activePlayerIndex: number;
  deck: WizardCard[];
  trumpCard: WizardCard | null;
  trumpSuit: WizardSuit | null;
  vampireCopyCard: WizardCard | null;
  trumpChoicePendingFor: string | null;
  currentTrick: PlayedWizardCard[];
  lastTrick: PlayedWizardCard[];
  pendingEffect: WizardPendingEffect | null;
  messages: string[];
  createdAt: string;
  updatedAt: string;
};

export type WizardGameListItem = {
  id: string;
  ownerUsername: string;
  status: WizardGameStatus;
  playerCount: number;
  maxPlayers: number;
  roundNumber: number;
  joinPath: string;
};

export type WizardPublicPlayer = {
  username: string;
  seat: number;
  handCount: number;
  prediction: number | null;
  tricksWon: number;
  score: number;
  isSelf: boolean;
};

export type WizardGameView = {
  id: string;
  ownerUsername: string;
  status: WizardGameStatus;
  settings: WizardGameSettings;
  players: WizardPublicPlayer[];
  selfHand: WizardCard[];
  validCardIds: string[];
  roundNumber: number;
  maxRounds: number;
  dealerUsername: string | null;
  leaderUsername: string | null;
  activeUsername: string | null;
  trumpCard: WizardCard | null;
  trumpSuit: WizardSuit | null;
  vampireCopyCard: WizardCard | null;
  trumpChoicePendingFor: string | null;
  currentTrick: PlayedWizardCard[];
  lastTrick: PlayedWizardCard[];
  pendingEffect: WizardPendingEffect | null;
  messages: string[];
  joinPath: string;
};

export type WizardCreateGameInput = {
  maxPlayers?: number;
  enabledOptionalCards?: OptionalWizardCardKind[];
  timeLimitSeconds?: number | null;
  scoreboardVisibleDefault?: boolean;
};

export type WizardPlayCardInput = {
  cardId: string;
  shapeshifterMode?: ShapeshifterMode;
  chosenTrumpSuit?: WizardSuit;
};
