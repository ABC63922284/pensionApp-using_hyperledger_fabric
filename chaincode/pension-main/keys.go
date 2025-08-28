package main

import (
	"errors"
	"fmt"
	"regexp"
)

const (
	prefixPensioner    = "PEN"
	prefixContribution = "CON"
	prefixClaim        = "CLM"
	prefixDisbursement = "DIS"
	prefixConfig       = "CFG"
)

var (
	reYYYYMM   = regexp.MustCompile(`^[0-9]{6}$`)
	reDateISO  = regexp.MustCompile(`^[0-9]{4}-[0-9]{2}-[0-9]{2}$`)
	errYYYYMM  = errors.New("month must be YYYYMM")
	errDateISO = errors.New("date must be YYYY-MM-DD")
)

// ---- Key builders ----

func KeyPensioner(nid string) string {
	return fmt.Sprintf("%s|%s", prefixPensioner, nid)
}

func KeyContribution(nid, yyyymm string) (string, error) {
	if !reYYYYMM.MatchString(yyyymm) {
		return "", errYYYYMM
	}
	return fmt.Sprintf("%s|%s|%s", prefixContribution, nid, yyyymm), nil
}

func KeyClaim(nid, claimID string) string {
	return fmt.Sprintf("%s|%s|%s", prefixClaim, nid, claimID)
}

func KeyDisbursement(nid, yyyymm string) (string, error) {
	if !reYYYYMM.MatchString(yyyymm) {
		return "", errYYYYMM
	}
	return fmt.Sprintf("%s|%s|%s", prefixDisbursement, nid, yyyymm), nil
}

func KeyConfig(name string) string {
	return fmt.Sprintf("%s|%s", prefixConfig, name)
}

// ---- Validators used by Part 3 later ----

func ValidateDateISO(s string) error {
	if s == "" {
		return nil
	}
	if !reDateISO.MatchString(s) {
		return errDateISO
	}
	return nil
}

func ValidateYYYYMM(s string) error {
	if !reYYYYMM.MatchString(s) {
		return errYYYYMM
	}
	return nil
}
