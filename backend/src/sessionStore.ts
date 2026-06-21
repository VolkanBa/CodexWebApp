import { randomBytes } from "node:crypto";
import type { UserRole } from "./config.js";

export type SessionUser = {
  username: string;
  role: UserRole;
};

type Session = {
  createdAt: number;
  expiresAt: number;
  user: SessionUser;
};

const sessions = new Map<string, Session>();

const removeExpiredSessions = () => {
  const now = Date.now();

  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt <= now) {
      sessions.delete(token);
    }
  }
};

export const createSession = (ttlMs: number, user: SessionUser) => {
  removeExpiredSessions();

  const token = randomBytes(32).toString("base64url");
  const now = Date.now();

  sessions.set(token, {
    createdAt: now,
    expiresAt: now + ttlMs,
    user
  });

  return token;
};

export const getSessionUser = (token: string | undefined) => {
  if (!token) {
    return undefined;
  }

  const session = sessions.get(token);

  if (!session) {
    return undefined;
  }

  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return undefined;
  }

  return session.user;
};

export const destroySession = (token: string | undefined) => {
  if (token) {
    sessions.delete(token);
  }
};
