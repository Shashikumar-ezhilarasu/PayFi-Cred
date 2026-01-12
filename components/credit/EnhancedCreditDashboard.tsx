'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
  Bot,
  Zap,
  Activity,
  Target
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { EthDisplay, CreditRatioDisplay } from './EthDisplay';
import { getCategoryBreakdown } from '@/lib/agent-policy';

export default function EnhancedCreditDashboard() {
  const { wallet, creditData, agentPolicy, assessCredit, refreshCreditData } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [assessingCredit, setAssessingCredit] = useState(false);

  // Assess credit on mount if no credit data
  useEffect(() => {
    if (wallet.address && !creditData) {
      handleAssessCredit();
    }
  }, [wallet.address]);

  const handleAssessCredit = async () => {
    if (!wallet.address) return;
    
    setAssessingCredit(true);
    try {
      await assessCredit(wallet.address);
    } catch (error) {
      console.error('Error assessing credit:', error);
    } finally {
      setAssessingCredit(false);
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await refreshCreditData();
    } catch (error) {
      console.error('Error refreshing:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!wallet.connected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <CreditCard className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-dim)]" />
          <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-[var(--color-text-dim)]">Please connect your wallet to access Pay-Fi Credit</p>
        </div>
      </div>
    );
  }

  if (assessingCredit) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 text-[var(--color-accent)] animate-spin" />
          <h3 className="text-xl font-semibold mb-2">Analyzing Your Transaction History</h3>
          <p className="text-[var(--color-text-dim)]">Fetching Sepolia transactions and computing credit limit...</p>
        </div>
      </div>
    );
  }

  if (!creditData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-lg">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-[var(--color-accent2)]" />
          <h3 className="text-2xl font-semibold mb-4">Apply for Pay-Fi Credit</h3>
          <p className="text-[var(--color-text-dim)] mb-6">
            We'll analyze your Sepolia transaction history to determine your credit limit. 
            Credit is earned based on your onchain behavior, not manually selected.
          </p>
          <button
            onClick={handleAssessCredit}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold transition-all"
          >
            <Zap className="w-5 h-5 inline-block mr-2" />
            Apply for Credit
          </button>
        </div>
      </div>
    );
  }

  const categoryBreakdown = getCategoryBreakdown(creditData.availableBalance, agentPolicy);
  const utilization = creditData.creditLimit > 0 
    ? (creditData.usedCredit / creditData.creditLimit) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Pay-Fi Credit Dashboard
          </h2>
          <p className="text-[var(--color-text-dim)] mt-1">Manage your income-backed credit line</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-3 bg-[var(--color-accent)]/10 hover:bg-[var(--color-accent)]/20 rounded-xl transition-all duration-300 border border-[var(--color-accent)]/20"
        >
          <RefreshCw className={`w-5 h-5 text-[var(--color-accent)] ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Credit Assessment Info */}
      {creditData.assessmentTimestamp && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[var(--color-accent)]/20 rounded-xl">
              <Activity className="w-6 h-6 text-[var(--color-accent)]" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Credit Assessment</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-[var(--color-text-dim)]">Transactions Analyzed</p>
                  <p className="text-xl font-bold text-[var(--color-accent)]">{creditData.transactionCount || 0}</p>
                </div>
                <div>
                  <p className="text-[var(--color-text-dim)]">Repayment Score</p>
                  <p className="text-xl font-bold text-[var(--color-accent)]">
                    {((creditData.cashflowMetrics?.repaymentScore || 0) * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-[var(--color-text-dim)]">Consistency</p>
                  <p className="text-xl font-bold text-[var(--color-accent2)]">
                    {((creditData.cashflowMetrics?.consistencyScore || 0) * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p className="text-[var(--color-text-dim)]">Credit Tier</p>
                  <p className="text-xl font-bold text-[var(--color-accent2)]">{creditData.creditTier}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Credit Display with FULL PRECISION */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-8 border border-[var(--color-accent)]/20/50"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <EthDisplay 
              value={creditData.creditLimit}
              label="Credit Limit"
              size="xl"
              showFiat
            />
          </div>
          <div>
            <EthDisplay 
              value={creditData.usedCredit}
              label="Credit Used"
              size="xl"
            />
          </div>
          <div>
            <EthDisplay 
              value={creditData.availableBalance}
              label="Available Credit"
              size="xl"
            />
          </div>
        </div>

        {/* Credit Ratio */}
        <div className="mt-6 pt-6 border-t border-[var(--color-accent)]/20">
          <CreditRatioDisplay
            used={creditData.usedCredit}
            limit={creditData.creditLimit}
            available={creditData.availableBalance}
            size="lg"
          />
        </div>

        {/* Utilization Bar */}
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-[var(--color-text-dim)]">Credit Utilization</span>
            <span className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              {utilization.toFixed(2)}%
            </span>
          </div>
          <div className="w-full h-3 bg-[var(--card)] rounded-full overflow-hidden">
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
        </div>
      </motion.div>

      {/* Agent Policy & Category Limits */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[var(--card)] backdrop-blur-xl rounded-2xl p-6 border border-[var(--color-accent)]/20"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-[var(--color-accent)]/20 rounded-xl">
            <Bot className="w-6 h-6 text-[var(--color-accent)]" />
          </div>
          <div>
            <h3 className="text-xl font-semibold">AI Agent Spending Policy</h3>
            <p className="text-sm text-[var(--color-text-dim)]">Category-based limits for agent-controlled spending</p>
          </div>
          <div className="ml-auto">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
              agentPolicy.enabled 
                ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' 
                : 'bg-[var(--color-text)]/20 text-[var(--color-text-dim)]'
            }`}>
              {agentPolicy.enabled ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryBreakdown.map((cat) => (
            <CategoryCard key={cat.category} category={cat} />
          ))}
        </div>

        <div className="mt-6 pt-6 border-t border-[var(--color-accent)]/20 grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[var(--color-text-dim)] mb-1">Daily Spend Limit</p>
            <p className="text-lg font-mono font-semibold text-[var(--color-accent)]">
              {agentPolicy.dailySpendLimit.toFixed(6)} ETH
            </p>
          </div>
          <div>
            <p className="text-[var(--color-text-dim)] mb-1">Manual Approval Above</p>
            <p className="text-lg font-mono font-semibold text-[var(--color-accent2)]">
              {agentPolicy.requireApprovalAbove.toFixed(6)} ETH
            </p>
          </div>
          <div>
            <p className="text-[var(--color-text-dim)] mb-1">Auto-Repayment</p>
            <p className="text-lg font-semibold text-[var(--color-accent)]">
              {agentPolicy.autoRepay ? '✅ Enabled' : '❌ Disabled'}
            </p>
          </div>
          <div>
            <p className="text-[var(--color-text-dim)] mb-1">Penalty Mode</p>
            <p className="text-lg font-semibold text-[var(--color-accent2)] capitalize">
              {agentPolicy.penaltyMode}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

