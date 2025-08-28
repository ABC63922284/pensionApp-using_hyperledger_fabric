import express from "express";
import "express-async-errors";
import cors from "cors";
import morgan from "morgan";
import { cfg, ensureDirs } from "./config.js";
import { identitySelector } from "./middleware/identity.js";

import { health } from "./routes/health.js";
import { configApi } from "./routes/config.js";
import { pensioner } from "./routes/pensioner.js";
import { kyc } from "./routes/kyc.js";
import { contribution } from "./routes/contribution.js";
import { claim } from "./routes/claim.js";
import { disbursement } from "./routes/disbursement.js";
import { events } from "./routes/events.js";

ensureDirs();

const app = express();
app.use(cors({ origin: cfg.allowOrigin }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(identitySelector);

// Routes
app.use("/health", health);
app.use("/config", configApi);
app.use("/pensioner", pensioner);
app.use("/kyc", kyc);
app.use("/contribution", contribution);
app.use("/claim", claim);
app.use("/disbursement", disbursement);
app.use("/events", events);

// Root
app.get("/", (_req, res) => res.json({ ok: true, service: "pension-fabric-backend", channel: cfg.channel, chaincode: cfg.chaincode }));

// Error handler
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("ERR:", err);
  const msg = typeof err?.message === "string" ? err.message : "unexpected error";
  res.status(400).json({ ok: false, error: msg });
});

const server = app.listen(cfg.port, () => {
  console.log(`API listening on :${cfg.port}`);
});

// Graceful shutdown
process.on("SIGINT", () => { server.close(() => process.exit(0)); });
process.on("SIGTERM", () => { server.close(() => process.exit(0)); });
