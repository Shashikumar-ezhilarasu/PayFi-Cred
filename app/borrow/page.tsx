'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  ArrowLeft, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  CreditCard,
  Wallet
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { getCreditInfo, useCredit } from '@/lib/payfi-contracts';

export default function BorrowPage() {
  const router = useRouter();
  const { wallet, creditData, refreshCreditData } = useAppStore();
  
  const [loading, setLoading] = useState(false);
  const [borrowing, setBorrowing] = useState(false);
  const [borrowAmount, setBorrowAmount] = useState('');
  const [creditInfo, setCreditInfo] = useState<any>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!wallet.connected) {
      router.push('/');
      return;
    }
    loadCreditInfo();
  }, [wallet.connected]);

  const loadCreditInfo = async () => {
    if (!wallet.address) return;
    
    try {
      setLoading(true);
      setError('');
      
      const info = await getCreditInfo(wallet.address);
      
      // Convert from wei (6 decimals for USDC)
      const formattedInfo = {
        income: info.income,
        limit: Number(info.limit) / 1e18, // SHM uses 18 decimals
        used: Number(info.used) / 1e18,
        available: Number(info.available) / 1e18,
      };
      
      setCreditInfo(formattedInfo);
      
      // Also refresh global state
      await refreshCreditData();
    } catch (err: any) {
      console.error('Error loading credit info:', err);
      setError('Failed to load credit information. Make sure you have verified your income first.');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async () => {
    if (!wallet.address || !borrowAmount) return;
    
    const amount = parseFloat(borrowAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!creditInfo || amount > creditInfo.available) {
      setError(`Amount exceeds available credit ($${creditInfo?.available.toFixed(2) || 0})`);
      return;
    }

    try {
      setBorrowing(true);
      setError('');
      setSuccess('');
      
      console.log('🔄 Borrowing credit...');
      console.log('   Amount:', amount, 'USDC');
      console.log('   Amount in wei:', ethers.parseUnits(amount.toString(), 6).toString());
      
      // Convert to wei (6 decimals for USDC)
      const amountInWei = ethers.parseUnits(amount.toString(), 6);
      
      // Call useCredit on FlexCreditCore
      const txHash = await useCredit(amountInWei.toString());
      
      console.log('✅ Transaction confirmed:', txHash);
      
      setSuccess(`Successfully borrowed $${amount} USDC! Transaction: ${txHash.substring(0, 10)}...`);
      setBorrowAmount('');
      
      // Refresh credit info
      setTimeout(() => {
        loadCreditInfo();
      }, 2000);
      
    } catch (err: any) {
      console.error('❌ Borrow failed:', err);
      
      let errorMessage = 'Failed to borrow credit: ';
      
      if (err.message?.includes('user rejected')) {
        errorMessage += 'Transaction rejected by user';
      } else if (err.message?.includes('insufficient funds')) {
        errorMessage += 'Insufficient gas funds';
      } else if (err.message?.includes('No credit limit')) {
        errorMessage += 'No credit limit set. Please verify your income first.';
      } else if (err.message?.includes('Insufficient credit')) {
        errorMessage += 'Insufficient available credit';
      } else if (err.reason) {
        errorMessage += err.reason;
      } else {
        errorMessage += err.message || 'Unknown error';
      }
      
      setError(errorMessage);
    } finally {
      setBorrowing(false);
    }
  };

  const setMaxAmount = () => {
    if (creditInfo) {
      setBorrowAmount(creditInfo.available.toFixed(2));
    }
  };

  if (!wallet.connected) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="p-2 hover:bg-green-600/10 rounded-lg transition-colors border border-green-500/20"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-4xl font-bold vite-text">Borrow Credit</h1>
            <p className="text-[var(--color-text-dim)] mt-1">
              Use your available credit line
            </p>
          </div>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl flex items-start gap-3"
          >
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-400 text-sm">{error}</p>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-900/20 border border-green-500/50 rounded-xl flex items-start gap-3"
          >
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
            <p className="text-green-400 text-sm">{success}</p>
          </motion.div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-green-400" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Credit Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-green-900/20 to-cyan-900/20 rounded-xl p-6 border border-green-500/30"
            >
              <h2 className="text-xl font-semibold text-green-400 mb-4 flex items-center gap-2">
                <CreditCard size={24} />
                Your Credit Line
              </h2>
              
              {creditInfo ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-black/30 p-4 rounded-lg">
                    <p className="text-sm text-[var(--color-text-dim)] mb-1">Total Limit</p>
                    <p className="text-2xl font-bold text-green-400">
                      ${creditInfo.limit.toFixed(2)}
                    </p>
                    <p className="text-xs text-[var(--color-text-dim)]">USDC</p>
                  </div>
                  
                  <div className="bg-black/30 p-4 rounded-lg">
                    <p className="text-sm text-[var(--color-text-dim)] mb-1">Used</p>
                    <p className="text-2xl font-bold text-yellow-400">
                      ${creditInfo.used.toFixed(2)}
                    </p>
                    <p className="text-xs text-[var(--color-text-dim)]">USDC</p>
                  </div>
                  
                  <div className="bg-black/30 p-4 rounded-lg">
                    <p className="text-sm text-[var(--color-text-dim)] mb-1">Available</p>
                    <p className="text-2xl font-bold text-cyan-400">
                      ${creditInfo.available.toFixed(2)}
                    </p>
                    <p className="text-xs text-[var(--color-text-dim)]">USDC</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-400" />
                  <p className="text-[var(--color-text-dim)]">
                    No credit limit found. Please verify your income first.
                  </p>
                  <button
                    onClick={() => router.push('/onboarding')}
                    className="mt-4 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-semibold transition-colors"
                  >
                    Verify Income
                  </button>
                </div>
              )}
            </motion.div>

            {/* Borrow Form */}
            {creditInfo && creditInfo.available > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-[var(--color-accent)]/20/50"
              >
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                  <Wallet size={24} className="text-green-400" />
                  Borrow Amount
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-[var(--color-text-dim)] mb-2">
                      Amount (USDC)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={borrowAmount}
                        onChange={(e) => setBorrowAmount(e.target.value)}
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        max={creditInfo.available}
                        className="w-full px-4 py-3 bg-black/30 border border-gray-600 rounded-lg focus:border-green-500 focus:outline-none transition-colors text-lg"
                      />
                      <button
                        onClick={setMaxAmount}
                        className="absolute right-3 top-1/2 -translate-y-1/2 px-3 py-1 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded text-sm font-semibold transition-colors"
                      >
                        MAX
                      </button>
                    </div>
                    <p className="text-xs text-[var(--color-text-dim)] mt-2">
                      Available: ${creditInfo.available.toFixed(2)} USDC
                    </p>
                  </div>

                  {borrowAmount && parseFloat(borrowAmount) > 0 && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4"
                    >
                      <p className="text-sm text-blue-400 mb-2">Transaction Summary</p>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[var(--color-text-dim)]">Borrow Amount:</span>
                          <span className="text-white font-semibold">
                            ${parseFloat(borrowAmount).toFixed(2)} USDC
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--color-text-dim)]">New Used Credit:</span>
                          <span className="text-yellow-400 font-semibold">
                            ${(creditInfo.used + parseFloat(borrowAmount)).toFixed(2)} USDC
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[var(--color-text-dim)]">Remaining Available:</span>
                          <span className="text-cyan-400 font-semibold">
                            ${(creditInfo.available - parseFloat(borrowAmount)).toFixed(2)} USDC
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <button
                    onClick={handleBorrow}
                    disabled={borrowing || !borrowAmount || parseFloat(borrowAmount) <= 0}
                    className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    {borrowing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing Transaction...
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-5 h-5" />
                        Borrow ${borrowAmount || '0.00'} USDC
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Info Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-cyan-900/10 border border-cyan-500/30 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold text-cyan-400 mb-3 flex items-center gap-2">
                <TrendingUp size={20} />
                How It Works
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>
                    <strong>Borrow:</strong> Use your available credit to get USDC instantly
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>
                    <strong>Repay:</strong> Pay back on time to double your credit limit
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>
                    <strong>Grow:</strong> Each on-time repayment increases your limit by 2x
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-cyan-400 mt-1">•</span>
                  <span>
                    <strong>Track:</strong> Monitor your credit usage in the dashboard
                  </span>
                </li>
              </ul>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
