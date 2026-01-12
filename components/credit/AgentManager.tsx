'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bot, 
  TrendingUp, 
  Shield, 
  Zap,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { 
  applyIncomeScore, 
  applyAgentPerformance,
  getAgentRisk,
  isAuthorizedVerifier
} from '@/lib/contract';
import { ethers } from 'ethers';

export default function AgentManager() {
  const { wallet } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [isVerifier, setIsVerifier] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(false);
  
  // Income Score Form
  const [targetAddress, setTargetAddress] = useState('');
  const [incomeBucket, setIncomeBucket] = useState('1');
  
  // Agent Performance Form
  const [agentTargetAddress, setAgentTargetAddress] = useState('');
  const [agentId, setAgentId] = useState('');
  const [pnlBucket, setPnlBucket] = useState('0');
  
  // Agent Risk Query
  const [riskQueryAddress, setRiskQueryAddress] = useState('');
  const [riskQueryAgentId, setRiskQueryAgentId] = useState('');
  const [agentRiskScore, setAgentRiskScore] = useState<string | null>(null);
  
  const [txStatus, setTxStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  // Check if current wallet is authorized verifier
  const checkAuthorization = async () => {
    if (!wallet.address) return;
    
    try {
      setCheckingAuth(true);
      const authorized = await isAuthorizedVerifier(wallet.address);
      setIsVerifier(authorized);
      
      if (!authorized) {
        setTxStatus({
          type: 'info',
          message: 'Your wallet is not authorized as a verifier. Some functions are restricted.'
        });
      }
    } catch (error) {
      console.error('Error checking authorization:', error);
    } finally {
      setCheckingAuth(false);
    }
  };

  // Handle apply income score
  const handleApplyIncomeScore = async () => {
    if (!targetAddress || !ethers.isAddress(targetAddress)) {
      setTxStatus({ type: 'error', message: 'Please enter a valid address' });
      return;
    }

    try {
      setLoading(true);
      setTxStatus({ type: null, message: '' });
      
      const txHash = await applyIncomeScore(targetAddress, parseInt(incomeBucket));
      
      setTxStatus({
        type: 'success',
        message: `Income score applied! Tx: ${txHash.substring(0, 10)}...`
      });
      
      setTargetAddress('');
      setIncomeBucket('1');
    } catch (error: any) {
      setTxStatus({
        type: 'error',
        message: error.message || 'Transaction failed'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle apply agent performance
  const handleApplyAgentPerformance = async () => {
    if (!agentTargetAddress || !ethers.isAddress(agentTargetAddress)) {
      setTxStatus({ type: 'error', message: 'Please enter a valid address' });
      return;
    }
    
    if (!agentId) {
      setTxStatus({ type: 'error', message: 'Please enter an agent ID' });
      return;
    }

    try {
      setLoading(true);
      setTxStatus({ type: null, message: '' });
      
      // Convert agent ID to bytes32
      const agentIdBytes32 = ethers.id(agentId);
      
      const txHash = await applyAgentPerformance(
        agentTargetAddress,
        agentIdBytes32,
        parseInt(pnlBucket)
      );
      
      setTxStatus({
        type: 'success',
        message: `Agent performance applied! Tx: ${txHash.substring(0, 10)}...`
      });
      
      setAgentTargetAddress('');
      setAgentId('');
      setPnlBucket('0');
    } catch (error: any) {
      setTxStatus({
        type: 'error',
        message: error.message || 'Transaction failed'
      });
    } finally {
      setLoading(false);
    }
  };

  // Query agent risk
  const handleQueryAgentRisk = async () => {
    if (!riskQueryAddress || !ethers.isAddress(riskQueryAddress)) {
      setTxStatus({ type: 'error', message: 'Please enter a valid address' });
      return;
    }
    
    if (!riskQueryAgentId) {
      setTxStatus({ type: 'error', message: 'Please enter an agent ID' });
      return;
    }

    try {
      setLoading(true);
      setTxStatus({ type: null, message: '' });
      
      const agentIdBytes32 = ethers.id(riskQueryAgentId);
      const risk = await getAgentRisk(riskQueryAddress, agentIdBytes32);
      
      setAgentRiskScore(risk);
      setTxStatus({
        type: 'success',
        message: 'Agent risk score retrieved successfully'
      });
    } catch (error: any) {
      setTxStatus({
        type: 'error',
        message: error.message || 'Query failed'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!wallet.connected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Bot className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-dim)]" />
          <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-[var(--color-text-dim)]">Please connect your wallet to manage agents</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
            Agent Manager
          </h2>
          <p className="text-[var(--color-text-dim)] mt-1">Manage income scores and agent performance</p>
        </div>
        <button
          onClick={checkAuthorization}
          disabled={checkingAuth}
          className="px-4 py-2 bg-blue-500/10 hover:bg-blue-500/20 rounded-xl transition-all duration-300 border border-blue-500/20 flex items-center gap-2"
        >
          <Shield className={`w-5 h-5 text-blue-400 ${checkingAuth ? 'animate-pulse' : ''}`} />
          {isVerifier ? 'Authorized Verifier' : 'Check Authorization'}
        </button>
      </div>

      {/* Transaction Status */}
      {txStatus.type && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-xl border ${
            txStatus.type === 'success' 
              ? 'bg-green-500/10 border-green-500/30 text-green-400' 
              : txStatus.type === 'info'
              ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
              : 'bg-red-500/10 border-red-500/30 text-red-400'
          }`}
        >
          <div className="flex items-center gap-2">
            {txStatus.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : txStatus.type === 'info' ? (
              <Info className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{txStatus.message}</span>
          </div>
        </motion.div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Apply Income Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30"
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-400" />
            Apply Income Score
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--color-text-dim)] mb-2">User Address</label>
              <input
                type="text"
                value={targetAddress}
                onChange={(e) => setTargetAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-[var(--card)]/50 border border-[var(--color-accent)]/20 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm text-[var(--color-text-dim)] mb-2">Income Bucket (0-5)</label>
              <select
                value={incomeBucket}
                onChange={(e) => setIncomeBucket(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--card)]/50 border border-[var(--color-accent)]/20 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
              >
                <option value="0">0 - No Income</option>
                <option value="1">1 - Low Income</option>
                <option value="2">2 - Medium Income</option>
                <option value="3">3 - Good Income</option>
                <option value="4">4 - High Income</option>
                <option value="5">5 - Very High Income</option>
              </select>
            </div>
            
            <button
              onClick={handleApplyIncomeScore}
              disabled={loading || !isVerifier}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Apply Income Score
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Apply Agent Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-xl rounded-2xl p-6 border border-blue-500/30"
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-400" />
            Apply Agent Performance
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-[var(--color-text-dim)] mb-2">User Address</label>
              <input
                type="text"
                value={agentTargetAddress}
                onChange={(e) => setAgentTargetAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-[var(--card)]/50 border border-[var(--color-accent)]/20 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm text-[var(--color-text-dim)] mb-2">Agent ID</label>
              <input
                type="text"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                placeholder="agent-001"
                className="w-full px-4 py-3 bg-[var(--card)]/50 border border-[var(--color-accent)]/20 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm text-[var(--color-text-dim)] mb-2">PnL Bucket (-5 to 5)</label>
              <select
                value={pnlBucket}
                onChange={(e) => setPnlBucket(e.target.value)}
                className="w-full px-4 py-3 bg-[var(--card)]/50 border border-[var(--color-accent)]/20 rounded-xl focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="-5">-5 - Heavy Loss</option>
                <option value="-4">-4 - Large Loss</option>
                <option value="-3">-3 - Moderate Loss</option>
                <option value="-2">-2 - Small Loss</option>
                <option value="-1">-1 - Minor Loss</option>
                <option value="0">0 - Break Even</option>
                <option value="1">1 - Minor Profit</option>
                <option value="2">2 - Small Profit</option>
                <option value="3">3 - Moderate Profit</option>
                <option value="4">4 - Large Profit</option>
                <option value="5">5 - Heavy Profit</option>
              </select>
            </div>
            
            <button
              onClick={handleApplyAgentPerformance}
              disabled={loading || !isVerifier}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Apply Performance
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Query Agent Risk */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30 lg:col-span-2"
        >
          <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-green-400" />
            Query Agent Risk Score
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-[var(--color-text-dim)] mb-2">User Address</label>
              <input
                type="text"
                value={riskQueryAddress}
                onChange={(e) => setRiskQueryAddress(e.target.value)}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-[var(--card)]/50 border border-[var(--color-accent)]/20 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
            
            <div>
              <label className="block text-sm text-[var(--color-text-dim)] mb-2">Agent ID</label>
              <input
                type="text"
                value={riskQueryAgentId}
                onChange={(e) => setRiskQueryAgentId(e.target.value)}
                placeholder="agent-001"
                className="w-full px-4 py-3 bg-[var(--card)]/50 border border-[var(--color-accent)]/20 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={handleQueryAgentRisk}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'Query Risk'
                )}
              </button>
            </div>
          </div>
          
          {agentRiskScore !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-4 p-4 bg-green-500/10 border border-green-500/30 rounded-xl"
            >
              <p className="text-sm text-[var(--color-text-dim)] mb-1">Agent Risk Score</p>
              <p className="text-3xl font-bold text-green-400">{agentRiskScore}</p>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4"
      >
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-semibold text-blue-400 mb-1">Authorization Required</p>
            <p>Only authorized verifiers can apply income scores and agent performance. Contact the contract owner to get authorized.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
