/**
 * incoJS Configuration
 * Setup for encrypted computation on Base Sepolia testnet
 */
import { getViemChain, supportedChains } from '@inco/js';
import { Lightning } from '@inco/js/lite';
import { createWalletClient, custom, type WalletClient } from 'viem';

// Configuration
export const INCO_CHAIN_ID = supportedChains.baseSepolia;
export const INCO_NETWORK = 'testnet' as const;

/**
 * Initialize Lightning instance for incoJS
 */
export async function initializeInco() {
  return await Lightning.latest(INCO_NETWORK, INCO_CHAIN_ID);
}

/**
 * Create wallet client for incoJS operations
 */
export async function createIncoWalletClient(): Promise<WalletClient | null> {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null;
  }

  try {
    // Request accounts to ensure wallet is connected
    const accounts = await window.ethereum.request({ 
      method: 'eth_accounts' 
    }) as string[];
    
    if (accounts.length === 0) {
      // Try to request connection
      await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
    }
  } catch (error) {
    console.warn('Failed to get wallet accounts:', error);
  }

  return createWalletClient({
    chain: getViemChain(INCO_CHAIN_ID),
    transport: custom(window.ethereum),
  });
}

/**
 * Get the inco chain configuration
 */
export function getIncoChain() {
  return getViemChain(INCO_CHAIN_ID);
}
