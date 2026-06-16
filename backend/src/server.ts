import argon2 from "argon2";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import type { CookieOptions, NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { z } from "zod";
import { config } from "./config.js";
import { createSession, destroySession, isValidSession } from "./sessionStore.js";

const app = express();

const loginSchema = z.object({
  password: z.string().min(1).max(256)
});

const sessionCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: config.isProduction,
  path: "/",
  maxAge: config.sessionTtlMs
};

const clearSessionCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: config.isProduction,
  path: "/"
};

const getSessionToken = (req: Request) => {
  const value = req.cookies?.[config.sessionCookieName];
  return typeof value === "string" ? value : undefined;
};

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  if (!isValidSession(getSessionToken(req))) {
    res.status(401).json({
      authenticated: false,
      error: "Unauthorized"
    });
    return;
  }

  next();
};

const loginRateLimiter = rateLimit({
  windowMs: config.loginRateLimitWindowMs,
  limit: config.loginRateLimitMax,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: {
    error: "Too many login attempts. Please try again later."
  }
});

app.use(helmet());
app.use(
  cors({
    origin: config.frontendOrigin,
    credentials: true
  })
);
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "personal-webapp-backend"
  });
});

app.post("/auth/login", loginRateLimiter, async (req, res) => {
  if (!config.privateAccessPasswordHash) {
    res.status(503).json({
      authenticated: false,
      error: "Private access is not configured."
    });
    return;
  }

  const parsedBody = loginSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json({
      authenticated: false,
      error: "Invalid login payload."
    });
    return;
  }

  let isPasswordValid = false;

  try {
    isPasswordValid = await argon2.verify(
      config.privateAccessPasswordHash,
      parsedBody.data.password
    );
  } catch {
    res.status(503).json({
      authenticated: false,
      error: "Private access is misconfigured."
    });
    return;
  }

  if (!isPasswordValid) {
    res.status(401).json({
      authenticated: false,
      error: "Invalid password."
    });
    return;
  }

  const sessionToken = createSession(config.sessionTtlMs);

  res.cookie(config.sessionCookieName, sessionToken, sessionCookieOptions);
  res.status(200).json({
    authenticated: true
  });
});

app.post("/auth/logout", (req, res) => {
  destroySession(getSessionToken(req));
  res.clearCookie(config.sessionCookieName, clearSessionCookieOptions);
  res.status(200).json({
    authenticated: false
  });
});

app.get("/auth/me", requireAuth, (_req, res) => {
  res.status(200).json({
    authenticated: true,
    area: "private"
  });
});

app.get("/private/content", requireAuth, (_req, res) => {
  res.status(200).json({
    title: "Privater Bereich",
    message: "Du bist angemeldet. Echte private Inhalte werden später serverseitig geladen.",
    items: [
      "Session wird über ein httpOnly Cookie geschützt.",
      "Das Passwort wird nur als Argon2-Hash im Backend geprüft.",
      "Private Inhalte werden nicht im Frontend hardcodiert."
    ]
  });
});

app.use((_req, res) => {
  res.status(404).json({
    error: "Not found"
  });
});

app.listen(config.port, () => {
  console.log(`Backend listening on http://localhost:${config.port}`);
});
