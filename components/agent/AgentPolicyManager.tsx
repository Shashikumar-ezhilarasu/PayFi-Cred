'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Settings, 
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  DollarSign,
  Calendar
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { 
  setAgentPolicy as setAgentPolicyContract,
  getAgentPolicy as getAgentPolicyContract
} from '@/lib/payfi-contracts';

interface AgentPolicyManagerProps {
  agentWalletAddress: string;
}

interface AgentPolicy {
  dailyLimit: string;
  perTxLimit: string;
  canUseCredit?: boolean;
  allowedCategories: string[];
  whitelistedAddresses: string[];
}

const EXPENSE_CATEGORIES = [
  'Bills',
  'Subscriptions',
  'Groceries',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Education',
  'Shopping',
  'Dining',
  'Travel',
  'Utilities',
  'Insurance'
];

export default function AgentPolicyManager({ agentWalletAddress }: AgentPolicyManagerProps) {
  const { wallet } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [loadingPolicy, setLoadingPolicy] = useState(true);

  const [policyForm, setPolicyForm] = useState<AgentPolicy>({
    dailyLimit: '100',
    perTxLimit: '50',
    canUseCredit: true,
    allowedCategories: [],
    whitelistedAddresses: []
  });

  const [newWhitelistAddress, setNewWhitelistAddress] = useState('');

  const [txStatus, setTxStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  // Load agent policy from blockchain on mount
  useEffect(() => {
    if (wallet.address && agentWalletAddress) {
      loadAgentPolicy();
    }
  }, [wallet.address, agentWalletAddress]);

  // Load agent policy from blockchain
  const loadAgentPolicy = async () => {
    if (!wallet.address) return;
    
    try {
      setLoadingPolicy(true);
      // Get policy from contract using agent wallet address as ID
      const agentId = ethers.id(agentWalletAddress);
      const contractPolicy = await getAgentPolicyContract(wallet.address, agentId);
      
      // Convert to local policy format (convert from Wei to SHM)
      setPolicyForm({
        dailyLimit: ethers.formatEther(contractPolicy.dailyLimit),
        perTxLimit: ethers.formatEther(contractPolicy.perTxLimit),
        canUseCredit: contractPolicy.canUseCredit,
        allowedCategories: [], // Not stored on-chain in current implementation
        whitelistedAddresses: [] // Not stored on-chain in current implementation
      });
      
      setTxStatus({
        type: 'info',
        message: 'Policy loaded from blockchain'
      });
    } catch (error) {
      console.error('Error loading agent policy:', error);
      setTxStatus({
        type: 'info',
        message: 'No existing policy found. Using defaults.'
      });
    } finally {
      setLoadingPolicy(false);
    }
  };

  // Save agent policy to blockchain
  const handleSavePolicy = async () => {
    if (!wallet.address) return;

    try {
      setLoading(true);
      setTxStatus({ type: null, message: '' });
      
      // Convert agent wallet address to bytes32 agentId
      const agentId = ethers.id(agentWalletAddress);
      
      // Note: Current contract only stores dailyLimit, perTxLimit, and canUseCredit
      // allowedCategories and whitelistedAddresses are stored locally
      // Convert from SHM to Wei using parseEther, then to string
      const txHash = await setAgentPolicyContract(
        agentId,
        ethers.parseEther(policyForm.dailyLimit).toString(),
        ethers.parseEther(policyForm.perTxLimit).toString(),
        policyForm.canUseCredit ?? true
      );
      
      setTxStatus({
        type: 'success',
        message: `Policy saved on-chain! Tx: ${txHash.substring(0, 10)}...`
      });
    } catch (error: any) {
      setTxStatus({
        type: 'error',
        message: error.message || 'Failed to save policy'
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle category
  const toggleCategory = (category: string) => {
    const categories = policyForm.allowedCategories.includes(category)
      ? policyForm.allowedCategories.filter(c => c !== category)
      : [...policyForm.allowedCategories, category];
    
    setPolicyForm({ ...policyForm, allowedCategories: categories });
  };

  // Add whitelist address
  const handleAddWhitelistAddress = () => {
    if (!newWhitelistAddress) return;
    
    if (!ethers.isAddress(newWhitelistAddress)) {
      setTxStatus({ type: 'error', message: 'Invalid address format' });
      return;
    }
    
    setPolicyForm({
      ...policyForm,
      whitelistedAddresses: [...policyForm.whitelistedAddresses, newWhitelistAddress]
    });
    setNewWhitelistAddress('');
  };

  // Remove whitelist address
  const handleRemoveWhitelistAddress = (address: string) => {
    setPolicyForm({
      ...policyForm,
      whitelistedAddresses: policyForm.whitelistedAddresses.filter(a => a !== address)
    });
  };

  if (!wallet.connected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Shield className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-gray-500">Please connect your wallet to manage agent policy</p>
        </div>
      </div>
    );
  }

  if (loadingPolicy) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-cyan-400 animate-spin" />
          <p className="text-gray-400">Loading agent policy...</p>
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
            Agent Policy Manager
          </h2>
          <p className="text-gray-400 mt-1">Configure spending limits and permissions for this agent</p>
        </div>
        <Settings className="w-6 h-6 text-cyan-400" />
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

      {/* Policy Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50"
      >
        <div className="space-y-6">
          {/* Agent Wallet Address */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Agent Wallet Address</label>
            <input
              type="text"
              value={agentWalletAddress}
              disabled
              className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none transition-colors text-gray-500 cursor-not-allowed font-mono text-sm"
            />
          </div>

          {/* Spending Limits */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-green-400" />
              Spending Limits
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Daily Limit (SHM)</label>
                <input
                  type="number"
                  value={policyForm.dailyLimit}
                  onChange={(e) => setPolicyForm({ ...policyForm, dailyLimit: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-2">Per Transaction Limit (SHM)</label>
                <input
                  type="number"
                  value={policyForm.perTxLimit}
                  onChange={(e) => setPolicyForm({ ...policyForm, perTxLimit: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Credit Usage Permission */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={policyForm.canUseCredit}
                onChange={(e) => setPolicyForm({ ...policyForm, canUseCredit: e.target.checked })}
                className="w-5 h-5 rounded border-gray-700 bg-gray-800/50 text-cyan-600 focus:ring-cyan-500"
              />
              <span className="text-sm text-gray-300">Allow agent to use credit</span>
            </label>
          </div>

          {/* Allowed Categories */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Allowed Expense Categories
            </h4>
            <p className="text-xs text-gray-400 mb-3">Note: Categories are stored locally and not on-chain</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {EXPENSE_CATEGORIES.map((category) => (
                <button
                  key={category}
                  onClick={() => toggleCategory(category)}
                  className={`px-4 py-2 rounded-lg border transition-all ${
                    policyForm.allowedCategories.includes(category)
                      ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                      : 'bg-gray-800/30 border-gray-700 text-gray-400 hover:border-cyan-500/30'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Whitelisted Addresses */}
          <div>
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" />
              Whitelisted Addresses
            </h4>
            <p className="text-xs text-gray-400 mb-3">Note: Addresses are stored locally and not on-chain</p>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newWhitelistAddress}
                  onChange={(e) => setNewWhitelistAddress(e.target.value)}
                  placeholder="0x..."
                  className="flex-1 px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <button
                  onClick={handleAddWhitelistAddress}
                  className="px-4 py-3 bg-cyan-600 hover:bg-cyan-700 rounded-xl transition-all"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-2">
                {policyForm.whitelistedAddresses.map((address, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg border border-gray-700"
                  >
                    <code className="text-sm text-cyan-400">{address}</code>
                    <button
                      onClick={() => handleRemoveWhitelistAddress(address)}
                      className="p-1 hover:bg-red-500/20 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSavePolicy}
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving Policy...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Save Policy to Blockchain
              </>
            )}
          </button>
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
            <p className="font-semibold text-blue-400 mb-1">Policy Storage</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Spending limits and credit permissions are stored on-chain</li>
              <li>Expense categories and whitelisted addresses are stored locally in your browser</li>
              <li>You can update the policy at any time</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
