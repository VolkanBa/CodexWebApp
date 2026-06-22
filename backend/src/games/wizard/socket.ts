import type { IncomingMessage, Server } from "node:http";
import { WebSocket, WebSocketServer } from "ws";
import { config } from "../../config.js";
import { getSessionUser, type SessionUser } from "../../sessionStore.js";
import {
  chooseWizardTrump,
  createWizardDebugGame,
  createWizardGame,
  getWizardGame,
  getWizardGameView,
  joinWizardGame,
  listWizardGames,
  makeWizardPrediction,
  playWizardCard,
  resolveWizardCloud,
  resolveWizardJuggler,
  resolveWizardWitchExchange,
  startWizardGame
} from "./store.js";
import { type WizardCreateGameInput, type WizardSuit, wizardSuits } from "./types.js";

type WizardConnection = {
  socket: WebSocket;
  token: string;
  user: SessionUser;
};

type WizardClientMessage =
  | {
      type: "listGames";
    }
  | {
      type: "createGame";
      settings?: WizardCreateGameInput;
    }
  | {
      type: "createDebugGame";
      settings?: WizardCreateGameInput;
    }
  | {
      type: "joinGame";
      gameId: string;
    }
  | {
      type: "viewGame";
      gameId: string;
    }
  | {
      type: "startGame";
      gameId: string;
    }
  | {
      type: "chooseTrump";
      gameId: string;
      suit: WizardSuit;
    }
  | {
      type: "makePrediction";
      gameId: string;
      prediction: number;
      playerUsername?: string;
    }
  | {
      type: "playCard";
      gameId: string;
      cardId: string;
      playerUsername?: string;
      shapeshifterMode?: "wizard" | "jester";
      chosenTrumpSuit?: WizardSuit;
    }
  | {
      type: "resolveCloud";
      gameId: string;
      delta: 1 | -1;
    }
  | {
      type: "resolveJuggler";
      gameId: string;
    }
  | {
      type: "resolveWitch";
      gameId: string;
      handCardId: string;
      trickPlayId: string;
    };

const parseCookies = (request: IncomingMessage) => {
  const cookieHeader = request.headers.cookie;

  if (!cookieHeader) {
    return new Map<string, string>();
  }

  return new Map(
    cookieHeader.split(";").flatMap((part) => {
      const [rawName, ...rawValue] = part.trim().split("=");

      if (!rawName) {
        return [];
      }

      return [[rawName, decodeURIComponent(rawValue.join("="))]];
    })
  );
};

const getSessionFromRequest = (request: IncomingMessage) => {
  const cookies = parseCookies(request);
  const token = cookies.get(config.sessionCookieName);

  if (!token) {
    return null;
  }

  const user = getSessionUser(token, config.sessionTtlMs);

  if (!user) {
    return null;
  }

  return {
    token,
    user
  };
};

const sendJson = (socket: WebSocket, payload: unknown) => {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
};

const sendError = (socket: WebSocket, message: string) => {
  sendJson(socket, {
    type: "error",
    message
  });
};

const parseMessage = (rawMessage: WebSocket.RawData): WizardClientMessage => {
  const parsed = JSON.parse(rawMessage.toString()) as WizardClientMessage;

  if (!parsed || typeof parsed !== "object" || typeof parsed.type !== "string") {
    throw new Error("Ungültige WebSocket-Nachricht.");
  }

  return parsed;
};

const getAuthedUser = (connection: WizardConnection) => {
  const user = getSessionUser(connection.token, config.sessionTtlMs);

  if (!user) {
    connection.socket.close(1008, "Session abgelaufen.");
    return null;
  }

  connection.user = user;
  return user;
};

