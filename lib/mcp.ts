// MCP Agent mock logic
// This simulates the AI decision-making process

import type { MCPDecision, RiskLevel } from '@/types';
import { RISK_THRESHOLDS } from './constants';

// Simulate MCP agent evaluation
export const evaluatePayLaterRequest = async (
  requestedAmount: number,
  creditScore: number,
  availableBalance: number,
  repaymentRate: number
): Promise<MCPDecision> => {
  // Simulate processing time
  await new Promise((resolve) => setTimeout(resolve, 3000));

  // Calculate risk factors
  const utilizationRatio = requestedAmount / availableBalance;
  const scoreNormalized = creditScore / 850;
  const repaymentNormalized = repaymentRate / 100;

  // Calculate confidence score
  const confidenceScore = (
    scoreNormalized * 0.4 +
    repaymentNormalized * 0.3 +
    (1 - Math.min(utilizationRatio, 1)) * 0.3
  );

  // Determine risk level
  let riskLevel: RiskLevel;
  if (confidenceScore >= RISK_THRESHOLDS.LOW) {
    riskLevel = 'LOW';
  } else if (confidenceScore >= RISK_THRESHOLDS.MEDIUM) {
    riskLevel = 'MEDIUM';
  } else if (confidenceScore >= RISK_THRESHOLDS.HIGH) {
    riskLevel = 'HIGH';
  } else {
    riskLevel = 'VERY_HIGH';
  }

  // Determine approval
  const approved = confidenceScore >= RISK_THRESHOLDS.MEDIUM && requestedAmount <= availableBalance;
  const approvedAmount = approved ? requestedAmount : Math.floor(requestedAmount * confidenceScore);

  // Generate reasoning
  const reasoning: string[] = [];

  if (creditScore >= 740) {
    reasoning.push('✓ Excellent credit score detected');
  } else if (creditScore >= 670) {
    reasoning.push('✓ Good credit score');
  } else {
    reasoning.push('⚠ Credit score below optimal range');
  }

  if (repaymentRate >= 95) {
    reasoning.push('✓ Outstanding repayment history');
  } else if (repaymentRate >= 80) {
    reasoning.push('✓ Good repayment track record');
  } else {
    reasoning.push('⚠ Repayment history needs improvement');
  }

  if (utilizationRatio <= 0.3) {
    reasoning.push('✓ Low credit utilization');
  } else if (utilizationRatio <= 0.7) {
    reasoning.push('◆ Moderate credit utilization');
  } else {
    reasoning.push('⚠ High credit utilization ratio');
  }

  if (availableBalance >= requestedAmount * 1.5) {
    reasoning.push('✓ Sufficient available credit');
  } else if (availableBalance >= requestedAmount) {
    reasoning.push('◆ Adequate available credit');
  } else {
    reasoning.push('⚠ Limited available credit');
  }

  // Generate decision hash (mock blockchain hash)
  const decisionHash = '0x' + Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('');

  return {
    approved,
    approvedAmount: Math.max(0, approvedAmount),
    requestedAmount,
    confidenceScore: Math.round(confidenceScore * 100) / 100,
    riskAssessment: riskLevel,
    decisionHash,
    reasoning,
    timestamp: new Date().toISOString(),
  };
};

// Simulate fetching MCP decision from blockchain
export const fetchMCPDecision = async (transactionId: string): Promise<MCPDecision | null> => {
  // This would query the blockchain for stored decision
  console.log('Fetching MCP decision for:', transactionId);

  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Return null for demo (would return actual decision)
  return null;
};

// Simulate storing MCP decision on blockchain
export const storeMCPDecision = async (decision: MCPDecision): Promise<string> => {
  // This would store the decision hash on-chain
  console.log('Storing MCP decision on-chain:', decision);

  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Return mock transaction hash
  return '0x' + Math.random().toString(16).substring(2, 66);
};

// Get risk color based on level
export const getRiskColor = (risk: RiskLevel): string => {
  switch (risk) {
    case 'LOW':
      return 'text-[var(--color-accent)]';
    case 'MEDIUM':
      return 'text-[var(--color-accent2)]';
    case 'HIGH':
      return 'text-[var(--color-text-dim)]';
    case 'VERY_HIGH':
      return 'text-[var(--color-text-dim)]';
    default:
      return 'text-[var(--color-text)]';
  }
};

// Get confidence color
export const getConfidenceColor = (confidence: number): string => {
  if (confidence >= 0.75) return 'text-[var(--color-accent)]';
  if (confidence >= 0.5) return 'text-[var(--color-accent2)]';
  if (confidence >= 0.3) return 'text-[var(--color-text-dim)]';
  return 'text-[var(--color-text-dim)]';
};
