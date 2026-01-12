'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ArrowLeft, Plus, Wallet, TrendingUp, Activity, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { AgentWalletBalance } from '@/components/agent/AgentWalletBalance';
import {
  createAgentWallet,
  getUserAgentWallets,
  getAgentWalletStats,
  depositToAgentWallet,
} from '@/lib/agent-wallet-factory';

interface WalletInfo {
  address: string;
  balance: number;
  creditAllocated: number;
  creditUsed: number;
  spendingCap: number;
  reputation: number;
  nonce: number;
}

export default function AgentWalletsPage() {
  const { wallet } = useAppStore();
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [spendingCap, setSpendingCap] = useState('1000');

  // For simulation
  const [simulatedAgents, setSimulatedAgents] = useState([
    { id: 1, name: 'Trading Agent Alpha', strategy: 'DeFi Arbitrage', simulated: true },
    { id: 2, name: 'Yield Optimizer Beta', strategy: 'Yield Farming', simulated: true },
  ]);

  useEffect(() => {
    if (wallet.address) {
      loadWallets();
    }
  }, [wallet.address]);

  const loadWallets = async () => {
    if (!wallet.address) return;

    setLoading(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const walletAddresses = await getUserAgentWallets(wallet.address, provider);

      const walletsWithStats = await Promise.all(
        walletAddresses.map(async (addr) => {
          const stats = await getAgentWalletStats(addr, provider);
          return {
            address: addr,
            ...stats,
          };
        })
      );

      setWallets(walletsWithStats);
    } catch (err) {
      console.error('Error loading wallets:', err);
      setError('Failed to load agent wallets');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWallet = async () => {
    if (!wallet.address) return;

    setCreating(true);
    setError('');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const walletAddress = await createAgentWallet(signer, Number(spendingCap));

      // Reload wallets
      await loadWallets();
    } catch (err: any) {
      console.error('Error creating wallet:', err);
      setError('Failed to create agent wallet: ' + (err.message || 'Unknown error'));
    } finally {
      setCreating(false);
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
              Agent Wallets
            </h1>
            <p className="text-[var(--color-text-dim)] mt-1">
              Manage your AI trading agent smart wallets
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Create Wallet Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 p-6 rounded-xl border border-blue-500/30 mb-8"
        >
          <h2 className="text-xl font-semibold text-blue-400 mb-4 flex items-center gap-2">
            <Plus size={24} />
            Create New Agent Wallet
          </h2>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm text-[var(--color-text-dim)] mb-2">
                Initial Spending Cap (USDC)
              </label>
              <input
                type="number"
                value={spendingCap}
                onChange={(e) => setSpendingCap(e.target.value)}
                disabled={creating}
                className="w-full bg-black/30 border border-gray-600 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                placeholder="1000"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleCreateWallet}
                disabled={creating || !spendingCap}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-600 rounded-lg font-semibold transition-all"
              >
                {creating ? 'Creating...' : 'Create Wallet'}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Existing Wallets */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-green-400 mb-4">Your Agent Wallets</h2>

          {loading ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-green-400" />
              <p className="text-[var(--color-text-dim)]">Loading agent wallets...</p>
            </div>
          ) : wallets.length === 0 ? (
            <div className="text-center py-12 bg-[var(--card)]/30 rounded-xl border border-[var(--color-accent)]/20">
              <Wallet size={48} className="mx-auto text-[var(--color-text-dim)] mb-4" />
              <p className="text-[var(--color-text-dim)]">No agent wallets found</p>
              <p className="text-sm text-[var(--color-text-dim)] mt-2">
                Create your first agent wallet above
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {wallets.map((w, index) => (
                <motion.div
                  key={w.address}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <AgentWalletBalance 
                    walletAddress={w.address}
                    showDetails={true}
                    className="mb-4"
                  />
                  <Link
                    href={`/agent?wallet=${w.address}`}
                    className="block w-full text-center px-4 py-2 bg-[var(--color-accent)]/20 hover:bg-[var(--color-accent)]/30 text-[var(--color-accent)] rounded-lg transition-all border border-[var(--color-accent)]/30 font-semibold"
                  >
                    Manage Wallet →
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Simulated Agents Section */}
        <div className="bg-yellow-900/10 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-yellow-400" size={20} />
            <h2 className="text-xl font-semibold text-yellow-400">
              Simulated Agents (Demo)
            </h2>
          </div>
          <p className="text-sm text-[var(--color-text-dim)] mb-4">
            The following are simulated agents for demonstration purposes. Real agent
            integration coming soon.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {simulatedAgents.map((agent) => (
              <div
                key={agent.id}
                className="bg-yellow-900/10 border border-yellow-500/20 p-4 rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-yellow-300">{agent.name}</h3>
                  <span className="text-xs bg-yellow-900/30 text-yellow-400 px-2 py-1 rounded">
                    SIMULATED
                  </span>
                </div>
                <p className="text-sm text-[var(--color-text-dim)]">Strategy: {agent.strategy}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <p className="text-[var(--color-text-dim)]">Performance</p>
                    <p className="text-green-400 font-semibold">+12.5%</p>
                  </div>
                  <div>
                    <p className="text-[var(--color-text-dim)]">Status</p>
                    <p className="text-blue-400 font-semibold">Active</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
