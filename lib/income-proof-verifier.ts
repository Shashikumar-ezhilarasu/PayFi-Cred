// Income Proof Verifier Contract Integration
// Verifies Vlayer income proofs and updates credit scores

import { ethers } from 'ethers';
import { shouldUseMockData, mockApplyIncomeScore } from './dev-mode';

// Contract Address
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from './web3-config';

// Contract Address
export const INCOME_PROOF_VERIFIER_ADDRESS = CONTRACT_ADDRESSES.IncomeProofVerifier;

// Contract ABI
// Contract ABI
export const INCOME_PROOF_VERIFIER_ABI = CONTRACT_ABIS.IncomeProofVerifier;

// Income Bucket Values
export const INCOME_BUCKETS = {
  NONE: 0,
  LOW: 500,
  MEDIUM: 1000,
  HIGH: 2000
} as const;

export type IncomeBucket = typeof INCOME_BUCKETS[keyof typeof INCOME_BUCKETS];

// Helper Functions
const getContract = () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Ethereum provider not found');
  }
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  return new ethers.Contract(INCOME_PROOF_VERIFIER_ADDRESS, INCOME_PROOF_VERIFIER_ABI, provider);
};

const getContractWithSigner = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('Ethereum provider not found');
  }
  
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(INCOME_PROOF_VERIFIER_ADDRESS, INCOME_PROOF_VERIFIER_ABI, signer);
};

// ============================================================================
// CONTRACT FUNCTIONS
// ============================================================================

/**
 * Submit income proof with full Vlayer verification
 * @param proof The full proof data from Vlayer
 * @param publicInputs Public inputs (user address, income bucket, timestamp)
 */
export const submitIncomeProof = async (
  proof: string,
  publicInputs: string
) => {
  try {
    const contract = await getContractWithSigner();
    const tx = await contract.submitIncomeProof(proof, publicInputs);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error submitting income proof:', error);
    throw error;
  }
};

/**
 * Submit income proof (simplified for testing/demo)
 * @param userAddress User's wallet address
 * @param incomeBucket Income bucket (0, 500, 1000, or 2000)
 */
export const submitIncomeProofSimplified = async (
  userAddress: string,
  incomeBucket: IncomeBucket
) => {
  const useMock = await shouldUseMockData();
  if (useMock) {
    console.log('🔧 Using mock income proof submission');
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const timestamp = Math.floor(Date.now() / 1000);
    const proofHash = ethers.keccak256(
      ethers.solidityPacked(
        ['address', 'uint256', 'uint256'],
        [userAddress, incomeBucket, timestamp]
      )
    );
    
    // Call mock apply income score
    const txHash = await mockApplyIncomeScore(userAddress, incomeBucket);
    
    return {
      txHash,
      proofHash,
      receipt: null
    };
  }
  
  try {
    const contract = await getContractWithSigner();
    
    // Generate a unique proof hash based on user, income, and timestamp
    const timestamp = Math.floor(Date.now() / 1000);
    const proofHash = ethers.keccak256(
      ethers.solidityPacked(
        ['address', 'uint256', 'uint256'],
        [userAddress, incomeBucket, timestamp]
      )
    );
    
    const tx = await contract.submitIncomeProofSimplified(
      userAddress,
      incomeBucket,
      proofHash
    );
    
    const receipt = await tx.wait();
    return {
      txHash: tx.hash,
      proofHash,
      receipt
    };
  } catch (error) {
    console.error('Error submitting simplified income proof:', error);
    console.log('⚠️ Falling back to mock income proof');
    
    // Fallback to mock
    const timestamp = Math.floor(Date.now() / 1000);
    const proofHash = ethers.keccak256(
      ethers.solidityPacked(
        ['address', 'uint256', 'uint256'],
        [userAddress, incomeBucket, timestamp]
      )
    );
    
    const txHash = await mockApplyIncomeScore(userAddress, incomeBucket);
    
    return {
      txHash,
      proofHash,
      receipt: null
    };
  }
};

/**
 * Check if a proof has been processed
 * @param proofHash The hash of the proof to check
 */
