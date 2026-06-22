import { createServer } from "node:http";
import argon2 from "argon2";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import type { CookieOptions, NextFunction, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { z } from "zod";
import { config } from "./config.js";
import { getWizardCardImagePath } from "./games/wizard/cardImages.js";
import { registerWizardSocketServer } from "./games/wizard/socket.js";
import {
  createSession,
  destroySession,
  getSessionUser,
  hasActiveSessionForUsername,
  type SessionUser
} from "./sessionStore.js";
import {
  createSubject,
  deleteSubject,
  getPublicSubjectBySlug,
  listAdminSubjects,
  listPublicSubjects,
  updateSubject
} from "./subjectStore.js";

const app = express();

const loginSchema = z.object({
  username: z.string().trim().min(1).max(60),
  password: z.string().min(1).max(256)
});

const subjectSchema = z.object({
  title: z.string().trim().min(1).max(120),
  summary: z.string().trim().max(500),
  content: z.string().trim().max(12000),
  isPublished: z.boolean(),
  images: z
    .array(
      z.object({
        id: z.string().trim().min(1).max(120),
        url: z.string().trim().min(1).max(300),
        alt: z.string().trim().max(160).optional()
      })
    )
    .max(12)
    .optional(),
  imageUploads: z
    .array(
      z.object({
        fileName: z.string().trim().min(1).max(180),
        dataUrl: z.string().max(4_500_000),
        alt: z.string().trim().max(160).optional()
      })
    )
    .max(8)
    .optional()
});

const sessionCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: config.sessionCookieSecure,
  path: "/",
  maxAge: config.sessionTtlMs
};

const clearSessionCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: config.sessionCookieSecure,
  path: "/"
};

const getSessionToken = (req: Request) => {
  const value = req.cookies?.[config.sessionCookieName];
  return typeof value === "string" ? value : undefined;
};

const refreshSessionCookie = (res: Response, sessionToken: string) => {
  res.cookie(config.sessionCookieName, sessionToken, sessionCookieOptions);
};

const getAuthenticatedUser = (req: Request) => getSessionUser(getSessionToken(req), config.sessionTtlMs);

const getRouteParam = (value: string | string[] | undefined) => {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
};

const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const sessionToken = getSessionToken(req);
  const user = getAuthenticatedUser(req);

  if (!user) {
    res.status(401).json({
      authenticated: false,
      error: "Unauthorized"
    });
    return;
  }

  if (sessionToken) {
    refreshSessionCookie(res, sessionToken);
  }

  res.locals.user = user;
  next();
};

const getResponseUser = (res: Response) => res.locals.user as SessionUser | undefined;

const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const sessionToken = getSessionToken(req);
  const user = getAuthenticatedUser(req);

  if (!user) {
    res.status(401).json({
      authenticated: false,
      error: "Unauthorized"
    });
    return;
  }

  if (user.role !== "admin") {
    res.status(403).json({
      authenticated: true,
      error: "Admin role required."
    });
    return;
  }

  if (sessionToken) {
    refreshSessionCookie(res, sessionToken);
  }

  res.locals.user = user;
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

const privateGames = [
  {
    id: "uno",
    title: "Uno",
    status: "Geplant",
    summary: "Schnelles Kartenablegen mit Farben, Zahlen und Aktionskarten.",
    href: null,
    nextSteps: ["Regelmodell festlegen", "Mehrspieler-Runden planen", "Spielstand serverseitig speichern"]
  },
  {
    id: "wizard",
    title: "Wizard",
    status: "Spielbar",
    summary: "WebSocket-basiertes Stichspiel mit Lobbys, Vorhersagen, Sonderkarten und automatischer Wertung.",
    href: "/private/games/wizard",
    nextSteps: ["Lobby erstellen", "per Link beitreten", "Punktestand ein- oder ausblenden"]
  },
  {
    id: "six-nimmt",
    title: "6 nimmt",
    status: "Geplant",
    summary: "Taktisches Ablegespiel mit Reihen, Hornochsen und Risikomanagement.",
    href: null,
    nextSteps: ["Reihenlogik definieren", "Kartenwahl synchronisieren", "Punktewertung implementieren"]
  }
];

app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin"
    }
  })
);
app.use(
  cors({
    origin: config.frontendOrigin,
    credentials: true
  })
);
app.use(express.json({ limit: "30mb" }));
app.use(cookieParser());
app.use("/uploads", express.static(config.uploadRoot));

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "personal-webapp-backend"
  });
});

