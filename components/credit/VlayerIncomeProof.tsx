'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  DollarSign,
  TrendingUp,
  Sparkles,
  FileCheck,
  Clock,
  Zap
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { 
  submitIncomeProofSimplified,
  isProofProcessed,
  getCreditCoreAddress,
  listenToIncomeProofSubmitted,
  listenToIncomeProofVerified,
  INCOME_BUCKETS,
  getIncomeBucketLabel,
  getIncomeBucketColor,
  type IncomeBucket
} from '@/lib/income-proof-verifier';
import { getCreditInfo } from '@/lib/contract';

interface ProofStatus {
  submitted: boolean;
  verified: boolean;
  proofHash?: string;
  txHash?: string;
  timestamp?: number;
  newCreditLimit?: string;
}

export default function VlayerIncomeProof() {
  const { wallet } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [selectedBucket, setSelectedBucket] = useState<IncomeBucket>(INCOME_BUCKETS.MEDIUM);
  const [proofStatus, setProofStatus] = useState<ProofStatus>({
    submitted: false,
    verified: false
  });
  const [creditInfo, setCreditInfo] = useState<any>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const [txStatus, setTxStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  // Fetch credit info
  const fetchCreditInfo = async () => {
    if (!wallet.address) return;
    
    try {
      const info = await getCreditInfo(wallet.address);
      setCreditInfo(info);
    } catch (error) {
      console.error('Error fetching credit info:', error);
    }
  };

  // Set up event listeners
  useEffect(() => {
    if (!wallet.address) return;

    const handleProofSubmitted = (user: string, incomeBucket: number, proofHash: string, timestamp: number) => {
      if (user.toLowerCase() === wallet.address?.toLowerCase()) {
        setProofStatus(prev => ({
          ...prev,
          submitted: true,
          proofHash,
          timestamp
        }));
        setTxStatus({
          type: 'info',
          message: 'Proof submitted! Waiting for verification...'
        });
      }
    };

    const handleProofVerified = (user: string, incomeBucket: number, newCreditLimit: string) => {
      if (user.toLowerCase() === wallet.address?.toLowerCase()) {
        setProofStatus(prev => ({
          ...prev,
          verified: true,
          newCreditLimit
        }));
        setShowSuccess(true);
        setTxStatus({
          type: 'success',
          message: `Income verified! New credit limit: ${(parseInt(newCreditLimit) / 1e18).toFixed(2)} ETH`
        });
        
        // Refresh credit info
        setTimeout(() => fetchCreditInfo(), 2000);
      }
    };

    listenToIncomeProofSubmitted(handleProofSubmitted);
    listenToIncomeProofVerified(handleProofVerified);

    return () => {
      // Cleanup listeners
    };
  }, [wallet.address]);

  // Initial fetch
  useEffect(() => {
    if (wallet.address) {
      fetchCreditInfo();
    }
  }, [wallet.address]);

  // Handle proof submission
  const handleSubmitProof = async () => {
    if (!wallet.address) return;

    try {
      setLoading(true);
      setTxStatus({ type: 'info', message: 'Generating income proof...' });
      
      // Submit simplified proof
      const result = await submitIncomeProofSimplified(wallet.address, selectedBucket);
      
      setProofStatus({
        submitted: true,
        verified: false,
        proofHash: result.proofHash,
        txHash: result.txHash,
        timestamp: Math.floor(Date.now() / 1000)
      });
      
      setTxStatus({
        type: 'info',
        message: `Proof submitted! Tx: ${result.txHash.substring(0, 10)}... Waiting for verification...`
      });
      
    } catch (error: any) {
      setTxStatus({
        type: 'error',
        message: error.message || 'Failed to submit proof'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!wallet.connected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-dim)]" />
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
            Vlayer Income Verification
          </h2>
          <p className="text-[var(--color-text-dim)] mt-1">Submit cryptographic proof of your income</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-sm text-green-400">Vlayer Powered</span>
        </div>
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

      {/* Success Animation */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-xl rounded-2xl p-8 border border-green-500/30 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <CheckCircle className="w-20 h-20 mx-auto mb-4 text-green-400" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-2 text-green-400">Income Verified!</h3>
            <p className="text-gray-300 mb-4">
              Your income proof has been verified on-chain
            </p>
            {proofStatus.newCreditLimit && (
              <div className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                New Credit Limit: {(parseInt(proofStatus.newCreditLimit) / 1e18).toFixed(4)} ETH
              </div>
            )}
            <button
              onClick={() => setShowSuccess(false)}
              className="mt-6 px-6 py-2 bg-green-600 hover:bg-green-700 rounded-xl font-semibold transition-all"
            >
              Continue
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current Credit Info */}
      {creditInfo && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            icon={<DollarSign className="w-6 h-6" />}
            label="Income Score"
            value={creditInfo.income}
            color="blue"
          />
          <StatCard
            icon={<TrendingUp className="w-6 h-6" />}
            label="Credit Limit"
            value={(parseInt(creditInfo.limit) / 1e18).toFixed(4)}
            suffix="ETH"
            color="purple"
          />
          <StatCard
            icon={<Shield className="w-6 h-6" />}
            label="Used Credit"
            value={(parseInt(creditInfo.used) / 1e18).toFixed(4)}
            suffix="ETH"
            color="pink"
          />
          <StatCard
            icon={<Sparkles className="w-6 h-6" />}
            label="Available"
            value={(parseInt(creditInfo.available) / 1e18).toFixed(4)}
            suffix="ETH"
            color="green"
          />
        </div>
      )}

      {/* Income Bucket Selection */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-[var(--color-accent)]/20/50"
      >
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          Select Your Income Level
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(INCOME_BUCKETS).map(([key, value]) => {
            const isSelected = selectedBucket === value;
            const color = getIncomeBucketColor(value);
            
            return (
              <motion.button
                key={key}
                onClick={() => setSelectedBucket(value)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`p-6 rounded-xl border-2 transition-all text-left ${
                  isSelected
                    ? `bg-${color}-500/20 border-${color}-500 shadow-lg shadow-${color}-500/20`
                    : 'bg-[var(--card)]/30 border-[var(--color-accent)]/20 hover:border-gray-600'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-3 rounded-lg ${
                    isSelected ? `bg-${color}-500/30` : 'bg-[var(--card)]'
                  }`}>
                    <DollarSign className={`w-6 h-6 ${
                      isSelected ? `text-${color}-400` : 'text-[var(--color-text-dim)]'
                    }`} />
                  </div>
                  {isSelected && (
                    <CheckCircle className={`w-6 h-6 text-${color}-400`} />
                  )}
                </div>
                <h4 className="font-semibold mb-1">{getIncomeBucketLabel(value)}</h4>
                <p className="text-sm text-[var(--color-text-dim)]">
                  Bucket Value: {value === 0 ? 'None' : `$${value}`}
                </p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Proof Submission */}
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
            <h3 className="text-lg font-semibold mb-2">Submit Income Proof</h3>
            <p className="text-sm text-[var(--color-text-dim)] mb-4">
              Generate a cryptographic proof of your income level using Vlayer's verification system. 
              This proof will be verified on-chain and update your credit limit automatically.
            </p>
            
            {/* Proof Status */}
            {proofStatus.submitted && (
              <div className="mb-4 p-4 bg-[var(--card)]/50 rounded-xl border border-[var(--color-accent)]/20">
                <div className="flex items-center gap-2 mb-2">
                  <FileCheck className="w-5 h-5 text-blue-400" />
                  <span className="font-semibold">Proof Status</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-dim)]">Submitted:</span>
                    <span className="text-green-400 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Yes
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[var(--color-text-dim)]">Verified:</span>
                    <span className={proofStatus.verified ? 'text-green-400' : 'text-yellow-400'}>
                      {proofStatus.verified ? (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Yes
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4 animate-pulse" />
                          Pending
                        </span>
                      )}
                    </span>
                  </div>
                  {proofStatus.proofHash && (
                    <div className="flex items-center justify-between">
                      <span className="text-[var(--color-text-dim)]">Proof Hash:</span>
                      <code className="text-xs text-purple-400">
                        {proofStatus.proofHash.substring(0, 10)}...
                      </code>
                    </div>
                  )}
                </div>
              </div>
            )}
            
            <button
              onClick={handleSubmitProof}
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Proof...
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  Submit Income Proof
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* How It Works */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6"
      >
        <h3 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          How Vlayer Verification Works
        </h3>
        <div className="space-y-3 text-sm text-gray-300">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-400">1</span>
            </div>
            <p>Select your income level from the buckets above</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-400">2</span>
            </div>
            <p>Click "Submit Income Proof" to generate a cryptographic proof</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-400">3</span>
            </div>
            <p>The proof is verified on-chain by the IncomeProofVerifier contract</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-blue-400">4</span>
            </div>
            <p>Your credit limit is automatically updated based on verified income</p>
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
  color: 'blue' | 'purple' | 'pink' | 'green';
}

function StatCard({ icon, label, value, suffix, color }: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400',
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
    pink: 'from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-400',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400',
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
