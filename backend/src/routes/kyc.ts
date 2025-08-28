import { Router } from "express";
import Joi from "joi";
import { connectGateway, disconnectGateway } from "../fabric/gateway.js";

export const kyc = Router();

kyc.put("/:nid", async (req, res) => {
  const schema = Joi.object({
    address: Joi.string().required(),
    phone: Joi.string().required(),
    nidScanHash: Joi.string().required(),
    status: Joi.string().required(),
    riskScore: Joi.number().integer().min(0).max(100).required()
  });
  const v = await schema.validateAsync(req.body);
  const id = (req as any).fabricIdentity as string;
  const ctx = await connectGateway(id);
  try {
    const r = await ctx.contract.submitTransaction(
      "UpsertKYC",
      req.params.nid, v.address, v.phone, v.nidScanHash, v.status, String(v.riskScore)
    );
    res.json({ ok: true, result: r.toString() });
  } finally { await disconnectGateway(ctx); }
});

kyc.get("/:nid", async (req, res) => {
  const id = (req as any).fabricIdentity as string;
  const ctx = await connectGateway(id);
  try {
    const r = await ctx.contract.evaluateTransaction("GetKYC", req.params.nid);
    res.json({ ok: true, kyc: JSON.parse(r.toString()) });
  } finally { await disconnectGateway(ctx); }
});
