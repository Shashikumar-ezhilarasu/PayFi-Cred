'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Fuel, Bot, CreditCard, Loader2, CheckCircle2, AlertCircle, Activity, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '@/lib/web3-config';
import { getCreditInfo } from '@/lib/payfi-contracts';
import { runAgentStrategy } from '@/lib/agent-api';

interface AgentControlPanelProps {
  agentWalletAddress: string;
  userAddress: string;
}

// Dummy bot address for simulation (not a real AI bot yet)
const DUMMY_BOT_ADDRESS = '0xeB3A9E39d8Ff98B8009308e8980FC6078c52b5fB'; // "BOT" in hex

export function AgentControlPanel({ agentWalletAddress, userAddress }: AgentControlPanelProps) {
  const [agentBalance, setAgentBalance] = useState('0');
  const [botStatus, setBotStatus] = useState<'active' | 'inactive'>('inactive');
  const [userDebt, setUserDebt] = useState(0);
  const [spendingCap, setSpendingCap] = useState('0');
  
  const [depositAmount, setDepositAmount] = useState('');
  const [newSpendingCap, setNewSpendingCap] = useState('');
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [agentResponse, setAgentResponse] = useState('');

  useEffect(() => {
    loadAgentData();
    loadUserDebt();
  }, [agentWalletAddress, userAddress]);

  const loadAgentData = async () => {
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      
      // Get agent balance
      const balance = await provider.getBalance(agentWalletAddress);
      setAgentBalance(ethers.formatEther(balance));

      // Check bot authorization and spending cap
      const agentWallet = new ethers.Contract(
        agentWalletAddress,
        CONTRACT_ABIS.AgentWallet,
        provider
      );
      
      const currentAgent = await agentWallet.agent();
      setBotStatus(currentAgent.toLowerCase() === DUMMY_BOT_ADDRESS.toLowerCase() ? 'active' : 'inactive');

      // Get spending cap
      const cap = await agentWallet.spendingCap();
      setSpendingCap(ethers.formatUnits(cap, 6)); // USDC 6 decimals
    } catch (err) {
      console.error('Error loading agent data:', err);
    }
  };

  const loadUserDebt = async () => {
    try {
      const creditInfo = await getCreditInfo(userAddress);
      const debt = Number(creditInfo.used) / 1e6; // Convert from 6 decimals
      setUserDebt(debt);
    } catch (err) {
      console.error('Error loading user debt:', err);
    }
  };

  // 1. FUND AGENT - Deposit ETH to agent wallet
  const handleFundAgent = async () => {
    if (!depositAmount || Number(depositAmount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    setLoading('fund');
    setError('');
    setSuccess('');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const tx = await signer.sendTransaction({
        to: agentWalletAddress,
        value: ethers.parseEther(depositAmount),
      });

      console.log('Deposit transaction sent:', tx.hash);
      await tx.wait();

      setSuccess(`Successfully deposited ${depositAmount} ETH to agent wallet!`);
      setDepositAmount('');
      await loadAgentData();
    } catch (err: any) {
      console.error('Deposit failed:', err);
      setError('Deposit failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(null);
    }
  };

  // 2. AUTHORIZE BOT - Set agent address (SIMULATED)
  const handleAuthorizeBot = async () => {
    setLoading('authorize');
    setError('');
    setSuccess('');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const agentWallet = new ethers.Contract(
        agentWalletAddress,
        CONTRACT_ABIS.AgentWallet,
        signer
      );

      const tx = await agentWallet.setAgent(DUMMY_BOT_ADDRESS);
      console.log('Authorization transaction sent:', tx.hash);
      await tx.wait();

      setSuccess('AI Co-Pilot authorized successfully!');
      setBotStatus('active');
    } catch (err: any) {
      console.error('Authorization failed:', err);
      setError('Authorization failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(null);
    }
  };

  // 3. REPAY DEBT - Agent pays off user's debt via AI Agent API
  const handleRepayDebt = async () => {
    if (userDebt <= 0) {
      setError('No debt to repay');
      return;
    }

    setLoading('repay');
    setError('');
    setSuccess('');
    setAgentResponse('');

    try {
      // Call the agent backend API
      const message = await runAgentStrategy(agentWalletAddress, userAddress);
      
      setAgentResponse(message);
      setSuccess(`AI Agent executed successfully and repaid your debt!`);
      
      // Refresh data after agent execution
      await loadUserDebt();
      await loadAgentData();
    } catch (err: any) {
      console.error('Agent execution failed:', err);
      
      // Better error handling for common issues
      let errorMsg = 'Agent execution failed: ';
      if (err.message?.includes('No agent wallet found')) {
        errorMsg += 'Please create an agent wallet first.';
      } else if (err.message?.includes('timeout')) {
        errorMsg += 'Request timed out. The agent may still be processing.';
      } else if (err.message?.includes('Exceeds spending cap')) {
        errorMsg += 'Transaction exceeds agent spending cap. Increase the cap in section 4 below.';
      } else if (err.message?.includes('insufficient funds')) {
        errorMsg += 'Insufficient agent wallet balance';
      } else {
        errorMsg += (err.message || 'Unknown error');
      }
      
      setError(errorMsg);
    } finally {
      setLoading(null);
    }
  };

  // 4. UPDATE SPENDING CAP - Increase agent's spending limit
  const handleUpdateSpendingCap = async () => {
    if (!newSpendingCap || Number(newSpendingCap) <= 0) {
      setError('Please enter a valid spending cap amount');
      return;
    }

    setLoading('updateCap');
    setError('');
    setSuccess('');

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const agentWallet = new ethers.Contract(
        agentWalletAddress,
        CONTRACT_ABIS.AgentWallet,
        signer
      );

      const newCap = ethers.parseUnits(newSpendingCap, 6); // USDC 6 decimals
      
      console.log('Updating spending cap to:', newSpendingCap);
      const tx = await agentWallet.updateSpendingCap(newCap);
      console.log('Update transaction sent:', tx.hash);
      await tx.wait();

      setSuccess(`Spending cap updated to $${newSpendingCap}!`);
      setNewSpendingCap('');
      await loadAgentData();
    } catch (err: any) {
      console.error('Update spending cap failed:', err);
      setError('Update failed: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-900/20 border border-red-500/50 rounded-xl flex items-start gap-2"
        >
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-400 text-sm">{error}</p>
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-900/20 border border-green-500/50 rounded-xl flex items-start gap-2"
        >
          <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
          <p className="text-green-400 text-sm">{success}</p>
        </motion.div>
      )}

      {/* 1. FUND AGENT */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-blue-900/20 to-cyan-900/20 p-6 rounded-xl border border-blue-500/30"
      >
        <div className="flex items-center gap-3 mb-4">
          <Fuel className="w-6 h-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-blue-300">1. Fund Agent (The Fuel)</h3>
        </div>

        <div className="space-y-4">
          <div className="bg-black/30 p-4 rounded-lg">
            <p className="text-sm text-[var(--color-text-dim)] mb-1">Current Agent Balance</p>
            <p className="text-2xl font-bold text-cyan-400">{Number(agentBalance).toFixed(4)} ETH</p>
          </div>

          <div>
            <label className="block text-sm text-[var(--color-text-dim)] mb-2">Deposit Amount (ETH)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                disabled={loading !== null}
                step="0.01"
                placeholder="0.1"
                className="flex-1 bg-black/30 border border-gray-600 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
              />
              <button
                onClick={handleFundAgent}
                disabled={loading !== null || !depositAmount}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                {loading === 'fund' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Depositing...
                  </>
                ) : (
                  'Deposit'
                )}
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 2. AUTHORIZE BOT (SIMULATED) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 p-6 rounded-xl border border-purple-500/30"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-purple-400" />
            <h3 className="text-xl font-semibold text-purple-300">2. Authorize Bot (The Driver)</h3>
          </div>
          <span className="text-xs bg-yellow-900/30 text-yellow-400 px-3 py-1 rounded-full border border-yellow-500/30">
            SIMULATED
          </span>
        </div>

        <div className="space-y-4">
          <div className="bg-black/30 p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--color-text-dim)] mb-1">AI Co-Pilot Status</p>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${botStatus === 'active' ? 'bg-green-500' : 'bg-gray-500'}`} />
                <p className="text-lg font-bold capitalize text-white">{botStatus}</p>
              </div>
            </div>
            {botStatus === 'inactive' && (
              <button
                onClick={handleAuthorizeBot}
                disabled={loading !== null}
                className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                {loading === 'authorize' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Authorizing...
                  </>
                ) : (
                  'Authorize AI Co-Pilot'
                )}
              </button>
            )}
          </div>

          <div className="bg-yellow-900/10 border border-yellow-500/20 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-300">
              This sets a dummy bot address ({DUMMY_BOT_ADDRESS.substring(0, 10)}...). Real AI integration coming soon.
            </p>
          </div>
        </div>
      </motion.div>

      {/* 3. REPAY DEBT */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 p-6 rounded-xl border border-green-500/30"
      >
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className="w-6 h-6 text-green-400" />
          <h3 className="text-xl font-semibold text-green-300">3. Repay Debt (The Goal)</h3>
        </div>

        <div className="space-y-4">
          <div className="bg-black/30 p-4 rounded-lg">
            <p className="text-sm text-[var(--color-text-dim)] mb-1">Your Current Debt</p>
            <p className="text-2xl font-bold text-yellow-400">${userDebt.toFixed(2)} USDC</p>
          </div>

          <button
            onClick={handleRepayDebt}
            disabled={loading !== null || userDebt <= 0}
            className="w-full px-6 py-4 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
          >
            {loading === 'repay' ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AI Agent Working... (may take 1-3 minutes)
              </>
            ) : userDebt > 0 ? (
              `🤖 Run Trade & Auto-Repay ($${userDebt.toFixed(2)})`
            ) : (
              'No Debt to Repay'
            )}
          </button>

          {/* Progress Info during execution */}
          {loading === 'repay' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 text-sm text-blue-300"
            >
              <p className="flex items-center gap-2">
                <Activity className="w-4 h-4 animate-pulse" />
                The agent is executing DeFi strategies on-chain. This involves multiple blockchain transactions and may take 1-3 minutes. Please be patient...
              </p>
            </motion.div>
          )}

          {/* Agent Response Display */}
          {agentResponse && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-[var(--card)]/50 rounded-lg p-4 border border-green-500/20"
            >
              <h4 className="text-sm font-semibold text-green-400 mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Agent Execution Summary:
              </h4>
              <div className="prose prose-invert prose-sm max-w-none">
                <div 
                  className="text-gray-300 text-sm whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: formatMarkdown(agentResponse) }}
                />
              </div>
            </motion.div>
          )}

          <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-blue-300">
              <strong>How it works:</strong> The AI agent will autonomously execute DeFi strategies
              (like yield farming on Aave) to generate profit, then automatically repay your debt using{' '}
              <code className="bg-black/30 px-1 rounded">repayCreditFor()</code> on FlexCreditCore.
            </p>
          </div>
        </div>
      </motion.div>

      {/* 4. UPDATE SPENDING CAP */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-orange-900/20 to-yellow-900/20 p-6 rounded-xl border border-orange-500/30"
      >
        <div className="flex items-center gap-3 mb-4">
          <Settings className="w-6 h-6 text-orange-400" />
          <h3 className="text-xl font-semibold text-orange-300">4. Update Spending Cap</h3>
        </div>

        <div className="space-y-4">
          <div className="bg-black/30 p-4 rounded-lg">
            <p className="text-sm text-[var(--color-text-dim)] mb-1">Current Spending Cap</p>
            <p className="text-2xl font-bold text-orange-400">${Number(spendingCap).toFixed(2)} USDC</p>
          </div>

          <div>
            <label className="block text-sm text-[var(--color-text-dim)] mb-2">New Spending Cap (USDC)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={newSpendingCap}
                onChange={(e) => setNewSpendingCap(e.target.value)}
                disabled={loading !== null}
                step="100"
                placeholder="10000"
                className="flex-1 bg-black/30 border border-gray-600 rounded-lg p-3 text-white focus:border-orange-500 focus:outline-none transition-colors"
              />
              <button
                onClick={handleUpdateSpendingCap}
                disabled={loading !== null || !newSpendingCap}
                className="px-6 py-3 bg-orange-600 hover:bg-orange-500 disabled:bg-gray-600 rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                {loading === 'updateCap' ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update Cap'
                )}
              </button>
            </div>
          </div>

          <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-blue-300">
              <strong>Note:</strong> Increase this if you see "Exceeds spending cap" errors. 
              This limits how much the agent can spend per transaction.
            </p>
          </div>
        </div>
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
