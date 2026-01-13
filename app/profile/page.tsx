'use client';

import { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import {
  User,
  Wallet,
  Activity,
  ExternalLink,
  Copy,
  CheckCircle,
  TrendingUp,
  DollarSign,
  Clock,
  RefreshCw,
} from 'lucide-react';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  value: string;
  timestamp: number;
  blockNumber: number;
  gasUsed?: string;
  status?: number;
}

export default function ProfilePage() {
  const { wallet, creditData } = useAppStore();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string>('');
  const [balance, setBalance] = useState<string>('0');
  const [copied, setCopied] = useState(false);
  const [networkInfo, setNetworkInfo] = useState<{
    name: string;
    chainId: number;
  } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!wallet.connected || !wallet.address) {
        setLoading(false);
        return;
      }

      try {
        // Connect to current network via MetaMask
        const browserProvider = new ethers.BrowserProvider(window.ethereum as any);
        const network = await browserProvider.getNetwork();
        
        setNetworkInfo({
          name: network.name === 'unknown' && Number(network.chainId) === 8119 ? 'Shardeum Testnet' : network.name,
          chainId: Number(network.chainId),
        });

        // Fetch balance from blockchain directly
        const balance = await browserProvider.getBalance(wallet.address);
        const balanceShm = ethers.formatEther(balance);
        setBalance(parseFloat(balanceShm).toFixed(6));

        // Placeholder for Shardeum transaction history
        // Will be implemented when Shardeum block explorer API is available
        console.log('Shardeum transactions to be implemented');
        setTransactions([]);
        setError('');
      } catch (error) {
        console.error('Error fetching profile data:', error);
        setError(error instanceof Error ? error.message : 'Failed to load transactions');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchData();
  }, [wallet.connected, wallet.address]);

  const handleRefresh = async () => {
    setRefreshing(true);
    setError('');
    
    try {
      if (!wallet.connected || !wallet.address) return;

      // Fetch balance directly from blockchain
      const browserProvider = new ethers.BrowserProvider(window.ethereum as any);
      const balance = await browserProvider.getBalance(wallet.address);
      const balanceShm = ethers.formatEther(balance);
      setBalance(parseFloat(balanceShm).toFixed(2));

      // Transactions will be available when Shardeum API is integrated
      setTransactions([]);
      setError('');
    } catch (error) {
      console.error('Error refreshing:', error);
      setError('Failed to refresh data');
    } finally {
      setRefreshing(false);
    }
  };

  const copyAddress = () => {
    if (wallet.address) {
      navigator.clipboard.writeText(wallet.address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const timeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return `${seconds} secs ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min${Math.floor(seconds / 60) > 1 ? 's' : ''} ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr${Math.floor(seconds / 3600) > 1 ? 's' : ''} ago`;
    return `${Math.floor(seconds / 86400)} day${Math.floor(seconds / 86400) > 1 ? 's' : ''} ago`;
  };

  if (!wallet.connected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card text-center p-8 max-w-md"
        >
          <Wallet className="w-16 h-16 text-[var(--color-accent)] mx-auto mb-4" />
          <h2 className="text-2xl neon-text mb-2">Connect Your Wallet</h2>
          <p className="text-[var(--color-text-alt)]">
            Please connect your wallet to view your profile and transaction history.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <User className="w-8 h-8 text-[var(--color-accent)]" />
          <h1 className="text-3xl font-bold neon-text">Profile</h1>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            {/* Avatar */}
            <div className="neon-bg rounded-full p-1 w-24 h-24 flex-shrink-0">
              <div className="w-full h-full rounded-full bg-[var(--card)] flex items-center justify-center">
                <User className="w-12 h-12 text-[var(--color-accent)]" />
              </div>
            </div>

            {/* Wallet Info */}
            <div className="flex-1 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <label className="text-sm text-[var(--color-muted)] mb-1 block">
                      Wallet Address
                    </label>
                    <div className="flex items-center gap-2 flex-wrap">
                    <code className="text-lg text-[var(--color-text)] font-mono">
                      {wallet.address}
                    </code>
                    <button
                      onClick={copyAddress}
                      className="p-2 hover:bg-[var(--elev)] rounded-lg transition-colors"
                      title="Copy address"
                    >
                      {copied ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <Copy className="w-5 h-5 text-[var(--color-muted)]" />
                      )}
                    </button>
                    <a
                      href={`https://explorer-mezame.shardeum.org/address/${wallet.address}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 hover:bg-[var(--elev)] rounded-lg transition-colors"
                      title="View on Shardeum Explorer"
                    >
                      <ExternalLink className="w-5 h-5 text-[var(--color-muted)]" />
                    </a>
                    {wallet.isVerified && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 border border-green-500/50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-sm text-green-400 font-semibold">Verified</span>
                        {wallet.verificationDate && (
                          <span className="text-xs text-green-400/70 ml-1">
                            {new Date(wallet.verificationDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {networkInfo && (
                  <div>
                    <label className="text-sm text-[var(--color-muted)] mb-1 block">
                      Connected Network
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 px-3 py-2 bg-[var(--elev)] rounded-lg border border-[var(--color-accent)]/30">
                        <div className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse"></div>
                        <span className="text-[var(--color-text)] font-semibold">
                          {networkInfo.name}
                        </span>
                        <span className="text-xs text-[var(--color-muted)]">
                          (Chain ID: {networkInfo.chainId})
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-[var(--elev)] rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <Wallet className="w-4 h-4 text-[var(--color-accent)]" />
                    <span className="text-sm text-[var(--color-muted)]">Balance</span>
                  </div>
                  <p className="text-2xl font-bold text-[var(--color-text)]">
                    {balance} <span className="text-sm text-[var(--color-muted)]">SHM</span>
                  </p>
                </div>

                {creditData && (
                  <>
                    <div className="bg-[var(--elev)] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <TrendingUp className="w-4 h-4 text-[var(--color-accent)]" />
                        <span className="text-sm text-[var(--color-muted)]">Credit Score</span>
                      </div>
                      <p className="text-2xl font-bold text-[var(--color-text)]">
                        {creditData.creditScore}
                      </p>
                    </div>

                    <div className="bg-[var(--elev)] rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-1">
                        <DollarSign className="w-4 h-4 text-[var(--color-accent)]" />
                        <span className="text-sm text-[var(--color-muted)]">Credit Limit</span>
                      </div>
                      <p className="text-2xl font-bold text-[var(--color-text)]">
                        ${creditData.creditLimit.toLocaleString()}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Transactions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Activity className="w-6 h-6 text-[var(--color-accent)]" />
              <h2 className="text-2xl font-bold neon-text">
                Recent Transactions (Shardeum Testnet)
              </h2>
            </div>
            <button
              onClick={handleRefresh}
              disabled={refreshing || loading}
              className="px-4 py-2 bg-[var(--color-accent)]/20 hover:bg-[var(--color-accent)]/30 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <p className="text-red-400 text-sm">⚠️ {error}</p>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--color-accent)]"></div>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-[var(--color-muted)] mx-auto mb-4" />
              <p className="text-[var(--color-text-alt)] mb-2">No transactions found</p>
              <p className="text-sm text-[var(--color-muted)]">
                Make some transactions on Shardeum testnet to see them here
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Header */}
              <div className="bg-[var(--card)] rounded-lg p-3 border border-[var(--color-accent)]/20 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span className="text-[var(--color-text-dim)]">Total Transactions:</span>
                    <span className="font-semibold text-[var(--color-accent)]">{transactions.length}</span>
                  </div>
                  <a
                    href={`https://sepolia.etherscan.io/address/${wallet.address}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-[var(--color-accent2)] hover:underline"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View on Shardeum Explorer
                  </a>
                </div>
              </div>

              {/* Transaction List */}
              {transactions.map((tx, index) => (
                <motion.div
                  key={tx.hash}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-[var(--elev)] rounded-lg p-4 hover:bg-[var(--elev)]/80 transition-colors border border-[var(--color-accent)]/10"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex-1 space-y-2">
                      {/* Transaction Hash */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <a
                          href={`https://sepolia.etherscan.io/tx/${tx.hash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-sm text-[var(--color-accent)] hover:underline flex items-center gap-1"
                        >
                          {formatAddress(tx.hash)}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <span className="text-xs text-[var(--color-text-dim)]">
                          {timeAgo(tx.timestamp)}
                        </span>
                        {tx.status === 1 ? (
                          <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                            Success
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                            Failed
                          </span>
                        )}
                      </div>

                      {/* From/To Addresses */}
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[var(--color-text-dim)]">From:</span>
                          <a
                            href={`https://sepolia.etherscan.io/address/${tx.from}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[var(--color-accent2)] hover:underline"
                          >
                            {formatAddress(tx.from)}
                          </a>
                        </div>
                        <span className="text-[var(--color-text-dim)]">→</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[var(--color-text-dim)]">To:</span>
                          <a
                            href={`https://sepolia.etherscan.io/address/${tx.to}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[var(--color-accent2)] hover:underline"
                          >
                            {formatAddress(tx.to)}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Amount and Block */}
                    <div className="text-right">
                      <div className="flex items-center gap-2 justify-end mb-1">
                        <span className="text-lg font-bold text-[var(--color-accent2)]">
                          {parseFloat(tx.value).toFixed(4)}
                        </span>
                        <span className="text-sm text-[var(--color-text-dim)]">SHM</span>
                      </div>
                      <a
                        href={`https://explorer-mezame.shardeum.org/block/${tx.blockNumber}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[var(--color-text-dim)] hover:text-[var(--color-accent)] transition-colors"
                      >
                        Block #{tx.blockNumber.toLocaleString()}
                      </a>
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
