'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, RefreshCw, CheckCircle, X } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import {
  getCurrentNetwork,
  switchNetwork,
  NETWORKS,
  isSupportedNetwork,
  getNetworkName
} from '@/lib/networks';

export default function NetworkChecker() {
  const { wallet } = useAppStore();
  const [currentChainId, setCurrentChainId] = useState<number | null>(null);
  const [isSupported, setIsSupported] = useState(true);
  const [switching, setSwitching] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Only check network if wallet is connected
    if (wallet.connected && typeof window !== 'undefined' && window.ethereum) {
      checkNetwork();

      // Listen for network changes
      const ethereum = window.ethereum;
      if (ethereum) {
        ethereum.on?.('chainChanged', (...args: unknown[]) => {
          const chainId = args[0] as string;
          const chainIdNumber = parseInt(chainId, 16);
          setCurrentChainId(chainIdNumber);
          setIsSupported(isSupportedNetwork(chainIdNumber));
          setShowBanner(!isSupportedNetwork(chainIdNumber));
        });
      }
    } else {
      // Hide banner if wallet is not connected
      setShowBanner(false);
    }

    return () => {
      // Cleanup will happen automatically on page reload (MetaMask behavior)
    };
  }, [wallet.connected]);

  const checkNetwork = async () => {
    // Only check if wallet is connected
    if (!wallet.connected) {
      setShowBanner(false);
      return;
    }

    try {
      const network = await getCurrentNetwork();
      if (network) {
        setCurrentChainId(network.chainId);
        setIsSupported(true);
        setShowBanner(false);
      }
    } catch (error) {
      // Network not supported or MetaMask not connected
      if (typeof window !== 'undefined' && window.ethereum) {
        try {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' });
          const chainIdNumber = parseInt(chainId as string, 16);
          setCurrentChainId(chainIdNumber);
          setIsSupported(isSupportedNetwork(chainIdNumber));
          setShowBanner(!isSupportedNetwork(chainIdNumber));
        } catch (chainError) {
          // MetaMask not connected or not available
          console.log('MetaMask not connected, skipping network check');
          setShowBanner(false);
        }
      } else {
        // No MetaMask installed
        setShowBanner(false);
      }
    }
  };

  const handleSwitchNetwork = async (chainId: number) => {
    try {
      setSwitching(true);
      await switchNetwork(chainId);
      setShowBanner(false);
    } catch (error: any) {
      console.error('Error switching network:', error);
      alert(`Failed to switch network: ${error.message || 'Unknown error'}`);
    } finally {
      setSwitching(false);
    }
  };

  if (!showBanner) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -100 }}
        className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              <div>
                <p className="font-semibold">Unsupported Network</p>
                <p className="text-sm opacity-90">
                  You're on {currentChainId ? getNetworkName(currentChainId) : 'an unknown network'}. 
                  Please switch to a supported network.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Quick switch buttons */}
              <button
                onClick={() => handleSwitchNetwork(NETWORKS.SHARDEUM_TESTNET.chainId)}
                disabled={switching}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
              >
                {switching ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Shardeum Testnet
              </button>

              <button
                onClick={() => handleSwitchNetwork(NETWORKS.ETHEREUM_SEPOLIA.chainId)}
                disabled={switching}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-semibold transition-all disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
              >
                {switching ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Sepolia
              </button>

              <button
                onClick={() => setShowBanner(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
