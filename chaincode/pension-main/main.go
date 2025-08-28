package main

import (
	"log"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// Bootstraps Fabric contract runtime.
func main() {
	cc, err := contractapi.NewChaincode(new(PensionContract))
	if err != nil {
		log.Panicf("error creating chaincode: %v", err)
	}
	cc.Info.Title = "pension-main"
	cc.Info.Version = "0.1.0"

	if err := cc.Start(); err != nil {
		log.Panicf("error starting chaincode: %v", err)
	}
}
