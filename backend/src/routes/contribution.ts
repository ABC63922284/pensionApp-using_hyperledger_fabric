import { Router } from "express";
import Joi from "joi";
import { connectGateway, disconnectGateway } from "../fabric/gateway.js";

export const contribution = Router();

contribution.post("/", async (req, res) => {
  const schema = Joi.object({
    nid: Joi.string().required(),
    month: Joi.string().pattern(/^[0-9]{6}$/).required(), // YYYYMM
    empSharePaisa: Joi.number().integer().min(0).required(),
    erSharePaisa: Joi.number().integer().min(0).required()
  });
  const v = await schema.validateAsync(req.body);
  const id = (req as any).fabricIdentity as string;
  const ctx = await connectGateway(id);
  try {
    const r = await ctx.contract.submitTransaction(
      "AddContribution",
      v.nid, v.month, String(v.empSharePaisa), String(v.erSharePaisa)
    );
    res.json({ ok: true, result: r.toString() });
  } finally { await disconnectGateway(ctx); }
});

contribution.get("/:nid", async (req, res) => {
  const schema = Joi.object({
    from: Joi.string().pattern(/^[0-9]{6}$/).required(),
    to: Joi.string().pattern(/^[0-9]{6}$/).required()
  });
  const v = await schema.validateAsync(req.query);
  const id = (req as any).fabricIdentity as string;
  const ctx = await connectGateway(id);
  try {
    const r = await ctx.contract.evaluateTransaction("GetContributionsByRange", req.params.nid, String(v.from), String(v.to));
    res.json({ ok: true, contributions: JSON.parse(r.toString()) });
  } finally { await disconnectGateway(ctx); }
});
