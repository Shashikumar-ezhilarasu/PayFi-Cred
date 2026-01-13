// Dynamic Credit Engine - Behavior-Driven Credit System
// This module handles all credit calculations based on user behavior

import type { CreditData, Transaction, RiskLevel, CreditTier } from '@/types';

// Initial credit state for new users (Shardeum testnet values)
export const INITIAL_CREDIT_STATE: CreditData = {
  creditScore: 500, // Start at 500 (Bronze tier: 300-579)
  creditLimit: 500, // Start with 500 SHM
  availableBalance: 500,
  usedCredit: 0,
  repaymentRate: 100,
  riskLevel: 'LOW',
  creditTier: 'Bronze',
};

// Credit behavior constants
const CREDIT_MULTIPLIER_ON_TIME = 2; // Double credit on timely repayment
const SCORE_INCREASE_ON_TIME = 50;
const SCORE_DECREASE_LATE = 30;
const SCORE_DECREASE_DEFAULT = 80;
const LATE_FEE_DAILY_RATE = 0.05; // 5% per day

/**
 * Calculate if a payment is late
 */
export function isPaymentLate(dueDate: string, paidDate?: string): boolean {
  const due = new Date(dueDate);
  const paid = paidDate ? new Date(paidDate) : new Date();
  return paid > due;
}

/**
 * Calculate number of days late
 */
