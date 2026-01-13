'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ArrowLeft, Loader2, AlertCircle, ExternalLink, TrendingDown, TrendingUp, Activity } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '@/lib/web3-config';

interface BlockchainEvent {
  type: 'Borrow' | 'Repayment' | 'Agent Spend';
  amount: string;
  txHash: string;
  blockNumber: number;
  timestamp?: number;
  user?: string;
}

export default function TransactionsPage() {
  const { wallet } = useAppStore();
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<BlockchainEvent[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (wallet.address) {
      fetchTransactions();
    }
  }, [wallet.address]);

  const fetchTransactions = async () => {
    if (!wallet.address) return;

    setLoading(true);
    setError('');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const flexCreditCore = new ethers.Contract(
        CONTRACT_ADDRESSES.FlexCreditCore,
        CONTRACT_ABIS.FlexCreditCore,
        provider
      );

      const allEvents: BlockchainEvent[] = [];

      // Fetch CreditUsed events (Borrow)
      console.log('📊 Fetching CreditUsed events...');
      try {
        const creditUsedFilter = flexCreditCore.filters.CreditUsed(wallet.address);
        const creditUsedEvents = await flexCreditCore.queryFilter(creditUsedFilter);
        
        for (const event of creditUsedEvents) {
          // Type guard for EventLog (has args)
          if ('args' in event && event.args) {
            const block = await event.getBlock();
            allEvents.push({
              type: 'Borrow',
              amount: ethers.formatUnits(event.args[1], 6), // amount (USDC has 6 decimals)
              txHash: event.transactionHash,
              blockNumber: event.blockNumber,
              timestamp: block.timestamp,
              user: event.args[0],
            });
          }
        }
        console.log(`✅ Found ${creditUsedEvents.length} borrow events`);
      } catch (err) {
        console.warn('Could not fetch CreditUsed events:', err);
      }

      // Fetch CreditRepaid events (Repayment)
      console.log('📊 Fetching CreditRepaid events...');
      try {
        const creditRepaidFilter = flexCreditCore.filters.CreditRepaid(wallet.address);
        const creditRepaidEvents = await flexCreditCore.queryFilter(creditRepaidFilter);
        
        for (const event of creditRepaidEvents) {
          if ('args' in event && event.args) {
            const block = await event.getBlock();
            allEvents.push({
              type: 'Repayment',
              amount: ethers.formatUnits(event.args[1], 6), // amount
              txHash: event.transactionHash,
              blockNumber: event.blockNumber,
              timestamp: block.timestamp,
              user: event.args[0],
            });
          }
        }
        console.log(`✅ Found ${creditRepaidEvents.length} repayment events`);
      } catch (err) {
        console.warn('Could not fetch CreditRepaid events:', err);
      }

      // Fetch ActionExecuted events from AgentWallet (if exists)
      const hasAgentWallet = CONTRACT_ADDRESSES.AgentWallet && CONTRACT_ADDRESSES.AgentWallet !== '';
      if (hasAgentWallet) {
        console.log('📊 Fetching ActionExecuted events from AgentWallet...');
        try {
          const agentWallet = new ethers.Contract(
            CONTRACT_ADDRESSES.AgentWallet,
            CONTRACT_ABIS.AgentWallet,
            provider
          );

          const actionExecutedFilter = agentWallet.filters.ActionExecuted();
          const actionExecutedEvents = await agentWallet.queryFilter(actionExecutedFilter);
          
          for (const event of actionExecutedEvents) {
            if ('args' in event && event.args) {
              const block = await event.getBlock();
              allEvents.push({
                type: 'Agent Spend',
                amount: ethers.formatUnits(event.args[1] || 0, 6), // value
                txHash: event.transactionHash,
                blockNumber: event.blockNumber,
                timestamp: block.timestamp,
              });
            }
          }
          console.log(`✅ Found ${actionExecutedEvents.length} agent spend events`);
        } catch (err) {
          console.warn('Could not fetch AgentWallet events (might not be deployed):', err);
        }
      }

      // Sort by block number (descending - newest first)
      allEvents.sort((a, b) => b.blockNumber - a.blockNumber);
      
      setEvents(allEvents);
      console.log(`✅ Total events loaded: ${allEvents.length}`);
      
    } catch (err: any) {
      console.error('Error fetching transactions:', err);
      setError('Failed to load transaction history from blockchain');
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'Borrow':
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      case 'Repayment':
        return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'Agent Spend':
        return <Activity className="w-5 h-5 text-blue-400" />;
      default:
        return null;
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'Borrow':
        return 'border-red-500/30 bg-red-900/10';
      case 'Repayment':
        return 'border-green-500/30 bg-green-900/10';
      case 'Agent Spend':
        return 'border-blue-500/30 bg-blue-900/10';
      default:
        return 'border-gray-500/30 bg-[var(--bg)]/10';
    }
  };

  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <p>Please connect your wallet first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-green-600/10 rounded-lg transition-colors border border-green-500/20"
          >
            <ArrowLeft size={24} className="text-green-400" />
          </Link>
          <div className="flex-1">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              Transaction History
            </h1>
            <p className="text-[var(--color-text-dim)] mt-1">
              All your on-chain credit activity
            </p>
          </div>
          <button
            onClick={fetchTransactions}
            disabled={loading}
            className="px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-all border border-green-500/30 disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-green-400" />
            <p className="text-[var(--color-text-dim)]">Loading transactions from blockchain...</p>
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-12 bg-[var(--card)]/30 rounded-xl border border-[var(--color-accent)]/20">
            <Activity size={48} className="mx-auto text-[var(--color-text-dim)] mb-4" />
            <p className="text-[var(--color-text-dim)]">No transactions found</p>
            <p className="text-sm text-[var(--color-text-dim)] mt-2">
              Start borrowing to see your transaction history
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-4 px-6 py-3 bg-[var(--card)]/30 rounded-lg border border-[var(--color-accent)]/20 text-sm font-semibold text-[var(--color-text-dim)]">
              <div>Type</div>
              <div>Amount</div>
              <div>Block</div>
              <div>Date</div>
              <div>Transaction</div>
            </div>

            {/* Transaction Rows */}
            {events.map((event, index) => (
              <motion.div
                key={`${event.txHash}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`grid grid-cols-5 gap-4 px-6 py-4 rounded-xl border ${getEventColor(event.type)} hover:border-green-500/50 transition-colors`}
              >
                {/* Type */}
                <div className="flex items-center gap-2">
                  {getEventIcon(event.type)}
                  <span className="font-medium">{event.type}</span>
                </div>

                {/* Amount */}
                <div className="font-mono text-cyan-400">
                  ${Number(event.amount).toFixed(2)}
                </div>

                {/* Block Number */}
                <div className="text-[var(--color-text-dim)]">
                  #{event.blockNumber}
                </div>

                {/* Timestamp */}
                <div className="text-[var(--color-text-dim)]">
                  {event.timestamp 
                    ? new Date(event.timestamp * 1000).toLocaleDateString()
                    : 'N/A'}
                </div>

                {/* Transaction Hash */}
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm text-purple-400 truncate">
                    {event.txHash.substring(0, 10)}...
                  </span>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${event.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:text-cyan-300 transition-colors"
                  >
                    <ExternalLink size={16} />
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-blue-900/10 border border-blue-500/30 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-blue-400 mb-3">
            About Transaction History
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>
                <strong>Borrow:</strong> Credit used from FlexCreditCore contract
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>
                <strong>Repayment:</strong> Credit repaid to FlexCreditCore contract
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>
                <strong>Agent Spend:</strong> Transactions executed by your AgentWallet (if deployed)
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>
                All data is fetched directly from the blockchain using contract events
              </span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
