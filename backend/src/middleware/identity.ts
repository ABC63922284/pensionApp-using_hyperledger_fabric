import { NextFunction, Request, Response } from "express";
import { cfg } from "../config.js";

// Very simple identity selector for dev:
// - Header `x-user-id` picks wallet identity label
// - Fallback to DEFAULT_ID from .env
export function identitySelector(req: Request, _res: Response, next: NextFunction) {
  const id = (req.header("x-user-id") || cfg.defaultId).trim();
  (req as any).fabricIdentity = id;
  next();
}
