'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ethers } from 'ethers';
import { CONTRACT_ABIS, CONTRACT_ADDRESSES } from '@/lib/web3-config';
import { AgentControlPanel } from '@/components/agent/AgentControlPanel';
import AgentPerformanceManager from '@/components/agent/AgentPerformanceManager';
import AgentPolicyManager from '@/components/agent/AgentPolicyManager';
import { ArrowLeft, Activity, Settings, TrendingUp, Plus, Wallet, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import {
  createAgentWallet,
  getUserAgentWallets,
  getAgentWalletStats,
} from '@/lib/agent-wallet-factory';

type TabType = 'control' | 'performance' | 'policy';

interface WalletInfo {
  address: string;
  balance: number;
  creditAllocated: number;
  creditUsed: number;
  spendingCap: number;
  reputation: number;
  nonce: number;
}

function AgentDashboard() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { wallet } = useAppStore();
  
  const [account, setAccount] = useState<string>('');
  const [agentWalletAddress, setAgentWalletAddress] = useState<string>('');
  const [activeTab, setActiveTab] = useState<TabType>('control');
  const [agentStats, setAgentStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  // Agent wallet list state
  const [wallets, setWallets] = useState<WalletInfo[]>([]);
  const [loadingWallets, setLoadingWallets] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [spendingCap, setSpendingCap] = useState('1000');

  // Auto-load wallet address from URL parameter
  useEffect(() => {
    const walletParam = searchParams.get('wallet');
    if (walletParam) {
      setAgentWalletAddress(walletParam);
      refreshStats(walletParam);
    }
  }, [searchParams]);

  // Auto-connect wallet when page loads
  useEffect(() => {
    const autoConnect = async () => {
      if (typeof window.ethereum !== 'undefined' && !account) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum as any);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            setAccount(accounts[0].address);
          }
        } catch (error) {
          // User hasn't connected yet, ignore
        }
      }
    };
    autoConnect();
  }, []);

  // Load user's agent wallets
  useEffect(() => {
    if (wallet.address) {
      loadWallets();
    }
  }, [wallet.address]);

  const loadWallets = async () => {
    if (!wallet.address) return;

    setLoadingWallets(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
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
    } catch (err: any) {
      console.error('Error loading wallets:', err);
      setError('Failed to load agent wallets. ' + (err.message || 'Please check console for details.'));
    } finally {
      setLoadingWallets(false);
    }
  };

  const handleCreateWallet = async () => {
    if (!wallet.address) return;

    setCreating(true);
    setError('');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const signer = await provider.getSigner();

      const walletAddress = await createAgentWallet(signer, Number(spendingCap));

      // Reload wallets and select the new one
      await loadWallets();
      setAgentWalletAddress(walletAddress);
      router.push(`/agent?wallet=${walletAddress}`);
    } catch (err: any) {
      console.error('Error creating wallet:', err);
      setError('Failed to create agent wallet: ' + (err.message || 'Unknown error'));
    } finally {
      setCreating(false);
    }
  };

  const refreshStats = async (address: string) => {
    try {
      setLoading(true);
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const contract = new ethers.Contract(address, CONTRACT_ABIS.AgentWallet, provider);
      
      const stats = await contract.getStats();
      setAgentStats({
        balance: ethers.formatEther(stats.balance),
        creditAllocated: ethers.formatEther(stats._creditAllocated),
        creditUsed: ethers.formatEther(stats._creditUsed),
        spendingCap: ethers.formatEther(stats._spendingCap),
        reputation: stats._reputation.toString(),
        nonce: stats._nonce.toString()
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      alert('Please install MetaMask');
      return;
    }
    try {
      const provider = new ethers.BrowserProvider(window.ethereum as any);
      const accounts = await provider.send("eth_requestAccounts", []);
      setAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectAgent = (address: string) => {
    setAgentWalletAddress(address);
    router.push(`/agent?wallet=${address}`);
  };

  const handleBackToList = () => {
    setAgentWalletAddress('');
    router.push('/agent');
  };

  // If no wallet connected, show connect prompt
  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-green-600/10 rounded-lg transition-colors border border-green-500/20"
            >
              <ArrowLeft size={24} className="text-green-400" />
            </Link>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
              AI Agents
            </h1>
          </div>
          
          <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
            <Activity className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-400 mb-4">Please connect your wallet to continue</p>
            <button
              onClick={connectWallet}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-all"
            >
              Connect MetaMask
            </button>
          </div>
        </div>
      </div>
    );
  }

  // If agent is selected, show management interface
  if (agentWalletAddress && account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header with Back Button */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleBackToList}
              className="p-2 hover:bg-green-600/10 rounded-lg transition-colors border border-green-500/20"
            >
              <ArrowLeft size={24} className="text-green-400" />
            </button>
            <div className="flex-1">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                Agent Dashboard
              </h1>
              <p className="text-sm text-gray-400 font-mono mt-1">
                {agentWalletAddress.substring(0, 10)}...{agentWalletAddress.substring(38)}
              </p>
            </div>
          </div>

          {/* Agent Stats Card */}
          {agentStats && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50 mb-8"
            >
              <h2 className="text-xl font-semibold mb-4 text-cyan-400">Agent Wallet Stats</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Balance</p>
                  <p className="text-lg font-bold text-cyan-400">{Number(agentStats.balance).toFixed(4)} ETH</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Spending Cap</p>
                  <p className="text-lg font-bold text-purple-400">{Number(agentStats.spendingCap).toFixed(2)} SHM</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Reputation</p>
                  <p className="text-lg font-bold text-yellow-400">{agentStats.reputation}/100</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Transactions</p>
                  <p className="text-lg font-bold text-green-400">{agentStats.nonce}</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex gap-2 border-b border-gray-700">
              <button
                onClick={() => setActiveTab('control')}
                className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'control'
                    ? 'text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Activity className="w-5 h-5" />
                Control
              </button>
              <button
                onClick={() => setActiveTab('performance')}
                className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'performance'
                    ? 'text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
                Performance
              </button>
              <button
                onClick={() => setActiveTab('policy')}
                className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
                  activeTab === 'policy'
                    ? 'text-cyan-400 border-b-2 border-cyan-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
              >
                <Settings className="w-5 h-5" />
                Policy
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="min-h-[600px]">
            {activeTab === 'control' && (
              <motion.div
                key="control"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <AgentControlPanel
                  agentWalletAddress={agentWalletAddress}
                  userAddress={account}
                />
              </motion.div>
            )}

            {activeTab === 'performance' && (
              <motion.div
                key="performance"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <AgentPerformanceManager agentWalletAddress={agentWalletAddress} />
              </motion.div>
            )}

            {activeTab === 'policy' && (
              <motion.div
                key="policy"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <AgentPolicyManager agentWalletAddress={agentWalletAddress} />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Default view: Show agent wallet list
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
              AI Agents
            </h1>
            <p className="text-gray-400 mt-1">
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

        {/* Create Wallet Section - Always visible */}
        {!loadingWallets && (
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
                <label className="block text-sm text-gray-400 mb-2">
                  Initial Spending Cap (SHM)
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
                  disabled={!spendingCap}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-600 disabled:to-gray-600 rounded-lg font-semibold transition-all"
                >
                  {creating ? 'Creating...' : 'Create Wallet'}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Existing Wallets */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-green-400 mb-4">Your Agent Wallets</h2>

          {loadingWallets ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 animate-spin mx-auto mb-4 text-green-400" />
              <p className="text-gray-400">Loading agent wallets...</p>
            </div>
          ) : wallets.length === 0 ? (
            <div className="text-center py-12 bg-gray-800/30 rounded-xl border border-gray-700">
              <Wallet size={48} className="mx-auto text-gray-500 mb-4" />
              <p className="text-gray-400">No agent wallets found</p>
              <p className="text-sm text-gray-500 mt-2">
                Create your first agent wallet above
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {wallets.map((w, index) => (
                <motion.div
                  key={w.address}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-green-900/20 to-cyan-900/20 p-6 rounded-xl border border-green-500/30 hover:border-green-500/50 transition-all cursor-pointer"
                  onClick={() => handleSelectAgent(w.address)}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-green-300">
                        Agent Wallet #{index + 1}
                      </h3>
                      <p className="text-xs text-gray-400 font-mono mt-1">
                        {w.address.substring(0, 10)}...{w.address.substring(38)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-green-900/30 px-3 py-1 rounded-full">
                      <TrendingUp size={16} className="text-green-400" />
                      <span className="text-sm text-green-300">{w.reputation}/100</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-gray-400">Balance</p>
                      <p className="text-lg font-bold text-cyan-400">
                        {w.balance.toFixed(4)} ETH
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Spending Cap</p>
                      <p className="text-lg font-bold text-purple-400">
                        {w.spendingCap.toFixed(2)} SHM
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Credit Used</p>
                      <p className="text-lg font-bold text-yellow-400">
                        {w.creditUsed.toFixed(2)} SHM
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Transactions</p>
                      <p className="text-lg font-bold text-green-400">{w.nonce}</p>
                    </div>
                  </div>

                  <div className="w-full text-center px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg transition-all border border-green-500/30">
                    Manage Wallet
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Wrap in Suspense to handle useSearchParams
export default function AgentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">Loading...</div>}>
      <AgentDashboard />
    </Suspense>
  );
}
