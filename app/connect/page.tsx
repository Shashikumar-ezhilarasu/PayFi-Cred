'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { motion } from 'framer-motion';
import { Shield, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';

export default function ConnectPage() {
  const router = useRouter();
  const { wallet, creditIdentity, setCreditIdentity } = useAppStore();
  const [hasCreditNFT, setHasCreditNFT] = useState(false);

  useEffect(() => {
    if (!wallet.connected) {
      router.push('/');
    }
  }, [wallet.connected, router]);

  const handleMintCreditIdentity = async () => {
    // Mock minting process
    setHasCreditNFT(true);
    
    // Set credit identity from mock data
    const { mockCreditIdentity } = await import('@/lib/mockData');
    setCreditIdentity({ ...mockCreditIdentity, walletAddress: wallet.address! });
    
    // Navigate to credit identity page
    setTimeout(() => {
      router.push('/credit-identity');
    }, 2000);
  };

  if (!wallet.connected) {
    return null;
  }

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-[var(--card)] rounded-2xl p-8 shadow-xl border border-gray-200 dark:border-[var(--color-accent)]/20"
        >
          {/* Icon */}
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Shield className="w-12 h-12 text-white" />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center mb-4">
            Welcome to PayForMe!
          </h1>
          <p className="text-center text-gray-600 dark:text-[var(--color-text-dim)] mb-8">
            Your wallet is connected. Let's create your Credit Identity NFT.
          </p>

          {/* Wallet Info */}
          <div className="bg-gray-50 dark:bg-[var(--bg)] rounded-xl p-4 mb-8">
            <p className="text-sm text-gray-600 dark:text-[var(--color-text-dim)] mb-1">Connected Wallet</p>
            <p className="font-mono text-sm break-all">{wallet.address}</p>
            {wallet.network && (
              <p className="text-xs text-[var(--color-text-dim)] dark:text-[var(--color-text-dim)] mt-2">
                Network: {wallet.network}
              </p>
            )}
          </div>

          {/* What is Credit Identity */}
          <div className="space-y-4 mb-8">
            <h2 className="font-bold text-lg">What is Credit Identity NFT?</h2>
            <div className="space-y-3">
              {[
                'Your unique on-chain credit profile',
                'Non-transferable and tied to your wallet',
                'Tracks your credit score and history',
                'Required to use PayLater services',
              ].map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action */}
          {!hasCreditNFT ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleMintCreditIdentity}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-semibold flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl transition-all"
            >
              <Sparkles className="w-5 h-5" />
              <span>Mint Credit Identity NFT</span>
            </motion.button>
          ) : (
            <div className="text-center space-y-4">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', bounce: 0.5 }}
              >
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
              </motion.div>
              <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                Credit Identity Minted Successfully!
              </p>
              <p className="text-sm text-gray-600 dark:text-[var(--color-text-dim)]">
                Redirecting to your Credit Identity...
              </p>
            </div>
          )}

          {/* Skip option */}
          {!hasCreditNFT && (
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full mt-4 text-gray-600 dark:text-[var(--color-text-dim)] hover:text-blue-600 dark:hover:text-blue-400 text-sm flex items-center justify-center space-x-1"
            >
              <span>Skip for now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
