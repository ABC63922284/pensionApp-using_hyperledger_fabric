import { Router } from "express";
import Joi from "joi";
import { connectGateway, disconnectGateway } from "../fabric/gateway.js";

export const claim = Router();

claim.post("/", async (req, res) => {
  const schema = Joi.object({
    nid: Joi.string().required(),
    claimId: Joi.string().required(),
    type: Joi.string().valid("RETIREMENT","NOMINEE","ARREAR").required(),
    docsHash: Joi.string().required()
  });
  const v = await schema.validateAsync(req.body);
  const id = (req as any).fabricIdentity as string;
  const ctx = await connectGateway(id);
  try {
    const r = await ctx.contract.submitTransaction("FileClaim", v.nid, v.claimId, v.type, v.docsHash);
    res.json({ ok: true, result: r.toString() });
  } finally { await disconnectGateway(ctx); }
});

claim.post("/:nid/:claimId/review", async (req, res) => {
  const schema = Joi.object({ remark: Joi.string().allow("").default("") });
  const v = await schema.validateAsync(req.body);
  const id = (req as any).fabricIdentity as string;
  const ctx = await connectGateway(id);
  try {
    const r = await ctx.contract.submitTransaction("ReviewClaim", req.params.nid, req.params.claimId, v.remark);
    res.json({ ok: true, result: r.toString() });
  } finally { await disconnectGateway(ctx); }
});

claim.post("/:nid/:claimId/approve", async (req, res) => {
  const schema = Joi.object({ remark: Joi.string().allow("").default("") });
  const v = await schema.validateAsync(req.body);
  const id = (req as any).fabricIdentity as string;
  const ctx = await connectGateway(id);
  try {
    const r = await ctx.contract.submitTransaction("ApproveClaim", req.params.nid, req.params.claimId, v.remark);
    res.json({ ok: true, result: r.toString() });
  } finally { await disconnectGateway(ctx); }
});

claim.post("/:nid/:claimId/reject", async (req, res) => {
  const schema = Joi.object({ reason: Joi.string().required() });
  const v = await schema.validateAsync(req.body);
  const id = (req as any).fabricIdentity as string;
  const ctx = await connectGateway(id);
  try {
    const r = await ctx.contract.submitTransaction("RejectClaim", req.params.nid, req.params.claimId, v.reason);
    res.json({ ok: true, result: r.toString() });
  } finally { await disconnectGateway(ctx); }
});

claim.get("/status/:status", async (req, res) => {
  const id = (req as any).fabricIdentity as string;
  const ctx = await connectGateway(id);
  try {
    const r = await ctx.contract.evaluateTransaction("GetClaimsByStatus", req.params.status.toUpperCase());
    res.json({ ok: true, claims: JSON.parse(r.toString()) });
  } finally { await disconnectGateway(ctx); }
});
