'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { motion } from 'framer-motion';
import { CreditCard, Zap, TrendingUp, DollarSign, Activity, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { ethers } from 'ethers';
import { useCredit as useCreditContract } from '@/lib/contract';

export default function RequestCreditPage() {
  const { wallet, creditData, assessCredit, refreshCreditData } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [borrowing, setBorrowing] = useState(false);
  const [borrowAmount, setBorrowAmount] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [borrowError, setBorrowError] = useState<string | null>(null);
  const [borrowSuccess, setBorrowSuccess] = useState<string | null>(null);
  const router = useRouter();

  // Fetch credit data from blockchain when wallet is connected
  useEffect(() => {
    if (wallet.address && wallet.connected) {
      refreshCreditData();
    }
  }, [wallet.address, wallet.connected, refreshCreditData]);

  const handleRequestCredit = async () => {
    if (!wallet.address) return;

    setLoading(true);
    setError(null);

    try {
      await assessCredit(wallet.address);
      // Redirect to dashboard after successful credit assessment
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError('Failed to assess credit. Please try again.');
      console.error('Credit assessment error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowCredit = async () => {
    if (!wallet.address || !borrowAmount) return;

    const amount = parseFloat(borrowAmount);
    if (isNaN(amount) || amount <= 0) {
      setBorrowError('Please enter a valid amount');
      return;
    }

    if (creditData && amount > creditData.availableBalance) {
      setBorrowError(`Amount exceeds available balance of ${creditData.availableBalance.toFixed(2)} SHM`);
      return;
    }

    setBorrowing(true);
    setBorrowError(null);
    setBorrowSuccess(null);

    try {
      // Convert amount to wei
      const amountInWei = ethers.parseEther(borrowAmount);
      
      // Call the smart contract
      const txHash = await useCreditContract(amountInWei.toString());
      
      setBorrowSuccess(`Successfully borrowed ${borrowAmount} SHM! Tx: ${txHash.substring(0, 10)}...`);
      setBorrowAmount('');
      
      // Refresh credit data from blockchain after borrowing
      setTimeout(async () => {
        await refreshCreditData();
      }, 3000);
    } catch (err: any) {
      console.error('Borrow credit error:', err);
      setBorrowError(err.message || 'Failed to borrow credit. Please try again.');
    } finally {
      setBorrowing(false);
    }
  };

  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center p-8 max-w-md"
        >
          <AlertCircle className="w-16 h-16 text-[var(--color-accent)] mx-auto mb-4" />
          <h2 className="text-2xl neon-text mb-2">Connect Your Wallet</h2>
          <p className="text-[var(--color-text-alt)]">
            Please connect your wallet to request credit.
          </p>
        </motion.div>
      </div>
    );
  }

  // If they already have credit, show current status
  if (creditData && !loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <PageHeader
            icon={CreditCard}
            title="Your Credit Status"
            subtitle="You already have an active credit line"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <StatsCard
              icon={DollarSign}
              label="Credit Limit"
              value={`${creditData.creditLimit.toFixed(2)} SHM`}
              subtext={`Tier: ${creditData.creditTier || 'Bronze'}`}
            />
            <StatsCard
              icon={TrendingUp}
              label="Available Balance"
              value={`${creditData.availableBalance.toFixed(2)} SHM`}
              subtext={`${((creditData.availableBalance / creditData.creditLimit) * 100).toFixed(0)}% available`}
              iconColor="text-green-400"
            />
            <StatsCard
              icon={Activity}
              label="Credit Score"
              value={creditData.creditScore}
              iconColor="text-blue-400"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="flex items-start gap-4">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-[var(--color-text)] mb-2">
                  Credit Active
                </h3>
                <p className="text-[var(--color-text-alt)] mb-4">
                  Your credit line is active and ready to use. Visit the Payment Requests page to start making payments,
                  or manage your agent settings to configure auto-approval rules.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push('/payment-requests')}
                    className="px-6 py-2 bg-[var(--color-accent)] text-[var(--bg)] rounded-lg hover:opacity-90 transition-opacity neon-glow"
                  >
                    Make Payment
                  </button>
                  <button
                    onClick={() => router.push('/repayment')}
                    className="px-6 py-2 border border-[var(--color-divider)] rounded-lg hover:bg-[var(--elev)] transition-colors"
                  >
                    View Repayments
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Borrow Credit Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card p-6 bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-[var(--color-accent)]/30"
          >
            <h3 className="text-lg font-semibold neon-text mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Borrow Credit (Receive SHM)
            </h3>
            <p className="text-sm text-[var(--color-text-alt)] mb-4">
              Borrow SHM from your credit line and receive it directly to your wallet from the FlexCredit smart contract.
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--color-text-alt)] mb-2">
                  Amount (SHM)
                  <span className="text-xs text-[var(--color-muted)] ml-2">
                    Available: {creditData.availableBalance.toFixed(2)} SHM
                  </span>
                </label>
                <input
                  type="number"
                  value={borrowAmount}
                  onChange={(e) => setBorrowAmount(e.target.value)}
                  placeholder="0.0"
                  step="0.0001"
                  max={creditData.availableBalance}
                  disabled={borrowing}
                  className="w-full px-4 py-3 bg-[var(--card)]/50 border border-[var(--color-accent)]/20 rounded-xl focus:outline-none focus:border-[var(--color-accent)] transition-colors text-[var(--color-text)]"
                />
              </div>

              {borrowError && (
                <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{borrowError}</p>
                </div>
              )}

              {borrowSuccess && (
                <div className="flex items-start gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-400">{borrowSuccess}</p>
                </div>
              )}

              <button
                onClick={handleBorrowCredit}
                disabled={borrowing || !borrowAmount || parseFloat(borrowAmount) <= 0}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 neon-glow"
              >
                {borrowing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing Transaction...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5" />
                    Borrow {borrowAmount || '0'} SHM
                  </>
                )}
              </button>

              <p className="text-xs text-[var(--color-muted)] text-center">
                Transaction will be executed on Shardeum Testnet. SHM will be sent to your wallet.
              </p>
            </div>
          </motion.div>

          {/* How to Increase Credit */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <h3 className="text-lg font-semibold neon-text mb-4">
              💡 How to Increase Your Credit Limit
            </h3>
            <div className="space-y-3 text-sm text-[var(--color-text-alt)]">
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] mt-2 flex-shrink-0" />
                <p>Make consistent on-time repayments to build your credit score</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] mt-2 flex-shrink-0" />
                <p>Increase your onchain income activity on Shardeum testnet</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] mt-2 flex-shrink-0" />
                <p>Maintain a low credit utilization ratio (below 30%)</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader
          icon={CreditCard}
          title="Request Credit"
          subtitle="Get income-backed credit based on your Sepolia transaction history"
        />

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h3 className="text-xl font-bold neon-text mb-6">How Pay-Fi Credit Works</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 neon-bg rounded-full flex items-center justify-center">
                <Activity className="w-8 h-8 text-[var(--bg)]" />
              </div>
              <h4 className="font-semibold text-[var(--color-text)] mb-2">1. Analyze Income</h4>
              <p className="text-sm text-[var(--color-text-alt)]">
                We analyze your Sepolia testnet transaction history to verify your onchain income
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 neon-bg rounded-full flex items-center justify-center">
                <TrendingUp className="w-8 h-8 text-[var(--bg)]" />
              </div>
              <h4 className="font-semibold text-[var(--color-text)] mb-2">2. Calculate Credit</h4>
              <p className="text-sm text-[var(--color-text-alt)]">
                Your credit limit is calculated based on your income consistency and transaction patterns
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 neon-bg rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-[var(--bg)]" />
              </div>
              <h4 className="font-semibold text-[var(--color-text)] mb-2">3. Instant Access</h4>
              <p className="text-sm text-[var(--color-text-alt)]">
                Get instant access to your credit line with AI agent auto-approval for eligible transactions
              </p>
            </div>
          </div>
        </motion.div>

        {/* Request Credit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-8 text-center"
        >
          {loading ? (
            <>
              <LoadingSpinner />
              <p className="text-[var(--color-text-alt)] mt-4">
                Analyzing your Sepolia transaction history...
              </p>
            </>
          ) : (
            <>
              <Zap className="w-20 h-20 mx-auto mb-6 text-[var(--color-accent)]" />
              <h3 className="text-2xl font-bold neon-text mb-4">Ready to Get Started?</h3>
              <p className="text-[var(--color-text-alt)] mb-8 max-w-2xl mx-auto">
                Click the button below to analyze your Sepolia testnet activity and receive your credit limit.
                This process is instant and requires no manual application.
              </p>
              
              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
                  <p className="text-red-400">{error}</p>
                </div>
              )}

              <button
                onClick={handleRequestCredit}
                disabled={loading}
                className="px-8 py-4 bg-[var(--color-accent)] text-[var(--bg)] rounded-xl font-semibold text-lg hover:opacity-90 transition-all neon-glow disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Zap className="w-6 h-6 inline-block mr-2" />
                Request Credit Now
              </button>

              <p className="text-xs text-[var(--color-muted)] mt-4">
                No credit check • Instant approval • Income-backed
              </p>
            </>
          )}
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <h3 className="text-lg font-semibold neon-text mb-4">Credit Features</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-[var(--color-text)]">AI Agent Management</h4>
                <p className="text-sm text-[var(--color-text-alt)]">Auto-approve payments based on your policies</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-[var(--color-text)]">Flexible Repayment</h4>
                <p className="text-sm text-[var(--color-text-alt)]">Pay back on your schedule, no hidden fees</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-[var(--color-text)]">Credit Building</h4>
                <p className="text-sm text-[var(--color-text-alt)]">Increase your limit with good behavior</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-medium text-[var(--color-text)]">Transparent Scoring</h4>
                <p className="text-sm text-[var(--color-text-alt)]">See exactly how your credit is calculated</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