export const isProofProcessed = async (proofHash: string): Promise<boolean> => {
  try {
    const contract = getContract();
    const processed = await contract.isProofProcessed(proofHash);
    return processed;
  } catch (error) {
    console.error('Error checking proof status:', error);
    throw error;
  }
};

/**
 * Get the credit core contract address
 */
export const getCreditCoreAddress = async (): Promise<string> => {
  try {
    const contract = getContract();
    const address = await contract.creditCore();
    return address;
  } catch (error) {
    console.error('Error getting credit core address:', error);
    throw error;
  }
};

/**
 * Get the Vlayer verifier contract address
 */
export const getVlayerVerifierAddress = async (): Promise<string> => {
  try {
    const contract = getContract();
    const address = await contract.vlayerVerifier();
    return address;
  } catch (error) {
    console.error('Error getting Vlayer verifier address:', error);
    throw error;
  }
};

/**
 * Get the contract owner
 */
export const getOwner = async (): Promise<string> => {
  try {
    const contract = getContract();
    const owner = await contract.owner();
    return owner;
  } catch (error) {
    console.error('Error getting owner:', error);
    throw error;
  }
};

/**
 * Set Vlayer verifier address (owner only)
 * @param verifierAddress The Vlayer verifier contract address
 */
export const setVlayerVerifier = async (verifierAddress: string) => {
  try {
    const contract = await getContractWithSigner();
    const tx = await contract.setVlayerVerifier(verifierAddress);
    await tx.wait();
    return tx.hash;
  } catch (error) {
    console.error('Error setting Vlayer verifier:', error);
    throw error;
  }
};

// ============================================================================
// EVENT LISTENERS
// ============================================================================

/**
 * Listen for IncomeProofSubmitted events
 */
export const listenToIncomeProofSubmitted = (
  callback: (user: string, incomeBucket: number, proofHash: string, timestamp: number) => void
) => {
  const contract = getContract();
  contract.on('IncomeProofSubmitted', (user, incomeBucket, proofHash, timestamp) => {
    callback(user, Number(incomeBucket), proofHash, Number(timestamp));
  });
};

/**
 * Listen for IncomeProofVerified events
 */
export const listenToIncomeProofVerified = (
  callback: (user: string, incomeBucket: number, newCreditLimit: string) => void
) => {
  const contract = getContract();
  contract.on('IncomeProofVerified', (user, incomeBucket, newCreditLimit) => {
    callback(user, Number(incomeBucket), newCreditLimit.toString());
  });
};

/**
 * Remove all event listeners
 */
export const removeAllListeners = () => {
  const contract = getContract();
  contract.removeAllListeners();
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get income bucket label
 */
export const getIncomeBucketLabel = (bucket: IncomeBucket): string => {
  switch (bucket) {
    case INCOME_BUCKETS.NONE:
      return 'No Income Verified';
    case INCOME_BUCKETS.LOW:
      return 'Low Income ($0-$500/month)';
    case INCOME_BUCKETS.MEDIUM:
      return 'Medium Income ($500-$1000/month)';
    case INCOME_BUCKETS.HIGH:
      return 'High Income ($1000+/month)';
    default:
      return 'Unknown';
  }
};

/**
 * Get income bucket color
 */
export const getIncomeBucketColor = (bucket: IncomeBucket): string => {
  switch (bucket) {
    case INCOME_BUCKETS.NONE:
      return 'gray';
    case INCOME_BUCKETS.LOW:
      return 'yellow';
    case INCOME_BUCKETS.MEDIUM:
      return 'blue';
    case INCOME_BUCKETS.HIGH:
      return 'green';
    default:
      return 'gray';
  }
};

/**
 * Encode public inputs for full proof submission
 */
export const encodePublicInputs = (
  userAddress: string,
  incomeBucket: IncomeBucket,
  timestamp: number
): string => {
  return ethers.AbiCoder.defaultAbiCoder().encode(
    ['address', 'uint256', 'uint256'],
    [userAddress, incomeBucket, timestamp]
  );
};

/**
 * Generate mock proof for testing
 */
export const generateMockProof = (): string => {
  // Generate random bytes for mock proof
  return ethers.hexlify(ethers.randomBytes(128));
};