app.post("/auth/login", loginRateLimiter, async (req, res) => {
  if (config.privateAccessUsers.length === 0) {
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
  const authUser = config.privateAccessUsers.find(
    (user) => user.normalizedUsername === parsedBody.data.username.toLowerCase()
  );

  if (!authUser) {
    res.status(401).json({
      authenticated: false,
      error: "Invalid username or password."
    });
    return;
  }

  try {
    isPasswordValid = await argon2.verify(authUser.passwordHash, parsedBody.data.password);
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
      error: "Invalid username or password."
    });
    return;
  }

  if (hasActiveSessionForUsername(authUser.username)) {
    res.status(409).json({
      authenticated: false,
      error: "Jemand ist schon auf dem Acc"
    });
    return;
  }

  const sessionToken = createSession(config.sessionTtlMs, {
    username: authUser.username,
    role: authUser.role
  });

  res.cookie(config.sessionCookieName, sessionToken, sessionCookieOptions);
  res.status(200).json({
    authenticated: true,
    username: authUser.username,
    role: authUser.role
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
  const user = getResponseUser(res);

  res.status(200).json({
    authenticated: true,
    area: "private",
    username: user?.username,
    role: user?.role
  });
});

app.get("/subjects", async (_req, res, next) => {
  try {
    const subjects = await listPublicSubjects(config.subjectDataFilePath);
    res.status(200).json({
      school: "Hochschule Gelsenkirchen",
      subjects
    });
  } catch (error) {
    next(error);
  }
});

app.get("/subjects/:slug", async (req, res, next) => {
  try {
    const subject = await getPublicSubjectBySlug(config.subjectDataFilePath, req.params.slug);

    if (!subject) {
      res.status(404).json({
        error: "Subject not found"
      });
      return;
    }

    res.status(200).json({
      subject
    });
  } catch (error) {
    next(error);
  }
});

app.get("/admin/subjects", requireAdmin, async (_req, res, next) => {
  try {
    const subjects = await listAdminSubjects(config.subjectDataFilePath);
    res.status(200).json({
      subjects
    });
  } catch (error) {
    next(error);
  }
});

app.post("/admin/subjects", requireAdmin, async (req, res, next) => {
  const parsedBody = subjectSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json({
      error: "Invalid subject payload."
    });
    return;
  }

  try {
    const subject = await createSubject(config.subjectDataFilePath, config.uploadRoot, parsedBody.data);
    res.status(201).json({
      subject
    });
  } catch {
    res.status(400).json({
      error: "Subject could not be created."
    });
  }
});

app.put("/admin/subjects/:id", requireAdmin, async (req, res, next) => {
  const subjectId = getRouteParam(req.params.id);

  if (!subjectId) {
    res.status(400).json({
      error: "Subject id is required."
    });
    return;
  }

  const parsedBody = subjectSchema.safeParse(req.body);

  if (!parsedBody.success) {
    res.status(400).json({
      error: "Invalid subject payload."
    });
    return;
  }

  try {
    const subject = await updateSubject(
      config.subjectDataFilePath,
      config.uploadRoot,
      subjectId,
      parsedBody.data
    );

    if (!subject) {
      res.status(404).json({
        error: "Subject not found."
      });
      return;
    }

    res.status(200).json({
      subject
    });
  } catch {
    res.status(400).json({
      error: "Subject could not be updated."
    });
  }
});

app.delete("/admin/subjects/:id", requireAdmin, async (req, res, next) => {
  const subjectId = getRouteParam(req.params.id);

  if (!subjectId) {
    res.status(400).json({
      error: "Subject id is required."
    });
    return;
  }

  try {
    const wasDeleted = await deleteSubject(config.subjectDataFilePath, config.uploadRoot, subjectId);

    if (!wasDeleted) {
      res.status(404).json({
        error: "Subject not found."
      });
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

app.get("/private/content", requireAuth, (_req, res) => {
  const user = getResponseUser(res);

  res.status(200).json({
    title: "Privater Bereich",
    message: `Du bist als ${user?.username ?? "Nutzer"} angemeldet. Echte private Inhalte werden später serverseitig geladen.`,
    items: [
      "Session wird über ein httpOnly Cookie geschützt.",
      "Das Passwort wird nur als Argon2-Hash im Backend geprüft.",
      "Private Inhalte werden nicht im Frontend hardcodiert."
    ]
  });
});

app.get("/private/games", requireAuth, (_req, res) => {
  res.status(200).json({
    title: "Spiele",
    description:
      "Hier entsteht der geschützte Spiele-Bereich für Kartenspiele und spätere private Spielrunden.",
    games: privateGames
  });
});

app.get("/private/wizard/cards/:designKey/image", requireAuth, async (req, res, next) => {
  const designKey = getRouteParam(req.params.designKey);

  if (!designKey) {
    res.status(400).json({
      error: "Wizard card design key is required."
    });
    return;
  }

  try {
    const imagePath = await getWizardCardImagePath(config.wizardCardImageRoot, designKey);

    if (!imagePath) {
      res.status(404).json({
        error: "Wizard card image not found."
      });
      return;
    }

    res.sendFile(imagePath, {
      headers: {
        "Cache-Control": "private, max-age=3600"
      }
    });
  } catch (error) {
    next(error);
  }
});

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(error);
  res.status(500).json({
    error: "Internal server error"
  });
});

app.use((_req, res) => {
  res.status(404).json({
    error: "Not found"
  });
});

const httpServer = createServer(app);

registerWizardSocketServer(httpServer);

httpServer.listen(config.port, () => {
  console.log(`Backend listening on http://localhost:${config.port}`);
});
