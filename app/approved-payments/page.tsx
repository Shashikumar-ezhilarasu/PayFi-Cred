'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { PageHeader } from '@/components/shared/PageHeader';
import { StatsCard } from '@/components/shared/StatsCard';
import { SearchFilter } from '@/components/shared/SearchFilter';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingSpinner } from '@/components/shared/LoadingSpinner';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  ExternalLink,
  Clock,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  Wallet,
} from 'lucide-react';
import { formatDate, getCategoryColor, getStatusBadgeClasses } from '@/lib/utils';

interface ApprovedPayment {
  id: string;
  merchantName: string;
  merchantType: string;
  amount: number;
  description: string;
  approvedAt: string;
  agentDecision: {
    approved: boolean;
    reason: string;
    autoApproved: boolean;
    categoryUsage?: number;
  };
  walletAddress?: string;
  txHash?: string;
  blockNumber?: number;
  status: 'pending' | 'completed' | 'failed';
}

export default function ApprovedPaymentsPage() {
  const { wallet, creditData } = useAppStore();
  const [approvedPayments, setApprovedPayments] = useState<ApprovedPayment[]>([]);
  const [filteredPayments, setFilteredPayments] = useState<ApprovedPayment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all');
  const [totalApproved, setTotalApproved] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    if (!wallet.connected) {
      setLoading(false);
      return;
    }

    const loadApprovedPayments = () => {
      try {
        const stored = localStorage.getItem('approved-payments');
        if (stored) {
          const payments: ApprovedPayment[] = JSON.parse(stored);
          setApprovedPayments(payments);
          setFilteredPayments(payments);
          
          const total = payments.reduce((sum, p) => sum + p.amount, 0);
          const completed = payments.filter(p => p.status === 'completed');
          const spent = completed.reduce((sum, p) => sum + p.amount, 0);
          
          setTotalApproved(total);
          setTotalSpent(spent);
        }
      } catch (error) {
        console.error('Error loading approved payments:', error);
      } finally {
        setLoading(false);
      }
    };

    loadApprovedPayments();
  }, [wallet.connected]);

  useEffect(() => {
    let filtered = approvedPayments;

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.merchantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter((p) => p.status === filterStatus);
    }

    setFilteredPayments(filtered);
  }, [searchTerm, filterStatus, approvedPayments]);

  if (!wallet.connected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center p-8 max-w-md"
        >
          <EmptyState
            icon={Wallet}
            title="Connect Your Wallet"
            description="Please connect your wallet to view agent-approved payments."
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader
          icon={CheckCircle}
          title="Agent-Approved Payments"
          subtitle="Track all payments approved by your AI agent"
        />

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <StatsCard
            icon={CheckCircle}
            label="Total Approved"
            value={`$${totalApproved.toFixed(2)}`}
            subtext={`${approvedPayments.length} payments`}
            iconColor="text-green-400"
          />
          <StatsCard
            icon={DollarSign}
            label="Total Spent"
            value={`$${totalSpent.toFixed(2)}`}
            subtext={`${approvedPayments.filter((p) => p.status === 'completed').length} completed`}
          />
          <StatsCard
            icon={TrendingUp}
            label="Available Credit"
            value={`$${creditData?.availableBalance.toFixed(2) || '0.00'}`}
            subtext={`of $${creditData?.creditLimit.toLocaleString() || '0'}`}
            iconColor="text-blue-400"
          />
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <SearchFilter
            searchValue={searchTerm}
            onSearchChange={setSearchTerm}
            filterValue={filterStatus}
            onFilterChange={setFilterStatus}
            searchPlaceholder="Search merchants or descriptions..."
            filterOptions={[
              { value: 'all', label: 'All Status' },
              { value: 'completed', label: 'Completed' },
              { value: 'pending', label: 'Pending' },
            ]}
          />
        </motion.div>

        {/* Payments List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <h2 className="text-xl font-bold neon-text mb-6">Payment History</h2>

          {loading ? (
            <LoadingSpinner />
          ) : filteredPayments.length === 0 ? (
            <EmptyState
              icon={AlertCircle}
              title={searchTerm || filterStatus !== 'all' ? 'No payments match your filters' : 'No agent-approved payments yet'}
              description="Agent-approved payments will appear here once processed"
            />
          ) : (
            <div className="space-y-3">
              {filteredPayments.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-[var(--elev)] rounded-lg p-5 hover:bg-[var(--elev)]/80 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Payment Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-semibold text-[var(--color-text)]">
                              {payment.merchantName}
                            </h3>
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(
                                payment.merchantType
                              )} bg-[var(--card)]`}
                            >
                              {payment.merchantType}
                            </span>
                          </div>
                          <p className="text-sm text-[var(--color-text-alt)]">
                            {payment.description}
                          </p>
                        </div>

                        {/* Status Badge */}
                        <div className="flex items-center gap-2">
                          {payment.status === 'completed' ? (
                            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Completed
                            </span>
                          ) : payment.status === 'pending' ? (
                            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                          ) : (
                            <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                              Failed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Agent Decision */}
                      <div className="bg-[var(--card)] rounded-lg p-3 border border-[var(--color-accent)]/20">
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-[var(--color-accent)] mt-0.5 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm text-[var(--color-text)] mb-1">
                              <span className="font-semibold text-[var(--color-accent)]">
                                {payment.agentDecision.autoApproved
                                  ? 'Auto-Approved'
                                  : 'Manually Approved'}
                              </span>
                            </p>
                            <p className="text-xs text-[var(--color-text-alt)]">
                              {payment.agentDecision.reason}
                            </p>
                            {payment.agentDecision.categoryUsage !== undefined && (
                              <p className="text-xs text-[var(--color-muted)] mt-1">
                                Category Usage: {payment.agentDecision.categoryUsage.toFixed(1)}%
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Wallet Address */}
                      {payment.walletAddress && (
                        <div className="bg-black/40 rounded-lg p-3 border border-[var(--color-accent)]/10">
                          <p className="text-xs text-[var(--color-muted)] mb-1">Wallet Address</p>
                          <div className="flex items-center gap-2">
                            <code className="text-xs text-[var(--color-accent2)] font-mono">
                              {payment.walletAddress.substring(0, 6)}...{payment.walletAddress.substring(38)}
                            </code>
                            <button
                              onClick={() => navigator.clipboard.writeText(payment.walletAddress || '')}
                              className="px-2 py-0.5 text-xs bg-[var(--color-accent)]/20 hover:bg-[var(--color-accent)]/30 rounded transition-colors"
                            >
                              Copy
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Transaction Details */}
                      <div className="flex items-center gap-4 text-xs text-[var(--color-muted)]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(payment.approvedAt)}
                        </div>
                        {payment.txHash && (
                          <a
                            href={`https://explorer-mezame.shardeum.org/transaction/${payment.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[var(--color-accent)] hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View Transaction
                          </a>
                        )}
                        {payment.blockNumber && (
                          <span>Block #{payment.blockNumber.toLocaleString()}</span>
                        )}
                      </div>

                      {/* Verify on Block Explorer Button */}
                      {payment.walletAddress && (
                        <div className="flex gap-2">
                          <a
                            href={`https://explorer-mezame.shardeum.org/account/${payment.walletAddress}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)]/20 hover:bg-[var(--color-accent)]/30 text-[var(--color-accent)] rounded-lg transition-colors text-sm"
                          >
                            <ExternalLink className="w-4 h-4" />
                            Verify on Block Explorer
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[var(--color-text)]">
                        ${payment.amount.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
