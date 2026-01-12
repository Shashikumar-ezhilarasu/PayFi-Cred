/**
 * Agent Policy Engine
 * Manages category-based spending limits and auto-repayment logic
 * Enforces credit constraints for AI/MCP agent actions
 */

export type SpendingCategory = 'utilities' | 'entertainment' | 'subscriptions' | 'food' | 'transport' | 'other';

export type PenaltyMode = 'strict' | 'relaxed';

export interface AgentPolicy {
  enabled: boolean;
  categoryLimits: Record<SpendingCategory, number>; // Percentage of available credit
  autoRepay: boolean;
  penaltyMode: PenaltyMode;
  dailySpendLimit: number; // Absolute limit per day
  requireApprovalAbove: number; // Amount requiring manual approval
}

export interface SpendingIntent {
  amount: number;
  category: SpendingCategory;
  merchant: string;
  description: string;
  timestamp: string;
}

export interface PolicyDecision {
  approved: boolean;
  reason: string;
  adjustedAmount?: number;
  requiresManualApproval: boolean;
  categoryUsage: number; // Percentage used in this category
  dailyUsage: number; // Amount spent today
}

export interface CategorySpending {
  category: SpendingCategory;
  used: number;
  limit: number;
  percentage: number;
}

/**
 * Default agent policy configuration
 */
export const DEFAULT_AGENT_POLICY: AgentPolicy = {
  enabled: true,
  categoryLimits: {
    utilities: 40, // 40% of available credit
    entertainment: 15,
    subscriptions: 20,
    food: 30,
    transport: 25,
    other: 10,
  },
  autoRepay: true,
  penaltyMode: 'relaxed',
  dailySpendLimit: 0.05, // 0.05 ETH per day
  requireApprovalAbove: 0.02, // Transactions > 0.02 ETH need approval
};

/**
 * Agent spending history tracker
 */
interface SpendingRecord {
  intent: SpendingIntent;
  approved: boolean;
  executedAmount: number;
}

class AgentSpendingTracker {
  private history: SpendingRecord[] = [];
  
  addRecord(record: SpendingRecord) {
    this.history.push(record);
    // Keep only last 100 records
    if (this.history.length > 100) {
      this.history.shift();
    }
  }
  
  getTodaySpending(): number {
    const today = new Date().toDateString();
    return this.history
      .filter(r => new Date(r.intent.timestamp).toDateString() === today)
      .reduce((sum, r) => sum + r.executedAmount, 0);
  }
  
  getCategorySpending(category: SpendingCategory): number {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return this.history
      .filter(r => 
        r.intent.category === category && 
        new Date(r.intent.timestamp).getTime() > thirtyDaysAgo
      )
      .reduce((sum, r) => sum + r.executedAmount, 0);
  }
  
  getHistory(): SpendingRecord[] {
    return [...this.history];
  }
  
  clear() {
    this.history = [];
  }
}

// Global tracker instance
const spendingTracker = new AgentSpendingTracker();

/**
 * Evaluate if a spending intent should be approved by the agent
 */
export function evaluateSpendingIntent(
  intent: SpendingIntent,
  availableCredit: number,
  policy: AgentPolicy
): PolicyDecision {
  // If agent is disabled, deny all automatic spending
  if (!policy.enabled) {
    return {
      approved: false,
      reason: 'Agent policy is disabled',
      requiresManualApproval: true,
      categoryUsage: 0,
      dailyUsage: 0,
    };
  }
  
  // Check if amount exceeds manual approval threshold
  if (intent.amount > policy.requireApprovalAbove) {
    return {
      approved: false,
      reason: `Amount exceeds manual approval threshold (${policy.requireApprovalAbove} ETH)`,
      requiresManualApproval: true,
      categoryUsage: 0,
      dailyUsage: spendingTracker.getTodaySpending(),
    };
  }
  
  // Check available credit
  if (intent.amount > availableCredit) {
    return {
      approved: false,
      reason: `Insufficient credit (available: ${availableCredit.toFixed(6)} ETH)`,
      requiresManualApproval: false,
      categoryUsage: 0,
      dailyUsage: spendingTracker.getTodaySpending(),
    };
  }
  
  // Check daily spend limit
  const todaySpending = spendingTracker.getTodaySpending();
  if (todaySpending + intent.amount > policy.dailySpendLimit) {
    return {
      approved: false,
      reason: `Daily spend limit reached (${policy.dailySpendLimit} ETH)`,
      requiresManualApproval: true,
      categoryUsage: 0,
      dailyUsage: todaySpending,
    };
  }
  
  // Check category limit
  const categoryLimit = (policy.categoryLimits[intent.category] / 100) * availableCredit;
  const categorySpending = spendingTracker.getCategorySpending(intent.category);
  const categoryUsagePercent = (categorySpending / categoryLimit) * 100;
  
  if (categorySpending + intent.amount > categoryLimit) {
    // In relaxed mode, allow small overages
    const overage = (categorySpending + intent.amount) - categoryLimit;
    const overagePercent = (overage / categoryLimit) * 100;
    
    if (policy.penaltyMode === 'relaxed' && overagePercent < 10) {
      // Allow up to 10% overage in relaxed mode
      return {
        approved: true,
        reason: `Approved with ${overagePercent.toFixed(1)}% category overage (relaxed mode)`,
        requiresManualApproval: false,
        categoryUsage: categoryUsagePercent,
        dailyUsage: todaySpending + intent.amount,
      };
    }
    
    return {
      approved: false,
      reason: `Category limit exceeded (${intent.category}: ${categoryUsagePercent.toFixed(1)}% used)`,
      requiresManualApproval: true,
      categoryUsage: categoryUsagePercent,
      dailyUsage: todaySpending,
    };
  }
  
  // All checks passed
  return {
    approved: true,
    reason: `Approved within all limits`,
    requiresManualApproval: false,
    categoryUsage: categoryUsagePercent,
    dailyUsage: todaySpending + intent.amount,
  };
}

