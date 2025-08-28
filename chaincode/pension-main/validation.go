package main

import "errors"

var (
	ErrInvalidNID       = errors.New("invalid NID")
	ErrInvalidName      = errors.New("invalid name")
	ErrInvalidSharePct  = errors.New("nominee share percent must be 0..100")
	ErrNegativeAmount   = errors.New("amount must be >= 0")
)

func validatePensioner(p *Pensioner) error {
	if len(p.NID) < 8 {
		return ErrInvalidNID
	}
	if p.Name == "" {
		return ErrInvalidName
	}
	if err := ValidateDateISO(p.DOB); err != nil {
		return err
	}
	if err := ValidateDateISO(p.JoinDate); err != nil {
		return err
	}
	if err := ValidateDateISO(p.LastLifeCertDate); err != nil {
		return err
	}
	sum := 0
	for _, n := range p.Nominees {
		if n.SharePct < 0 || n.SharePct > 100 {
			return ErrInvalidSharePct
		}
		sum += n.SharePct
	}
	if sum > 100 {
		return errors.New("total nominee share exceeds 100%")
	}
	return nil
}

func validateContribution(c *Contribution) error {
	if err := ValidateYYYYMM(c.Month); err != nil {
		return err
	}
	if c.EmpShare < 0 || c.ErShare < 0 {
		return ErrNegativeAmount
	}
	return nil
}

func validateDisbursement(d *Disbursement) error {
	if err := ValidateYYYYMM(d.Month); err != nil {
		return err
	}
	if d.AmountPaisa < 0 {
		return ErrNegativeAmount
	}
	return nil
}
