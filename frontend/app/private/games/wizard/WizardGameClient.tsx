"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PrivateTabs } from "../../PrivateTabs";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";
const webSocketBaseUrl = apiBaseUrl.replace(/^http/, "ws");

const optionalCards = [
  ["juggler", "Jongleur 7 1/2"],
  ["cloud", "Wolke 9 3/4"],
  ["dragon", "Drache"],
  ["fairy", "Fee"],
  ["bomb", "Bombe"],
  ["werewolf", "Werwolf"],
  ["witch", "Hexe"],
  ["shapeshifter", "Gestaltwandler"],
  ["vampire", "Vampir"]
] as const;

const suitOptions = [
  ["red", "Rot"],
  ["blue", "Blau"],
  ["green", "Grün"],
  ["yellow", "Gelb"]
] as const;

type WizardSuit = (typeof suitOptions)[number][0];

type WizardCard = {
  id: string;
  kind: string;
  label: string;
  designKey?: string;
  suit?: WizardSuit;
  value?: number;
};

type PlayedWizardCard = {
  playId: string;
  playerUsername: string;
  card: WizardCard;
  shapeshifterMode?: "wizard" | "jester";
  chosenTrumpSuit?: WizardSuit;
  effectSuppressed?: boolean;
};

type WizardPlayer = {
  username: string;
  seat: number;
  handCount: number;
  prediction: number | null;
  tricksWon: number;
  score: number;
  isSelf: boolean;
};

type WizardPendingEffect =
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

