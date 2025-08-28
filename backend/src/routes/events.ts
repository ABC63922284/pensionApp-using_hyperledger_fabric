import { Router } from "express";
import type { Request, Response } from "express";
import { connectGateway, disconnectGateway } from "../fabric/gateway.js";
import { addSSEClient, removeSSEClient, registerListeners } from "../fabric/listener.js";

export const events = Router();

// GET /events/stream  -> Server-Sent Events
events.get("/stream", async (req: Request, res: Response) => {
  // SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const id = addSSEClient((chunk) => res.write(chunk));
  res.write(`event: hello\ndata: {"ok":true}\n\n`);

  // Ensure at least one live gateway to receive events (per-client for simplicity)
  const identity = (req as any).fabricIdentity as string;
  const ctx = await connectGateway(identity);
  await registerListeners(ctx.network, ctx.contract);

  req.on("close", async () => {
    removeSSEClient(id);
    await disconnectGateway(ctx);
    res.end();
  });
});
