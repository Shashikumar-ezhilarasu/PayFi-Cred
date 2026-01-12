/**
 * Credit Calculation Engine
 * Analyzes Sepolia transaction history to determine credit limits
 * Frontend-only implementation - NO smart contracts
 */

interface SepoliaTransaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timeStamp: string;
  isError: string;
  blockNumber: string;
}

interface CashflowMetrics {
  avgMonthlyInflow: number;
  repaymentScore: number;
  volatilityPenalty: number;
  transactionFrequency: number;
  consistencyScore: number;
}

interface CreditCalculationResult {
  creditLimit: number;
  metrics: CashflowMetrics;
  transactionCount: number;
  analysisTimestamp: string;
  reasoning: string[];
}

/**
 * Fetch Sepolia transaction history from Etherscan API
 * This is READ-ONLY blockchain data analysis
 */
export async function fetchSepoliaTransactions(
  address: string
): Promise<SepoliaTransaction[]> {
  try {
    // For demo purposes, using mock data
    // In production, call: https://api-sepolia.etherscan.io/api?module=account&action=txlist&address=${address}
    
    // Return mock but realistic transaction data
    const mockTransactions: SepoliaTransaction[] = generateMockSepoliaTransactions(address);
    
    console.log(`📊 Fetched ${mockTransactions.length} Sepolia transactions for analysis`);
    return mockTransactions;
  } catch (error) {
    console.error('Error fetching Sepolia transactions:', error);
    return [];
  }
}

/**
 * Generate realistic mock Sepolia transactions for demo
 * In production, this would be real Etherscan API data
 */
function generateMockSepoliaTransactions(address: string): SepoliaTransaction[] {
  const now = Math.floor(Date.now() / 1000);
  const dayInSeconds = 86400;
  
  const transactions: SepoliaTransaction[] = [];
  
  // Generate 20 incoming transactions (simulating income)
  for (let i = 0; i < 20; i++) {
    const daysAgo = i * 7; // Weekly income
    transactions.push({
      hash: `0x${Math.random().toString(16).substring(2, 66)}`,
      from: `0x${Math.random().toString(16).substring(2, 42)}`,
      to: address,
      value: (Math.random() * 0.5 + 0.1).toFixed(18), // 0.1 to 0.6 ETH
      timeStamp: (now - daysAgo * dayInSeconds).toString(),
      isError: '0',
      blockNumber: (18000000 + i * 1000).toString(),
    });
  }
  
  // Generate some outgoing transactions (spending)
  for (let i = 0; i < 15; i++) {
    const daysAgo = Math.floor(Math.random() * 140);
    transactions.push({
      hash: `0x${Math.random().toString(16).substring(2, 66)}`,
      from: address,
      to: `0x${Math.random().toString(16).substring(2, 42)}`,
      value: (Math.random() * 0.3 + 0.02).toFixed(18), // 0.02 to 0.32 ETH
      timeStamp: (now - daysAgo * dayInSeconds).toString(),
      isError: '0',
      blockNumber: (18000000 + i * 800).toString(),
    });
  }
  
  return transactions.sort((a, b) => Number(b.timeStamp) - Number(a.timeStamp));
}

/**
 * Analyze transaction history to compute cashflow metrics
 */
export function analyzeCashflow(
  transactions: SepoliaTransaction[],
  userAddress: string
): CashflowMetrics {
  const normalizedAddress = userAddress.toLowerCase();
  
  // Separate incoming and outgoing transactions
  const incoming = transactions.filter(
    (tx) => tx.to.toLowerCase() === normalizedAddress && tx.isError === '0'
  );
  
  const outgoing = transactions.filter(
    (tx) => tx.from.toLowerCase() === normalizedAddress && tx.isError === '0'
  );
  
  // Calculate average monthly inflow
  const inflowValues = incoming.map((tx) => parseFloat(tx.value));
  const totalInflow = inflowValues.reduce((sum, val) => sum + val, 0);
  
  // Estimate monthly average (assuming last 6 months of data)
  const avgMonthlyInflow = totalInflow / Math.max(1, incoming.length / 4);
  
  // Calculate repayment score (percentage of outgoing after inflow)
  const repaymentScore = incoming.length > 0
    ? Math.min(1, outgoing.length / incoming.length)
    : 0;
  
  // Calculate volatility penalty
  const inflowStdDev = calculateStandardDeviation(inflowValues);
  const inflowMean = totalInflow / Math.max(1, inflowValues.length);
  const volatilityPenalty = inflowMean > 0 ? inflowStdDev / inflowMean : 1;
  
  // Transaction frequency (txs per month)
  const oldestTimestamp = Math.min(
    ...transactions.map((tx) => Number(tx.timeStamp))
  );
  const newestTimestamp = Math.max(
    ...transactions.map((tx) => Number(tx.timeStamp))
  );
  const monthsSpan = Math.max(1, (newestTimestamp - oldestTimestamp) / (30 * 86400));
  const transactionFrequency = transactions.length / monthsSpan;
  
  // Consistency score (regular activity is good)
  const consistencyScore = Math.min(1, transactionFrequency / 10);
  
  return {
    avgMonthlyInflow,
    repaymentScore,
    volatilityPenalty,
    transactionFrequency,
    consistencyScore,
  };
}

