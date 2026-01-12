/**
 * PayFi Smart Contract Integration
 * 
 * This file provides functions to interact with the deployed PayFi smart contracts.
 * 
 * IMPORTANT: 
 * - All READ operations fetch REAL data from the blockchain
 * - All WRITE operations are REAL transactions
 * - NO mock data fallbacks for reads (only loading states)
 * - Vlayer proof generation is mocked separately in vlayer-mock.ts
 */

import { ethers, BrowserProvider, Contract } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from './web3-config';

// ============================================================================
// Contract Instance Helpers
// ============================================================================

/**
 * Get a read-only contract instance
 */
function getContract(contractName: keyof typeof CONTRACT_ADDRESSES): Contract {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Ethereum provider not found. Please install MetaMask.');
  }

  const address = CONTRACT_ADDRESSES[contractName];
  if (!address || address === '') {
    throw new Error(
      `Contract address for ${contractName} not configured. ` +
      `Please update CONTRACT_ADDRESSES in lib/web3-config.ts`
    );
  }

  const provider = new BrowserProvider(window.ethereum);
  const abi = CONTRACT_ABIS[contractName];
  
  return new Contract(address, abi, provider);
}

/**
 * Get a contract instance with signer for transactions
 */
async function getContractWithSigner(
  contractName: keyof typeof CONTRACT_ADDRESSES
): Promise<Contract> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Ethereum provider not found. Please install MetaMask.');
  }

  const address = CONTRACT_ADDRESSES[contractName];
  if (!address || address === '') {
    throw new Error(
      `Contract address for ${contractName} not configured. ` +
      `Please update CONTRACT_ADDRESSES in lib/web3-config.ts`
    );
  }

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const abi = CONTRACT_ABIS[contractName];
  
  return new Contract(address, abi, signer);
}

// ============================================================================
// FlexCreditCore - Read Functions
// ============================================================================

export interface CreditInfo {
  income: string;
  limit: string;
  used: string;
  available: string;
}

/**
 * Get complete credit information for a user
 * Returns REAL blockchain data
 */
export async function getCreditInfo(userAddress: string): Promise<CreditInfo> {
  const contract = getContract('FlexCreditCore');
  const info = await contract.getCreditInfo(userAddress);
  
  return {
    income: info.income.toString(),
    limit: info.limit.toString(),
    used: info.used.toString(),
    available: info.available.toString(),
  };
}

/**
 * Get available credit for a user
 */
export async function getAvailableCredit(userAddress: string): Promise<string> {
  const contract = getContract('FlexCreditCore');
  const available = await contract.getAvailableCredit(userAddress);
  return available.toString();
}

/**
 * Get income score for a user
 */
export async function getIncomeScore(userAddress: string): Promise<string> {
  const contract = getContract('FlexCreditCore');
  const score = await contract.incomeScore(userAddress);
  return score.toString();
}

/**
 * Get credit limit for a user
 */
export async function getCreditLimit(userAddress: string): Promise<string> {
  const contract = getContract('FlexCreditCore');
  const limit = await contract.creditLimit(userAddress);
  return limit.toString();
}

/**
 * Get used credit for a user
 */
export async function getUsedCredit(userAddress: string): Promise<string> {
  const contract = getContract('FlexCreditCore');
  const used = await contract.usedCredit(userAddress);
  return used.toString();
}

/**
 * Get agent risk score
 */
export async function getAgentRisk(
  userAddress: string,
  agentId: string
): Promise<string> {
  const contract = getContract('FlexCreditCore');
  const risk = await contract.getAgentRisk(userAddress, agentId);
  return risk.toString();
}

// ============================================================================
// FlexCreditCore - Write Functions (Transactions)
// ============================================================================

/**
 * Use credit (borrow)
 */