type WizardGame = {
  id: string;
  ownerUsername: string;
  status: "lobby" | "trumpSelection" | "prediction" | "playing" | "effect" | "roundEnded" | "finished";
  settings: {
    maxPlayers: number;
    enabledOptionalCards: string[];
    timeLimitSeconds: number | null;
    scoreboardVisibleDefault: boolean;
  };
  players: WizardPlayer[];
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

type WizardGameListItem = {
  id: string;
  ownerUsername: string;
  status: WizardGame["status"];
  playerCount: number;
  maxPlayers: number;
  roundNumber: number;
  joinPath: string;
};

type WizardSocketMessage =
  | {
      type: "hello";
      username: string;
    }
  | {
      type: "gamesList";
      games: WizardGameListItem[];
    }
  | {
      type: "gameState";
      game: WizardGame;
    }
  | {
      type: "error";
      message: string;
    };

const getStatusLabel = (status: WizardGame["status"]) => {
  const labels: Record<WizardGame["status"], string> = {
    lobby: "Lobby",
    trumpSelection: "Trumpfwahl",
    prediction: "Vorhersage",
    playing: "Stich läuft",
    effect: "Sondereffekt",
    roundEnded: "Runde beendet",
    finished: "Beendet"
  };

  return labels[status];
};

const getSuitLabel = (suit: WizardSuit | null) => suitOptions.find(([value]) => value === suit)?.[1] ?? "Keine";

export function WizardGameClient({
  initialJoinGameId = null
}: {
  initialJoinGameId?: string | null;
}) {
  const socketRef = useRef<WebSocket | null>(null);
  const didAutoJoinRef = useRef(false);
  const [socketStatus, setSocketStatus] = useState<"connecting" | "open" | "closed">("connecting");
  const [username, setUsername] = useState<string | null>(null);
  const [games, setGames] = useState<WizardGameListItem[]>([]);
  const [game, setGame] = useState<WizardGame | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [maxPlayers, setMaxPlayers] = useState(6);
  const [timeLimitSeconds, setTimeLimitSeconds] = useState("");
  const [enabledOptionalCards, setEnabledOptionalCards] = useState<string[]>(optionalCards.map(([value]) => value));
  const [scoreboardVisible, setScoreboardVisible] = useState(true);
  const [prediction, setPrediction] = useState(0);
  const [selectedTrumpSuit, setSelectedTrumpSuit] = useState<WizardSuit>("red");
  const [shapeshifterMode, setShapeshifterMode] = useState<"wizard" | "jester">("wizard");
  const [witchHandCardId, setWitchHandCardId] = useState("");
  const [witchTrickPlayId, setWitchTrickPlayId] = useState("");

  const isSelfOwner = username && game?.ownerUsername.toLowerCase() === username.toLowerCase();
  const selfPlayer = game?.players.find((player) => player.isSelf) ?? null;
  const joinUrl = useMemo(() => {
    if (!game || typeof window === "undefined") {
      return "";
    }

    return `${window.location.origin}${game.joinPath}`;
  }, [game]);

  const send = useCallback((payload: unknown) => {
    const socket = socketRef.current;

    if (socket?.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify(payload));
    }
  }, []);

  useEffect(() => {
    const socket = new WebSocket(`${webSocketBaseUrl}/ws/wizard`);
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      setSocketStatus("open");
      setError(null);
    });

    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data as string) as WizardSocketMessage;

      if (message.type === "hello") {
        setUsername(message.username);
      }

      if (message.type === "gamesList") {
        setGames(message.games);
      }

      if (message.type === "gameState") {
        setGame((currentGame) => {
          if (!currentGame || currentGame.id !== message.game.id) {
            setScoreboardVisible(message.game.settings.scoreboardVisibleDefault);
          }

          return message.game;
        });
        setPrediction(message.game.roundNumber);
        setError(null);
      }

      if (message.type === "error") {
        setError(message.message);
      }
    });

    socket.addEventListener("close", () => {
      setSocketStatus("closed");
    });

    return () => {
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (socketStatus === "open" && initialJoinGameId && !didAutoJoinRef.current) {
      didAutoJoinRef.current = true;
      send({
        type: "joinGame",
        gameId: initialJoinGameId
      });
    }
  }, [initialJoinGameId, send, socketStatus]);

  const createGame = () => {
    send({
      type: "createGame",
      settings: {
        maxPlayers,
        enabledOptionalCards,
        timeLimitSeconds: timeLimitSeconds ? Number(timeLimitSeconds) : null,
        scoreboardVisibleDefault: scoreboardVisible
      }
    });
  };

  const playCard = (card: WizardCard) => {
    send({
      type: "playCard",
      gameId: game?.id,
      cardId: card.id,
      shapeshifterMode: card.kind === "shapeshifter" ? shapeshifterMode : undefined,
      chosenTrumpSuit: selectedTrumpSuit
    });
  };

  return (
    <section className="w-full text-left">
      <PrivateTabs />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="mb-5 inline-flex border border-suit-green/50 bg-suit-green/10 px-3 py-1 text-sm font-medium text-suit-green">
            WebSocket-Spiel
          </p>
          <h1 className="text-5xl font-black text-white">Wizard</h1>
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/70">
            Erstelle eine Lobby, teile den Join-Link und spiele Wizard mit bis zu 6 eingeloggten Accounts.
          </p>
        </div>
        <div className="border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white/70">
          Verbindung: <span className="font-bold text-white">{socketStatus}</span>
        </div>
      </div>

      {error ? (
        <div className="mt-6 border border-suit-orange/50 bg-suit-orange/10 p-4 text-sm font-semibold text-suit-orange">
          {error}
        </div>
      ) : null}

      {!game ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <section className="border border-white/12 bg-white/[0.045] p-5">
            <h2 className="text-2xl font-black text-white">Lobby erstellen</h2>
            <label className="mt-5 block text-sm font-bold text-white/78">
              Maximale Spieler
              <input
                type="number"
                min={2}
                max={6}
                value={maxPlayers}
                onChange={(event) => setMaxPlayers(Number(event.target.value))}
                className="mt-2 w-full border border-white/12 bg-suit-black px-3 py-3 text-white"
              />
            </label>
            <label className="mt-4 block text-sm font-bold text-white/78">
              Zeitlimit pro Zug in Sekunden
              <input
                type="number"
                min={15}
                value={timeLimitSeconds}
                onChange={(event) => setTimeLimitSeconds(event.target.value)}
                placeholder="Aus"
                className="mt-2 w-full border border-white/12 bg-suit-black px-3 py-3 text-white"
              />
            </label>
            <label className="mt-4 flex items-center gap-3 text-sm font-bold text-white/78">
              <input
                type="checkbox"
                checked={scoreboardVisible}
                onChange={(event) => setScoreboardVisible(event.target.checked)}
              />
              Punktestand standardmäßig anzeigen
            </label>
            <div className="mt-5 grid gap-2 sm:grid-cols-2">
              {optionalCards.map(([value, label]) => (
                <label key={value} className="flex items-center gap-3 border border-white/10 bg-suit-black/40 p-3 text-sm text-white/72">
                  <input
                    type="checkbox"
                    checked={enabledOptionalCards.includes(value)}
                    onChange={(event) => {
                      setEnabledOptionalCards((current) =>
                        event.target.checked ? [...current, value] : current.filter((card) => card !== value)
                      );
                    }}
                  />
                  {label}
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={createGame}
              className="mt-5 bg-suit-orange px-5 py-3 text-sm font-bold text-suit-black transition hover:bg-orange-400"
            >
              Lobby erstellen
            </button>
          </section>

          <section className="border border-white/12 bg-white/[0.045] p-5">
            <h2 className="text-2xl font-black text-white">Offene Spiele</h2>
            <div className="mt-5 grid gap-3">
              {games.length ? (
                games.map((item) => (
                  <div key={item.id} className="border border-white/10 bg-suit-black/40 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-bold text-white">Lobby {item.id}</p>
                        <p className="mt-1 text-sm text-white/64">
                          {getStatusLabel(item.status)} · {item.playerCount}/{item.maxPlayers} Spieler · Host {item.ownerUsername}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => send({ type: "joinGame", gameId: item.id })}
                          className="bg-suit-purple px-4 py-2 text-sm font-bold text-white transition hover:bg-suit-orange hover:text-suit-black"
                        >
                          Beitreten
                        </button>
                        <Link
                          href={item.joinPath}
                          className="border border-white/12 px-4 py-2 text-sm font-bold text-white/72 transition hover:text-white"
                        >
                          Link
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-white/64">Noch keine Wizard-Lobby vorhanden.</p>
              )}
            </div>
          </section>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 xl:grid-cols-[1.3fr_0.8fr]">
          <section className="border border-white/12 bg-white/[0.045] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-3xl font-black text-white">Lobby {game.id}</h2>
                <p className="mt-2 text-sm text-white/64">
                  Status: {getStatusLabel(game.status)} · Runde {game.roundNumber || 0}/{game.maxRounds || "-"} · Trumpf:{" "}
                  {getSuitLabel(game.trumpSuit)}
                </p>
                <p className="mt-2 text-sm text-white/64">Join-Link: {joinUrl}</p>
              </div>
              <button
                type="button"
                onClick={() => setGame(null)}
                className="border border-white/12 px-4 py-3 text-sm font-bold text-white/72 transition hover:text-white"
              >
                Zur Lobbyliste
              </button>
            </div>

            {game.status === "lobby" ? (
              <div className="mt-6">
                <h3 className="text-xl font-black text-white">Spieler</h3>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {game.players.map((player) => (
                    <div key={player.username} className="border border-white/10 bg-suit-black/40 p-3 text-white/72">
                      {player.seat + 1}. {player.username}
                    </div>
                  ))}
                </div>
                {isSelfOwner ? (
                  <button
                    type="button"
                    onClick={() => send({ type: "startGame", gameId: game.id })}
                    className="mt-5 bg-suit-orange px-5 py-3 text-sm font-bold text-suit-black transition hover:bg-orange-400"
                  >
                    Spiel starten
                  </button>
                ) : null}
              </div>
            ) : null}

            {game.status === "trumpSelection" && game.trumpChoicePendingFor?.toLowerCase() === username?.toLowerCase() ? (
              <div className="mt-6 border border-suit-green/40 bg-suit-green/10 p-4">
                <h3 className="text-xl font-black text-white">Trumpf bestimmen</h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {suitOptions.map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => send({ type: "chooseTrump", gameId: game.id, suit: value })}
                      className="bg-suit-purple px-4 py-2 text-sm font-bold text-white transition hover:bg-suit-orange hover:text-suit-black"
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {game.status === "prediction" && selfPlayer?.prediction === null ? (
              <div className="mt-6 border border-white/12 bg-suit-black/40 p-4">
                <h3 className="text-xl font-black text-white">Stiche vorhersagen</h3>
                <div className="mt-4 flex flex-wrap items-end gap-3">
                  <label className="text-sm font-bold text-white/78">
                    Vorhersage
                    <input
                      type="number"
                      min={0}
                      max={game.roundNumber}
                      value={prediction}
                      onChange={(event) => setPrediction(Number(event.target.value))}
                      className="mt-2 w-28 border border-white/12 bg-suit-black px-3 py-3 text-white"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => send({ type: "makePrediction", gameId: game.id, prediction })}
                    className="bg-suit-orange px-5 py-3 text-sm font-bold text-suit-black transition hover:bg-orange-400"
                  >
                    Abgeben
                  </button>
                </div>
              </div>
            ) : null}

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              <div className="border border-white/10 bg-suit-black/40 p-4">
                <h3 className="text-xl font-black text-white">Aktueller Stich</h3>
                <div className="mt-3 grid gap-2">
                  {game.currentTrick.length ? (
                    game.currentTrick.map((played) => (
                      <div key={played.playId} className="border border-white/10 p-3 text-sm text-white/72">
                        {played.playerUsername}: {played.card.label}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-white/60">Noch keine Karte im Stich.</p>
                  )}
                </div>
              </div>
              <div className="border border-white/10 bg-suit-black/40 p-4">
                <h3 className="text-xl font-black text-white">Trumpfkarte</h3>
                <p className="mt-3 text-sm text-white/72">{game.trumpCard?.label ?? "Keine"}</p>
                <p className="mt-2 text-sm text-white/60">Vampir kopiert: {game.vampireCopyCard?.label ?? "Keine Karte"}</p>
              </div>
            </div>

            {game.pendingEffect ? (
              <div className="mt-6 border border-suit-orange/50 bg-suit-orange/10 p-4">
                <h3 className="text-xl font-black text-white">Sondereffekt</h3>
                {game.pendingEffect.type === "cloud" ? (
                  <div className="mt-3">
                    <p className="text-sm text-white/72">Wolke: {game.pendingEffect.username} muss die Vorhersage ändern.</p>
                    {game.pendingEffect.username.toLowerCase() === username?.toLowerCase() ? (
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => send({ type: "resolveCloud", gameId: game.id, delta: 1 })}
                          className="bg-suit-purple px-4 py-2 text-sm font-bold text-white"
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          onClick={() => send({ type: "resolveCloud", gameId: game.id, delta: -1 })}
                          className="bg-suit-purple px-4 py-2 text-sm font-bold text-white"
                        >
                          -1
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
                {game.pendingEffect.type === "juggler" ? (
                  <div className="mt-3">
                    <p className="text-sm text-white/72">Jongleur: Alle geben ihre letzte Handkarte nach links weiter.</p>
                    <button
                      type="button"
                      onClick={() => send({ type: "resolveJuggler", gameId: game.id })}
                      className="mt-3 bg-suit-purple px-4 py-2 text-sm font-bold text-white"
                    >
                      Effekt ausführen
                    </button>
                  </div>
                ) : null}
                {game.pendingEffect.type === "witch" ? (
                  <div className="mt-3">
                    <p className="text-sm text-white/72">Hexe: {game.pendingEffect.username} darf eine Karte tauschen.</p>
                    {game.pendingEffect.username.toLowerCase() === username?.toLowerCase() ? (
                      <div className="mt-3 grid gap-3 sm:grid-cols-2">
                        <select
                          value={witchHandCardId}
                          onChange={(event) => setWitchHandCardId(event.target.value)}
                          className="border border-white/12 bg-suit-black px-3 py-3 text-white"
                        >
                          <option value="">Handkarte wählen</option>
                          {game.selfHand.map((card) => (
                            <option key={card.id} value={card.id}>
                              {card.label}
                            </option>
                          ))}
                        </select>
                        <select
                          value={witchTrickPlayId}
                          onChange={(event) => setWitchTrickPlayId(event.target.value)}
                          className="border border-white/12 bg-suit-black px-3 py-3 text-white"
                        >
                          <option value="">Stichkarte wählen</option>
                          {game.pendingEffect.trick
                            .filter((played) => played.card.kind !== "witch")
                            .map((played) => (
                              <option key={played.playId} value={played.playId}>
                                {played.playerUsername}: {played.card.label}
                              </option>
                            ))}
                        </select>
                        <button
                          type="button"
                          onClick={() =>
                            send({
                              type: "resolveWitch",
                              gameId: game.id,
                              handCardId: witchHandCardId,
                              trickPlayId: witchTrickPlayId
                            })
                          }
                          className="bg-suit-purple px-4 py-2 text-sm font-bold text-white"
                        >
                          Tauschen
                        </button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="mt-6">
              <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h3 className="text-xl font-black text-white">Deine Hand</h3>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={selectedTrumpSuit}
                    onChange={(event) => setSelectedTrumpSuit(event.target.value as WizardSuit)}
                    className="border border-white/12 bg-suit-black px-3 py-2 text-sm text-white"
                  >
                    {suitOptions.map(([value, label]) => (
                      <option key={value} value={value}>
                        Werwolf: {label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={shapeshifterMode}
                    onChange={(event) => setShapeshifterMode(event.target.value as "wizard" | "jester")}
                    className="border border-white/12 bg-suit-black px-3 py-2 text-sm text-white"
                  >
                    <option value="wizard">Gestaltwandler als Wizard</option>
                    <option value="jester">Gestaltwandler als Narr</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {game.selfHand.map((card) => {
                  const isValid = game.validCardIds.includes(card.id);
                  const isActive = game.activeUsername?.toLowerCase() === username?.toLowerCase();

                  return (
                    <button
                      key={card.id}
                      type="button"
                      disabled={!isActive || !isValid || game.status !== "playing"}
                      onClick={() => playCard(card)}
                      className={`min-h-24 border p-4 text-left transition ${
                        isActive && isValid && game.status === "playing"
                          ? "border-suit-green/60 bg-suit-purple/50 text-white hover:bg-suit-orange hover:text-suit-black"
                          : "border-white/10 bg-suit-black/40 text-white/42"
                      }`}
                    >
                      <span className="block text-sm font-black">{card.label}</span>
                      {card.designKey ? <span className="mt-1 block text-[11px] uppercase text-white/48">{card.designKey}</span> : null}
                      <span className="mt-2 block text-xs">{isValid ? "spielbar" : "gesperrt"}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <aside className="grid gap-6">
            <section className="border border-white/12 bg-white/[0.045] p-5">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-black text-white">Punktestand</h2>
                <button
                  type="button"
                  onClick={() => setScoreboardVisible((current) => !current)}
                  className="border border-white/12 px-3 py-2 text-xs font-bold text-white/72"
                >
                  {scoreboardVisible ? "Ausblenden" : "Einblenden"}
                </button>
              </div>
              {scoreboardVisible ? (
                <div className="mt-4 grid gap-2">
                  {game.players.map((player) => (
                    <div key={player.username} className="grid grid-cols-[1fr_auto] gap-3 border border-white/10 bg-suit-black/40 p-3 text-sm">
                      <div>
                        <p className="font-bold text-white">{player.username}</p>
                        <p className="text-white/58">
                          Vorhersage {player.prediction ?? "-"} · Stiche {player.tricksWon} · Hand {player.handCount}
                        </p>
                      </div>
                      <p className="font-black text-suit-green">{player.score}</p>
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="border border-white/12 bg-white/[0.045] p-5">
              <h2 className="text-2xl font-black text-white">Log</h2>
              <div className="mt-4 grid gap-2">
                {game.messages.map((message) => (
                  <p key={message} className="border-l-2 border-suit-green/70 pl-3 text-sm leading-6 text-white/68">
                    {message}
                  </p>
                ))}
              </div>
            </section>
          </aside>
        </div>
      )}
    </section>
  );
}