/**
 * Record a spending execution
 */
export function recordSpending(
  intent: SpendingIntent,
  approved: boolean,
  executedAmount: number
) {
  spendingTracker.addRecord({
    intent,
    approved,
    executedAmount,
  });
}

/**
 * Get category spending breakdown
 */
export function getCategoryBreakdown(
  availableCredit: number,
  policy: AgentPolicy
): CategorySpending[] {
  const categories: SpendingCategory[] = [
    'utilities',
    'entertainment',
    'subscriptions',
    'food',
    'transport',
    'other',
  ];
  
  return categories.map(category => {
    const limitPercent = policy.categoryLimits[category];
    const limit = (limitPercent / 100) * availableCredit;
    const used = spendingTracker.getCategorySpending(category);
    
    return {
      category,
      used,
      limit,
      percentage: (used / limit) * 100,
    };
  });
}

/**
 * Check if auto-repayment should trigger
 */
export interface RepaymentCheck {
  shouldRepay: boolean;
  amount: number;
  reason: string;
}

export function checkAutoRepayment(
  incomingAmount: number,
  outstandingCredit: number,
  policy: AgentPolicy
): RepaymentCheck {
  if (!policy.autoRepay) {
    return {
      shouldRepay: false,
      amount: 0,
      reason: 'Auto-repayment disabled',
    };
  }
  
  if (outstandingCredit === 0) {
    return {
      shouldRepay: false,
      amount: 0,
      reason: 'No outstanding credit',
    };
  }
  
  // Repay up to the outstanding amount or incoming amount
  const repayAmount = Math.min(incomingAmount, outstandingCredit);
  
  return {
    shouldRepay: true,
    amount: repayAmount,
    reason: `Auto-repaying ${repayAmount.toFixed(6)} ETH from incoming funds`,
  };
}

/**
 * Get agent spending history
 */
export function getSpendingHistory(): SpendingRecord[] {
  return spendingTracker.getHistory();
}

/**
 * Clear spending history (for testing)
 */
export function clearSpendingHistory() {
  spendingTracker.clear();
}

/**
 * Validate and sanitize agent policy
 */
export function validatePolicy(policy: Partial<AgentPolicy>): AgentPolicy {
  return {
    enabled: policy.enabled ?? DEFAULT_AGENT_POLICY.enabled,
    categoryLimits: {
      utilities: Math.max(0, Math.min(100, policy.categoryLimits?.utilities ?? 40)),
      entertainment: Math.max(0, Math.min(100, policy.categoryLimits?.entertainment ?? 15)),
      subscriptions: Math.max(0, Math.min(100, policy.categoryLimits?.subscriptions ?? 20)),
      food: Math.max(0, Math.min(100, policy.categoryLimits?.food ?? 30)),
      transport: Math.max(0, Math.min(100, policy.categoryLimits?.transport ?? 25)),
      other: Math.max(0, Math.min(100, policy.categoryLimits?.other ?? 10)),
    },
    autoRepay: policy.autoRepay ?? DEFAULT_AGENT_POLICY.autoRepay,
    penaltyMode: policy.penaltyMode ?? DEFAULT_AGENT_POLICY.penaltyMode,
    dailySpendLimit: Math.max(0, policy.dailySpendLimit ?? DEFAULT_AGENT_POLICY.dailySpendLimit),
    requireApprovalAbove: Math.max(0, policy.requireApprovalAbove ?? DEFAULT_AGENT_POLICY.requireApprovalAbove),
  };
}
