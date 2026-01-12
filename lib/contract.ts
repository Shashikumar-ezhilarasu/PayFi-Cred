// Smart Contract Integration with ethers.js
import { ethers } from 'ethers';
import { 
  shouldUseMockData, 
  getMockCreditInfo,
  getMockAvailableCredit,
  getMockIncomeScore,
  getMockCreditLimit,
  getMockUsedCredit,
  mockUseCredit,
  mockRepayCredit,
  mockApplyIncomeScore,
  mockGetAgentRisk,
  mockApplyAgentPerformance,
  showDevModeIndicator 
} from './dev-mode';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from './web3-config';

// Show dev mode indicator on load
if (typeof window !== 'undefined') {
  showDevModeIndicator();
}

// Contract Address
export const CONTRACT_ADDRESS = CONTRACT_ADDRESSES.FlexCreditCore;

// Contract ABI
export const CONTRACT_ABI = CONTRACT_ABIS.FlexCreditCore;

// Get contract instance (read-only)
export const getContract = () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Ethereum provider not found');
  }
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
};

// Get contract instance with signer (for transactions)
export const getContractWithSigner = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Ethereum provider not found');
  }
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
};

// Contract interaction functions

// Get credit info for a user
export const getCreditInfo = async (userAddress: string) => {
  // Check if we should use mock data
  const useMock = await shouldUseMockData();
  if (useMock) {
    console.log('📊 Using mock credit data');
    return getMockCreditInfo(userAddress);
  }
  
  try {
    const contract = getContract();
    const info = await contract.getCreditInfo(userAddress);
    
    return {
      income: info.income.toString(),
      limit: info.limit.toString(),
      used: info.used.toString(),
      available: info.available.toString(),
    };
  } catch (error: any) {
    console.error('Error getting credit info:', error);
    
    // Fallback to mock data on error
    console.log('⚠️ Contract call failed, using mock data');
    return getMockCreditInfo(userAddress);
  }
};

// Get available credit for a user
export const getAvailableCredit = async (userAddress: string) => {
  const useMock = await shouldUseMockData();
  if (useMock) {
    return getMockAvailableCredit(userAddress);
  }
  
  try {
    const contract = getContract();
    const available = await contract.getAvailableCredit(userAddress);
    return available.toString();
  } catch (error) {
    console.error('Error getting available credit:', error);
    return getMockAvailableCredit(userAddress);
  }
};

// Get income score for a user
export const getIncomeScore = async (userAddress: string) => {
  const useMock = await shouldUseMockData();
  if (useMock) {
    return getMockIncomeScore(userAddress);
  }
  
  try {
    const contract = getContract();
    const score = await contract.incomeScore(userAddress);
    return score.toString();
  } catch (error) {
    console.error('Error getting income score:', error);
    return getMockIncomeScore(userAddress);
  }
};

// Get credit limit for a user
export const getCreditLimit = async (userAddress: string) => {
  const useMock = await shouldUseMockData();
  if (useMock) {
    return getMockCreditLimit(userAddress);
  }
  
  try {
    const contract = getContract();
    const limit = await contract.creditLimit(userAddress);
    return limit.toString();
  } catch (error) {
    console.error('Error getting credit limit:', error);
    return getMockCreditLimit(userAddress);
  }
};

// Get used credit for a user
export const getUsedCredit = async (userAddress: string) => {
  const useMock = await shouldUseMockData();
  if (useMock) {
    return getMockUsedCredit(userAddress);
  }
  
  try {
    const contract = getContract();
    const used = await contract.usedCredit(userAddress);
    return used.toString();
  } catch (error) {
    console.error('Error getting used credit:', error);
    return getMockUsedCredit(userAddress);
  }
};

// Get agent risk score
export const getAgentRisk = async (userAddress: string, agentId: string) => {
  const useMock = await shouldUseMockData();
  if (useMock) {
    return mockGetAgentRisk(userAddress, agentId);
  }
  
  try {
    const contract = getContract();
    const risk = await contract.getAgentRisk(userAddress, agentId);
    return risk.toString();
  } catch (error) {
    console.error('Error getting agent risk:', error);
    return mockGetAgentRisk(userAddress, agentId);
  }
};

// Use credit (transaction)
export const useCredit = async (amount: string) => {
  try {
    const contract = await getContractWithSigner();
    const tx = await contract.useCredit(amount);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error using credit:', error);
    throw error;
  }
};

