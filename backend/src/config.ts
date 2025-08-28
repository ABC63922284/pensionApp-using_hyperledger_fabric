import * as fs from "fs";
import * as path from "path";
import dotenv from "dotenv";
dotenv.config();

export const cfg = {
  port: parseInt(process.env.PORT || "8080", 10),
  allowOrigin: process.env.ALLOW_ORIGIN || "*",
  ccpPath: path.resolve(process.env.CCP_PATH || "../config/connection-profiles/pension-main-connection.json"),
  channel: process.env.CHANNEL_NAME || "pension-main",
  chaincode: process.env.CHAINCODE_NAME || "pension-main",
  walletPath: path.resolve(process.env.WALLET_PATH || "./wallet"),
  defaultId: process.env.DEFAULT_ID || "pb-admin",
  checkpointDir: path.resolve(process.env.EVENT_CHECKPOINT_DIR || "./checkpoints"),
};

export function ensureDirs() {
  for (const dir of [cfg.walletPath, cfg.checkpointDir]) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
}
