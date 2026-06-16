import cors from "cors";
import "dotenv/config";
import express from "express";
import helmet from "helmet";

const app = express();
const port = Number(process.env.PORT ?? 4000);
const frontendOrigin = process.env.FRONTEND_ORIGIN ?? "http://localhost:3000";

app.use(helmet());
app.use(
  cors({
    origin: frontendOrigin,
    credentials: true
  })
);
app.use(express.json({ limit: "100kb" }));

app.get("/health", (_req, res) => {
  res.status(200).json({
    status: "ok",
    service: "personal-webapp-backend"
  });
});

app.use((_req, res) => {
  res.status(404).json({
    error: "Not found"
  });
});

app.listen(port, () => {
  console.log(`Backend listening on http://localhost:${port}`);
});
