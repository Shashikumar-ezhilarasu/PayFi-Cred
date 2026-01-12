/**
 * Agent Wallet Factory - Helper functions for managing agent smart wallets
 */

import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from './web3-config';

/**
 * Create a new agent wallet via the factory
 */
export async function createAgentWallet(
  signer: ethers.Signer,
  initialSpendingCap: number // in USDC (e.g., 1000 = $1000)
): Promise<string> {
  const factory = new ethers.Contract(
    CONTRACT_ADDRESSES.AgentWalletFactory,
    CONTRACT_ABIS.AgentWalletFactory,
    signer
  );

  const capInWei = ethers.parseUnits(initialSpendingCap.toString(), 6); // USDC has 6 decimals
  
  console.log('🏭 Creating agent wallet with spending cap:', initialSpendingCap);
  const tx = await factory.createWallet(capInWei);
  
  console.log('⏳ Waiting for wallet creation...');
  const receipt = await tx.wait();
  
  // Find the WalletCreated event
  const event = receipt.logs.find((log: any) => {
    try {
      const parsed = factory.interface.parseLog(log);
      return parsed?.name === 'WalletCreated';
    } catch {
      return false;
    }
  });

  if (event) {
    const parsed = factory.interface.parseLog(event);
    const walletAddress = parsed?.args[1];
    console.log('✅ Agent wallet created:', walletAddress);
    return walletAddress;
  }

  throw new Error('Failed to get wallet address from event');
}

/**
 * Get all agent wallets for a user
 */
export async function getUserAgentWallets(
  userAddress: string,
  provider: ethers.Provider
): Promise<string[]> {
  try {
    // Check current network (log only, don't block)
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    
    console.log('🌐 Current Network:', {
      chainId,
      name: network.name,
      expected: 8119,
      isShardeum: chainId === 8119
    });
    
    if (chainId !== 8119) {
      console.warn('⚠️ Warning: Not on Shardeum network');
      console.warn(`Current Chain ID: ${chainId}, Expected: 8119`);
      console.warn('Please switch to Shardeum EVM Testnet in MetaMask');
      // Don't throw - let the contract call happen anyway
    }
    
    const factory = new ethers.Contract(
      CONTRACT_ADDRESSES.AgentWalletFactory,
      CONTRACT_ABIS.AgentWalletFactory,
      provider
    );

    console.log('📞 Calling getWallets for:', userAddress);
    const wallets = await factory.getWallets(userAddress);
    console.log('✅ Got wallets:', wallets);
    
    return wallets;
  } catch (error: any) {
    console.error('❌ Error fetching agent wallets:', error);
    
    // If it's a decode error, likely wrong network or no wallets yet
    if (error.code === 'BAD_DATA') {
      console.warn('⚠️ Could not decode wallet data. This might mean:');
      console.warn('1. You have no agent wallets yet (normal for new users)');
      console.warn('2. You are connected to the wrong network');
      console.warn('3. Please ensure you are on Shardeum EVM Testnet (Chain ID: 8119)');
    }
    
    // Return empty array to allow UI to show "no wallets" state
    return [];
  }
}

/**
 * Get agent wallet stats
 */
export async function getAgentWalletStats(
  walletAddress: string,
  provider: ethers.Provider
) {
  const wallet = new ethers.Contract(
    walletAddress,
    CONTRACT_ABIS.AgentWallet,
    provider
  );

  const stats = await wallet.getStats();
  
  return {
    balance: Number(stats.balance) / 1e18, // ETH balance
    creditAllocated: Number(stats._creditAllocated) / 1e6, // USDC
    creditUsed: Number(stats._creditUsed) / 1e6, // USDC
    spendingCap: Number(stats._spendingCap) / 1e6, // USDC
    reputation: Number(stats._reputation),
    nonce: Number(stats._nonce),
  };
}

/**
 * Deposit funds to agent wallet
 */
export async function depositToAgentWallet(
  walletAddress: string,
  amount: number, // in ETH
  signer: ethers.Signer
): Promise<string> {
 const amountInWei = ethers.parseEther(amount.toString());
  
  const tx = await signer.sendTransaction({
    to: walletAddress,
    value: amountInWei,
  });

  await tx.wait();
  return tx.hash;
}

/**
 * Repay credit on behalf of borrower using agent wallet
 */
export async function repayCreditFor(
  borrowerAddress: string,
  amount: number, // in USDC
  signer: ethers.Signer
): Promise<string> {
  const flexCreditCore = new ethers.Contract(
    CONTRACT_ADDRESSES.FlexCreditCore,
    CONTRACT_ABIS.FlexCreditCore,
    signer
  );

  const amountInWei = ethers.parseUnits(amount.toString(), 6); // USDC has 6 decimals
  
  // Note: repayCreditFor expects ETH to be sent
  const tx = await flexCreditCore.repayCreditFor(borrowerAddress, amountInWei, {
    value: amountInWei,
  });

  await tx.wait();
  return tx.hash;
}
