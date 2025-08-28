package main

import "time"

// Money is in paisa (int64) to avoid float issues.
type Money = int64

// Common date format (UTC, YYYY-MM-DD)
const DateISO = "2006-01-02"

// ---------- Enums ----------

type PensionerStatus string

const (
	PensionerActive   PensionerStatus = "ACTIVE"
	PensionerRetired  PensionerStatus = "RETIRED"
	PensionerSuspended PensionerStatus = "SUSPENDED"
	PensionerDeceased PensionerStatus = "DECEASED"
)

type ClaimType string

const (
	ClaimRetirement ClaimType = "RETIREMENT"
	ClaimNominee    ClaimType = "NOMINEE"
	ClaimArrear     ClaimType = "ARREAR"
)

type ClaimStatus string

const (
	ClaimSubmitted ClaimStatus = "SUBMITTED"
	ClaimReviewed  ClaimStatus = "REVIEWED"
	ClaimApproved  ClaimStatus = "APPROVED"
	ClaimPaid      ClaimStatus = "PAID"
	ClaimRejected  ClaimStatus = "REJECTED"
)

type DisbursementStatus string

const (
	DisbPending  DisbursementStatus = "PENDING"
	DisbSent     DisbursementStatus = "SENT"
	DisbAcked    DisbursementStatus = "ACKED"
	DisbFailed   DisbursementStatus = "FAILED"
)

// ---------- Entities ----------

// Pensioner (public state)
type Pensioner struct {
	DocType           string           `json:"docType"` // "pensioner"
	NID               string           `json:"nid"`
	Name              string           `json:"name"`
	DOB               string           `json:"dob"`          // YYYY-MM-DD
	DeptID            string           `json:"deptId"`       // employer/department ref
	JoinDate          string           `json:"joinDate"`     // YYYY-MM-DD
	Status            PensionerStatus  `json:"status"`
	Nominees          []Nominee        `json:"nominees,omitempty"`
	BankRefID         string           `json:"bankRefId"`    // reference to PDC bank details on payout channel
	AccruedFundPaisa  Money            `json:"accruedFund"`  // running accrual in paisa
	LastLifeCertDate  string           `json:"lastLifeCertDate,omitempty"` // YYYY-MM-DD
	CreatedAtUnix     int64            `json:"createdAt"`
	UpdatedAtUnix     int64            `json:"updatedAt"`
}

// Nominee (embedded)
type Nominee struct {
	Name     string `json:"name"`
	NID      string `json:"nid"`
	Relation string `json:"relation"`
	SharePct int    `json:"sharePct"` // 0-100
}

// KYC (Private Data Collection on pension-main: pdc.kyc)
type KYC struct {
	NID          string `json:"nid"`
	Address      string `json:"address"`
	Phone        string `json:"phone"`
	NIDScanHash  string `json:"nidScanHash"`
	Status       string `json:"status"`    // e.g., "VERIFIED","PENDING"
	RiskScore    int    `json:"riskScore"` // 0-100
	UpdatedAtUnix int64 `json:"updatedAt"`
}

// Contribution (monthly) — key: CON|<nid>|<yyyymm>
type Contribution struct {
	DocType   string `json:"docType"` // "contribution"
	NID       string `json:"nid"`
	Month     string `json:"month"`   // YYYYMM
	EmpShare  Money  `json:"empShare"`
	ErShare   Money  `json:"erShare"`
	TxRefs    []string `json:"txRefs,omitempty"`
	CreatedAtUnix int64 `json:"createdAt"`
}

// Claim — key: CLM|<nid>|<claimId>
type Claim struct {
	DocType    string      `json:"docType"` // "claim"
	ClaimID    string      `json:"claimId"`
	NID        string      `json:"nid"`
	Type       ClaimType   `json:"type"`
	SubmittedBy string     `json:"submittedBy"` // MSP/role or user id
	DocsHash   string      `json:"docsHash"`
	Status     ClaimStatus `json:"status"` // flow: SUBMITTED→REVIEWED→APPROVED→PAID/REJECTED
	Approvals  []Approval  `json:"approvals,omitempty"`
	CreatedAtUnix int64    `json:"createdAt"`
	UpdatedAtUnix int64    `json:"updatedAt"`
}

type Approval struct {
	Step       string `json:"step"`        // REVIEW|APPROVE|PAY
	By         string `json:"by"`          // clientID/MSP role
	Remark     string `json:"remark"`
	AtUnix     int64  `json:"at"`
}

// Disbursement — key: DIS|<nid>|<yyyymm>
type Disbursement struct {
	DocType     string             `json:"docType"` // "disbursement"
	NID         string             `json:"nid"`
	Month       string             `json:"month"` // YYYYMM
	AmountPaisa Money              `json:"amount"`
	BankUTR     string             `json:"bankUtr,omitempty"`
	Status      DisbursementStatus `json:"status"`
	Retries     int                `json:"retries"`
	CreatedAtUnix int64            `json:"createdAt"`
	UpdatedAtUnix int64            `json:"updatedAt"`
}

// Global Config — singletons by name, key: CFG|<name>
type Config struct {
	DocType                string `json:"docType"` // "config"
	Name                   string `json:"name"` // e.g., "policy"
	InterestRateBP         int    `json:"interestRateBP"`     // basis points, e.g., 550 = 5.50%
	VestingYears           int    `json:"vestingYears"`
	MinServiceYears        int    `json:"minServiceYears"`
	DearnessReliefPct      int    `json:"dearnessReliefPct"`  // percent
	LifeCertFrequencyMonths int   `json:"lifeCertFrequencyMonths"`
	UpdatedAtUnix          int64  `json:"updatedAt"`
}

// Utility
func NowUnix() int64 { return time.Now().UTC().Unix() }
