import assert from "node:assert/strict";
import test from "node:test";
import { createWizardGame } from "../src/games/wizard/store.js";
import { calculateRoundScore, determineTrickWinner, getEffectiveCard, validateCardPlay } from "../src/games/wizard/rules.js";
import type { PlayedWizardCard, WizardCard, WizardGame, WizardPlayer } from "../src/games/wizard/types.js";

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

const played = (playerUsername: string, card: WizardCard, playId = `${playerUsername}-${card.id}`): PlayedWizardCard => ({
  playId,
  playerUsername,
  card
});

const gameForRules = (overrides: Partial<WizardGame>): WizardGame => ({
  id: "game",
  ownerUsername: "Volle",
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

test("parallel wizard games receive separate ids", () => {
  const firstGame = createWizardGame("Volle");
  const secondGame = createWizardGame("Neo");

  assert.notEqual(firstGame.id, secondGame.id);
  assert.equal(firstGame.players[0]?.username, "Volle");
  assert.equal(secondGame.players[0]?.username, "Neo");
});
