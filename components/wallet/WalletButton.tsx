'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { connectWallet, isMetaMaskInstalled, onAccountsChanged, onChainChanged, removeWalletListeners } from '@/lib/wallet';
import { Wallet, LogOut, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

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

      // Step 2: Request signature to verify ownership
      const message = `Welcome to PayForMe!\n\nSign this message to create your credit account.\n\nWallet: ${result.address}\nTimestamp: ${new Date().toISOString()}\n\nThis request will not trigger a blockchain transaction or cost any gas fees.`;
      
      try {
        const signature = await window.ethereum.request({
          method: 'personal_sign',
          params: [message, result.address],
        });

        // Step 3: Connection and signature successful
        setWallet({
          address: result.address,
          connected: true,
          network: result.network,
        });

        console.log('Account created with signature:', signature);

        // Navigate to connect page for onboarding
        router.push('/connect');
      } catch (signError: any) {
        console.error('Signature rejected:', signError);
        if (signError.code === 4001) {
          alert('You must sign the message to create your PayForMe account.');
        } else {
          alert('Failed to sign message. Please try again.');
        }
        setIsConnecting(false);
        return;
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert('An error occurred while connecting. Please try again.');
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
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleConnect}
        disabled={isConnecting}
        className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
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
      </motion.button>
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