export function getDaysLate(dueDate: string, paidDate?: string): number {
  if (!isPaymentLate(dueDate, paidDate)) return 0;
  
  const due = new Date(dueDate);
  const paid = paidDate ? new Date(paidDate) : new Date();
  const diffTime = Math.abs(paid.getTime() - due.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Calculate late payment fine
 */
export function calculateLateFee(amount: number, daysLate: number): number {
  return amount * LATE_FEE_DAILY_RATE * daysLate;
}

/**
 * Update credit after timely repayment
 */
export function processTimelyRepayment(currentCredit: CreditData): CreditData {
  const newCreditLimit = currentCredit.creditLimit * CREDIT_MULTIPLIER_ON_TIME;
  const newCreditScore = Math.min(850, currentCredit.creditScore + SCORE_INCREASE_ON_TIME);
  
  return {
    ...currentCredit,
    creditLimit: newCreditLimit,
    availableBalance: newCreditLimit - currentCredit.usedCredit,
    creditScore: newCreditScore,
    creditTier: determineCreditTier(newCreditScore),
    riskLevel: 'LOW',
  };
}

/**
 * Update credit after late repayment
 */
export function processLateRepayment(
  currentCredit: CreditData,
  daysLate: number
): CreditData {
  const newCreditScore = Math.max(300, currentCredit.creditScore - SCORE_DECREASE_LATE);
  
  return {
    ...currentCredit,
    creditScore: newCreditScore,
    creditTier: determineCreditTier(newCreditScore),
    riskLevel: daysLate > 7 ? 'HIGH' : 'MEDIUM',
    // Credit limit does NOT increase on late payment
  };
}

/**
 * Update credit after default/severe delay
 */
export function processDefault(currentCredit: CreditData): CreditData {
  const newCreditScore = Math.max(300, currentCredit.creditScore - SCORE_DECREASE_DEFAULT);
  
  return {
    ...currentCredit,
    creditScore: newCreditScore,
    creditLimit: currentCredit.creditLimit * 0.5, // Reduce limit by 50%
    availableBalance: currentCredit.creditLimit * 0.5 - currentCredit.usedCredit,
    creditTier: determineCreditTier(newCreditScore),
    riskLevel: 'HIGH',
  };
}

/**
 * Determine credit tier based on score
 */
export function determineCreditTier(score: number): CreditTier {
  if (score >= 740) return 'Platinum';
  if (score >= 670) return 'Gold';
  if (score >= 580) return 'Silver';
  return 'Bronze';
}

/**
 * Calculate maximum allowed credit limits by tier (Shardeum testnet values)
 * New accounts start at 500 SHM, grow to 1000 SHM after first repayment
 */
export function getMaxCreditLimitForTier(tier: CreditTier): number {
  switch (tier) {
    case 'Platinum':
      return 5000; // 5000 SHM
    case 'Gold':
      return 2000; // 2000 SHM
    case 'Silver':
      return 1000; // 1000 SHM
    case 'Bronze':
    default:
      return 500; // 500 SHM
  }
}

/**
 * Process a repayment and update credit accordingly
 * THIS IS THE MAIN FUNCTION THAT SHOULD BE CALLED AFTER REPAYMENT
 */
export function processRepayment(
  currentCredit: CreditData,
  transaction: Transaction,
  paidDate: string
): {
  newCredit: CreditData;
  statusMessage: string;
  creditIncreased: boolean;
  fine: number;
} {
  const daysLate = getDaysLate(transaction.dueDate!, paidDate);
  const fine = daysLate > 0 ? calculateLateFee(transaction.amount, daysLate) : 0;
  
  let newCredit: CreditData;
  let statusMessage: string;
  let creditIncreased = false;

  // Free up the used credit
  const freedCredit = {
    ...currentCredit,
    usedCredit: currentCredit.usedCredit - transaction.amount,
    availableBalance: currentCredit.availableBalance + transaction.amount,
  };

  if (daysLate === 0) {
    // ON TIME REPAYMENT
    newCredit = processTimelyRepayment(freedCredit);
    creditIncreased = true;
    statusMessage = `🎉 Credit doubled! Your new limit is $${newCredit.creditLimit.toFixed(2)}`;
  } else if (daysLate <= 7) {
    // LATE BUT NOT DEFAULT
    newCredit = processLateRepayment(freedCredit, daysLate);
    statusMessage = `⚠️ Late payment detected. Fine: $${fine.toFixed(2)}. Credit limit unchanged.`;
  } else {
    // SEVERE DEFAULT
    newCredit = processDefault(freedCredit);
    statusMessage = `❌ Severe delay! Credit limit reduced. Fine: $${fine.toFixed(2)}`;
  }

  // Cap credit limit at tier maximum
  const maxLimit = getMaxCreditLimitForTier(newCredit.creditTier);
  if (newCredit.creditLimit > maxLimit) {
    newCredit = {
      ...newCredit,
      creditLimit: maxLimit,
      availableBalance: maxLimit - newCredit.usedCredit,
    };
    statusMessage += ` (Capped at ${newCredit.creditTier} tier limit)`;
  }

  return {
    newCredit,
    statusMessage,
    creditIncreased,
    fine,
  };
}

/**
 * Calculate repayment status for a transaction
 */
export function getRepaymentStatus(
  transaction: Transaction
): 'ON_TIME' | 'LATE' | 'DEFAULT' | 'PENDING' {
  if (transaction.status !== 'Repaid' && transaction.status !== 'Approved') {
    return 'PENDING';
  }

  if (transaction.status === 'Repaid' && transaction.repaidDate && transaction.dueDate) {
    const daysLate = getDaysLate(transaction.dueDate, transaction.repaidDate);
    if (daysLate === 0) return 'ON_TIME';
    if (daysLate <= 7) return 'LATE';
    return 'DEFAULT';
  }

  return 'PENDING';
}

/**
 * Calculate current outstanding amount including fines
 */
export function calculateTotalDue(transaction: Transaction): number {
  if (transaction.status !== 'Approved' || !transaction.dueDate) {
    return transaction.amount;
  }

  const daysLate = getDaysLate(transaction.dueDate);
  const fine = daysLate > 0 ? calculateLateFee(transaction.amount, daysLate) : 0;
  
  return transaction.amount + fine;
}

/**
 * Get credit growth timeline
 */
export function getCreditGrowthTimeline(startingCredit: number, cycles: number): number[] {
  const timeline = [startingCredit];
  let current = startingCredit;
  
  for (let i = 0; i < cycles; i++) {
    current *= CREDIT_MULTIPLIER_ON_TIME;
    timeline.push(current);
  }
  
  return timeline;
}

/**
 * Estimate next credit limit after successful repayment
 */
export function estimateNextCreditLimit(currentCredit: CreditData): number {
  const estimated = currentCredit.creditLimit * CREDIT_MULTIPLIER_ON_TIME;
  const maxLimit = getMaxCreditLimitForTier(currentCredit.creditTier);
  return Math.min(estimated, maxLimit);
}
