'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppStore } from '@/store/useAppStore';
import { motion } from 'framer-motion';
import EnhancedCreditDashboard from '@/components/credit/EnhancedCreditDashboard';
import { TrendingUp, DollarSign, Loader2, Zap, Activity, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { wallet, creditData, refreshCreditData, assessCredit, agentPolicy } = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!wallet.connected) {
      router.push('/');
      return;
    }

    // Try to load credit data or assess if needed
    const loadData = async () => {
      if (wallet.address) {
        try {
          if (!creditData) {
            // First time - assess credit from Sepolia
            await assessCredit(wallet.address);
          } else {
            // Refresh existing data
            await refreshCreditData();
          }
        } catch (error) {
          console.error('Error loading credit data:', error);
        }
      }
      setLoading(false);
    };

    loadData();
  }, [wallet.connected, wallet.address, router]);

  // Show loading state
  if (!wallet.connected || loading) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-[var(--color-accent)]" />
          <p className="text-[var(--color-text-alt)]">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // If no credit data and not loading, show apply screen
  if (!creditData) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-2xl"
        >
          <div className="mb-8">
            <Zap className="w-20 h-20 mx-auto mb-6 text-[var(--color-accent)]" />
            <h2 className="text-4xl font-bold mb-4 neon-text">Welcome to Pay-Fi</h2>
            <p className="text-lg text-[var(--color-text-alt)] mb-2">
              Get income-backed credit based on your Shardeum transaction history
            </p>
            <p className="text-sm text-[var(--color-muted)]">
              No credit check • Instant approval • AI-powered auto-payments
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="card p-4">
              <Activity className="w-8 h-8 mx-auto mb-2 text-[var(--color-accent)]" />
              <p className="text-sm text-[var(--color-text-alt)]">Analyze your onchain income</p>
            </div>
            <div className="card p-4">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-[var(--color-accent)]" />
              <p className="text-sm text-[var(--color-text-alt)]">Get instant credit limit</p>
            </div>
            <div className="card p-4">
              <Zap className="w-8 h-8 mx-auto mb-2 text-[var(--color-accent)]" />
              <p className="text-sm text-[var(--color-text-alt)]">Start making payments</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push('/request-credit')}
              className="px-8 py-4 bg-[var(--color-accent)] text-[var(--bg)] hover:opacity-90 rounded-xl font-semibold text-lg transition-all neon-glow flex items-center justify-center gap-2"
            >
              <Zap className="w-6 h-6" />
              Request Credit Now
            </button>
            <button
              onClick={() => router.push('/credit-identity')}
              className="px-8 py-4 border border-[var(--color-divider)] rounded-xl hover:bg-[var(--elev)] transition-colors flex items-center justify-center gap-2"
            >
              Learn More
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header with Enhanced Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-grid-2x mb-6">
            <div>
              <h1 className="neon-text">Pay-Fi Dashboard</h1>
              <p className="text-[var(--color-text-alt)]">
                Your credit is powered by onchain income analysis • Agent-managed • Auto-repayment enabled
              </p>
            </div>
            
            {/* Agent Status Badge */}
            <div className="flex items-center gap-grid">
              <div className={`px-4 py-2 rounded-xl border ${
                agentPolicy.enabled
                  ? 'bg-[var(--color-accent)]/20 border-[var(--color-accent)]/40 text-[var(--color-accent)]'
                  : 'bg-[var(--color-muted)]/20 border-[var(--color-muted)]/40 text-[var(--color-muted)]'
              }`}>
                <Activity className="w-4 h-4 inline-block mr-2" />
                Agent: {agentPolicy.enabled ? 'Active' : 'Inactive'}
              </div>
            </div>
          </div>

          {/* Workflow Visualization */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card bg-[var(--elev)] border-[var(--color-accent)]/30 neon-glow"
          >
            <h3 className="text-lg font-semibold text-[var(--color-accent)] mb-4">📊 How Pay-Fi Works</h3>
            <div className="flex flex-wrap items-center gap-grid text-sm">
              <div className="px-3 py-2 bg-[var(--card)] rounded-lg border border-[var(--color-divider)]">
                1️⃣ Connect Wallet
              </div>
              <ArrowRight className="text-cyan-400" size={16} />
              <div className="px-3 py-2 bg-purple-500/20 rounded-lg border border-purple-500/40">
                2️⃣ Analyze Shardeum Txs
              </div>
              <ArrowRight className="text-cyan-400" size={16} />
              <div className="px-3 py-2 bg-green-500/20 rounded-lg border border-green-500/40">
                3️⃣ Credit Limit Assigned
              </div>
              <ArrowRight className="text-cyan-400" size={16} />
              <div className="px-3 py-2 bg-yellow-500/20 rounded-lg border border-yellow-500/40">
                4️⃣ Agent Manages Spending
              </div>
              <ArrowRight className="text-cyan-400" size={16} />
              <div className="px-3 py-2 bg-pink-500/20 rounded-lg border border-pink-500/40">
                5️⃣ Auto-Repayment
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Main Enhanced Credit Dashboard */}
        <EnhancedCreditDashboard />

        {/* Additional Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Link
            href="/payment-requests"
            className="p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-500/30 hover:border-purple-500/60 transition-all relative"
          >
            <span className="absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold bg-[var(--color-accent)] text-black rounded-full">
              NEW
            </span>
            <Zap className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Payment Requests</h3>
            <p className="text-sm text-[var(--color-text-dim)]">Merchants requesting payments from your agent</p>
          </Link>

          <Link
            href="/credit"
            className="p-6 bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-xl border border-blue-500/30 hover:border-blue-500/60 transition-all"
          >
            <DollarSign className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="text-lg font-semibold mb-2">View Full Credit Details</h3>
            <p className="text-sm text-[var(--color-text-dim)]">See complete credit analysis and history</p>
          </Link>

          <Link
            href="/agent"
            className="p-6 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-500/30 hover:border-purple-500/60 transition-all"
          >
            <Activity className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="text-lg font-semibold mb-2">AI Agent Cockpit</h3>
            <p className="text-sm text-[var(--color-text-dim)]">Monitor agent decisions and spending</p>
          </Link>

          <Link
            href="/transactions"
            className="p-6 bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-xl border border-green-500/30 hover:border-green-500/60 transition-all"
          >
            <TrendingUp className="w-8 h-8 text-green-400 mb-3" />
            <h3 className="text-lg font-semibold mb-2">Transaction History</h3>
            <p className="text-sm text-[var(--color-text-dim)]">Review all credit transactions</p>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
