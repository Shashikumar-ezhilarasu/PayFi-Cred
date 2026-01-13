'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign, 
  TrendingUp, 
  Shield, 
  CheckCircle,
  AlertCircle,
  Loader2,
  Plus,
  Trash2,
  ExternalLink
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { 
  getCreditInfo,
  submitIncomeProof
} from '@/lib/payfi-contracts';
import { generateMockVlayerProof, calculateIncomeBucket } from '@/lib/vlayer-mock';

interface IncomeSource {
  id: string;
  name: string;
  type: 'payroll' | 'grant' | 'stream' | 'contribution' | 'other';
  tokenAddress: string;
  amount: string;
  verified: boolean;
}

export default function IncomeVerification() {
  const { wallet } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [monthlyIncome, setMonthlyIncome] = useState<string>('0');
  const [creditLimit, setCreditLimit] = useState<string>('0');
  const [lastVerified, setLastVerified] = useState<string>('');
  
  // Add income source form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSource, setNewSource] = useState({
    name: '',
    type: 'payroll' as const,
    tokenAddress: '',
    amount: ''
  });

  const [txStatus, setTxStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  // Fetch income data from blockchain
  const fetchIncomeData = async () => {
    if (!wallet.address) return;
    
    try {
      setLoading(true);
      const data = await getCreditInfo(wallet.address);
      
      // Convert from wei (6 decimals for USDC)
      const limitSHM = Number(data.limit) / 1e18; // SHM uses 18 decimals
      const incomeScore = Number(data.income);
      
      setMonthlyIncome(incomeScore.toString());
      setCreditLimit(limitUSDC.toFixed(2));
      setLastVerified(new Date().toLocaleDateString());
      
      // Note: Income sources are not stored on-chain in current implementation
      // This would require additional contract functions
    } catch (error) {
      console.error('Error fetching income data:', error);
      setTxStatus({
        type: 'error',
        message: 'Failed to load data from blockchain. Make sure contracts are deployed.'
      });
    } finally {
      setLoading(false);
    }
  };

  // Add income source (local only - not on-chain in current implementation)
  const handleAddSource = async () => {
    if (!wallet.address || !newSource.name || !newSource.tokenAddress) {
      setTxStatus({ type: 'error', message: 'Please fill all fields' });
      return;
    }

    try {
      setLoading(true);
      setTxStatus({ type: null, message: '' });
      
      // Note: Current smart contracts don't have registerIncomeSource function
      // This is stored locally for UI purposes only
      // In production, you would add this function to your smart contracts
      
      setTxStatus({
        type: 'info',
        message: 'Income source added locally. Use "Verify Income" to update on-chain.'
      });
      
      // Add to local state
      const source: IncomeSource = {
        id: `source-${Date.now()}`,
        ...newSource,
        verified: false
      };
      setIncomeSources([...incomeSources, source]);
      
      // Reset form
      setNewSource({
        name: '',
        type: 'payroll',
        tokenAddress: '',
        amount: ''
      });
      setShowAddForm(false);
    } catch (error: any) {
      setTxStatus({
        type: 'error',
        message: error.message || 'Failed to add income source'
      });
    } finally {
      setLoading(false);
    }
  };

  // Verify income with Vlayer proof
  const handleVerifyIncome = async () => {
    if (!wallet.address) return;

    try {
      setLoading(true);
      setTxStatus({ type: 'info', message: 'Generating Vlayer proof...' });
      
      // Calculate total monthly income from sources
      const totalIncome = incomeSources.reduce((sum, source) => {
        return sum + (Number(source.amount) || 0);
      }, 0);
      
      // Step 1: Generate Vlayer proof (MOCKED)
      const proofHash = generateMockVlayerProof(wallet.address, totalIncome);
      const incomeBucket = calculateIncomeBucket(totalIncome);
      
      setTxStatus({ type: 'info', message: 'Submitting to blockchain...' });
      
      // Step 2: Submit to REAL smart contract
      const txHash = await submitIncomeProof(wallet.address, incomeBucket, proofHash);
      
      setTxStatus({
        type: 'success',
        message: `Income verified! Tx: ${txHash.substring(0, 10)}...`
      });
      
      // Refresh data from blockchain
      setTimeout(() => fetchIncomeData(), 2000);
    } catch (error: any) {
      setTxStatus({
        type: 'error',
        message: error.message || 'Verification failed'
      });
    } finally {
      setLoading(false);
    }
  };

  // Remove income source
  const handleRemoveSource = (id: string) => {
    setIncomeSources(incomeSources.filter(source => source.id !== id));
  };

  if (!wallet.connected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <DollarSign className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-dim)]" />
          <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-[var(--color-text-dim)]">Please connect your wallet to verify income</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
            Income Verification
          </h2>
          <p className="text-[var(--color-text-dim)] mt-1">Connect income sources and verify with Vlayer</p>
        </div>
        <button
          onClick={fetchIncomeData}
          disabled={loading}
          className="px-4 py-2 bg-green-500/10 hover:bg-green-500/20 rounded-xl transition-all duration-300 border border-green-500/20 flex items-center gap-2"
        >
          <Shield className={`w-5 h-5 text-green-400 ${loading ? 'animate-pulse' : ''}`} />
          Refresh Data
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
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{txStatus.message}</span>
          </div>
        </motion.div>
      )}

      {/* Income Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={<DollarSign className="w-6 h-6" />}
          label="Monthly Income"
          value={monthlyIncome}
          suffix="USDC"
          color="green"
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Credit Limit"
          value={creditLimit}
          suffix="USDC"
          color="blue"
        />
        <StatCard
          icon={<Shield className="w-6 h-6" />}
          label="Last Verified"
          value={lastVerified || 'Not verified'}
          color="purple"
        />
      </div>

      {/* Income Sources */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-[var(--color-accent)]/20/50"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold">Income Sources</h3>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-xl font-semibold transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Source
          </button>
        </div>

        {/* Add Source Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 p-4 bg-[var(--card)]/50 rounded-xl border border-[var(--color-accent)]/20"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-[var(--color-text-dim)] mb-2">Source Name</label>
                <input
                  type="text"
                  value={newSource.name}
                  onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                  placeholder="e.g., Gitcoin Grant"
                  className="w-full px-4 py-3 bg-[var(--card)]/50 border border-[var(--color-accent)]/20 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm text-[var(--color-text-dim)] mb-2">Type</label>
                <select
                  value={newSource.type}
                  onChange={(e) => setNewSource({ ...newSource, type: e.target.value as any })}
                  className="w-full px-4 py-3 bg-[var(--card)]/50 border border-[var(--color-accent)]/20 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
                >
                  <option value="payroll">Payroll</option>
                  <option value="grant">Grant</option>
                  <option value="stream">Stream</option>
                  <option value="contribution">Contribution</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-[var(--color-text-dim)] mb-2">Token Address (USDC)</label>
                <input
                  type="text"
                  value={newSource.tokenAddress}
                  onChange={(e) => setNewSource({ ...newSource, tokenAddress: e.target.value })}
                  placeholder="0x..."
                  className="w-full px-4 py-3 bg-[var(--card)]/50 border border-[var(--color-accent)]/20 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm text-[var(--color-text-dim)] mb-2">Expected Monthly Amount</label>
                <input
                  type="number"
                  value={newSource.amount}
                  onChange={(e) => setNewSource({ ...newSource, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-3 bg-[var(--card)]/50 border border-[var(--color-accent)]/20 rounded-xl focus:outline-none focus:border-green-500 transition-colors"
                />
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleAddSource}
                disabled={loading}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded-xl font-semibold transition-all"
              >
                {loading ? 'Adding...' : 'Add Source'}
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="px-6 py-2 bg-[var(--card)] hover:bg-gray-600 rounded-xl font-semibold transition-all"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {/* Sources List */}
        <div className="space-y-3">
          {incomeSources.length === 0 ? (
            <div className="text-center py-8 text-[var(--color-text-dim)]">
              No income sources registered yet. Add your first source to get started!
            </div>
          ) : (
            incomeSources.map((source) => (
              <motion.div
                key={source.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-4 bg-[var(--card)]/30 rounded-xl border border-[var(--color-accent)]/20/50 hover:border-green-500/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${
                    source.verified 
                      ? 'bg-green-500/20 border border-green-500/30' 
                      : 'bg-[var(--card)]/50 border border-gray-600'
                  }`}>
                    <DollarSign className={`w-5 h-5 ${source.verified ? 'text-green-400' : 'text-[var(--color-text-dim)]'}`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold">{source.name}</h4>
                      {source.verified && (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                    </div>
                    <p className="text-sm text-[var(--color-text-dim)]">
                      {source.type.charAt(0).toUpperCase() + source.type.slice(1)} • {source.amount} USDC/month
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveSource(source.id)}
                  className="p-2 hover:bg-red-500/20 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-red-400" />
                </button>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Verify Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-xl rounded-2xl p-6 border border-green-500/30"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 bg-green-500/20 rounded-xl">
            <Shield className="w-6 h-6 text-green-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-2">Verify Income with Vlayer</h3>
            <p className="text-sm text-[var(--color-text-dim)] mb-4">
              Generate a cryptographic proof of your income sources using Vlayer's web proof stack. 
              This will calculate your credit limit based on verified cashflow.
            </p>
            <button
              onClick={handleVerifyIncome}
              disabled={loading || incomeSources.length === 0}
              className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold transition-all flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Proof...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Verify Income
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4"
      >
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-semibold text-blue-400 mb-1">How Income Verification Works</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Register your stablecoin income sources (payroll, grants, streams)</li>
              <li>Vlayer generates a cryptographic proof of your income history</li>
              <li>Smart contract calculates your credit limit based on cashflow</li>
              <li>Credit is automatically adjusted as your income changes</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  suffix?: string;
  color: 'green' | 'blue' | 'purple';
}

function StatCard({ icon, label, value, suffix, color }: StatCardProps) {
  const colorClasses = {
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400',
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-xl rounded-2xl p-6 border`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 bg-gradient-to-br ${colorClasses[color]} rounded-xl`}>
          {icon}
        </div>
      </div>
      <p className="text-[var(--color-text-dim)] text-sm mb-1">{label}</p>
      <p className="text-2xl font-bold">
        {value} {suffix && <span className="text-sm text-[var(--color-text-dim)]">{suffix}</span>}
      </p>
    </motion.div>
  );
}