export async function useCredit(amount: string): Promise<string> {
  const contract = await getContractWithSigner('FlexCreditCore');
  const tx = await contract.useCredit(amount);
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Repay credit
 */
export async function repayCredit(amount: string): Promise<string> {
  const contract = await getContractWithSigner('FlexCreditCore');
  const tx = await contract.repayCredit(amount);
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Apply income score (requires authorization)
 * This is called by the IncomeProofVerifier contract
 */
export async function applyIncomeScore(
  userAddress: string,
  incomeBucket: number
): Promise<string> {
  const contract = await getContractWithSigner('FlexCreditCore');
  const tx = await contract.applyIncomeScore(userAddress, incomeBucket);
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Apply agent performance (requires authorization)
 * This is called by the AgentPerformanceVerifier contract
 */
export async function applyAgentPerformance(
  userAddress: string,
  agentId: string,
  pnlBucket: number
): Promise<string> {
  const contract = await getContractWithSigner('FlexCreditCore');
  const tx = await contract.applyAgentPerformance(userAddress, agentId, pnlBucket);
  const receipt = await tx.wait();
  return receipt.hash;
}

// ============================================================================
// IncomeProofVerifier - Write Functions
// ============================================================================

/**
 * Submit income proof (simplified version)
 * This is the main function for income verification
 * 
 * @param userAddress - User's wallet address
 * @param incomeBucket - Income tier (0, 500, 1000, 2000)
 * @param proofHash - Vlayer proof hash (from vlayer-mock.ts)
 */
export async function submitIncomeProof(
  userAddress: string,
  incomeBucket: number,
  proofHash: string
): Promise<string> {
  const contract = await getContractWithSigner('IncomeProofVerifier');
  const tx = await contract.submitIncomeProofSimplified(
    userAddress,
    incomeBucket,
    proofHash
  );
  const receipt = await tx.wait();
  return receipt.hash;
}

// ============================================================================
// AgentWallet - Read Functions
// ============================================================================

export interface AgentStats {
  balance: string;
  creditAllocated: string;
  creditUsed: string;
  spendingCap: string;
  reputation: string;
  nonce: string;
}

/**
 * Get agent wallet statistics
 */
export async function getAgentStats(): Promise<AgentStats> {
  const contract = getContract('AgentWallet');
  const stats = await contract.getStats();
  
  return {
    balance: stats.balance.toString(),
    creditAllocated: stats._creditAllocated.toString(),
    creditUsed: stats._creditUsed.toString(),
    spendingCap: stats._spendingCap.toString(),
    reputation: stats._reputation.toString(),
    nonce: stats._nonce.toString(),
  };
}

/**
 * Get agent wallet owner
 */
export async function getAgentOwner(): Promise<string> {
  const contract = getContract('AgentWallet');
  return await contract.owner();
}

/**
 * Get spending cap
 */
export async function getSpendingCap(): Promise<string> {
  const contract = getContract('AgentWallet');
  const cap = await contract.spendingCap();
  return cap.toString();
}

/**
 * Get credit used by agent
 */
export async function getAgentCreditUsed(): Promise<string> {
  const contract = getContract('AgentWallet');
  const used = await contract.creditUsed();
  return used.toString();
}

// ============================================================================
// AgentWallet - Write Functions
// ============================================================================

/**
 * Execute an action through the agent wallet
 */
export async function executeAgentAction(
  target: string,
  value: string,
  data: string
): Promise<string> {
  const contract = await getContractWithSigner('AgentWallet');
  const tx = await contract.executeAction(target, value, data);
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Allocate credit to agent
 */
export async function allocateCredit(amount: string): Promise<string> {
  const contract = await getContractWithSigner('AgentWallet');
  const tx = await contract.allocateCredit(amount);
  const receipt = await tx.wait();
  return receipt.hash;
}

/**
 * Withdraw from agent wallet
 */
export async function withdrawFromAgent(amount: string): Promise<string> {
  const contract = await getContractWithSigner('AgentWallet');
  const tx = await contract.withdraw(amount);
  const receipt = await tx.wait();
  return receipt.hash;
}

// ============================================================================
// AgentPolicy - Read Functions
// ============================================================================

export interface AgentPolicy {
  dailyLimit: string;
  perTxLimit: string;
  canUseCredit: boolean;
}

/**
 * Get policy for an agent
 */
export async function getAgentPolicy(
  userAddress: string,
  agentId: string
): Promise<AgentPolicy> {
  const contract = getContract('AgentPolicy');
  const policy = await contract.getPolicy(userAddress, agentId);
  
  return {
    dailyLimit: policy.dailyLimit.toString(),
    perTxLimit: policy.perTxLimit.toString(),
    canUseCredit: policy.canUseCredit,
  };
}

/**
 * Get agent tier (0 = Bronze, 1 = Silver, 2 = Gold, 3 = Platinum)
 */
export async function getAgentTier(
  userAddress: string,
  agentId: string
): Promise<number> {
  const contract = getContract('AgentPolicy');
  const tier = await contract.getAgentTier(userAddress, agentId);
  return Number(tier);
}

/**
 * Get remaining daily limit for agent
 */
export async function getRemainingDailyLimit(
  userAddress: string,
  agentId: string
): Promise<string> {
  const contract = getContract('AgentPolicy');
  const remaining = await contract.getRemainingDailyLimit(userAddress, agentId);
  return remaining.toString();
}

// ============================================================================
// AgentPolicy - Write Functions
// ============================================================================

/**
 * Set policy for an agent
 */
export async function setAgentPolicy(
  agentId: string,
  dailyLimit: string,
  perTxLimit: string,
  canUseCredit: boolean
): Promise<string> {
  const contract = await getContractWithSigner('AgentPolicy');
  const tx = await contract.setPolicy(agentId, dailyLimit, perTxLimit, canUseCredit);
  const receipt = await tx.wait();
  return receipt.hash;
}

// ============================================================================
// AgentPerformanceVerifier - Write Functions
// ============================================================================

/**
 * Submit agent performance proof (simplified version)
 * 
 * @param userAddress - User's wallet address
 * @param agentId - Agent identifier
 * @param pnlBucket - P&L tier (-100, -50, 0, 50, 100)
 * @param proofHash - Vlayer proof hash (from vlayer-mock.ts)
 */
export async function submitAgentProof(
  userAddress: string,
  agentId: string,
  pnlBucket: number,
  proofHash: string
): Promise<string> {
  const contract = await getContractWithSigner('AgentPerformanceVerifier');
  const tx = await contract.submitAgentProofSimplified(
    userAddress,
    agentId,
    pnlBucket,
    proofHash
  );
  const receipt = await tx.wait();
  return receipt.hash;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if contracts are configured
 */
export function areContractsConfigured(): boolean {
  return (
    CONTRACT_ADDRESSES.FlexCreditCore !== '' &&
    CONTRACT_ADDRESSES.IncomeProofVerifier !== ''
  );
}

/**
 * Get current network
 */
export async function getCurrentNetwork(): Promise<{ chainId: number; name: string }> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Ethereum provider not found');
  }

  const provider = new BrowserProvider(window.ethereum);
  const network = await provider.getNetwork();
  
  return {
    chainId: Number(network.chainId),
    name: network.name,
  };
}

/**
 * Get wallet balance
 */
export async function getWalletBalance(address: string): Promise<string> {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Ethereum provider not found');
  }

  const provider = new BrowserProvider(window.ethereum);
  const balance = await provider.getBalance(address);
  return ethers.formatEther(balance);
}
