// Core types for the Pay-Fi Credit application

// Window ethereum type for Web3 wallet
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, callback: (...args: unknown[]) => void) => void;
      isMetaMask?: boolean;
    };
  }
}

export type CreditTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';

export type TransactionStatus = 'Approved' | 'Pending' | 'Repaid' | 'Defaulted' | 'Rejected';

export type MerchantType = 'Food' | 'Petrol' | 'Shopping' | 'Other';

export interface WalletState {
  address: string | null;
  connected: boolean;
  network: string | null;
  balance: string;
  isVerified?: boolean;
  verificationDate?: string;
}

export interface CreditIdentity {
  tokenId: string;
  walletAddress: string;
  creditTier: CreditTier;
  creditScore: number;
  ipfsMetadataUri: string;
  mintedAt: string;
  isVerified?: boolean;
  verificationDate?: string;
}

export interface CreditData {
  creditScore: number;
  creditLimit: number;
  availableBalance: number;
  usedCredit: number;
  repaymentRate: number;
  riskLevel: RiskLevel;
  creditTier: CreditTier;
  // New fields for enhanced credit model
  assessmentTimestamp?: string;
  transactionCount?: number;
  cashflowMetrics?: {
    avgMonthlyInflow: number;
    repaymentScore: number;
    volatilityPenalty: number;
    transactionFrequency: number;
    consistencyScore: number;
  };
}

export interface Transaction {
  id: string;
  amount: number;
  merchantName: string;
  merchantType: MerchantType;
  status: TransactionStatus;
  date: string;
  dueDate?: string;
  repaidDate?: string;
  transactionHash?: string;
}

export interface Repayment {
  id: string;
  transactionId: string;
  amount: number;
  dueDate: string;
  status: 'Pending' | 'Completed' | 'Overdue';
  lateFee?: number;
}

export interface MCPDecision {
  approved: boolean;
  approvedAmount: number;
  requestedAmount: number;
  confidenceScore: number;
  riskAssessment: RiskLevel;
  decisionHash: string;
  reasoning: string[];
  timestamp: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OnChainActivity {
  totalTransactions: number;
  successfulRepayments: number;
  avgRepaymentTime: number;
  defaultCount: number;
  lastActivityDate: string;
}