export const registerWizardSocketServer = (server: Server) => {
  const webSocketServer = new WebSocketServer({
    server,
    path: "/ws/wizard"
  });
  const connections = new Set<WizardConnection>();

  const broadcastGamesList = () => {
    const games = listWizardGames();

    for (const connection of connections) {
      sendJson(connection.socket, {
        type: "gamesList",
        games
      });
    }
  };

  const sendGameState = (connection: WizardConnection, gameId: string) => {
    const game = getWizardGame(gameId);

    if (!game) {
      sendError(connection.socket, "Wizard-Spiel wurde nicht gefunden.");
      return;
    }

    sendJson(connection.socket, {
      type: "gameState",
      game: getWizardGameView(game, connection.user.username)
    });
  };

  const broadcastGameState = (gameId: string) => {
    const game = getWizardGame(gameId);

    if (!game) {
      return;
    }

    const playerNames = new Set(game.players.map((player) => player.username.toLowerCase()));
    const debugController = game.debugMode?.controllerUsername.toLowerCase();

    for (const connection of connections) {
      if (
        playerNames.has(connection.user.username.toLowerCase()) ||
        debugController === connection.user.username.toLowerCase()
      ) {
        sendJson(connection.socket, {
          type: "gameState",
          game: getWizardGameView(game, connection.user.username)
        });
      }
    }
  };

  webSocketServer.on("connection", (socket, request) => {
    const session = getSessionFromRequest(request);

    if (!session) {
      socket.close(1008, "Nicht angemeldet.");
      return;
    }

    const connection: WizardConnection = {
      socket,
      token: session.token,
      user: session.user
    };
    connections.add(connection);

    sendJson(socket, {
      type: "hello",
      username: session.user.username,
      role: session.user.role
    });
    sendJson(socket, {
      type: "gamesList",
      games: listWizardGames()
    });

    socket.on("message", (rawMessage) => {
      const user = getAuthedUser(connection);

      if (!user) {
        return;
      }

      try {
        const message = parseMessage(rawMessage);

        switch (message.type) {
          case "listGames":
            sendJson(socket, {
              type: "gamesList",
              games: listWizardGames()
            });
            break;
          case "createGame": {
            const game = createWizardGame(user.username, message.settings);
            sendGameState(connection, game.id);
            broadcastGamesList();
            break;
          }
          case "createDebugGame": {
            if (user.role !== "admin") {
              throw new Error("Nur Admins dürfen den Wizard-Debugmodus starten.");
            }

            const game = createWizardDebugGame(user.username, message.settings);
            sendGameState(connection, game.id);
            broadcastGamesList();
            break;
          }
          case "joinGame": {
            const game = joinWizardGame(message.gameId, user.username);
            broadcastGameState(game.id);
            broadcastGamesList();
            break;
          }
          case "viewGame":
            sendGameState(connection, message.gameId);
            break;
          case "startGame": {
            const game = startWizardGame(message.gameId, user.username);
            broadcastGameState(game.id);
            broadcastGamesList();
            break;
          }
          case "chooseTrump": {
            if (!wizardSuits.includes(message.suit)) {
              throw new Error("Ungültige Trumpffarbe.");
            }

            const game = chooseWizardTrump(message.gameId, user.username, message.suit);
            broadcastGameState(game.id);
            broadcastGamesList();
            break;
          }
          case "makePrediction": {
            const game = makeWizardPrediction(message.gameId, user.username, message.prediction, message.playerUsername);
            broadcastGameState(game.id);
            broadcastGamesList();
            break;
          }
          case "playCard": {
            const game = playWizardCard(message.gameId, user.username, {
              cardId: message.cardId,
              playerUsername: message.playerUsername,
              shapeshifterMode: message.shapeshifterMode,
              chosenTrumpSuit: message.chosenTrumpSuit
            });
            broadcastGameState(game.id);
            broadcastGamesList();
            break;
          }
          case "resolveCloud": {
            const game = resolveWizardCloud(message.gameId, user.username, message.delta);
            broadcastGameState(game.id);
            broadcastGamesList();
            break;
          }
          case "resolveJuggler": {
            const game = resolveWizardJuggler(message.gameId, user.username);
            broadcastGameState(game.id);
            broadcastGamesList();
            break;
          }
          case "resolveWitch": {
            const game = resolveWizardWitchExchange(message.gameId, user.username, {
              handCardId: message.handCardId,
              trickPlayId: message.trickPlayId
            });
            broadcastGameState(game.id);
            broadcastGamesList();
            break;
          }
          default:
            sendError(socket, "Unbekannte Wizard-Aktion.");
        }
      } catch (error) {
        sendError(socket, error instanceof Error ? error.message : "Wizard-Aktion fehlgeschlagen.");
      }
    });

    socket.on("close", () => {
      connections.delete(connection);
    });
  });

  return webSocketServer;
};
