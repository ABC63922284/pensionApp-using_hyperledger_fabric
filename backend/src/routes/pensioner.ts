import { Router } from "express";
import Joi from "joi";
import { connectGateway, disconnectGateway } from "../fabric/gateway.js";

export const pensioner = Router();

pensioner.post("/", async (req, res) => {
  const schema = Joi.object({
    nid: Joi.string().required(),
    name: Joi.string().required(),
    dob: Joi.string().required(),       // YYYY-MM-DD
    deptId: Joi.string().required(),
    joinDate: Joi.string().required()   // YYYY-MM-DD
  });
  const v = await schema.validateAsync(req.body);
  const id = (req as any).fabricIdentity as string;
  const ctx = await connectGateway(id);
  try {
    const r = await ctx.contract.submitTransaction("RegisterPensioner", v.nid, v.name, v.dob, v.deptId, v.joinDate);
    res.json({ ok: true, result: r.toString() });
  } finally { await disconnectGateway(ctx); }
});

pensioner.get("/:nid", async (req, res) => {
  const id = (req as any).fabricIdentity as string;
  const ctx = await connectGateway(id);
  try {
    const r = await ctx.contract.evaluateTransaction("GetPensioner", req.params.nid);
    res.json({ ok: true, pensioner: JSON.parse(r.toString()) });
  } finally { await disconnectGateway(ctx); }
});

pensioner.patch("/:nid/status", async (req, res) => {
  const schema = Joi.object({ status: Joi.string().valid("ACTIVE","RETIRED","SUSPENDED","DECEASED").required() });
  const v = await schema.validateAsync(req.body);
  const id = (req as any).fabricIdentity as string;
  const ctx = await connectGateway(id);
  try {
    const r = await ctx.contract.submitTransaction("UpdatePensionerStatus", req.params.nid, v.status);
    res.json({ ok: true, result: r.toString() });
  } finally { await disconnectGateway(ctx); }
});
