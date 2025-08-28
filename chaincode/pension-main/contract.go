package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// ----------------------------
// Contract definition
// ----------------------------

// PensionContract holds transaction functions for the "pension-main" channel.
// NOTE: Channel-level Private Data Collections used here:
//   - pdc.kyc  (visible to PB + MoF as defined in collections.pension-main.json)
type PensionContract struct {
	contractapi.Contract
}

// ----------------------------
// Utilities: JSON helpers
// ----------------------------

func putJSON(ctx contractapi.TransactionContextInterface, key string, v any) error {
	b, err := json.Marshal(v)
	if err != nil {
		return err
	}
	return ctx.GetStub().PutState(key, b)
}

func getJSON[T any](ctx contractapi.TransactionContextInterface, key string, dst *T) (bool, error) {
	b, err := ctx.GetStub().GetState(key)
	if err != nil {
		return false, err
	}
	if len(b) == 0 {
		return false, nil
	}
	return true, json.Unmarshal(b, dst)
}

func putPDCJSON(ctx contractapi.TransactionContextInterface, collection, key string, v any) error {
	b, err := json.Marshal(v)
	if err != nil {
		return err
	}
	return ctx.GetStub().PutPrivateData(collection, key, b)
}

func getPDCJSON[T any](ctx contractapi.TransactionContextInterface, collection, key string, dst *T) (bool, error) {
	b, err := ctx.GetStub().GetPrivateData(collection, key)
	if err != nil {
		return false, err
	}
	if len(b) == 0 {
		return false, nil
	}
	return true, json.Unmarshal(b, dst)
}

// ----------------------------
// Boilerplate / Health
// ----------------------------

// Ping is a simple health endpoint.
func (c *PensionContract) Ping(ctx contractapi.TransactionContextInterface) (string, error) {
	role, _ := GetClientRole(ctx) // ignore err; just for info
	return fmt.Sprintf("pong@%d role=%s", time.Now().UTC().Unix(), role), nil
}

// ----------------------------
// Admin: Global Config (CFG|policy)
// ----------------------------

// SetConfig upserts protocol policy params.
// ACL: PB admin or MoF admin (adjust to your need).
func (c *PensionContract) SetConfig(ctx contractapi.TransactionContextInterface, name string, interestRateBP, vestingYears, minServiceYears, dearnessReliefPct, lifeCertFreqMonths int) error {
	if err := AssertAnyRole(ctx, RolePB, RoleMoF); err != nil {
		return err
	}
	cfg := &Config{
		DocType:                "config",
		Name:                   name,
		InterestRateBP:         interestRateBP,
		VestingYears:           vestingYears,
		MinServiceYears:        minServiceYears,
		DearnessReliefPct:      dearnessReliefPct,
		LifeCertFrequencyMonths: lifeCertFreqMonths,
		UpdatedAtUnix:          NowUnix(),
	}
	return putJSON(ctx, KeyConfig(name), cfg)
}

func (c *PensionContract) GetConfig(ctx contractapi.TransactionContextInterface, name string) (*Config, error) {
	var cfg Config
	ok, err := getJSON(ctx, KeyConfig(name), &cfg)
	if err != nil {
		return nil, err
	}
	if !ok {
		return nil, fmt.Errorf("config not found: %s", name)
	}
	return &cfg, nil
}

// ----------------------------
// Pensioner (PEN|<nid>)
// ----------------------------

