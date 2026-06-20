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

export const config = {
  port: parsePositiveInt(process.env.PORT, 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:3000",
  privateAccessPasswordHash: process.env.PRIVATE_ACCESS_PASSWORD_HASH,
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
