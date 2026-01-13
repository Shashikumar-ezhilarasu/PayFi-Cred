'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import { motion } from 'framer-motion';
import { CreditNFT } from '@/components/credit/CreditNFT';
import { ArrowLeft, Loader2, AlertCircle, TrendingUp, Shield, DollarSign, BarChart3, Info, CheckCircle, RefreshCw } from 'lucide-react';
import { getCreditInfo, getIncomeScore } from '@/lib/payfi-contracts';
import { ethers } from 'ethers';
import { 
  determineCreditTier, 
  getMaxCreditLimitForTier, 
  estimateNextCreditLimit,
  getCreditGrowthTimeline 
} from '@/lib/creditEngine';

interface CreditDetails {
  income: string;
  incomeScore: string;
  limit: string;
  used: string;
  available: string;
  tier: string;
  utilizationRate: number;
  maxTierLimit: number;
  estimatedNextLimit: number;
}

export default function CreditIdentityPage() {
  const router = useRouter();
  const { wallet, setVerificationStatus } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>('');
  const [creditDetails, setCreditDetails] = useState<CreditDetails | null>(null);

  useEffect(() => {
    if (!wallet.connected) {
      router.push('/');
      return;
    }
    
    loadCreditData();
  }, [wallet.connected, router]);

  const loadCreditData = async () => {
    setLoading(true);
    setError('');
    
    try {
      if (!wallet.address) {
        throw new Error('Wallet not connected');
      }

      // Fetch real data from blockchain
      const [creditInfo, incomeScore] = await Promise.all([
        getCreditInfo(wallet.address),
        getIncomeScore(wallet.address)
      ]);

      // Scale down values for Shardeum testnet display (divide by 1000)
      // This converts mainnet-scale values to testnet-appropriate amounts
      const TESTNET_SCALE = 1000;
      
      const limitEth = ethers.formatUnits(creditInfo.limit, 18); // SHM uses 18 decimals
      const usedEth = ethers.formatUnits(creditInfo.used, 18);
      const availableEth = ethers.formatUnits(creditInfo.available, 18);
      const incomeEth = ethers.formatUnits(creditInfo.income, 18);

      const limit = parseFloat(limitEth) / TESTNET_SCALE;
      const used = parseFloat(usedEth) / TESTNET_SCALE;
      const available = parseFloat(availableEth) / TESTNET_SCALE;
      const income = parseFloat(incomeEth) / TESTNET_SCALE;
      const utilizationRate = limit > 0 ? (used / limit) * 100 : 0;

      // Calculate credit tier based on score (simplified - using income as proxy)
      const score = parseInt(incomeScore.toString());
      const tier = determineCreditTier(score);
      const maxTierLimit = getMaxCreditLimitForTier(tier);
      
      // Estimate next limit
      const currentCreditData = {
        creditLimit: limit,
        creditTier: tier,
        creditScore: score,
        availableBalance: available,
        usedCredit: used,
        repaymentRate: 100,
        riskLevel: 'LOW' as any
      };
      const estimatedNextLimit = estimateNextCreditLimit(currentCreditData);

      setCreditDetails({
        income: income.toString(),
        incomeScore: incomeScore.toString(),
        limit: limit.toString(),
        used: used.toString(),
        available: available.toString(),
        tier,
        utilizationRate,
        maxTierLimit,
        estimatedNextLimit
      });

      // Mark user as verified once credit data is loaded
      if (limit > 0) {
        setVerificationStatus(true);
      }

    } catch (err: any) {
      console.error('Error loading credit data:', err);
      setError(err.message || 'Failed to load credit data from blockchain');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadCreditData();
    setRefreshing(false);
  };

  // Show loading state
  if (!wallet.connected || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--bg)] via-black to-[var(--bg)] text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[var(--color-accent)]" />
          <p className="text-[var(--color-text-dim)]">Loading credit data from blockchain...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--bg)] via-black to-[var(--bg)] text-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <AlertCircle className="w-16 h-16 mx-auto mb-6 text-red-400" />
          <h2 className="text-3xl font-bold mb-4 text-white">
            Error Loading Credit Data
          </h2>
          <p className="text-[var(--color-text-dim)] mb-8">
            {error}
          </p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={loadCreditData}
              className="px-6 py-3 bg-[var(--color-accent)] hover:opacity-80 text-black rounded-lg font-semibold transition-all"
            >
              Retry
            </button>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-[var(--card)] hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
            >
              Go to Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  // If no credit data, show onboarding message
  if (!creditDetails || parseFloat(creditDetails.limit) === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[var(--bg)] via-black to-[var(--bg)] text-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <AlertCircle className="w-16 h-16 mx-auto mb-6 text-[var(--color-accent2)]" />
          <h2 className="text-3xl font-bold mb-4 text-[var(--color-accent)]">
            No Credit Identity Found
          </h2>
          <p className="text-[var(--color-text-dim)] mb-8">
            You need to verify your income first to establish your credit limit on-chain.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href="/onboarding"
              className="px-6 py-3 bg-[var(--color-accent)] hover:opacity-80 text-black rounded-lg font-semibold transition-all"
            >
              Verify Income
            </Link>
            <Link
              href="/dashboard"
              className="px-6 py-3 bg-[var(--card)] hover:bg-gray-600 text-white rounded-lg font-semibold transition-all"
            >
              Go to Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  const limit = parseFloat(creditDetails.limit);
  const used = parseFloat(creditDetails.used);
  const available = parseFloat(creditDetails.available);
  const income = parseFloat(creditDetails.income);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[var(--bg)] via-black to-[var(--bg)] text-white pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center space-x-2 text-[var(--color-text-dim)] hover:text-[var(--color-accent)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Dashboard</span>
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-[var(--card)] hover:bg-[var(--elev)] text-white rounded-lg transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold mb-4 text-[var(--color-accent)]">
            Your Credit Identity
          </h1>
          <p className="text-xl text-[var(--color-text-dim)]">
            On-chain credit profile powered by smart contracts
          </p>
        </motion.div>

        {/* Credit Overview Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--color-accent)]/20">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-[var(--color-accent)]" />
              <span className="text-[var(--color-text-dim)] text-sm">Agent Credit Limit</span>
            </div>
            <p className="text-3xl font-bold text-white">{limit.toFixed(2)} SHM</p>
            <p className="text-xs text-[var(--color-accent2)] mt-1">{creditDetails.tier} Tier</p>
          </div>

          <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--color-accent)]/20">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-[var(--color-accent)]" />
              <span className="text-[var(--color-text-dim)] text-sm">Available</span>
            </div>
            <p className="text-3xl font-bold text-white">{available.toFixed(2)} SHM</p>
            <p className="text-xs text-[var(--color-accent)] mt-1">Ready for agent</p>
          </div>

          <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--color-accent)]/20">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-5 h-5 text-[var(--color-accent)]" />
              <span className="text-[var(--color-text-dim)] text-sm">Used by Agent</span>
            </div>
            <p className="text-3xl font-bold text-white">{used.toFixed(2)} SHM</p>
            <p className="text-xs text-[var(--color-text-dim)] mt-1">
              {creditDetails.utilizationRate.toFixed(1)}% utilization
            </p>
          </div>

          <div className="bg-[var(--card)] rounded-xl p-6 border border-[var(--color-accent)]/20">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-[var(--color-accent)]" />
              <span className="text-[var(--color-text-dim)] text-sm">Income Score</span>
            </div>
            <p className="text-3xl font-bold text-white">{creditDetails.incomeScore}</p>
            <p className="text-xs text-[var(--color-accent2)] mt-1">Verified on-chain</p>
          </div>
        </motion.div>

        {/* Credit Limit Logic Explanation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[var(--card)] rounded-xl p-6 border border-[var(--color-accent)]/20 mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Info className="w-6 h-6 text-[var(--color-accent)]" />
            <h2 className="text-2xl font-bold text-white">How Agent Credit Allocation Works</h2>
          </div>
          <p className="text-[var(--color-text-dim)] mb-6">
            Your agent is allocated credit based on your verified income and payment history. As your agent successfully manages payments, the credit limit grows, allowing it to handle larger transactions autonomously.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Current Calculation */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--color-accent2)]">Current Calculation</h3>
              
              <div className="bg-[var(--bg)] rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-dim)]">Verified Income (SHM):</span>
                  <span className="font-semibold text-white">{income.toFixed(2)} SHM</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-dim)]">Income Score:</span>
                  <span className="font-semibold text-white">{creditDetails.incomeScore}</span>
                </div>
                
                <div className="border-t border-[var(--color-accent)]/20 pt-3 flex justify-between items-center">
                  <span className="text-[var(--color-text-dim)]">Agent Credit Allocation:</span>
                  <span className="font-semibold text-[var(--color-accent)]">{limit.toFixed(2)} SHM</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-dim)]">Credit Tier:</span>
                  <span className="font-semibold text-[var(--color-accent2)]">{creditDetails.tier}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-[var(--color-text-dim)]">Tier Max Limit:</span>
                  <span className="font-semibold text-white">{creditDetails.maxTierLimit.toFixed(2)} SHM</span>
                </div>
              </div>
            </div>

            {/* Growth Potential */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-[var(--color-accent2)]">Growth Potential</h3>
              
              <div className="bg-[var(--bg)] rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white">On-Time Repayment Reward</p>
                    <p className="text-sm text-[var(--color-text-dim)]">Credit limit doubles after each on-time repayment</p>
                  </div>
                </div>
                
                <div className="border-t border-[var(--color-accent)]/20 pt-3">
                  <p className="text-[var(--color-text-dim)] text-sm mb-2">After agent's next on-time payment:</p>
                  <p className="text-2xl font-bold text-[var(--color-accent)]">
                    {Math.min(creditDetails.estimatedNextLimit, creditDetails.maxTierLimit).toFixed(2)} SHM
                  </p>
                  <p className="text-xs text-[var(--color-text-dim)] mt-1">
                    (2x multiplier, capped at tier limit)
                  </p>
                </div>
                
                <div className="mt-4 p-3 bg-[var(--color-accent)]/10 rounded border border-[var(--color-accent)]/30">
                  <p className="text-sm text-white">
                    💡 <strong>Agent Growth:</strong> Your agent starts small and grows its credit capacity with each successful payment, enabling it to handle larger autonomous transactions!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Credit Behavior Rules */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[var(--card)] rounded-xl p-6 border border-[var(--color-accent)]/20 mb-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-white">Agent Payment Behavior & Credit Growth</h2>
          <p className="text-[var(--color-text-dim)] mb-6">
            Your agent's credit allocation grows based on payment performance. Successful on-time payments double the credit, allowing your agent to handle increasingly larger transactions.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* On-Time Payment */}
            <div className="bg-green-500/10 rounded-lg p-5 border border-green-500/30">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-6 h-6 text-green-400" />
                <h3 className="font-bold text-green-400">Agent On-Time Payment</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>✓ Agent credit <strong className="text-green-400">doubles</strong></li>
                <li>✓ Credit score +50 points</li>
                <li>✓ Risk level: LOW</li>
                <li>✓ No fees or penalties</li>
                <li>✓ Agent can handle bigger transactions</li>
              </ul>
              <p className="mt-3 text-xs text-green-400 font-semibold">Best outcome! Agent growth enabled 🎉</p>
            </div>

            {/* Late Payment */}
            <div className="bg-yellow-500/10 rounded-lg p-5 border border-yellow-500/30">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-6 h-6 text-yellow-400" />
                <h3 className="font-bold text-yellow-400">Agent Late Payment (1-7 days)</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>⚠ Agent credit unchanged</li>
                <li>⚠ Credit score -30 points</li>
                <li>⚠ Risk level: MEDIUM</li>
                <li>⚠ Late fee: 5% per day</li>
                <li>⚠ No growth - agent capacity stagnates</li>
              </ul>
              <p className="mt-3 text-xs text-yellow-400 font-semibold">Agent should pay ASAP to avoid worse penalties</p>
            </div>

            {/* Default */}
            <div className="bg-red-500/10 rounded-lg p-5 border border-red-500/30">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-6 h-6 text-red-400" />
                <h3 className="font-bold text-red-400">Agent Default (8+ days)</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>✗ Agent credit <strong className="text-red-400">reduced 50%</strong></li>
                <li>✗ Credit score -80 points</li>
                <li>✗ Risk level: HIGH</li>
                <li>✗ High late fees accumulated</li>
                <li>✗ Agent capacity severely limited</li>
              </ul>
              <p className="mt-3 text-xs text-red-400 font-semibold">Severe consequences! Agent credibility damaged</p>
            </div>
          </div>
        </motion.div>

        {/* Credit Tier System */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-[var(--card)] rounded-xl p-6 border border-[var(--color-accent)]/20 mb-8"
        >
          <h2 className="text-2xl font-bold mb-6 text-white">Agent Credit Tier System</h2>
          <p className="text-[var(--color-text-dim)] mb-6">
            Based on your credit tier, your agent is allocated a maximum credit limit. As your agent successfully manages payments, its credit grows within the tier limits. Higher tiers allow agents to handle larger autonomous transactions.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className={`rounded-lg p-5 border-2 ${
              creditDetails.tier === 'Bronze' 
                ? 'bg-orange-500/20 border-orange-500' 
                : 'bg-[var(--bg)] border-[var(--color-accent)]/20'
            }`}>
              <h3 className="font-bold text-orange-400 mb-2">🥉 Bronze</h3>
              <p className="text-sm text-[var(--color-text-dim)] mb-2">Score: 300-579</p>
              <p className="text-2xl font-bold text-white">500 SHM</p>
              <p className="text-xs text-[var(--color-text-dim)]">Max agent credit</p>
              <p className="text-xs text-[var(--color-accent2)] mt-2">New accounts start here</p>
            </div>

            <div className={`rounded-lg p-5 border-2 ${
              creditDetails.tier === 'Silver' 
                ? 'bg-gray-500/20 border-gray-400' 
                : 'bg-[var(--bg)] border-[var(--color-accent)]/20'
            }`}>
              <h3 className="font-bold text-gray-300 mb-2">🥈 Silver</h3>
              <p className="text-sm text-[var(--color-text-dim)] mb-2">Score: 580-669</p>
              <p className="text-2xl font-bold text-white">1,000 SHM</p>
              <p className="text-xs text-[var(--color-text-dim)]">Max agent credit</p>
              <p className="text-xs text-[var(--color-accent2)] mt-2">After first repayment</p>
            </div>

            <div className={`rounded-lg p-5 border-2 ${
              creditDetails.tier === 'Gold' 
                ? 'bg-yellow-500/20 border-yellow-500' 
                : 'bg-[var(--bg)] border-[var(--color-accent)]/20'
            }`}>
              <h3 className="font-bold text-yellow-400 mb-2">🥇 Gold</h3>
              <p className="text-sm text-[var(--color-text-dim)] mb-2">Score: 670-739</p>
              <p className="text-2xl font-bold text-white">2,000 SHM</p>
              <p className="text-xs text-[var(--color-text-dim)]">Max agent credit</p>
              <p className="text-xs text-[var(--color-accent2)] mt-2">Consistent repayers</p>
            </div>

            <div className={`rounded-lg p-5 border-2 ${
              creditDetails.tier === 'Platinum' 
                ? 'bg-purple-500/20 border-purple-500' 
                : 'bg-[var(--bg)] border-[var(--color-accent)]/20'
            }`}>
              <h3 className="font-bold text-purple-400 mb-2">💎 Platinum</h3>
              <p className="text-sm text-[var(--color-text-dim)] mb-2">Score: 740+</p>
              <p className="text-2xl font-bold text-white">5,000 SHM</p>
              <p className="text-xs text-[var(--color-text-dim)]">Max agent credit</p>
              <p className="text-xs text-[var(--color-accent2)] mt-2">Elite performers</p>
            </div>
          </div>
        </motion.div>

        {/* Smart Contract Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-[var(--color-accent)]/10 rounded-xl p-6 border border-[var(--color-accent)]/30"
        >
          <h3 className="font-bold text-lg mb-3 text-[var(--color-accent)]">On-Chain Verification</h3>
          <div className="space-y-4 text-sm">
            <p className="text-gray-300">
              All agent credit allocations are stored and verified on the Shardeum testnet using the FlexCreditCore smart contract. Values are in SHM (18 decimals) suitable for testnet transactions.
            </p>
            
            {/* Wallet Address Display */}
            <div className="bg-black/40 rounded-lg p-4 border border-[var(--color-accent)]/20">
              <p className="text-xs text-[var(--color-text-dim)] mb-2">Your Wallet Address</p>
              <div className="flex items-center gap-2">
                <code className="text-[var(--color-accent2)] font-mono text-sm break-all">
                  {wallet.address}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(wallet.address || '')}
                  className="px-2 py-1 text-xs bg-[var(--color-accent)]/20 hover:bg-[var(--color-accent)]/30 rounded transition-colors flex-shrink-0"
                  title="Copy address"
                >
                  Copy
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-4">
              <a
                href={`https://explorer-mezame.shardeum.org/account/${wallet.address}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-accent2)] hover:underline"
              >
                View Your Wallet on Shardeum Explorer ↗
              </a>
              <a
                href="https://explorer-mezame.shardeum.org/account/0xF21C05d1AEE9b444C90855A9121a28bE941785B5"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-accent2)] hover:underline"
              >
                View FlexCreditCore Contract ↗
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