// RegisterPensioner creates a new pensioner.
// ACL: PB or Employer can register (tune as per policy).
func (c *PensionContract) RegisterPensioner(ctx contractapi.TransactionContextInterface,
	nid, name, dob, deptID, joinDate string,
) error {
	if err := AssertAnyRole(ctx, RolePB, RoleEmployer); err != nil {
		return err
	}
	key := KeyPensioner(nid)

	var exists bool
	{
		var tmp Pensioner
		ok, err := getJSON(ctx, key, &tmp)
		if err != nil {
			return err
		}
		exists = ok
	}
	if exists {
		return fmt.Errorf("pensioner already exists: %s", nid)
	}

	p := &Pensioner{
		DocType:          "pensioner",
		NID:              nid,
		Name:             name,
		DOB:              dob,
		DeptID:           deptID,
		JoinDate:         joinDate,
		Status:           PensionerActive,
		AccruedFundPaisa: 0,
		CreatedAtUnix:    NowUnix(),
		UpdatedAtUnix:    NowUnix(),
	}
	if err := validatePensioner(p); err != nil {
		return err
	}

	// Save public state
	if err := putJSON(ctx, key, p); err != nil {
		return err
	}

	// Example SBE per-record: future updates to this key must be endorsed by PB + MoF.
	// (Even if chaincode-level endorsement is different.)
	if err := SetKeySBE(ctx, key, []string{"PensionBoardMSP", "MoFMSP"}); err != nil {
		// Non-fatal: you may choose to return error. Here we choose to enforce it.
		return fmt.Errorf("set SBE failed: %w", err)
	}

	return nil
}

// GetPensioner returns the pensioner public record.
func (c *PensionContract) GetPensioner(ctx contractapi.TransactionContextInterface, nid string) (*Pensioner, error) {
	key := KeyPensioner(nid)
	var p Pensioner
	ok, err := getJSON(ctx, key, &p)
	if err != nil {
		return nil, err
	}
	if !ok {
		return nil, fmt.Errorf("pensioner not found: %s", nid)
	}
	return &p, nil
}

// UpdatePensionerStatus allows PB or MoF to change status (e.g., RETIRED/DECEASED/SUSPENDED).
func (c *PensionContract) UpdatePensionerStatus(ctx contractapi.TransactionContextInterface, nid string, status string) error {
	if err := AssertAnyRole(ctx, RolePB, RoleMoF); err != nil {
		return err
	}
	key := KeyPensioner(nid)
	var p Pensioner
	ok, err := getJSON(ctx, key, &p)
	if err != nil {
		return err
	}
	if !ok {
		return fmt.Errorf("pensioner not found: %s", nid)
	}
	p.Status = PensionerStatus(strings.ToUpper(status))
	p.UpdatedAtUnix = NowUnix()
	return putJSON(ctx, key, &p)
}

// ----------------------------
// Private Data: KYC (pdc.kyc)
// ----------------------------

// UpsertKYC stores/updates KYC in private collection "pdc.kyc".
// ACL: PB or MoF. NOTE: Only members of this PDC will be able to read.
func (c *PensionContract) UpsertKYC(ctx contractapi.TransactionContextInterface,
	nid, address, phone, nidScanHash, status string, riskScore int,
) error {
	if err := AssertAnyRole(ctx, RolePB, RoleMoF); err != nil {
		return err
	}
	kyc := &KYC{
		NID:           nid,
		Address:       address,
		Phone:         phone,
		NIDScanHash:   nidScanHash,
		Status:        status,
		RiskScore:     riskScore,
		UpdatedAtUnix: NowUnix(),
	}
	return putPDCJSON(ctx, "pdc.kyc", nid, kyc)
}

func (c *PensionContract) GetKYC(ctx contractapi.TransactionContextInterface, nid string) (*KYC, error) {
	if err := AssertAnyRole(ctx, RolePB, RoleMoF); err != nil {
		return nil, err
	}
	var k KYC
	ok, err := getPDCJSON(ctx, "pdc.kyc", nid, &k)
	if err != nil {
		return nil, err
	}
	if !ok {
		return nil, fmt.Errorf("kyc not found for nid: %s", nid)
	}
	return &k, nil
}

// ----------------------------
// Contribution (monthly): CON|<nid>|<yyyymm>
// ----------------------------

