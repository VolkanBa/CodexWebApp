import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

const configDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(configDir, "../..");
loadEnv({ path: resolve(configDir, "../.env") });

const minutesToMs = (minutes: number) => minutes * 60 * 1000;

const parsePositiveInt = (value: string | undefined, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const parseBoolean = (value: string | undefined, fallback: boolean) => {
  if (!value) {
    return fallback;
  }

  return value.toLowerCase() === "true";
};

export type UserRole = "admin" | "user";

export type PrivateAccessUser = {
  username: string;
  normalizedUsername: string;
  passwordHash: string;
  role: UserRole;
};

const normalizeUsername = (username: string) => username.trim().toLowerCase();

const parsePrivateAccessUsers = () => {
  const users = new Map<string, PrivateAccessUser>();

  const addUser = (username: string, passwordHash: string | undefined, role: UserRole) => {
    const trimmedUsername = username.trim();
    const trimmedPasswordHash = passwordHash?.trim();

    if (!trimmedUsername || !trimmedPasswordHash) {
      return;
    }

    const normalizedUsername = normalizeUsername(trimmedUsername);

    if (users.has(normalizedUsername)) {
      throw new Error(`Duplicate auth username configured: ${trimmedUsername}`);
    }

    users.set(normalizedUsername, {
      username: trimmedUsername,
      normalizedUsername,
      passwordHash: trimmedPasswordHash,
      role
    });
  };

  addUser(
    process.env.PRIVATE_ACCESS_ADMIN_USERNAME ?? "Volle",
    process.env.PRIVATE_ACCESS_PASSWORD_HASH,
    "admin"
  );

  if (process.env.PRIVATE_ACCESS_USERS_JSON) {
    const parsedUsers = JSON.parse(process.env.PRIVATE_ACCESS_USERS_JSON) as unknown;

    if (!Array.isArray(parsedUsers)) {
      throw new Error("PRIVATE_ACCESS_USERS_JSON must be a JSON array.");
    }

    for (const user of parsedUsers) {
      if (!user || typeof user !== "object") {
        throw new Error("Each PRIVATE_ACCESS_USERS_JSON entry must be an object.");
      }

      const candidate = user as Record<string, unknown>;
      const username = typeof candidate.username === "string" ? candidate.username : "";
      const passwordHash = typeof candidate.passwordHash === "string" ? candidate.passwordHash : "";
      const role = candidate.role === "admin" ? "admin" : "user";

      addUser(username, passwordHash, role);
    }
  }

  return Array.from(users.values());
};

export const config = {
  port: parsePositiveInt(process.env.PORT, 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:3000",
  privateAccessAdminUsername: process.env.PRIVATE_ACCESS_ADMIN_USERNAME ?? "Volle",
  privateAccessPasswordHash: process.env.PRIVATE_ACCESS_PASSWORD_HASH,
  privateAccessUsers: parsePrivateAccessUsers(),
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? "private_session",
  sessionCookieSecure: parseBoolean(
    process.env.SESSION_COOKIE_SECURE,
    process.env.NODE_ENV === "production"
  ),
  sessionTtlMs: minutesToMs(parsePositiveInt(process.env.SESSION_TTL_MINUTES, 60 * 24)),
  loginRateLimitWindowMs: minutesToMs(parsePositiveInt(process.env.AUTH_RATE_LIMIT_WINDOW_MINUTES, 15)),
  loginRateLimitMax: parsePositiveInt(process.env.AUTH_RATE_LIMIT_MAX, 5),
  subjectDataFilePath: process.env.SUBJECT_DATA_FILE_PATH ?? resolve(projectRoot, "backend/data/subjects.json"),
  uploadRoot: process.env.UPLOAD_ROOT ?? resolve(projectRoot, "uploads")
};
