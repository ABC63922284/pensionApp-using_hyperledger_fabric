package main

import (
	"github.com/hyperledger/fabric-chaincode-go/pkg/statebased"
	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// SetKeySBE applies State-Based Endorsement for a specific key so that
// updates to THAT key require endorsements from listed MSPs,
// independent of chaincode-level endorsement policy.
//
// Example:
//   SetKeySBE(ctx, KeyPensioner("1234"), []string{"PensionBoardMSP","MoFMSP"})
func SetKeySBE(ctx contractapi.TransactionContextInterface, key string, msps []string) error {
	policy, err := statebased.NewStateEP(nil)
	if err != nil {
		return err
	}
	// Require any N of listed orgs? We use ALL here (1 signature per MSP).
	// You can tweak to 1-of-many with policy.AddOrgs(statebased.RoleTypePeer, msps...).
	if err := policy.AddOrgs(statebased.RoleTypePeer, msps...); err != nil {
		return err
	}
	policyBytes, err := policy.Policy()
	if err != nil {
		return err
	}
	return ctx.GetStub().SetStateValidationParameter(key, policyBytes)
}