// AddContribution records monthly employee+employer share and updates Pensioner.AccruedFundPaisa.
// ACL: Employer or PB.
func (c *PensionContract) AddContribution(ctx contractapi.TransactionContextInterface,
	nid, yyyymm string, empSharePaisa, erSharePaisa int64,
) error {
	if err := AssertAnyRole(ctx, RoleEmployer, RolePB); err != nil {
		return err
	}
	// Basic validations
	if err := ValidateYYYYMM(yyyymm); err != nil {
		return err
	}
	if empSharePaisa < 0 || erSharePaisa < 0 {
		return ErrNegativeAmount
	}

	// Load pensioner
	pKey := KeyPensioner(nid)
	var p Pensioner
	ok, err := getJSON(ctx, pKey, &p)
	if err != nil {
		return err
	}
	if !ok {
		return fmt.Errorf("pensioner not found: %s", nid)
	}
	if p.Status == PensionerDeceased || p.Status == PensionerSuspended {
		return fmt.Errorf("cannot add contribution for status=%s", p.Status)
	}

	// Contribution key
	cKey, err := KeyContribution(nid, yyyymm)
	if err != nil {
		return err
	}
	// Idempotency: if exists, reject (or sum—your policy). We'll reject.
	var existing Contribution
	exists, err := getJSON(ctx, cKey, &existing)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("contribution exists for %s %s", nid, yyyymm)
	}

	con := &Contribution{
		DocType:      "contribution",
		NID:          nid,
		Month:        yyyymm,
		EmpShare:     empSharePaisa,
		ErShare:      erSharePaisa,
		CreatedAtUnix: NowUnix(),
	}
	if err := validateContribution(con); err != nil {
		return err
	}
	if err := putJSON(ctx, cKey, con); err != nil {
		return err
	}

	// Update pensioner accrual (safe add)
	totalAdd, ok2 := SafeAddMoney(empSharePaisa, erSharePaisa)
	if !ok2 {
		return errors.New("overflow in contribution sum")
	}
	newFund, ok3 := SafeAddMoney(p.AccruedFundPaisa, totalAdd)
	if !ok3 {
		return errors.New("overflow in accrued fund")
	}
	p.AccruedFundPaisa = newFund
	p.UpdatedAtUnix = NowUnix()

	return putJSON(ctx, pKey, &p)
}

// GetContributionsByRange returns contributions for a NID between [fromYM, toYM] inclusive.
func (c *PensionContract) GetContributionsByRange(ctx contractapi.TransactionContextInterface, nid, fromYYYYMM, toYYYYMM string) ([]*Contribution, error) {
	if err := ValidateYYYYMM(fromYYYYMM); err != nil {
		return nil, err
	}
	if err := ValidateYYYYMM(toYYYYMM); err != nil {
		return nil, err
	}
	// We used flat keys (CON|nid|yyyymm). We can do a prefix range scan.
	startKey := fmt.Sprintf("%s|%s|%s", prefixContribution, nid, fromYYYYMM)
	endKey := fmt.Sprintf("%s|%s|%s", prefixContribution, nid, toYYYYMM)

	iter, err := ctx.GetStub().GetStateByRange(startKey, endKey+"\ufff0") // \ufff0 trick to include end prefix
	if err != nil {
		return nil, err
	}
	defer iter.Close()

	var res []*Contribution
	for iter.HasNext() {
		kv, er := iter.Next()
		if er != nil {
			return nil, er
		}
		var c Contribution
		if e := json.Unmarshal(kv.Value, &c); e != nil {
			return nil, e
		}
		res = append(res, &c)
	}
	return res, nil
}

// ----------------------------
// Claim lifecycle: CLM|<nid>|<claimId>
// ----------------------------

