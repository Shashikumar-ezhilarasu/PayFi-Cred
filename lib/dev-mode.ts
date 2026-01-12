// Development mode helpers - Use mock data when contracts aren't deployed

export const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true' || true; // Always true for development

// Mock credit data
export const MOCK_CREDIT_DATA = {
  income: '1000', // Income bucket
  limit: '5000000000000000000', // 5 ETH
  used: '1000000000000000000', // 1 ETH
  available: '4000000000000000000', // 4 ETH
};

// Mock functions for development
export const getMockCreditInfo = async (userAddress: string) => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    income: MOCK_CREDIT_DATA.income,
    limit: MOCK_CREDIT_DATA.limit,
    used: MOCK_CREDIT_DATA.used,
    available: MOCK_CREDIT_DATA.available,
  };
};

export const getMockAvailableCredit = async (userAddress: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_CREDIT_DATA.available;
};

export const getMockIncomeScore = async (userAddress: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_CREDIT_DATA.income;
};

export const getMockCreditLimit = async (userAddress: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_CREDIT_DATA.limit;
};

export const getMockUsedCredit = async (userAddress: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return MOCK_CREDIT_DATA.used;
};

export const mockUseCredit = async (amount: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Update mock data
  const currentUsed = BigInt(MOCK_CREDIT_DATA.used);
  const amountBigInt = BigInt(amount);
  MOCK_CREDIT_DATA.used = (currentUsed + amountBigInt).toString();
  MOCK_CREDIT_DATA.available = (BigInt(MOCK_CREDIT_DATA.limit) - BigInt(MOCK_CREDIT_DATA.used)).toString();
  
  return '0x' + Math.random().toString(16).substring(2, 66); // Mock tx hash
};

export const mockRepayCredit = async (amount: string) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Update mock data
  const currentUsed = BigInt(MOCK_CREDIT_DATA.used);
  const amountBigInt = BigInt(amount);
  MOCK_CREDIT_DATA.used = (currentUsed - amountBigInt).toString();
  MOCK_CREDIT_DATA.available = (BigInt(MOCK_CREDIT_DATA.limit) - BigInt(MOCK_CREDIT_DATA.used)).toString();
  
  return '0x' + Math.random().toString(16).substring(2, 66); // Mock tx hash
};

export const mockApplyIncomeScore = async (userAddress: string, incomeBucket: number) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Update mock data
  MOCK_CREDIT_DATA.income = incomeBucket.toString();
  // Recalculate limit based on income
  const multiplier = 5;
  MOCK_CREDIT_DATA.limit = (BigInt(incomeBucket) * BigInt(multiplier) * BigInt(1e18)).toString();
  MOCK_CREDIT_DATA.available = (BigInt(MOCK_CREDIT_DATA.limit) - BigInt(MOCK_CREDIT_DATA.used)).toString();
  
  return '0x' + Math.random().toString(16).substring(2, 66); // Mock tx hash
};

export const mockGetAgentRisk = async (userAddress: string, agentId: string) => {
  await new Promise(resolve => setTimeout(resolve, 300));
  return '50'; // Mock risk score
};

export const mockApplyAgentPerformance = async (
  userAddress: string,
  agentId: string,
  pnlBucket: number
) => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return '0x' + Math.random().toString(16).substring(2, 66); // Mock tx hash
};

// Check if we should use mock data
export const shouldUseMockData = async (): Promise<boolean> => {
  if (!DEV_MODE) return false;
  
  // Check if window.ethereum exists
  if (typeof window === 'undefined' || !window.ethereum) {
    return true;
  }
  
  try {
    // Try to get the network
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const chainIdNumber = parseInt(chainId, 16);
    
    // If on localhost or unknown network, use mock data
    if (chainIdNumber === 31337 || chainIdNumber === 1337) {
      console.log('🔧 Using mock data (localhost network detected)');
      return true;
    }
    
    // For now, always use mock data in development
    console.log('🔧 Using mock data (development mode)');
    return true;
  } catch (error) {
    console.log('🔧 Using mock data (error detecting network)');
    return true;
  }
};

// Helper to show dev mode indicator
export const showDevModeIndicator = () => {
  if (typeof window !== 'undefined' && DEV_MODE) {
    console.log(
      '%c🔧 DEV MODE ACTIVE',
      'background: #10b981; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;',
      '\nUsing mock contract data. Deploy contracts to use real data.'
    );
  }
};
