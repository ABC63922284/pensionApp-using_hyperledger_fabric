import type { Network, Contract, BlockListener, ContractListener } from "@hyperledger/fabric-network";
import * as fs from "fs";
import * as path from "path";
import { cfg } from "../config.js";

// In-memory subscriber list for SSE push
type SSEClient = { id: number; write: (chunk: string) => void };
const sseClients: Map<number, SSEClient> = new Map();
let nextClientId = 1;

export function addSSEClient(write: SSEClient["write"]): number {
  const id = nextClientId++;
  sseClients.set(id, { id, write });
  return id;
}
export function removeSSEClient(id: number) {
  sseClients.delete(id);
}
function broadcast(event: string, payload: any) {
  const data = `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
  for (const c of sseClients.values()) c.write(data);
}

// Simple file checkpoint (one per listener type)
function cpPath(name: string) { return path.join(cfg.checkpointDir, `${name}.json`); }
function saveCheckpoint(name: string, value: any) {
  fs.writeFileSync(cpPath(name), JSON.stringify(value), "utf-8");
}
function loadCheckpoint<T=any>(name: string): T | undefined {
  if (!fs.existsSync(cpPath(name))) return undefined;
  return JSON.parse(fs.readFileSync(cpPath(name), "utf-8"));
}

// Register block & contract listeners
export async function registerListeners(network: Network, contract: Contract) {
  // Block listener
  const blockCheckpoint = loadCheckpoint("block") || {};
  const blockListener: BlockListener = async (event) => {
    const blockNumber = event.blockNumber.toString();
    broadcast("block", { blockNumber });
    saveCheckpoint("block", { lastBlock: blockNumber });
    // Optional: parse writes to our chaincode
    try {
      const txs = event.blockData.data?.data || [];
      broadcast("block-txs", { blockNumber, txCount: txs.length });
    } catch {}
  };
  await network.addBlockListener(blockListener, { filtered: true, startBlock: blockCheckpoint.lastBlock });

  // Contract listener (emits via ctx.GetStub().SetEvent in chaincode if used)
  const ccCheckpoint = loadCheckpoint("contract") || {};
  const ccListener: ContractListener = async (event) => {
    broadcast("cc-event", {
      name: event.eventName,
      txId: event.transactionId,
      payload: event.payload?.toString("utf8") || ""
    });
    saveCheckpoint("contract", { lastTx: event.transactionId });
  };
  await contract.addContractListener(ccListener, undefined, { startBlock: ccCheckpoint.lastBlock });
}