// FileClaim opens a claim with SUBMITTED status.
// ACL: Pensioner or PB (e.g., service desk). Provide docs hash for off-chain bundle.
func (c *PensionContract) FileClaim(ctx contractapi.TransactionContextInterface,
	nid, claimID, claimType, docsHash string,
) error {
	if err := AssertAnyRole(ctx, RolePensioner, RolePB); err != nil {
		return err
	}
	key := KeyClaim(nid, claimID)
	var tmp Claim
	ok, err := getJSON(ctx, key, &tmp)
	if err != nil {
		return err
	}
	if ok {
		return fmt.Errorf("claim exists: %s/%s", nid, claimID)
	}
	presentBy, _ := GetClientID(ctx)
	cl := &Claim{
		DocType:     "claim",
		ClaimID:     claimID,
		NID:         nid,
		Type:        ClaimType(strings.ToUpper(claimType)),
		SubmittedBy: presentBy,
		DocsHash:    docsHash,
		Status:      ClaimSubmitted,
		Approvals:   []Approval{{Step: "SUBMIT", By: presentBy, Remark: "submitted", AtUnix: NowUnix()}},
		CreatedAtUnix: NowUnix(),
		UpdatedAtUnix: NowUnix(),
	}
	// Persist
	if err := putJSON(ctx, key, cl); err != nil {
		return err
	}
	// Tighten SBE for this claim: require PB + MoF for updates.
	return SetKeySBE(ctx, key, []string{"PensionBoardMSP", "MoFMSP"})
}

// ReviewClaim marks claim as REVIEWED with remarks.
// ACL: PB or MoF (e.g., PB does document scrutiny, MoF does finance rules).
func (c *PensionContract) ReviewClaim(ctx contractapi.TransactionContextInterface, nid, claimID, remark string) error {
	if err := AssertAnyRole(ctx, RolePB, RoleMoF); err != nil {
		return err
	}
	key := KeyClaim(nid, claimID)
	var cl Claim
	ok, err := getJSON(ctx, key, &cl)
	if err != nil {
		return err
	}
	if !ok {
		return fmt.Errorf("claim not found")
	}
	if cl.Status != ClaimSubmitted {
		return fmt.Errorf("only SUBMITTED can be REVIEWED (got %s)", cl.Status)
	}
	user, _ := GetClientID(ctx)
	cl.Status = ClaimReviewed
	cl.Approvals = append(cl.Approvals, Approval{Step: "REVIEW", By: user, Remark: remark, AtUnix: NowUnix()})
	cl.UpdatedAtUnix = NowUnix()
	return putJSON(ctx, key, &cl)
}

// ApproveClaim moves claim to APPROVED.
// ACL: MoF (final approver) — tune as needed.
func (c *PensionContract) ApproveClaim(ctx contractapi.TransactionContextInterface, nid, claimID, remark string) error {
	if err := AssertAnyRole(ctx, RoleMoF); err != nil {
		return err
	}
	key := KeyClaim(nid, claimID)
	var cl Claim
	ok, err := getJSON(ctx, key, &cl)
	if err != nil {
		return err
	}
	if !ok {
		return fmt.Errorf("claim not found")
	}
	if cl.Status != ClaimReviewed {
		return fmt.Errorf("only REVIEWED can be APPROVED (got %s)", cl.Status)
	}
	user, _ := GetClientID(ctx)
	cl.Status = ClaimApproved
	cl.Approvals = append(cl.Approvals, Approval{Step: "APPROVE", By: user, Remark: remark, AtUnix: NowUnix()})
	cl.UpdatedAtUnix = NowUnix()
	return putJSON(ctx, key, &cl)
}

// RejectClaim closes claim with REJECTED.
// ACL: PB or MoF.
func (c *PensionContract) RejectClaim(ctx contractapi.TransactionContextInterface, nid, claimID, reason string) error {
	if err := AssertAnyRole(ctx, RolePB, RoleMoF); err != nil {
		return err
	}
	key := KeyClaim(nid, claimID)
	var cl Claim
	ok, err := getJSON(ctx, key, &cl)
	if err != nil {
		return err
	}
	if !ok {
		return fmt.Errorf("claim not found")
	}
	if cl.Status == ClaimPaid || cl.Status == ClaimRejected {
		return fmt.Errorf("cannot reject in status=%s", cl.Status)
	}
	user, _ := GetClientID(ctx)
	cl.Status = ClaimRejected
	cl.Approvals = append(cl.Approvals, Approval{Step: "REJECT", By: user, Remark: reason, AtUnix: NowUnix()})
	cl.UpdatedAtUnix = NowUnix()
	return putJSON(ctx, key, &cl)
}

