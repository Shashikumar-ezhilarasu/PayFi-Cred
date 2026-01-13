// Wallet utility functions for ethers.js integration
// These are placeholders that can be replaced with actual smart contract calls

import { ethers } from 'ethers';

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean(window.ethereum?.isMetaMask);
};

// Connect wallet
export const connectWallet = async (): Promise<{ address: string; network: string } | null> => {
  try {
    if (!isMetaMaskInstalled()) {
      throw new Error('MetaMask is not installed');
    }

    // Request account access
    const accounts = await (window.ethereum as any).request({
      method: 'eth_requestAccounts',
    }) as string[];

    if (!accounts || accounts.length === 0) {
      throw new Error('No accounts found');
    }

    // Get network info
    const provider = new ethers.BrowserProvider(window.ethereum as any);
    const network = await provider.getNetwork();

    return {
      address: accounts[0],
      network: network.name,
    };
  } catch (error) {
    console.error('Error connecting wallet:', error);
    return null;
  }
};

// Disconnect wallet (client-side only)
export const disconnectWallet = () => {
  // MetaMask doesn't have a programmatic disconnect
  // This is handled client-side by clearing state
  console.log('Wallet disconnected (client-side)');
};

// Get wallet balance
export const getWalletBalance = async (address: string): Promise<string> => {
  try {
    if (!window.ethereum) return '0';

    const provider = new ethers.BrowserProvider(window.ethereum as any);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  } catch (error) {
    console.error('Error getting balance:', error);
    return '0';
  }
};

// Get wallet balance using Etherscan API (more reliable for Sepolia)
export const getSepoliaBalance = async (address: string): Promise<string> => {
  try {
    const response = await fetch(
      `https://api-sepolia.etherscan.io/api?module=account&action=balance&address=${address}&tag=latest`
    );
    const data = await response.json();
    
    if (data.status === '1' && data.result) {
      return ethers.formatEther(data.result);
    }
    return '0';
  } catch (error) {
    console.error('Error getting Sepolia balance:', error);
    return '0';
  }
};

// Get multiple addresses balances at once (up to 20)
export const getMultipleBalances = async (addresses: string[]): Promise<Record<string, string>> => {
  try {
    if (addresses.length === 0 || addresses.length > 20) {
      throw new Error('Address count must be between 1 and 20');
    }

    const addressList = addresses.join(',');
    const response = await fetch(
      `https://api-sepolia.etherscan.io/api?module=account&action=balancemulti&address=${addressList}&tag=latest`
    );
    const data = await response.json();
    
    if (data.status === '1' && Array.isArray(data.result)) {
      const balances: Record<string, string> = {};
      data.result.forEach((item: any) => {
        balances[item.account.toLowerCase()] = ethers.formatEther(item.balance);
      });
      return balances;
    }
    return {};
  } catch (error) {
    console.error('Error getting multiple balances:', error);
    return {};
  }
};

// Check network
export const checkNetwork = async (expectedChainId: number): Promise<boolean> => {
  try {
    if (!window.ethereum) return false;

    const provider = new ethers.BrowserProvider(window.ethereum as any);
    const network = await provider.getNetwork();
    return Number(network.chainId) === expectedChainId;
  } catch (error) {
    console.error('Error checking network:', error);
    return false;
  }
};

// Switch network
export const switchNetwork = async (chainId: number): Promise<boolean> => {
  try {
    if (!window.ethereum) return false;

    await (window.ethereum as any).request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });

    return true;
  } catch (error) {
    console.error('Error switching network:', error);
    return false;
  }
};

// Listen for account changes
export const onAccountsChanged = (callback: (accounts: string[]) => void) => {
  if (!window.ethereum) return;

  (window.ethereum as any).on?.('accountsChanged', callback);
};

// Listen for network changes
export const onChainChanged = (callback: (chainId: string) => void) => {
  if (!window.ethereum) return;

  (window.ethereum as any).on?.('chainChanged', callback);
};

// Remove listeners
export const removeWalletListeners = () => {
  if (!window.ethereum) return;

  (window.ethereum as any).removeListener?.('accountsChanged', () => {});
  (window.ethereum as any).removeListener?.('chainChanged', () => {});
};

// PLACEHOLDER: Mint Credit Identity NFT
export const mintCreditIdentity = async (address: string): Promise<string> => {
  // This would call your smart contract's mint function
  console.log('Minting Credit Identity for:', address);
  
  // Simulate transaction
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  // Return mock transaction hash
  return '0x' + Math.random().toString(16).substring(2, 66);
};

// PLACEHOLDER: Check if user has Credit Identity NFT
export const hasCreditIdentity = async (address: string): Promise<boolean> => {
  // This would query your smart contract
  console.log('Checking Credit Identity for:', address);
  
  // Mock: return true for demo
  return true;
};

// PLACEHOLDER: Get credit data from contract
export const getCreditData = async (address: string) => {
  // This would query your smart contract
  console.log('Fetching credit data for:', address);
  
  // Return from mock data (this would be replaced with contract call)
  return null;
};

// PLACEHOLDER: Execute PayLater transaction
export const executePayLater = async (
  amount: number,
  merchantAddress: string
): Promise<string> => {
  // This would call your smart contract's PayLater function
  console.log('Executing PayLater:', { amount, merchantAddress });
  
  // Simulate transaction
  await new Promise((resolve) => setTimeout(resolve, 3000));
  
  // Return mock transaction hash
  return '0x' + Math.random().toString(16).substring(2, 66);
};

// PLACEHOLDER: Repay transaction
export const repayTransaction = async (
  transactionId: string,
  amount: number
): Promise<string> => {
  // This would call your smart contract's repay function
  console.log('Repaying transaction:', { transactionId, amount });
  
  // Simulate transaction
  await new Promise((resolve) => setTimeout(resolve, 2000));
  
  // Return mock transaction hash
  return '0x' + Math.random().toString(16).substring(2, 66);
};
