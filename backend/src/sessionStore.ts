import { randomBytes } from "node:crypto";
import type { UserRole } from "./config.js";

export type SessionUser = {
  username: string;
  role: UserRole;
};

type Session = {
  createdAt: number;
  expiresAt: number;
  lastActivityAt: number;
  user: SessionUser;
};

const sessions = new Map<string, Session>();

const normalizeUsername = (username: string) => username.trim().toLowerCase();

const removeExpiredSessions = () => {
  const now = Date.now();

  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt <= now) {
      sessions.delete(token);
    }
  }
};

export const hasActiveSessionForUsername = (username: string) => {
  removeExpiredSessions();

  const normalizedUsername = normalizeUsername(username);

  for (const session of sessions.values()) {
    if (normalizeUsername(session.user.username) === normalizedUsername) {
      return true;
    }
  }

  return false;
};

export const createSession = (ttlMs: number, user: SessionUser) => {
  removeExpiredSessions();

  const token = randomBytes(32).toString("base64url");
  const now = Date.now();

  sessions.set(token, {
    createdAt: now,
    expiresAt: now + ttlMs,
    lastActivityAt: now,
    user
  });

  return token;
};

export const getSessionUser = (token: string | undefined, ttlMs: number) => {
  if (!token) {
    return undefined;
  }

  const session = sessions.get(token);

  if (!session) {
    return undefined;
  }

  const now = Date.now();

  if (session.expiresAt <= now) {
    sessions.delete(token);
    return undefined;
  }

  session.lastActivityAt = now;
  session.expiresAt = now + ttlMs;

  return session.user;
};

export const destroySession = (token: string | undefined) => {
  if (token) {
    sessions.delete(token);
  }
};