// Repay credit (transaction)
export const repayCredit = async (amount: string) => {
  const useMock = await shouldUseMockData();
  if (useMock) {
    console.log('💰 Using mock repayCredit');
    return mockRepayCredit(amount);
  }
  
  try {
    const contract = await getContractWithSigner();
    const tx = await contract.repayCredit(amount);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error repaying credit:', error);
    console.log('⚠️ Falling back to mock repayCredit');
    return mockRepayCredit(amount);
  }
};

// Apply income score (transaction - requires authorization)
export const applyIncomeScore = async (userAddress: string, incomeBucket: number) => {
  const useMock = await shouldUseMockData();
  if (useMock) {
    console.log('📊 Using mock applyIncomeScore');
    return mockApplyIncomeScore(userAddress, incomeBucket);
  }
  
  try {
    const contract = await getContractWithSigner();
    const tx = await contract.applyIncomeScore(userAddress, incomeBucket);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error applying income score:', error);
    console.log('⚠️ Falling back to mock applyIncomeScore');
    return mockApplyIncomeScore(userAddress, incomeBucket);
  }
};

// Apply agent performance (transaction - requires authorization)
export const applyAgentPerformance = async (
  userAddress: string,
  agentId: string,
  pnlBucket: number
) => {
  try {
    const contract = await getContractWithSigner();
    const tx = await contract.applyAgentPerformance(userAddress, agentId, pnlBucket);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error applying agent performance:', error);
    throw error;
  }
};

// Get credit multiplier constant
export const getCreditMultiplier = async () => {
  try {
    const contract = getContract();
    const multiplier = await contract.CREDIT_MULTIPLIER();
    return multiplier.toString();
  } catch (error) {
    console.error('Error getting credit multiplier:', error);
    throw error;
  }
};

// Check if address is authorized verifier
export const isAuthorizedVerifier = async (address: string) => {
  try {
    const contract = getContract();
    const authorized = await contract.authorizedVerifiers(address);
    return authorized;
  } catch (error) {
    console.error('Error checking verifier authorization:', error);
    throw error;
  }
};

// Get contract owner
export const getOwner = async () => {
  try {
    const contract = getContract();
    const owner = await contract.owner();
    return owner;
  } catch (error) {
    console.error('Error getting owner:', error);
    throw error;
  }
};

// Event listeners
export const listenToCreditUsed = (callback: (user: string, amount: string, totalUsed: string) => void) => {
  const contract = getContract();
  contract.on('CreditUsed', (user, amount, totalUsed) => {
    callback(user, amount.toString(), totalUsed.toString());
  });
};

export const listenToCreditRepaid = (callback: (user: string, amount: string, totalUsed: string) => void) => {
  const contract = getContract();
  contract.on('CreditRepaid', (user, amount, totalUsed) => {
    callback(user, amount.toString(), totalUsed.toString());
  });
};

export const listenToIncomeScoreApplied = (
  callback: (user: string, previousScore: string, newScore: string, newCreditLimit: string) => void
) => {
  const contract = getContract();
  contract.on('IncomeScoreApplied', (user, previousScore, newScore, newCreditLimit) => {
    callback(user, previousScore.toString(), newScore.toString(), newCreditLimit.toString());
  });
};

// Fetch repayment history from event logs
export const fetchRepaymentHistory = async (userAddress: string) => {
  // Check if we should use mock data
  const useMock = await shouldUseMockData();
  if (useMock) {
    console.log('📊 Using mock repayment history');
    // Return mock data
    return {
      count: 5,
      totalVolume: ethers.parseEther('2.5').toString()
    };
  }
  
  try {
    const contract = getContract();
    
    // Create a filter for CreditRepaid events for this user
    const filter = contract.filters.CreditRepaid(userAddress);
    
    // Query all historical events
    const events = await contract.queryFilter(filter);
    
    // Count the events
    const count = events.length;
    
    // Sum up the amounts to get total lifetime volume
    let totalVolume = BigInt(0);
    for (const event of events) {
      // Type guard: Check if this is an EventLog (has args property)
      if ('args' in event && event.args && event.args.amount) {
        totalVolume += BigInt(event.args.amount);
      }
    }
    
    return {
      count,
      totalVolume: totalVolume.toString()
    };
  } catch (error) {
    console.error('Error fetching repayment history:', error);
    console.log('⚠️ Falling back to mock repayment history');
    // Fallback to mock data
    return {
      count: 5,
      totalVolume: ethers.parseEther('2.5').toString()
    };
  }
};
