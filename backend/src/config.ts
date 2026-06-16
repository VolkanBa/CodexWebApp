import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";

const configDir = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(configDir, "../.env") });

const minutesToMs = (minutes: number) => minutes * 60 * 1000;

const parsePositiveInt = (value: string | undefined, fallback: number) => {
  if (!value) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

export const config = {
  port: parsePositiveInt(process.env.PORT, 4000),
  frontendOrigin: process.env.FRONTEND_ORIGIN ?? "http://localhost:3000",
  isProduction: process.env.NODE_ENV === "production",
  privateAccessPasswordHash: process.env.PRIVATE_ACCESS_PASSWORD_HASH,
  sessionCookieName: process.env.SESSION_COOKIE_NAME ?? "private_session",
  sessionTtlMs: minutesToMs(parsePositiveInt(process.env.SESSION_TTL_MINUTES, 60 * 24)),
  loginRateLimitWindowMs: minutesToMs(parsePositiveInt(process.env.AUTH_RATE_LIMIT_WINDOW_MINUTES, 15)),
  loginRateLimitMax: parsePositiveInt(process.env.AUTH_RATE_LIMIT_MAX, 5)
};
