'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { ArrowLeft, Loader2, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ethers } from 'ethers';
import { getCreditInfo } from '@/lib/payfi-contracts';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '@/lib/web3-config';

export default function RepaymentPage() {
  const { wallet, creditData, refreshCreditData } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<'idle' | 'withdrawing' | 'repaying' | 'success'>('idle');
  const [error, setError] = useState('');
  const [repayAmount, setRepayAmount] = useState('');
  const [currentDebt, setCurrentDebt] = useState(0);

  // Load real debt from blockchain
  useEffect(() => {
    const loadDebt = async () => {
      if (!wallet.address) return;
      try {
        const info = await getCreditInfo(wallet.address);
        const debt = Number(info.used) / 1e6; // Convert from 6 decimals (USDC)
        setCurrentDebt(debt);
        setRepayAmount(debt.toString()); // Default to full repayment
      } catch (err) {
        console.error('Error loading debt:', err);
      }
    };
    loadDebt();
  }, [wallet.address]);

  const handleRepayment = async () => {
    if (!wallet.address || !repayAmount || Number(repayAmount) <= 0) {
      setError('Invalid repayment amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const amountInWei = ethers.parseUnits(repayAmount, 6); // USDC has 6 decimals
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      // STEP 1: Withdraw from AgentWallet (if user has one)
      // For now, we'll skip this step if AgentWallet is not deployed
      // In production, you would check if AgentWallet exists and withdraw from it
      const hasAgentWallet = CONTRACT_ADDRESSES.AgentWallet && CONTRACT_ADDRESSES.AgentWallet !== '';
      
      if (hasAgentWallet) {
        setCurrentStep('withdrawing');
        console.log('🏦 Step 1: Withdrawing from Agent Wallet...');
        
        const agentWallet = new ethers.Contract(
          CONTRACT_ADDRESSES.AgentWallet,
          CONTRACT_ABIS.AgentWallet,
          signer
        );

        // Execute withdrawal: transfer USDC from AgentWallet to user
        // executeAction(target, value, data)
        // For ERC20 transfer, we need to encode the transfer call
        // This is simplified - in production you'd get the USDC contract address
        // and encode a proper transfer call
        const withdrawTx = await agentWallet.executeAction(
          wallet.address, // target: send to user
          amountInWei, // value/amount
          '0x' // data: empty for ETH transfer, or encoded for ERC20
        );
        
        console.log('⏳ Waiting for withdrawal confirmation...');
        await withdrawTx.wait();
        console.log('✅ Withdrawal complete:', withdrawTx.hash);
      }

      // STEP 2: Repay Credit via FlexCreditCore
      setCurrentStep('repaying');
      console.log('💳 Step 2: Settling debt with FlexCreditCore...');

      const flexCreditCore = new ethers.Contract(
        CONTRACT_ADDRESSES.FlexCreditCore,
        CONTRACT_ABIS.FlexCreditCore,
        signer
      );

      // CRITICAL: repayCredit is payable and requires msg.value == amount
      // We must send ETH with the transaction using {value: amountInWei}
      const repayTx = await flexCreditCore.repayCredit(amountInWei, {
        value: amountInWei // Send ETH with the transaction
      });
      
      console.log('⏳ Waiting for repayment confirmation...');
      await repayTx.wait();
      console.log('✅ Repayment complete:', repayTx.hash);

      // Success!
      setCurrentStep('success');
      
      // Refresh credit data from blockchain
      await refreshCreditData();
      
      // Reload debt
      const info = await getCreditInfo(wallet.address);
      const newDebt = Number(info.used) / 1e6;
      setCurrentDebt(newDebt);
      
    } catch (err: any) {
      console.error('❌ Repayment failed:', err);
      
      let errorMessage = 'Repayment failed: ';
      if (err.message?.includes('user rejected')) {
        errorMessage += 'Transaction rejected by user';
      } else if (err.message?.includes('insufficient funds')) {
        errorMessage += 'Insufficient funds for repayment or gas';
      } else if (err.reason) {
        errorMessage += err.reason;
      } else {
        errorMessage += err.message || 'Unknown error';
      }
      
      setError(errorMessage);
      setCurrentStep('idle');
    } finally {
      setLoading(false);
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
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/dashboard"
            className="p-2 hover:bg-green-600/10 rounded-lg transition-colors border border-green-500/20"
          >
            <ArrowLeft size={24} className="text-green-400" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent">
              Repayment Center
            </h1>
            <p className="text-[var(--color-text-dim)] mt-1">
              Repay your borrowed credit
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-6 p-4 bg-red-900/20 border border-red-500/50 rounded-xl">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {/* Current Debt Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-green-900/20 to-cyan-900/20 p-6 rounded-xl border border-green-500/30 mb-6"
        >
          <h2 className="text-sm text-[var(--color-text-dim)] mb-2">Current Debt</h2>
          <p className="text-4xl font-bold text-green-400 mb-4">
            ${currentDebt.toFixed(2)} USDC
          </p>
          
          {currentDebt === 0 ? (
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle2 size={20} />
              <span>No outstanding debt! You're all clear.</span>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--color-text-dim)] mb-2">
                  Repayment Amount (USDC)
                </label>
                <input
                  type="number"
                  value={repayAmount}
                  onChange={(e) => setRepayAmount(e.target.value)}
                  max={currentDebt}
                  step="0.01"
                  disabled={loading}
                  className="w-full bg-black/30 border border-gray-600 rounded-lg p-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                  placeholder="Enter amount to repay"
                />
                <button
                  onClick={() => setRepayAmount(currentDebt.toString())}
                  className="mt-2 text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  Repay Full Amount
                </button>
              </div>

              <button
                onClick={handleRepayment}
                disabled={loading || !repayAmount || Number(repayAmount) <= 0}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-cyan-600 hover:from-green-500 hover:to-cyan-500 disabled:from-gray-600 disabled:to-gray-600 rounded-lg font-semibold transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    {currentStep === 'withdrawing' && 'Withdrawing from Agent Account...'}
                    {currentStep === 'repaying' && 'Settling Debt Protocol...'}
                  </>
                ) : (
                  'Repay Credit'
                )}
              </button>
            </div>
          )}
        </motion.div>

        {/* Success Message */}
        {currentStep === 'success' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 p-6 rounded-xl border border-green-500/50 text-center"
          >
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 text-green-400" />
            <h3 className="text-2xl font-bold text-green-400 mb-2">
              Repayment Successful!
            </h3>
            <p className="text-gray-300 mb-4">
              Your debt has been settled on-chain.
            </p>
            {creditData && (
              <div className="grid grid-cols-2 gap-4 bg-black/30 p-4 rounded-lg">
                <div>
                  <p className="text-xs text-[var(--color-text-dim)]">New Available Credit</p>
                  <p className="text-lg font-bold text-cyan-400">
                    ${creditData.availableBalance.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[var(--color-text-dim)]">Credit Score</p>
                  <p className="text-lg font-bold text-green-400">
                    {creditData.creditScore}
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-8 bg-blue-900/10 border border-blue-500/30 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold text-blue-400 mb-3">
            How Repayment Works
          </h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>
                <strong>Step 1 (if applicable):</strong> Funds are withdrawn from your Agent Wallet to your personal wallet
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>
                <strong>Step 2:</strong> The FlexCreditCore contract settles your debt and updates your credit limit
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-400 mt-1">•</span>
              <span>
                <strong>On-Time:</strong> Repaying on time can increase your credit score and unlock higher limits
              </span>
            </li>
          </ul>
        </motion.div>
      </div>
    </div>
  );
}
