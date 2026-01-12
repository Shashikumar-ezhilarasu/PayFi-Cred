'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/store/useAppStore';
import { PageHeader } from '@/components/shared/PageHeader';
import { motion } from 'framer-motion';
import { Settings, Save, RotateCcw, Info } from 'lucide-react';
import type { AgentPolicy } from '@/lib/agent-policy';

export default function AgentSettingsPage() {
  const { agentPolicy, setAgentPolicy } = useAppStore();
  const [localPolicy, setLocalPolicy] = useState<AgentPolicy>(agentPolicy);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setAgentPolicy(localPolicy);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setLocalPolicy(agentPolicy);
  };

  const updateField = (field: keyof AgentPolicy, value: any) => {
    setLocalPolicy((prev) => ({ ...prev, [field]: value }));
  };

  const updateCategoryLimit = (category: string, value: number) => {
    setLocalPolicy((prev) => ({
      ...prev,
      categoryLimits: {
        ...prev.categoryLimits,
        [category]: value,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <PageHeader
          icon={Settings}
          title="Agent Settings"
          subtitle="Configure your AI agent's spending policies and approval rules"
          actions={
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 border border-[var(--color-divider)] rounded-lg hover:bg-[var(--elev)] transition-colors flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <button
                onClick={handleSave}
                className={`px-6 py-2 rounded-lg flex items-center gap-2 transition-all ${
                  saved
                    ? 'bg-green-500 text-white'
                    : 'bg-[var(--color-accent)] text-[var(--bg)] hover:opacity-90 neon-glow'
                }`}
              >
                <Save className="w-4 h-4" />
                {saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          }
        />

        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-6"
        >
          <h2 className="text-xl font-bold neon-text mb-6 flex items-center gap-2">
            <Info className="w-5 h-5" />
            General Policies
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Auto Approve Threshold */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Auto-Approve Threshold (USD)
              </label>
              <input
                type="number"
                value={localPolicy.autoApproveThreshold}
                onChange={(e) => updateField('autoApproveThreshold', parseFloat(e.target.value))}
                className="w-full px-4 py-2 bg-[var(--elev)] border border-[var(--color-divider)] rounded-lg text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
              />
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Transactions below this amount will be automatically approved
              </p>
            </div>

            {/* Daily Spending Limit */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Daily Spending Limit (USD)
              </label>
              <input
                type="number"
                value={localPolicy.dailySpendingLimit}
                onChange={(e) => updateField('dailySpendingLimit', parseFloat(e.target.value))}
                className="w-full px-4 py-2 bg-[var(--elev)] border border-[var(--color-divider)] rounded-lg text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
              />
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Maximum total spending allowed per day
              </p>
            </div>

            {/* Monthly Spending Limit */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Monthly Spending Limit (USD)
              </label>
              <input
                type="number"
                value={localPolicy.monthlySpendingLimit}
                onChange={(e) => updateField('monthlySpendingLimit', parseFloat(e.target.value))}
                className="w-full px-4 py-2 bg-[var(--elev)] border border-[var(--color-divider)] rounded-lg text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
              />
              <p className="text-xs text-[var(--color-muted)] mt-1">
                Maximum total spending allowed per month
              </p>
            </div>

            {/* Risk Level */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Risk Tolerance
              </label>
              <select
                value={localPolicy.riskTolerance}
                onChange={(e) => updateField('riskTolerance', e.target.value)}
                className="w-full px-4 py-2 bg-[var(--elev)] border border-[var(--color-divider)] rounded-lg text-[var(--color-text)] focus:outline-none focus:border-[var(--color-accent)]"
              >
                <option value="conservative">Conservative</option>
                <option value="moderate">Moderate</option>
                <option value="aggressive">Aggressive</option>
              </select>
              <p className="text-xs text-[var(--color-muted)] mt-1">
                How strict should the agent be with approvals
              </p>
            </div>
          </div>

          {/* Toggles */}
          <div className="mt-6 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localPolicy.requireManualApprovalForLargeTransactions}
                onChange={(e) =>
                  updateField('requireManualApprovalForLargeTransactions', e.target.checked)
                }
                className="w-5 h-5 rounded border-[var(--color-divider)] bg-[var(--elev)] checked:bg-[var(--color-accent)] focus:ring-[var(--color-accent)]"
              />
              <span className="text-sm text-[var(--color-text)]">
                Require manual approval for large transactions
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={localPolicy.allowRecurringPayments}
                onChange={(e) => updateField('allowRecurringPayments', e.target.checked)}
                className="w-5 h-5 rounded border-[var(--color-divider)] bg-[var(--elev)] checked:bg-[var(--color-accent)] focus:ring-[var(--color-accent)]"
              />
              <span className="text-sm text-[var(--color-text)]">
                Allow automatic approval of recurring payments
              </span>
            </label>
          </div>
        </motion.div>

        {/* Category Limits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-6"
        >
          <h2 className="text-xl font-bold neon-text mb-6">Category Spending Limits</h2>
          <p className="text-sm text-[var(--color-text-alt)] mb-6">
            Set maximum monthly spending for each category as a percentage of your credit limit
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(localPolicy.categoryLimits).map(([category, limit]) => (
              <div key={category} className="bg-[var(--elev)] p-4 rounded-lg">
                <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                  {category}
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={limit}
                    onChange={(e) => updateCategoryLimit(category, parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-lg font-bold text-[var(--color-accent)] min-w-[4rem] text-right">
                    {limit}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Trusted Merchants */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card p-6"
        >
          <h2 className="text-xl font-bold neon-text mb-4">Trusted Merchants</h2>
          <p className="text-sm text-[var(--color-text-alt)] mb-4">
            Transactions from these merchants will always be auto-approved
          </p>

          <div className="flex flex-wrap gap-2">
            {localPolicy.trustedMerchants && localPolicy.trustedMerchants.length > 0 ? (
              localPolicy.trustedMerchants.map((merchant) => (
                <span
                  key={merchant}
                  className="px-3 py-1 bg-[var(--elev)] border border-[var(--color-accent)]/30 rounded-full text-sm text-[var(--color-text)]"
                >
                  {merchant}
                </span>
              ))
            ) : (
              <p className="text-sm text-[var(--color-text-dim)]">No trusted merchants configured yet</p>
            )}
          </div>
        </motion.div>

        {/* Blocked Merchants */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card p-6"
        >
          <h2 className="text-xl font-bold neon-text mb-4">Blocked Merchants</h2>
          <p className="text-sm text-[var(--color-text-alt)] mb-4">
            Transactions from these merchants will always be rejected
          </p>

          {!localPolicy.blockedMerchants || localPolicy.blockedMerchants.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)] italic">No blocked merchants</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {localPolicy.blockedMerchants?.map((merchant) => (
                <span
                  key={merchant}
                  className="px-3 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-sm text-red-400"
                >
                  {merchant}
                </span>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
