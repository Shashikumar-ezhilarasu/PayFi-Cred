'use client';

import { motion } from 'framer-motion';
import { ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { useState } from 'react';
import { CONTRACT_ADDRESS } from '@/lib/contract';

interface ContractInfoCardProps {
  compact?: boolean;
}

export default function ContractInfoCard({ compact = false }: ContractInfoCardProps) {
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(CONTRACT_ADDRESS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const openEtherscan = () => {
    window.open(`https://etherscan.io/address/${CONTRACT_ADDRESS}`, '_blank');
  };

  if (compact) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-sm"
      >
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
        <span className="text-purple-300">Contract:</span>
        <code className="text-purple-400 font-mono">
          {CONTRACT_ADDRESS.substring(0, 6)}...{CONTRACT_ADDRESS.substring(38)}
        </code>
        <button
          onClick={copyAddress}
          className="p-1 hover:bg-purple-500/20 rounded transition-colors"
          title="Copy address"
        >
          {copied ? (
            <CheckCircle className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-purple-400" />
          )}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-purple-400 mb-1">Smart Contract</h3>
          <p className="text-sm text-[var(--color-text-dim)]">Deployed on Ethereum</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-xs text-green-400 font-semibold">Active</span>
        </div>
      </div>

      <div className="space-y-3">
        {/* Contract Address */}
        <div>
          <label className="block text-xs text-[var(--color-text-dim)] mb-1">Contract Address</label>
          <div className="flex items-center gap-2 p-3 bg-[var(--card)]/50 rounded-lg border border-[var(--color-accent)]/20">
            <code className="flex-1 text-sm text-purple-400 font-mono break-all">
              {CONTRACT_ADDRESS}
            </code>
            <button
              onClick={copyAddress}
              className="p-2 hover:bg-[var(--card)] rounded transition-colors flex-shrink-0"
              title="Copy address"
            >
              {copied ? (
                <CheckCircle className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-[var(--color-text-dim)]" />
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 bg-[var(--card)]/30 rounded-lg border border-[var(--color-accent)]/20/50">
            <div className="text-xl font-bold text-purple-400">15+</div>
            <div className="text-xs text-[var(--color-text-dim)]">Functions</div>
          </div>
          <div className="text-center p-3 bg-[var(--card)]/30 rounded-lg border border-[var(--color-accent)]/20/50">
            <div className="text-xl font-bold text-pink-400">5</div>
            <div className="text-xs text-[var(--color-text-dim)]">Events</div>
          </div>
          <div className="text-center p-3 bg-[var(--card)]/30 rounded-lg border border-[var(--color-accent)]/20/50">
            <div className="text-xl font-bold text-cyan-400">ETH</div>
            <div className="text-xs text-[var(--color-text-dim)]">Network</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={openEtherscan}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-sm transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View on Etherscan
          </button>
        </div>

        {/* Features */}
        <div className="pt-3 border-t border-[var(--color-accent)]/20/50">
          <div className="flex flex-wrap gap-2">
            {['Credit Management', 'Agent Integration', 'Real-time Events'].map((feature, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded text-xs text-purple-300"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
