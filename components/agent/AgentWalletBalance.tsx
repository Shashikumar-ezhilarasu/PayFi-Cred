'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Wallet, TrendingUp, Activity, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { getAgentWalletStats } from '@/lib/agent-wallet-factory';

interface AgentWalletBalanceProps {
  walletAddress: string;
  showDetails?: boolean;
  className?: string;
}

export function AgentWalletBalance({ 
  walletAddress, 
  showDetails = true,
  className = '' 
}: AgentWalletBalanceProps) {
  const [stats, setStats] = useState<{
    balance: number;
    creditAllocated: number;
    creditUsed: number;
    spendingCap: number;
    reputation: number;
    nonce: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const walletStats = await getAgentWalletStats(walletAddress, provider);
      setStats(walletStats);
    } catch (err: any) {
      console.error('Error loading wallet stats:', err);
      setError('Failed to load wallet stats');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (walletAddress) {
      loadStats();
    }
  }, [walletAddress]);

  if (loading) {
    return (
      <div className={`bg-[var(--card)] rounded-xl p-4 border border-[var(--color-accent)]/20 ${className}`}>
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-[var(--color-accent)] animate-spin" />
          <span className="text-[var(--color-text-dim)]">Loading wallet balance...</span>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className={`bg-[var(--elev)]/50 rounded-xl p-4 border border-[var(--color-text-dim)]/20 ${className}`}>
        <div className="flex items-center gap-3">
          <Wallet className="w-5 h-5 text-[var(--color-text-dim)]" />
          <span className="text-[var(--color-text-dim)]">
            {error || 'Unable to load wallet'}
          </span>
        </div>
      </div>
    );
  }

  const creditAvailable = stats.creditAllocated - stats.creditUsed;
  const utilizationPercent = stats.creditAllocated > 0 
    ? (stats.creditUsed / stats.creditAllocated) * 100 
    : 0;

  if (!showDetails) {
    return (
      <div className={`bg-[var(--card)] rounded-xl p-4 border border-[var(--color-accent)]/20 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Wallet className="w-5 h-5 text-[var(--color-accent)]" />
            <span className="text-sm text-[var(--color-text-dim)]">Balance</span>
          </div>
          <span className="text-lg font-bold text-[var(--color-accent)]">
            {stats.balance.toFixed(4)} ETH
          </span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[var(--card)] rounded-xl p-6 border border-[var(--color-accent)]/20 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[var(--color-accent)]/20 rounded-lg">
            <Wallet className="w-5 h-5 text-[var(--color-accent)]" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Agent Wallet</h3>
            <p className="text-xs text-[var(--color-text-dim)] font-mono">
              {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
            </p>
          </div>
        </div>
        <button
          onClick={loadStats}
          className="p-2 hover:bg-[var(--color-accent)]/10 rounded-lg transition-colors"
          title="Refresh balance"
        >
          <RefreshCw className="w-4 h-4 text-[var(--color-accent)]" />
        </button>
      </div>

      {/* Balance Stats */}
      <div className="grid grid-cols-2 gap-4">
        {/* ETH Balance */}
        <div className="bg-[var(--elev)] rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-[var(--color-accent)]" />
            <span className="text-xs text-[var(--color-text-dim)]">ETH Balance</span>
          </div>
          <p className="text-xl font-bold text-[var(--color-accent)]">
            {stats.balance.toFixed(4)}
          </p>
          <p className="text-xs text-[var(--color-text-dim)] mt-1">Native Token</p>
        </div>

        {/* Credit Allocated */}
        <div className="bg-[var(--elev)] rounded-lg p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-[var(--color-accent2)]" />
            <span className="text-xs text-[var(--color-text-dim)]">Credit Allocated</span>
          </div>
          <p className="text-xl font-bold text-[var(--color-accent2)]">
            ${stats.creditAllocated.toFixed(2)}
          </p>
          <p className="text-xs text-[var(--color-text-dim)] mt-1">USDC Equivalent</p>
        </div>

        {/* Credit Used */}
        <div className="bg-[var(--elev)] rounded-lg p-3">
          <span className="text-xs text-[var(--color-text-dim)]">Credit Used</span>
          <p className="text-lg font-bold text-[var(--color-text)]">
            ${stats.creditUsed.toFixed(2)}
          </p>
          <p className="text-xs text-[var(--color-text-dim)] mt-1">
            of ${stats.creditAllocated.toFixed(2)}
          </p>
        </div>

        {/* Credit Available */}
        <div className="bg-[var(--elev)] rounded-lg p-3">
          <span className="text-xs text-[var(--color-text-dim)]">Available</span>
          <p className="text-lg font-bold text-[var(--color-accent)]">
            ${creditAvailable.toFixed(2)}
          </p>
          <p className="text-xs text-[var(--color-text-dim)] mt-1">
            Remaining Credit
          </p>
        </div>
      </div>

      {/* Credit Utilization Bar */}
      <div className="mt-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-[var(--color-text-dim)]">Credit Utilization</span>
          <span className="text-xs font-semibold text-[var(--color-accent)]">
            {utilizationPercent.toFixed(1)}%
          </span>
        </div>
        <div className="w-full h-2 bg-[var(--bg)] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(utilizationPercent, 100)}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-[var(--color-accent)]"
          />
        </div>
      </div>

      {/* Additional Stats */}
      <div className="mt-4 pt-4 border-t border-[var(--color-accent)]/10 grid grid-cols-2 gap-4 text-xs">
        <div>
          <span className="text-[var(--color-text-dim)]">Spending Cap</span>
          <p className="text-sm font-semibold text-[var(--color-text)] mt-1">
            ${stats.spendingCap.toFixed(2)}
          </p>
        </div>
        <div>
          <span className="text-[var(--color-text-dim)]">Reputation</span>
          <p className="text-sm font-semibold text-[var(--color-text)] mt-1">
            {stats.reputation}
          </p>
        </div>
        <div>
          <span className="text-[var(--color-text-dim)]">Transactions</span>
          <p className="text-sm font-semibold text-[var(--color-text)] mt-1">
            {stats.nonce}
          </p>
        </div>
        <div>
          <span className="text-[var(--color-text-dim)]">Status</span>
          <p className="text-sm font-semibold text-[var(--color-accent)] mt-1">
            Active
          </p>
        </div>
      </div>
    </motion.div>
  );
}
