import { Router } from "express";
import Joi from "joi";
import { connectGateway, disconnectGateway } from "../fabric/gateway.js";

export const disbursement = Router();

disbursement.post("/", async (req, res) => {
  const schema = Joi.object({
    nid: Joi.string().required(),
    month: Joi.string().pattern(/^[0-9]{6}$/).required(),
    amountPaisa: Joi.number().integer().min(0).required()
  });
  const v = await schema.validateAsync(req.body);
  const id = (req as any).fabricIdentity as string;
  const ctx = await connectGateway(id);
  try {
    const r = await ctx.contract.submitTransaction("RecordDisbursement", v.nid, v.month, String(v.amountPaisa));
    res.json({ ok: true, result: r.toString() });
  } finally { await disconnectGateway(ctx); }
});

disbursement.post("/:nid/:month/ack", async (req, res) => {
  const schema = Joi.object({
    bankUTR: Joi.string().allow("").default(""),
    status: Joi.string().valid("SENT","ACKED","FAILED").required()
  });
  const v = await schema.validateAsync(req.body);
  const id = (req as any).fabricIdentity as string;
  const ctx = await connectGateway(id);
  try {
    const r = await ctx.contract.submitTransaction("AckDisbursement", req.params.nid, req.params.month, v.bankUTR, v.status);
    res.json({ ok: true, result: r.toString() });
  } finally { await disconnectGateway(ctx); }
});

disbursement.get("/month/:yyyymm/status/:status", async (req, res) => {
  const id = (req as any).fabricIdentity as string;
  const ctx = await connectGateway(id);
  try {
    const r = await ctx.contract.evaluateTransaction(
      "GetDisbursementsByMonthStatus",
      req.params.yyyymm,
      req.params.status.toUpperCase()
    );
    res.json({ ok: true, disbursements: JSON.parse(r.toString()) });
  } finally { await disconnectGateway(ctx); }
});
