import { Gateway, Wallets, Contract, Network } from "@hyperledger/fabric-network";
import * as fs from "fs";
import { cfg } from "../config.js";

export type FabricContext = {
  gateway: Gateway;
  network: Network;
  contract: Contract;
};

export async function connectGateway(identityLabel: string): Promise<FabricContext> {
  const ccpJSON = fs.readFileSync(cfg.ccpPath, "utf-8");
  const ccp = JSON.parse(ccpJSON);

  const wallet = await Wallets.newFileSystemWallet(cfg.walletPath);
  const id = await wallet.get(identityLabel);
  if (!id) {
    throw new Error(`Identity '${identityLabel}' not found in wallet: ${cfg.walletPath}`);
  }

  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: identityLabel,
    discovery: { enabled: true, asLocalhost: true } // set asLocalhost=false if real hostnames/TLS
  });

  const network = await gateway.getNetwork(cfg.channel);
  const contract = network.getContract(cfg.chaincode);

  return { gateway, network, contract };
}

export async function disconnectGateway(ctx?: FabricContext) {
  try { await ctx?.gateway.disconnect(); } catch {}
}
