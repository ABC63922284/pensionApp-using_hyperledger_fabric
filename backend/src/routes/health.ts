import { Router } from "express";
import { connectGateway, disconnectGateway } from "../fabric/gateway.js";

export const health = Router();

health.get("/ping", async (req, res) => {
  const id = (req as any).fabricIdentity as string;
  const ctx = await connectGateway(id);
  try {
    const r = await ctx.contract.evaluateTransaction("Ping");
    res.json({ ok: true, pong: r.toString(), identity: id });
  } finally {
    await disconnectGateway(ctx);
  }
});
