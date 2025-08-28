#!/bin/bash
echo "Generating genesis block and channel tx..."
configtxgen -profile OrdererGenesis -channelID sys-channel -outputBlock ./config/genesis.block
configtxgen -profile PensionMainChannel -outputCreateChannelTx ./config/pension-main.tx -channelID pension-main
