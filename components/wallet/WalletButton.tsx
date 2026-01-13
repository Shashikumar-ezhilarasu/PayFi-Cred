'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { connectWallet, isMetaMaskInstalled, onAccountsChanged, onChainChanged, removeWalletListeners } from '@/lib/wallet';
import { Wallet, LogOut, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { NoiseBackground } from '@/components/ui/noise-background';
import { ethers } from 'ethers';

export function WalletButton() {
  const router = useRouter();
  const { wallet, setWallet, disconnectWallet } = useAppStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    // Set up wallet listeners
    if (wallet.connected) {
      onAccountsChanged((accounts) => {
        if (accounts.length === 0) {
          disconnectWallet();
          router.push('/');
        } else {
          setWallet({ address: accounts[0] });
        }
      });

      onChainChanged(() => {
        window.location.reload();
      });
    }

    return () => {
      removeWalletListeners();
    };
  }, [wallet.connected]);

  const handleConnect = async () => {
    if (!isMetaMaskInstalled()) {
      alert('MetaMask is not installed. Please install MetaMask to continue.');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    setIsConnecting(true);

    try {
      // Step 1: Request MetaMask connection - this will open MetaMask popup
      const result = await connectWallet();

      if (!result) {
        alert('Failed to connect wallet. Please try again.');
        setIsConnecting(false);
        return;
      }

      // Step 2: Check if we're on the correct network (Shardeum)
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const network = await provider.getNetwork();

      if (network.chainId !== BigInt(8119)) {
        // Try to switch to Shardeum network
        if (window.ethereum) {
          try {
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x1f91' }], // 8119 in hex
            });
          } catch (switchError: any) {
            // If network not added, add it
            if (switchError.code === 4902) {
              try {
                await window.ethereum.request({
                  method: 'wallet_addEthereumChain',
                  params: [{
                    chainId: '0x1f91',
                    chainName: 'Shardeum EVM Testnet',
                    rpcUrls: ['https://api-mezame.shardeum.org'],
                    blockExplorerUrls: ['https://explorer-mezame.shardeum.org'],
                    nativeCurrency: {
                      name: 'SHM',
                      symbol: 'SHM',
                      decimals: 18,
                    },
                  }],
                });
              } catch (addError) {
                console.warn('Failed to add Shardeum network:', addError);
                // Continue anyway - user can switch manually later
              }
            }
          }
        }
      }

      // Step 3: Request signature to verify ownership
      const message = `Welcome to PayFi-Cred!\n\nSign this message to create your credit account.\n\nWallet: ${result.address}\nTimestamp: ${new Date().toISOString()}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;

      if (!window.ethereum) {
        throw new Error('MetaMask not available');
      }

      const signature = await window.ethereum.request({
        method: 'personal_sign',
        params: [message, result.address],
      });

      // Step 4: Connection and signature successful
      setWallet({
        address: result.address,
        connected: true,
        network: result.network,
      });

      console.log('Account created with signature:', signature);

      // Navigate to connect page for onboarding
      router.push('/connect');
    } catch (error: any) {
      console.error('Connection error:', error);
      
      // Handle specific error types
      if (error.code === 4001) {
        alert('You must sign the message to create your PayFi-Cred account.');
      } else {
        alert('An error occurred while connecting. Please try again.');
      }
      
      setIsConnecting(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setShowDropdown(false);
    router.push('/');
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!wallet.connected) {
    return (
      <NoiseBackground
        containerClassName="rounded-lg"
        gradientColors={["rgb(79, 70, 229)", "rgb(168, 85, 247)"]}
      >
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className="flex items-center space-x-2 px-4 py-2 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Connecting...</span>
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4" />
              <span>Connect Wallet</span>
            </>
          )}
        </button>
      </NoiseBackground>
    );
  }

  return (
    <div className="relative">
      <motion.button
        whileHover={{ scale: 1.05 }}
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center space-x-2 px-4 py-2 bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 rounded-lg font-medium hover:bg-green-500/20 transition-colors"
      >
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
        <span className="font-mono">{formatAddress(wallet.address!)}</span>
      </motion.button>

      {showDropdown && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 mt-2 w-64 bg-white dark:bg-[var(--card)] rounded-lg shadow-xl border border-gray-200 dark:border-[var(--color-accent)]/20 overflow-hidden z-50"
        >
          <div className="p-4 border-b border-gray-200 dark:border-[var(--color-accent)]/20">
            <p className="text-sm text-[var(--color-text-dim)] dark:text-[var(--color-text-dim)] mb-1">Connected Wallet</p>
            <p className="font-mono text-sm break-all">{wallet.address}</p>
            {wallet.network && (
              <p className="text-xs text-[var(--color-text-dim)] dark:text-[var(--color-text-dim)] mt-1">
                Network: {wallet.network}
              </p>
            )}
            <a
              href="https://explorer-mezame.shardeum.org/txs"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 mt-2 transition-colors"
            >
              <span>View Your Wallet on Shardeum Explorer</span>
              <span className="text-xs">↗</span>
            </a>
          </div>

          <button
            onClick={handleDisconnect}
            className="w-full flex items-center space-x-2 px-4 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Disconnect</span>
          </button>
        </motion.div>
      )}

      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
