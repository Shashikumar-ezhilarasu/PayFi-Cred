'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
  Bot
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { 
  getCreditInfo, 
  getIncomeScore,
  useCredit as useCreditContract,
  repayCredit as repayCreditContract,
  listenToCreditUsed,
  listenToCreditRepaid,
  listenToIncomeScoreApplied,
  fetchRepaymentHistory
} from '@/lib/contract';
import { runAgentStrategy } from '@/lib/agent-api';
import { getUserAgentWallets } from '@/lib/agent-wallet-factory';
import { ethers } from 'ethers';

interface CreditStats {
  income: string;
  limit: string;
  used: string;
  available: string;
}

export default function CreditDashboard() {
  const { wallet } = useAppStore();
  const [creditStats, setCreditStats] = useState<CreditStats | null>(null);
  const [incomeScore, setIncomeScore] = useState<string>('0');
  const [repaymentCount, setRepaymentCount] = useState<number>(0);
  const [repaymentVolume, setRepaymentVolume] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [useCreditAmount, setUseCreditAmount] = useState('');
  const [repayAmount, setRepayAmount] = useState('');
  const [txStatus, setTxStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const [agentResponse, setAgentResponse] = useState<string>('');
  const [isAgentLoading, setIsAgentLoading] = useState(false);

  // Fetch credit data
  const fetchCreditData = async () => {
    if (!wallet.address) return;
    
    try {
      setRefreshing(true);
      const [info, score, repaymentHistory] = await Promise.all([
        getCreditInfo(wallet.address),
        getIncomeScore(wallet.address),
        fetchRepaymentHistory(wallet.address)
      ]);
      
      setCreditStats(info);
      setIncomeScore(score);
      setRepaymentCount(repaymentHistory.count);
      setRepaymentVolume(repaymentHistory.totalVolume);
    } catch (error) {
      console.error('Error fetching credit data:', error);
      setTxStatus({
        type: 'error',
        message: 'Failed to fetch credit data'
      });
    } finally {
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (wallet.address) {
      fetchCreditData();
    }
  }, [wallet.address]);

  // Set up event listeners
  useEffect(() => {
    if (!wallet.address) return;

    listenToCreditUsed((user, amount, totalUsed) => {
      if (user.toLowerCase() === wallet.address?.toLowerCase()) {
        fetchCreditData();
      }
    });

    listenToCreditRepaid((user, amount, totalUsed) => {
      if (user.toLowerCase() === wallet.address?.toLowerCase()) {
        fetchCreditData();
      }
    });

    listenToIncomeScoreApplied((user, prevScore, newScore, newLimit) => {
      if (user.toLowerCase() === wallet.address?.toLowerCase()) {
        fetchCreditData();
      }
    });
  }, [wallet.address]);

  // Handle use credit
  const handleUseCredit = async () => {
    if (!useCreditAmount || parseFloat(useCreditAmount) <= 0) {
      setTxStatus({ type: 'error', message: 'Please enter a valid amount' });
      return;
    }

    try {
      setLoading(true);
      setTxStatus({ type: null, message: '' });
      
      const amountInWei = ethers.parseEther(useCreditAmount);
      const txHash = await useCreditContract(amountInWei.toString());
      
      setTxStatus({
        type: 'success',
        message: `Credit used successfully! Tx: ${txHash.substring(0, 10)}...`
      });
      setUseCreditAmount('');
      
      // Refresh data
      setTimeout(() => fetchCreditData(), 2000);
    } catch (error: any) {
      setTxStatus({
        type: 'error',
        message: error.message || 'Transaction failed'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle repay credit
  const handleRepayCredit = async () => {
    if (!repayAmount || parseFloat(repayAmount) <= 0) {
      setTxStatus({ type: 'error', message: 'Please enter a valid amount' });
      return;
    }

    try {
      setLoading(true);
      setTxStatus({ type: null, message: '' });
      
      const amountInWei = ethers.parseEther(repayAmount);
      const txHash = await repayCreditContract(amountInWei.toString());
      
      setTxStatus({
        type: 'success',
        message: `Credit repaid successfully! Tx: ${txHash.substring(0, 10)}...`
      });
      setRepayAmount('');
      
      // Refresh data
      setTimeout(() => fetchCreditData(), 2000);
    } catch (error: any) {
      setTxStatus({
        type: 'error',
        message: error.message || 'Transaction failed'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle AI Agent auto-repay
  const handleRunAgent = async () => {
    if (!wallet.address) {
      setTxStatus({ type: 'error', message: 'Wallet not connected' });
      return;
    }

    try {
      setIsAgentLoading(true);
      setAgentResponse('');
      setTxStatus({ type: null, message: '' });
      
      // Get user's agent wallets
      const provider = new ethers.BrowserProvider(window.ethereum);
      const agentWallets = await getUserAgentWallets(wallet.address, provider);
      
      if (agentWallets.length === 0) {
        throw new Error('No agent wallet found. Please create an agent wallet first.');
      }
      
      // Use the first agent wallet
      const agentWalletAddress = agentWallets[0];
      
      const message = await runAgentStrategy(agentWalletAddress, wallet.address);
      
      setAgentResponse(message);
      setTxStatus({
        type: 'success',
        message: '✅ AI Agent completed successfully!'
      });
      
      // Refresh credit data after agent execution
      setTimeout(() => fetchCreditData(), 2000);
    } catch (error: any) {
      setTxStatus({
        type: 'error',
        message: error.message || 'Agent execution failed'
      });
      setAgentResponse('');
    } finally {
      setIsAgentLoading(false);
    }
  };

  if (!wallet.connected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Wallet className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-dim)]" />
          <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-[var(--color-text-dim)]">Please connect your wallet to view credit information</p>
        </div>
      </div>
    );
  }

  const utilization = creditStats 
    ? (parseFloat(ethers.formatEther(creditStats.used)) / parseFloat(ethers.formatEther(creditStats.limit))) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Credit Dashboard
          </h2>
          <p className="text-[var(--color-text-dim)] mt-1">Manage your on-chain credit</p>
        </div>
        <button
          onClick={fetchCreditData}
          disabled={refreshing}
          className="p-3 bg-purple-500/10 hover:bg-purple-500/20 rounded-xl transition-all duration-300 border border-purple-500/20"
        >
          <RefreshCw className={`w-5 h-5 text-purple-400 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          label="Income Score"
          value={incomeScore}
          color="blue"
          loading={refreshing}
        />
        <StatCard
          icon={<CreditCard className="w-6 h-6" />}
          label="Credit Limit"
          value={creditStats ? ethers.formatEther(creditStats.limit) : '0'}
          suffix="ETH"
          color="purple"
          loading={refreshing}
        />
        <StatCard
          icon={<TrendingDown className="w-6 h-6" />}
          label="Used Credit"
          value={creditStats ? ethers.formatEther(creditStats.used) : '0'}
          suffix="ETH"
          color="pink"
          loading={refreshing}
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Available Credit"
          value={creditStats ? ethers.formatEther(creditStats.available) : '0'}
          suffix="ETH"
          color="green"
          loading={refreshing}
        />
        <StatCard
          icon={<CheckCircle className="w-6 h-6" />}
          label="Successful Payments"
          value={repaymentCount.toString()}
          subtitle={`${parseFloat(ethers.formatEther(repaymentVolume)).toFixed(4)} ETH repaid`}
          color="cyan"
          loading={refreshing}
        />
      </div>

      {/* Utilization Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-[var(--color-accent)]/20/50"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Credit Utilization</h3>
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            {utilization.toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-4 bg-[var(--card)] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${utilization}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              utilization > 80 ? 'bg-gradient-to-r from-red-500 to-orange-500' :
              utilization > 50 ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
              'bg-gradient-to-r from-green-500 to-emerald-500'
            }`}
          />
        </div>
      </motion.div>

      {/* Transaction Status */}
      {txStatus.type && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border ${
            txStatus.type === 'success' 
              ? 'bg-green-500/10 border-green-500/30 text-green-400' 
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {txStatus.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{txStatus.message}</span>
          </div>
        </motion.div>
      )}

      {/* Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Use Credit */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30"
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-purple-400" />
            Use Credit
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--color-text-dim)] mb-2">Amount (ETH)</label>
              <input
                type="number"
                value={useCreditAmount}
                onChange={(e) => setUseCreditAmount(e.target.value)}
                placeholder="0.0"
                step="0.01"
                className="w-full px-4 py-3 bg-[var(--card)]/50 border border-[var(--color-accent)]/20 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <button
              onClick={handleUseCredit}
              disabled={loading || !useCreditAmount}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Use Credit'
              )}
            </button>
          </div>
        </motion.div>

        {/* Repay Credit */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30"
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            Repay Credit
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--color-text-dim)] mb-2">Amount (ETH)</label>
              <input
                type="number"
                value={repayAmount}
                onChange={(e) => setRepayAmount(e.target.value)}
                placeholder="0.0"
                step="0.01"
                className="w-full px-4 py-3 bg-[var(--card)]/50 border border-[var(--color-accent)]/20 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
            <button
              onClick={handleRepayCredit}
              disabled={loading || !repayAmount}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                'Repay Credit'
              )}
            </button>
          </div>
        </motion.div>
      </div>

      {/* AI Agent Auto-Repay Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-900/30 to-purple-900/30 backdrop-blur-xl rounded-2xl p-6 border border-indigo-500/30"
      >
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Bot className="w-5 h-5 text-indigo-400" />
          AI Agent Auto-Repay
        </h3>
        <p className="text-[var(--color-text-dim)] text-sm mb-4">
          Let our AI agent autonomously execute DeFi strategies to generate yield and automatically repay your debt.
        </p>
        
        <button
          onClick={handleRunAgent}
          disabled={isAgentLoading || loading}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
        >
          {isAgentLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              AI Agent Working...
            </>
          ) : (
            <>
              <Bot className="w-5 h-5" />
              🤖 Auto-Repay with AI Agent
            </>
          )}
        </button>

        {/* Agent Response Display */}
        {agentResponse && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 p-4 bg-[var(--card)]/50 rounded-xl border border-indigo-500/20"
          >
            <h4 className="text-sm font-semibold text-indigo-400 mb-2">Agent Summary:</h4>
            <div className="prose prose-invert prose-sm max-w-none">
              <div 
                className="text-gray-300 text-sm whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: formatMarkdown(agentResponse) }}
              />
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

// Simple markdown formatter for agent responses
function formatMarkdown(text: string): string {
  // Safety check: ensure text is a string
  if (!text || typeof text !== 'string') {
    return String(text || '');
  }
  
  return text
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    // Code blocks
    .replace(/`([^`]+)`/g, '<code class="bg-[var(--card)] px-1 rounded">$1</code>')
    // Line breaks
    .replace(/\n/g, '<br/>');
}

// Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  suffix?: string;
  subtitle?: string;
  color: 'blue' | 'purple' | 'pink' | 'green' | 'cyan';
  loading?: boolean;
}

function StatCard({ icon, label, value, suffix, subtitle, color, loading }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
    pink: 'from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-400',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400',
    cyan: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/30 text-cyan-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-xl rounded-2xl p-6 border`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-gradient-to-br ${colorClasses[color]} rounded-xl`}>
          {icon}
        </div>
      </div>
      <p className="text-[var(--color-text-dim)] text-sm mb-1">{label}</p>
      {loading ? (
        <div className="h-8 w-24 bg-[var(--card)] animate-pulse rounded" />
      ) : (
        <>
          <p className="text-2xl font-bold">
            {suffix ? parseFloat(value).toFixed(4) : value} {suffix && <span className="text-sm text-[var(--color-text-dim)]">{suffix}</span>}
          </p>
          {subtitle && (
            <p className="text-xs text-[var(--color-text-dim)] mt-1">{subtitle}</p>
          )}
        </>
      )}
    </motion.div>
  );
}
