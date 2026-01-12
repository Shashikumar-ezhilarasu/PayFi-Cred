'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';
import { 
  MERCHANTS, 
  createPaymentRequest, 
  generateRandomPaymentRequest,
  getCategoryEmoji,
  type PaymentRequest,
  type Merchant 
} from '@/lib/payment-requests';
import { evaluateSpendingIntent, recordSpending } from '@/lib/agent-policy';
import { Zap, CheckCircle, XCircle, Clock, Loader2, AlertCircle, Wallet, Plus, CheckCircle2, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function PaymentRequestsPage() {
  const { wallet, creditData, agentPolicy, addTransaction } = useAppStore();
  
  // Initialize with empty array, populate in effect
  const [requests, setRequests] = useState<PaymentRequest[]>([]);
  const [processing, setProcessing] = useState<string | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [showUserRequestModal, setShowUserRequestModal] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Generate initial random requests
  useEffect(() => {
    if (!wallet.connected || !creditData || initialized) return;
    
    // Initialize with 3 random requests
    const initialRequests = [
      generateRandomPaymentRequest(),
      generateRandomPaymentRequest(),
      generateRandomPaymentRequest(),
    ];
    
    setRequests(initialRequests);
    setInitialized(true);
  }, [wallet.connected, creditData, initialized]);
  
  // Auto-generate new requests periodically
  useEffect(() => {
    if (!initialized) return;
    
    const interval = setInterval(() => {
      if (Math.random() > 0.5) { // 50% chance
        setRequests(prev => [...prev, generateRandomPaymentRequest()]);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [initialized]);

  const handleAgentDecision = async (request: PaymentRequest) => {
    if (!creditData || !agentPolicy) return;

    setProcessing(request.id);

    // Evaluate spending intent
    const decision = evaluateSpendingIntent(
      {
        amount: request.amount,
        category: request.merchantType,
        merchant: request.merchantName,
        description: request.description,
        timestamp: new Date().toISOString(),
      },
      creditData.availableBalance,
      agentPolicy
    );

    // Update request with decision
    setTimeout(() => {
      setRequests(prev => prev.map(req => {
        if (req.id === request.id) {
          const updatedRequest = {
            ...req,
            status: decision.approved ? 'approved' : 'rejected',
            agentDecision: {
              approved: decision.approved,
              reason: decision.reason,
              timestamp: new Date().toISOString(),
              categoryUsage: decision.categoryUsage,
              autoApproved: !decision.requiresManualApproval,
            },
          };

          // Save to localStorage if approved
          if (decision.approved) {
            try {
              const stored = localStorage.getItem('approved-payments');
              const approvedPayments = stored ? JSON.parse(stored) : [];
              
              // Generate unique ID for approved payment (different from request ID)
              const approvedPaymentId = `approved_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              
              const approvedPayment = {
                id: approvedPaymentId, // Use unique ID instead of req.id
                merchantName: req.merchantName,
                merchantType: req.merchantType,
                amount: req.amount,
                description: req.description,
                approvedAt: new Date().toISOString(),
                agentDecision: updatedRequest.agentDecision,
                walletAddress: wallet.address, // Save wallet address
                txHash: undefined, // Will be set when actual transaction is made
                blockNumber: undefined,
                status: 'pending' as const,
              };
              
              approvedPayments.unshift(approvedPayment);
              localStorage.setItem('approved-payments', JSON.stringify(approvedPayments));
            } catch (error) {
              console.error('Error saving approved payment:', error);
            }
          }

          return updatedRequest;
        }
        return req;
      }));

      // Record spending if approved
      if (decision.approved) {
        recordSpending(
          {
            amount: request.amount,
            category: request.merchantType,
            merchant: request.merchantName,
            description: request.description,
            timestamp: new Date().toISOString(),
          },
          true,
          request.amount
        );

        // Add to transactions
        addTransaction({
          id: request.id,
          amount: request.amount,
          merchantName: request.merchantName,
          merchantType: request.merchantType === 'subscriptions' ? 'Other' : 
                       request.merchantType === 'entertainment' ? 'Food' :
                       request.merchantType === 'utilities' ? 'Other' : 'Food',
          status: 'Approved',
          date: new Date().toISOString(),
          dueDate: request.dueDate,
        });
      }

      setProcessing(null);
    }, 1500); // Simulate agent thinking time
  };

  const handleManualRequest = (merchant: Merchant) => {
    const amount = customAmount ? parseFloat(customAmount) : undefined;
    const request = createPaymentRequest(
      merchant.id,
      amount,
      true,
      'monthly',
      true // User-initiated
    );
    setRequests(prev => [request, ...prev]);
    setCustomAmount('');
    setShowUserRequestModal(false);
    
    // Auto-evaluate user request
    setTimeout(() => handleAgentDecision(request), 500);
  };

  if (!wallet.connected) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-yellow-400" />
          <h2 className="text-2xl font-bold mb-2">Connect Wallet</h2>
          <p className="text-[var(--color-text-dim)]">Connect your wallet to view payment requests</p>
        </div>
      </div>
    );
  }

  if (!creditData) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 text-blue-400 animate-spin" />
          <h2 className="text-2xl font-bold mb-2">Loading Credit Data</h2>
        </div>
      </div>
    );
  }

  const pendingRequests = requests.filter(r => r.status === 'pending');
  const approvedRequests = requests.filter(r => r.status === 'approved');
  const rejectedRequests = requests.filter(r => r.status === 'rejected');

  return (
    <div className="min-h-screen bg-black text-white pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Payment Requests
              </h1>
              <p className="text-[var(--color-text-dim)]">
                Merchants requesting payments • AI agent auto-approves within policy
              </p>
            </div>
            <Link
              href="/approved-payments"
              className="flex items-center gap-2 px-6 py-3 bg-[var(--color-accent)] hover:opacity-80 text-black rounded-lg font-semibold transition-all"
            >
              <CheckCircle2 className="w-5 h-5" />
              View Approved Payments
            </Link>
          </div>
        </motion.div>

        {/* Agent Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl border border-purple-500/30"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="w-6 h-6 text-purple-400" />
              <div>
                <p className="font-semibold">AI Agent Status</p>
                <p className="text-sm text-[var(--color-text-dim)]">
                  {agentPolicy.enabled ? 'Actively monitoring and auto-approving' : 'Disabled - manual approval required'}
                </p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full ${
              agentPolicy.enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {agentPolicy.enabled ? 'Active' : 'Inactive'}
            </div>
          </div>
        </motion.div>

        {/* Approved Payments Banner */}
        {approvedRequests.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-xl border border-green-500/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-green-400" />
                <div>
                  <p className="font-semibold text-green-400">{approvedRequests.length} Payment{approvedRequests.length !== 1 ? 's' : ''} Approved</p>
                  <p className="text-sm text-[var(--color-text-dim)]">
                    View detailed transaction information and blockchain explorer links
                  </p>
                </div>
              </div>
              <Link
                href="/approved-payments"
                className="flex items-center gap-2 px-4 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/50 text-green-400 rounded-lg transition-all"
              >
                <ExternalLink className="w-4 h-4" />
                View All Approved
              </Link>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 bg-gradient-to-br from-yellow-900/20 to-orange-900/20 rounded-xl border border-yellow-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Clock className="w-6 h-6 text-yellow-400" />
              <span className="text-2xl font-bold">{pendingRequests.length}</span>
            </div>
            <p className="text-sm text-[var(--color-text-dim)]">Pending Review</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl border border-green-500/30">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-6 h-6 text-green-400" />
              <span className="text-2xl font-bold">{approvedRequests.length}</span>
            </div>
            <p className="text-sm text-[var(--color-text-dim)]">Approved</p>
          </div>
          <div className="p-6 bg-gradient-to-br from-red-900/20 to-pink-900/20 rounded-xl border border-red-500/30">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-6 h-6 text-red-400" />
              <span className="text-2xl font-bold">{rejectedRequests.length}</span>
            </div>
            <p className="text-sm text-[var(--color-text-dim)]">Rejected</p>
          </div>
        </div>

        {/* Manual Request Button */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setShowUserRequestModal(true)}
          className="mb-6 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-xl font-semibold transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Request Payment (Custom)
        </motion.button>

        {/* User Request Modal */}
        <AnimatePresence>
          {showUserRequestModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50"
              onClick={() => setShowUserRequestModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-[var(--bg)] rounded-2xl p-6 max-w-4xl w-full max-h-[80vh] overflow-auto border border-purple-500/30"
                onClick={e => e.stopPropagation()}
              >
                <h2 className="text-2xl font-bold mb-4">Request Custom Payment</h2>
                <p className="text-[var(--color-text-dim)] mb-6">
                  Select a service and optionally customize the amount. Agent will evaluate based on your policy.
                </p>
                
                {/* Custom Amount Input */}
                <div className="mb-6">
                  <label className="block text-sm font-semibold mb-2">Custom Amount (ETH)</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    placeholder="Leave empty for default amount"
                    className="w-full px-4 py-2 bg-[var(--card)] rounded-lg border border-[var(--color-accent)]/20 focus:border-purple-500 outline-none"
                  />
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {MERCHANTS.map(merchant => (
                    <button
                      key={merchant.id}
                      onClick={() => handleManualRequest(merchant)}
                      className="p-4 bg-[var(--card)] hover:bg-[var(--card)] rounded-xl border border-[var(--color-accent)]/20 hover:border-purple-500/50 transition-all text-left"
                    >
                      <div className="text-3xl mb-2">{merchant.logo}</div>
                      <p className="font-semibold text-sm mb-1">{merchant.name}</p>
                      <p className="text-xs text-[var(--color-text-dim)] mb-2">{merchant.description}</p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-purple-400">{merchant.typicalAmount} ETH</span>
                        {merchant.wallet && (
                          <Wallet className="w-3 h-3 text-green-400" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Merchant Selection Modal */}
        {/* Removed - now using User Request Modal above */}

        {/* Payment Requests */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Active Requests</h2>
          <AnimatePresence mode="popLayout">
            {requests.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12 text-[var(--color-text-dim)]"
              >
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>No payment requests yet</p>
                <p className="text-sm">Merchants will request payments automatically</p>
              </motion.div>
            )}
            
            {requests.map(request => (
              <PaymentRequestCard
                key={request.id}
                request={request}
                processing={processing === request.id}
                onDecide={() => handleAgentDecision(request)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

interface PaymentRequestCardProps {
  request: PaymentRequest;
  processing: boolean;
  onDecide: () => void;
}

function PaymentRequestCard({ request, processing, onDecide }: PaymentRequestCardProps) {
  const statusColors = {
    pending: 'border-yellow-500/30 bg-yellow-900/10',
    approved: 'border-green-500/30 bg-green-900/10',
    rejected: 'border-red-500/30 bg-red-900/10',
    paid: 'border-blue-500/30 bg-blue-900/10',
    failed: 'border-red-500/30 bg-red-900/10',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`p-6 rounded-xl border ${statusColors[request.status]} transition-all`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left Side */}
        <div className="flex items-start gap-4 flex-1">
          <div className="text-4xl">{getCategoryEmoji(request.merchantType)}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-lg font-semibold">{request.merchantName}</h3>
              {request.isUserInitiated && (
                <span className="px-2 py-0.5 text-xs bg-blue-500/20 text-blue-400 rounded-full">
                  You requested
                </span>
              )}
            </div>
            <p className="text-sm text-[var(--color-text-dim)] mb-2">{request.description}</p>
            
            {/* Wallet Address */}
            {request.merchantWallet && (
              <div className="flex items-center gap-2 mb-2 text-xs text-[var(--color-text-dim)]">
                <Wallet className="w-3 h-3" />
                <span className="font-mono">{request.merchantWallet.slice(0, 6)}...{request.merchantWallet.slice(-4)}</span>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-2 py-1 bg-[var(--card)] rounded-full capitalize">
                {request.merchantType}
              </span>
              {request.recurring && (
                <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full">
                  Recurring • {request.frequency}
                </span>
              )}
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">
                Due: {new Date(request.dueDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side - Amount and Action */}
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-400 mb-2">
            {request.amount.toFixed(6)} ETH
          </div>

          {request.status === 'pending' && (
            <button
              onClick={onDecide}
              disabled={processing}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 rounded-lg font-semibold transition-all flex items-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Agent Deciding...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Let Agent Decide
                </>
              )}
            </button>
          )}

          {request.status === 'approved' && request.agentDecision && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" />
                Approved
              </div>
              <div className="text-xs text-[var(--color-text-dim)]">
                {request.agentDecision.autoApproved ? '🤖 Auto-approved' : '👤 Manual approval'}
              </div>
              <div className="text-xs text-[var(--color-text-dim)] max-w-xs mb-2">
                {request.agentDecision.reason}
              </div>
              
              {/* Link to approved payments page */}
              <Link
                href="/approved-payments"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-accent)]/20 hover:bg-[var(--color-accent)]/30 border border-[var(--color-accent)]/50 rounded-lg text-sm text-[var(--color-accent)] transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                View in Approved
              </Link>
              
              {/* If transaction hash exists, show blockchain link */}
              {(request as any).txHash && (
                <a
                  href={`https://sepolia.etherscan.io/tx/${(request as any).txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/50 rounded-lg text-sm text-blue-400 transition-all ml-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on Etherscan
                </a>
              )}
            </div>
          )}

          {request.status === 'rejected' && request.agentDecision && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-red-400 text-sm">
                <XCircle className="w-4 h-4" />
                Rejected
              </div>
              <div className="text-xs text-[var(--color-text-dim)] max-w-xs">
                {request.agentDecision.reason}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
