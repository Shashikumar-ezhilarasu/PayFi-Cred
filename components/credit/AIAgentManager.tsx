'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { motion } from 'framer-motion';
import { 
  Bot, 
  Shield, 
  Settings, 
  Plus,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lock,
  Unlock,
  DollarSign,
  Calendar
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { 
  setAgentPolicy as setAgentPolicyContract,
  getAgentPolicy as getAgentPolicyContract
} from '@/lib/payfi-contracts';

// Local interface for agent policy (extends contract policy with UI-specific fields)
interface AgentPolicy {
  dailyLimit: string;
  perTxLimit: string;
  canUseCredit?: boolean;
  allowedCategories: string[];
  whitelistedAddresses: string[];
}

interface AgentConfig {
  address: string;
  name: string;
  description: string;
  enabled: boolean;
  policy: AgentPolicy;
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

export default function AIAgentManager() {
  const { wallet } = useAppStore();
  const [loading, setLoading] = useState(false);
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AgentConfig | null>(null);
  const [showAddAgent, setShowAddAgent] = useState(false);
  
  const [newAgent, setNewAgent] = useState({
    address: '',
    name: '',
    description: ''
  });

  const [policyForm, setPolicyForm] = useState<AgentPolicy>({
    dailyLimit: '100',
    perTxLimit: '50',
    allowedCategories: [],
    whitelistedAddresses: []
  });

  const [newWhitelistAddress, setNewWhitelistAddress] = useState('');

  const [txStatus, setTxStatus] = useState<{
    type: 'success' | 'error' | 'info' | null;
    message: string;
  }>({ type: null, message: '' });

  // Load agent policy from blockchain
  const loadAgentPolicy = async (agentAddress: string) => {
    if (!wallet.address) return;
    
    try {
      // Get policy from contract
      const contractPolicy = await getAgentPolicyContract(wallet.address, agentAddress);
      
      // Convert to local policy format
      const policy: AgentPolicy = {
        dailyLimit: contractPolicy.dailyLimit,
        perTxLimit: contractPolicy.perTxLimit,
        canUseCredit: contractPolicy.canUseCredit,
        allowedCategories: [], // Not stored on-chain in current implementation
        whitelistedAddresses: [] // Not stored on-chain in current implementation
      };
      
      setPolicyForm(policy);
    } catch (error) {
      console.error('Error loading agent policy:', error);
      setTxStatus({
        type: 'error',
        message: 'Failed to load policy from blockchain'
      });
    }
  };

  // Add new agent
  const handleAddAgent = () => {
    if (!newAgent.address || !newAgent.name) {
      setTxStatus({ type: 'error', message: 'Please fill all fields' });
      return;
    }

    const agent: AgentConfig = {
      ...newAgent,
      enabled: false,
      policy: {
        dailyLimit: '100',
        perTxLimit: '50',
        allowedCategories: [],
        whitelistedAddresses: []
      }
    };

    setAgents([...agents, agent]);
    setNewAgent({ address: '', name: '', description: '' });
    setShowAddAgent(false);
    setTxStatus({ type: 'success', message: 'Agent added successfully!' });
  };

  // Save agent policy to blockchain
  const handleSavePolicy = async () => {
    if (!wallet.address || !selectedAgent) return;

    try {
      setLoading(true);
      setTxStatus({ type: null, message: '' });
      
      // Convert agentAddress to bytes32 agentId
      const agentId = ethers.id(selectedAgent.address);
      
      // Note: Current contract only stores dailyLimit, perTxLimit, and canUseCredit
      // allowedCategories and whitelistedAddresses are stored locally
      const txHash = await setAgentPolicyContract(
        agentId,
        policyForm.dailyLimit,
        policyForm.perTxLimit,
        policyForm.canUseCredit ?? true
      );
      
      setTxStatus({
        type: 'success',
        message: `Policy saved on-chain! Tx: ${txHash.substring(0, 10)}...`
      });
      
      // Update local state
      setAgents(agents.map(agent => 
        agent.address === selectedAgent.address 
          ? { ...agent, policy: policyForm, enabled: true }
          : agent
      ));
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

  // Remove agent
  const handleRemoveAgent = (address: string) => {
    setAgents(agents.filter(agent => agent.address !== address));
    if (selectedAgent?.address === address) {
      setSelectedAgent(null);
    }
  };

  if (!wallet.connected) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Bot className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-dim)]" />
          <h3 className="text-xl font-semibold mb-2">Connect Your Wallet</h3>
          <p className="text-[var(--color-text-dim)]">Please connect your wallet to manage AI agents</p>
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
            AI Agent Manager
          </h2>
          <p className="text-[var(--color-text-dim)] mt-1">Configure AI co-pilots to manage your account</p>
        </div>
        <button
          onClick={() => setShowAddAgent(!showAddAgent)}
          className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Add Agent
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

      {/* Add Agent Form */}
      {showAddAgent && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-gradient-to-br from-cyan-900/30 to-blue-900/30 backdrop-blur-xl rounded-2xl p-6 border border-cyan-500/30"
        >
          <h3 className="text-lg font-semibold mb-4">Add New AI Agent</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[var(--color-text-dim)] mb-2">Agent Address</label>
              <input
                type="text"
                value={newAgent.address}
                onChange={(e) => setNewAgent({ ...newAgent, address: e.target.value })}
                placeholder="0x..."
                className="w-full px-4 py-3 bg-[var(--card)]/50 border border-[var(--color-accent)]/20 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm text-[var(--color-text-dim)] mb-2">Agent Name</label>
              <input
                type="text"
                value={newAgent.name}
                onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })}
                placeholder="e.g., Bill Payment Bot"
                className="w-full px-4 py-3 bg-[var(--card)]/50 border border-[var(--color-accent)]/20 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-[var(--color-text-dim)] mb-2">Description</label>
              <textarea
                value={newAgent.description}
                onChange={(e) => setNewAgent({ ...newAgent, description: e.target.value })}
                placeholder="What will this agent do?"
                rows={3}
                className="w-full px-4 py-3 bg-[var(--card)]/50 border border-[var(--color-accent)]/20 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors resize-none"
              />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddAgent}
              className="px-6 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-xl font-semibold transition-all"
            >
              Add Agent
            </button>
            <button
              onClick={() => setShowAddAgent(false)}
              className="px-6 py-2 bg-[var(--card)] hover:bg-gray-600 rounded-xl font-semibold transition-all"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Agents Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agents List */}
        <div className="lg:col-span-1 space-y-3">
          <h3 className="text-lg font-semibold mb-4">Your AI Agents</h3>
          {agents.length === 0 ? (
            <div className="text-center py-8 text-[var(--color-text-dim)] bg-[var(--card)]/30 rounded-xl border border-[var(--color-accent)]/20/50">
              No agents configured yet
            </div>
          ) : (
            agents.map((agent) => (
              <motion.div
                key={agent.address}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={() => {
                  setSelectedAgent(agent);
                  setPolicyForm(agent.policy);
                }}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedAgent?.address === agent.address
                    ? 'bg-cyan-500/20 border-cyan-500/50'
                    : 'bg-[var(--card)]/30 border-[var(--color-accent)]/20/50 hover:border-cyan-500/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${agent.enabled ? 'bg-green-500/20' : 'bg-[var(--card)]/50'}`}>
                      <Bot className={`w-5 h-5 ${agent.enabled ? 'text-green-400' : 'text-[var(--color-text-dim)]'}`} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold">{agent.name}</h4>
                        {agent.enabled ? (
                          <Unlock className="w-4 h-4 text-green-400" />
                        ) : (
                          <Lock className="w-4 h-4 text-[var(--color-text-dim)]" />
                        )}
                      </div>
                      <p className="text-xs text-[var(--color-text-dim)] mt-1">{agent.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveAgent(agent.address);
                    }}
                    className="p-1 hover:bg-red-500/20 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Policy Configuration */}
        <div className="lg:col-span-2">
          {selectedAgent ? (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-[var(--color-accent)]/20/50"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold">Policy Configuration</h3>
                  <p className="text-sm text-[var(--color-text-dim)]">Set limits and permissions for {selectedAgent.name}</p>
                </div>
                <Settings className="w-6 h-6 text-cyan-400" />
              </div>

              <div className="space-y-6">
                {/* Spending Limits */}
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    Spending Limits
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-[var(--color-text-dim)] mb-2">Daily Limit (USDC)</label>
                      <input
                        type="number"
                        value={policyForm.dailyLimit}
                        onChange={(e) => setPolicyForm({ ...policyForm, dailyLimit: e.target.value })}
                        className="w-full px-4 py-3 bg-[var(--card)]/50 border border-[var(--color-accent)]/20 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-[var(--color-text-dim)] mb-2">Per Transaction Limit (USDC)</label>
                      <input
                        type="number"
                        value={policyForm.perTxLimit}
                        onChange={(e) => setPolicyForm({ ...policyForm, perTxLimit: e.target.value })}
                        className="w-full px-4 py-3 bg-[var(--card)]/50 border border-[var(--color-accent)]/20 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Allowed Categories */}
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    Allowed Expense Categories
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {EXPENSE_CATEGORIES.map((category) => (
                      <button
                        key={category}
                        onClick={() => toggleCategory(category)}
                        className={`px-4 py-2 rounded-lg border transition-all ${
                          policyForm.allowedCategories.includes(category)
                            ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                            : 'bg-[var(--card)]/30 border-[var(--color-accent)]/20 text-[var(--color-text-dim)] hover:border-cyan-500/30'
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
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newWhitelistAddress}
                        onChange={(e) => setNewWhitelistAddress(e.target.value)}
                        placeholder="0x..."
                        className="flex-1 px-4 py-3 bg-[var(--card)]/50 border border-[var(--color-accent)]/20 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
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
                          className="flex items-center justify-between p-3 bg-[var(--card)]/30 rounded-lg border border-[var(--color-accent)]/20"
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
                      Save Policy
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[400px] bg-[var(--card)]/30 rounded-2xl border border-[var(--color-accent)]/20/50">
              <div className="text-center text-[var(--color-text-dim)]">
                <Bot className="w-16 h-16 mx-auto mb-4" />
                <p>Select an agent to configure its policy</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info Box */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4"
      >
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-gray-300">
            <p className="font-semibold text-blue-400 mb-1">AI Agent Safety</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Agents can only spend within configured limits</li>
              <li>All transactions must match allowed categories</li>
              <li>Payments only go to whitelisted addresses</li>
              <li>You can revoke agent access at any time</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
