package main

// SafeAddMoney adds two Money values with basic overflow guard.
func SafeAddMoney(a, b Money) (Money, bool) {
	c := a + b
	// overflow if signs of a and b are the same but sign of c differs
	if (a > 0 && b > 0 && c <= 0) || (a < 0 && b < 0 && c >= 0) {
		return 0, false
	}
	return c, true
}