/**
 * Calculate standard deviation of values
 */
function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  
  return Math.sqrt(variance);
}

/**
 * Calculate credit limit based on cashflow analysis
 * This is the CORE credit logic for Pay-Fi
 */
export function calculateCreditLimit(metrics: CashflowMetrics): number {
  const {
    avgMonthlyInflow,
    repaymentScore,
    volatilityPenalty,
    consistencyScore,
  } = metrics;
  
  // Base limit: 1.5x average monthly inflow
  let baseLimit = avgMonthlyInflow * 1.5;
  
  // Apply repayment score multiplier (good history = higher limit)
  baseLimit *= 0.5 + repaymentScore * 0.5;
  
  // Apply consistency bonus (regular income = higher limit)
  baseLimit *= 0.7 + consistencyScore * 0.3;
  
  // Apply volatility penalty (irregular income = lower limit)
  const stabilityFactor = Math.max(0.5, 1 - volatilityPenalty * 0.3);
  baseLimit *= stabilityFactor;
  
  // Ensure minimum viable credit (0.001 ETH) and cap at reasonable max
  const finalLimit = Math.max(0.001, Math.min(baseLimit, 10));
  
  return finalLimit;
}

/**
 * Main entry point: Calculate credit limit from wallet address
 */
export async function assessCreditLimit(
  address: string
): Promise<CreditCalculationResult> {
  const transactions = await fetchSepoliaTransactions(address);
  
  if (transactions.length === 0) {
    // New user with no history - give minimum credit
    return {
      creditLimit: 0.01,
      metrics: {
        avgMonthlyInflow: 0,
        repaymentScore: 0,
        volatilityPenalty: 0,
        transactionFrequency: 0,
        consistencyScore: 0,
      },
      transactionCount: 0,
      analysisTimestamp: new Date().toISOString(),
      reasoning: [
        'No transaction history found',
        'Assigned minimum starter credit of 0.01 ETH',
        'Build history to increase limit',
      ],
    };
  }
  
  const metrics = analyzeCashflow(transactions, address);
  const creditLimit = calculateCreditLimit(metrics);
  
  // Generate human-readable reasoning
  const reasoning: string[] = [
    `Analyzed ${transactions.length} Sepolia transactions`,
    `Average monthly inflow: ${metrics.avgMonthlyInflow.toFixed(6)} ETH`,
    `Repayment behavior score: ${(metrics.repaymentScore * 100).toFixed(1)}%`,
    `Transaction consistency: ${(metrics.consistencyScore * 100).toFixed(1)}%`,
    `Volatility adjustment: ${(metrics.volatilityPenalty * 100).toFixed(1)}%`,
    `Calculated credit limit: ${creditLimit.toFixed(6)} ETH`,
  ];
  
  return {
    creditLimit,
    metrics,
    transactionCount: transactions.length,
    analysisTimestamp: new Date().toISOString(),
    reasoning,
  };
}

/**
 * Dynamic credit adjustment based on user behavior
 */
export interface BehaviorUpdate {
  type: 'early_repay' | 'on_time_repay' | 'late_repay' | 'missed_repay';
  amount: number;
  daysLate?: number;
}

export function adjustCreditForBehavior(
  currentLimit: number,
  behavior: BehaviorUpdate
): { newLimit: number; adjustment: number; reason: string } {
  let adjustment = 0;
  let reason = '';
  
  switch (behavior.type) {
    case 'early_repay':
      adjustment = currentLimit * 0.05; // 5% increase
      reason = 'Early repayment bonus';
      break;
      
    case 'on_time_repay':
      adjustment = 0; // No change
      reason = 'On-time repayment maintained';
      break;
      
    case 'late_repay':
      const latePenalty = Math.min(0.15, (behavior.daysLate || 0) * 0.01);
      adjustment = -currentLimit * latePenalty;
      reason = `Late repayment penalty (${behavior.daysLate} days)`;
      break;
      
    case 'missed_repay':
      adjustment = -currentLimit * 0.2; // 20% decrease
      reason = 'Missed repayment - significant penalty';
      break;
  }
  
  const newLimit = Math.max(0.001, currentLimit + adjustment);
  
  return { newLimit, adjustment, reason };
}
