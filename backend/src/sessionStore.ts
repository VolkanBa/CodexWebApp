import { randomBytes } from "node:crypto";

type Session = {
  createdAt: number;
  expiresAt: number;
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

export const createSession = (ttlMs: number) => {
  removeExpiredSessions();

  const token = randomBytes(32).toString("base64url");
  const now = Date.now();

  sessions.set(token, {
    createdAt: now,
    expiresAt: now + ttlMs
  });

  return token;
};

export const isValidSession = (token: string | undefined) => {
  if (!token) {
    return false;
  }

  const session = sessions.get(token);

  if (!session) {
    return false;
  }

  if (session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return false;
  }

  return true;
};

export const destroySession = (token: string | undefined) => {
  if (token) {
    sessions.delete(token);
  }
};