interface CategoryCardProps {
  category: {
    category: string;
    used: number;
    limit: number;
    percentage: number;
  };
}

function CategoryCard({ category }: CategoryCardProps) {
  const getIcon = () => {
    switch (category.category) {
      case 'utilities': return <Zap className="w-5 h-5" />;
      case 'entertainment': return <Target className="w-5 h-5" />;
      case 'subscriptions': return <CreditCard className="w-5 h-5" />;
      case 'food': return <DollarSign className="w-5 h-5" />;
      case 'transport': return <TrendingUp className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const getColor = () => {
    // Use theme colors instead of percentage-based coloring
    return 'border-[var(--color-accent)]/30 bg-[var(--color-accent)]/10';
  };

  return (
    <div className={`p-4 rounded-xl border ${getColor()}`}>
      <div className="flex items-center gap-2 mb-3">
        {getIcon()}
        <span className="font-semibold capitalize">{category.category}</span>
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-[var(--color-text-dim)]">Used</span>
          <span className="font-mono font-semibold">{category.used.toFixed(6)} ETH</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[var(--color-text-dim)]">Limit</span>
          <span className="font-mono font-semibold">{category.limit.toFixed(6)} ETH</span>
        </div>
        <div className="w-full h-2 bg-[var(--bg)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--color-accent)]"
            style={{ width: `${Math.min(category.percentage, 100)}%` }}
          />
        </div>
        <p className="text-xs text-center font-semibold">
          {category.percentage.toFixed(1)}% used
        </p>
      </div>
    </div>
  );
}
