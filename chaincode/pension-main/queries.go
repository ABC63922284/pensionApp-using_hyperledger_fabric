package main

import (
	"encoding/json"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// Query helpers dedicated per-type (clean separation, easier to extend later)

func QueryDisbursements(ctx contractapi.TransactionContextInterface, query string) ([]*Disbursement, error) {
	iter, err := ctx.GetStub().GetQueryResult(query)
	if err != nil {
		return nil, err
	}
	defer iter.Close()

	var out []*Disbursement
	for iter.HasNext() {
		kv, er := iter.Next()
		if er != nil {
			return nil, er
		}
		var d Disbursement
		if e := json.Unmarshal(kv.Value, &d); e != nil {
			return nil, e
		}
		out = append(out, &d)
	}
	return out, nil
}

func QueryClaims(ctx contractapi.TransactionContextInterface, query string) ([]*Claim, error) {
	iter, err := ctx.GetStub().GetQueryResult(query)
	if err != nil {
		return nil, err
	}
	defer iter.Close()

	var out []*Claim
	for iter.HasNext() {
		kv, er := iter.Next()
		if er != nil {
			return nil, er
		}
		var c Claim
		if e := json.Unmarshal(kv.Value, &c); e != nil {
			return nil, e
		}
		out = append(out, &c)
	}
	return out, nil
}

func QueryPensioners(ctx contractapi.TransactionContextInterface, query string) ([]*Pensioner, error) {
	iter, err := ctx.GetStub().GetQueryResult(query)
	if err != nil {
		return nil, err
	}
	defer iter.Close()

	var out []*Pensioner
	for iter.HasNext() {
		kv, er := iter.Next()
		if er != nil {
			return nil, er
		}
		var p Pensioner
		if e := json.Unmarshal(kv.Value, &p); e != nil {
			return nil, e
		}
		out = append(out, &p)
	}
	return out, nil
}
