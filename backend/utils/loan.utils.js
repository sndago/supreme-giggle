/**
 * Calculate monthly repayment using flat interest method
 * (common in microfinance / savings & loan institutions)
 *
 * Formula: Monthly = (Principal + Total Interest) / Duration
 * Total Interest = Principal × (annualRate / 100) × (months / 12)
 */
const calculateLoanSchedule = (amount, annualRate, durationMonths) => {
  const totalInterest  = amount * (annualRate / 100) * (durationMonths / 12);
  const totalRepayable = amount + totalInterest;
  const monthlyPayment = totalRepayable / durationMonths;

  return {
    totalInterest:   parseFloat(totalInterest.toFixed(2)),
    totalRepayable:  parseFloat(totalRepayable.toFixed(2)),
    monthlyPayment:  parseFloat(monthlyPayment.toFixed(2)),
  };
};

/**
 * Calculate late payment penalty
 * Default: 2% of outstanding balance per month late
 */
const calculatePenalty = (outstandingBalance, daysLate, penaltyRate = 0.02) => {
  if (daysLate <= 0) return 0;
  const monthsLate = daysLate / 30;
  return parseFloat((outstandingBalance * penaltyRate * monthsLate).toFixed(2));
};

/**
 * Split a repayment amount into interest and principal portions
 * Interest is paid first, remainder goes to principal
 */
const splitRepayment = (amount, outstandingBalance, totalInterestRemaining) => {
  const interestPortion  = Math.min(amount, totalInterestRemaining);
  const principalPortion = Math.max(0, amount - interestPortion);
  return {
    interest:  parseFloat(interestPortion.toFixed(2)),
    principal: parseFloat(principalPortion.toFixed(2)),
  };
};

module.exports = { calculateLoanSchedule, calculatePenalty, splitRepayment };