// ----------------------------
// Disbursement (DIS|<nid>|<yyyymm>)
// ----------------------------

// RecordDisbursement creates a disbursement record for an approved month.
// ACL: PB (scheduler) or BangladeshBank (payment initiator).
func (c *PensionContract) RecordDisbursement(ctx contractapi.TransactionContextInterface,
	nid, yyyymm string, amountPaisa int64,
) error {
	if err := AssertAnyRole(ctx, RolePB, RoleBank); err != nil {
		return err
	}
	if err := ValidateYYYYMM(yyyymm); err != nil {
		return err
	}
	key, err := KeyDisbursement(nid, yyyymm)
	if err != nil {
		return err
	}
	var d Disbursement
	exists, err := getJSON(ctx, key, &d)
	if err != nil {
		return err
	}
	if exists {
		return fmt.Errorf("disbursement exists for %s/%s", nid, yyyymm)
	}

	d = Disbursement{
		DocType:       "disbursement",
		NID:           nid,
		Month:         yyyymm,
		AmountPaisa:   amountPaisa,
		Status:        DisbPending,
		CreatedAtUnix: NowUnix(),
		UpdatedAtUnix: NowUnix(),
	}
	if err := validateDisbursement(&d); err != nil {
		return err
	}
	if err := putJSON(ctx, key, &d); err != nil {
		return err
	}
	// Tighten SBE: PB + BangladeshBank must endorse any update to this key.
	return SetKeySBE(ctx, key, []string{"PensionBoardMSP", "BangladeshBankMSP"})
}

// AckDisbursement updates status after bank UTR is available.
// ACL: BangladeshBank or PB Ops (depending on policy).
func (c *PensionContract) AckDisbursement(ctx contractapi.TransactionContextInterface,
	nid, yyyymm, bankUTR, newStatus string,
) error {
	if err := AssertAnyRole(ctx, RoleBank, RolePB); err != nil {
		return err
	}
	key, err := KeyDisbursement(nid, yyyymm)
	if err != nil {
		return err
	}
	var d Disbursement
	ok, err := getJSON(ctx, key, &d)
	if err != nil {
		return err
	}
	if !ok {
		return fmt.Errorf("disbursement not found")
	}
	switch strings.ToUpper(newStatus) {
	case string(DisbSent), string(DisbAcked), string(DisbFailed):
	default:
		return fmt.Errorf("invalid new status: %s", newStatus)
	}
	d.BankUTR = bankUTR
	d.Status = DisbursementStatus(strings.ToUpper(newStatus))
	d.UpdatedAtUnix = NowUnix()
	return putJSON(ctx, key, &d)
}

// GetDisbursementsByMonthStatus queries CouchDB index (docType, month, status).
// This is efficient because of idxDisbByMonthStatus.json.
func (c *PensionContract) GetDisbursementsByMonthStatus(ctx contractapi.TransactionContextInterface, yyyymm, status string) ([]*Disbursement, error) {
	query := fmt.Sprintf(`{"selector":{"docType":"disbursement","month":"%s","status":"%s"}}`, yyyymm, strings.ToUpper(status))
	return QueryDisbursements(ctx, query)
}

// ----------------------------
// Queries (simple examples)
// ----------------------------

func (c *PensionContract) GetClaimsByStatus(ctx contractapi.TransactionContextInterface, status string) ([]*Claim, error) {
	query := fmt.Sprintf(`{"selector":{"docType":"claim","status":"%s"}}`, strings.ToUpper(status))
	return QueryClaims(ctx, query)
}

func (c *PensionContract) GetPensionersByStatus(ctx contractapi.TransactionContextInterface, status string) ([]*Pensioner, error) {
	query := fmt.Sprintf(`{"selector":{"docType":"pensioner","status":"%s"}}`, strings.ToUpper(status))
	return QueryPensioners(ctx, query)
}
