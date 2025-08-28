package main

import (
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
	"github.com/hyperledger/fabric-chaincode-go/pkg/cid"
)

// Logical business roles embedded as ECert attribute: role=PB|MoF|Bank|Employer|Auditor|Pensioner
const (
	RolePB        = "PB"
	RoleMoF       = "MoF"
	RoleBank      = "Bank"
	RoleEmployer  = "Employer"
	RoleAuditor   = "Auditor"
	RolePensioner = "Pensioner"
)

// GetClientID returns x509 subject/ID for audit trails.
func GetClientID(ctx contractapi.TransactionContextInterface) (string, error) {
	id, err := cid.New(ctx.GetStub())
	if err != nil {
		return "", err
	}
	return id.GetID()
}

// GetClientRole reads 'role' attribute from ECert.
func GetClientRole(ctx contractapi.TransactionContextInterface) (string, error) {
	identity, err := cid.New(ctx.GetStub())
	if err != nil {
		return "", err
	}
	val, ok, err := identity.GetAttributeValue("role")
	if err != nil {
		return "", err
	}
	if !ok || val == "" {
		return "", fmt.Errorf("client has no 'role' attribute on ECert")
	}
	return val, nil
}

// AssertAnyRole ensures invoker has any of the expected roles.
func AssertAnyRole(ctx contractapi.TransactionContextInterface, roles ...string) error {
	got, err := GetClientRole(ctx)
	if err != nil {
		return err
	}
	for _, r := range roles {
		if got == r {
			return nil
		}
	}
	return fmt.Errorf("access denied for role=%s; need one of %v", got, roles)
}
