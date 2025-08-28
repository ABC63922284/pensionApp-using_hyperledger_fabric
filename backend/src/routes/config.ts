import { Router } from "express";
import Joi from "joi";
import { connectGateway, disconnectGateway } from "../fabric/gateway.js";

export const configApi = Router();

configApi.post("/", async (req, res) => {
  const schema = Joi.object({
    name: Joi.string().required(),
    interestRateBP: Joi.number().integer().required(),
    vestingYears: Joi.number().integer().required(),
    minServiceYears: Joi.number().integer().required(),
    dearnessReliefPct: Joi.number().integer().required(),
    lifeCertFrequencyMonths: Joi.number().integer().required()
  });
  const v = await schema.validateAsync(req.body);
  const id = (req as any).fabricIdentity as string;
  const ctx = await connectGateway(id);
  try {
    const tx = ctx.contract.createTransaction("SetConfig");
    const r = await tx.submit(
      v.name,
      String(v.interestRateBP),
      String(v.vestingYears),
      String(v.minServiceYears),
      String(v.dearnessReliefPct),
      String(v.lifeCertFrequencyMonths)
    );
    res.json({ ok: true, result: r.toString() });
  } finally { await disconnectGateway(ctx); }
});

configApi.get("/:name", async (req, res) => {
  const id = (req as any).fabricIdentity as string;
  const ctx = await connectGateway(id);
  try {
    const r = await ctx.contract.evaluateTransaction("GetConfig", req.params.name);
    res.json({ ok: true, config: JSON.parse(r.toString()) });
  } finally { await disconnectGateway(ctx); }
});
