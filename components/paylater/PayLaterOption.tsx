'use client';

import { motion } from 'framer-motion';
import { Clock, CreditCard, Sparkles, Zap } from 'lucide-react';

interface PayLaterOptionProps {
  amount: number;
  onSelect: () => void;
  selected?: boolean;
}

export function PayLaterOption({ amount, onSelect, selected = false }: PayLaterOptionProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      className={`w-full p-6 rounded-xl border-2 transition-all ${
        selected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
          : 'border-gray-200 dark:border-[var(--color-accent)]/20 hover:border-blue-300 dark:hover:border-blue-700'
      }`}
    >
      <div className="flex items-start space-x-4">
        {/* Icon */}
        <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <Zap className="w-6 h-6 text-white" />
        </div>

        {/* Content */}
        <div className="flex-1 text-left">
          <div className="flex items-center space-x-2 mb-1">
            <h3 className="font-bold text-lg">Spend from Credit</h3>
            {selected && (
              <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                Selected
              </span>
            )}
          </div>
          <p className="text-sm text-gray-600 dark:text-[var(--color-text-dim)] mb-3">
            Use your Pay-Fi credit line • Agent-managed • Auto-repayment
          </p>

          {/* Features */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm">
              <CreditCard className="w-4 h-4 text-blue-500" />
              <span>Income-backed credit verification</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>AI agent optimizes repayment</span>
            </div>
          </div>

          {/* Amount */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-[var(--color-accent)]/20">
            <div className="flex items-baseline space-x-2">
              <span className="text-gray-600 dark:text-[var(--color-text-dim)]">Amount:</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                ${amount.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-[var(--color-text-dim)] dark:text-[var(--color-text-dim)] mt-1">
              Auto-repays when income detected onchain
            </p>
          </div>
        </div>

        {/* Radio button */}
        <div className="flex-shrink-0">
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
              selected
                ? 'border-blue-500 bg-blue-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
          >
            {selected && <div className="w-3 h-3 bg-white rounded-full" />}
          </div>
        </div>
      </div>
    </motion.button>
  );
}
