'use client';

import { motion } from 'framer-motion';
import type { CreditIdentity } from '@/types';
import { Shield, Award, Calendar, Hash } from 'lucide-react';
import { IPFS_GATEWAY } from '@/lib/constants';

interface CreditNFTProps {
  identity: CreditIdentity | null;
}

export function CreditNFT({ identity }: CreditNFTProps) {
  // Handle null identity
  if (!identity) {
    return (
      <div className="w-full max-w-md mx-auto p-8 bg-[var(--card)]/50 rounded-2xl border border-[var(--color-accent)]/20 text-center">
        <Shield className="w-16 h-16 mx-auto mb-4 text-[var(--color-text-dim)]" />
        <p className="text-[var(--color-text-dim)]">No credit identity found</p>
      </div>
    );
  }

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Platinum':
        return 'from-gray-400 to-gray-600';
      case 'Gold':
        return 'from-yellow-400 to-yellow-600';
      case 'Silver':
        return 'from-gray-300 to-gray-500';
      default:
        return 'from-orange-400 to-orange-600';
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0, rotateY: -30 }}
      animate={{ scale: 1, opacity: 1, rotateY: 0 }}
      transition={{ duration: 0.6 }}
      className="relative w-full max-w-md mx-auto"
    >
      {/* NFT Card */}
      <div className="relative bg-white dark:bg-[var(--card)] rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-[var(--color-accent)]/20">
        {/* Header with gradient */}
        <div className={`h-40 bg-gradient-to-br ${getTierColor(identity.creditTier)} relative`}>
          <div className="absolute inset-0 bg-black/10" />
          
          {/* Decorative elements */}
          <div className="absolute top-4 right-4">
            <Shield className="w-12 h-12 text-white/30" />
          </div>
          
          <div className="absolute bottom-4 left-4 text-white">
            <div className="flex items-center space-x-2 mb-2">
              <Award className="w-5 h-5" />
              <span className="font-bold text-lg">Credit Identity NFT</span>
            </div>
            <p className="text-sm opacity-80">On-Chain Credit Profile</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Token ID */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-[var(--color-text-dim)]">
              <Hash className="w-4 h-4" />
              <span className="text-sm">Token ID</span>
            </div>
            <span className="font-mono font-bold">#{identity.tokenId}</span>
          </div>

          {/* Wallet Address */}
          <div>
            <p className="text-xs text-[var(--color-text-dim)] dark:text-[var(--color-text-dim)] mb-1">Wallet Address</p>
            <p className="font-mono text-sm break-all bg-gray-100 dark:bg-[var(--card)] p-2 rounded">
              {identity.walletAddress}
            </p>
          </div>

          {/* Credit Tier Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-[var(--color-text-dim)]">Credit Tier</span>
            <div className={`px-4 py-1.5 bg-gradient-to-r ${getTierColor(
              identity.creditTier
            )} rounded-full`}>
              <span className="text-white font-bold text-sm">{identity.creditTier}</span>
            </div>
          </div>

          {/* Credit Score */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-[var(--color-text-dim)]">Credit Score</span>
            <span className="text-2xl font-bold text-green-500">{identity.creditScore}</span>
          </div>

          {/* Minted Date */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-[var(--color-accent)]/20">
            <div className="flex items-center space-x-2 text-gray-600 dark:text-[var(--color-text-dim)]">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">Minted</span>
            </div>
            <span className="text-sm">
              {new Date(identity.mintedAt).toLocaleDateString()}
            </span>
          </div>

          {/* IPFS Metadata */}
          <div>
            <p className="text-xs text-[var(--color-text-dim)] dark:text-[var(--color-text-dim)] mb-1">IPFS Metadata</p>
            <a
              href={`${IPFS_GATEWAY}${identity.ipfsMetadataUri}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs break-all text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 underline"
            >
              {identity.ipfsMetadataUri}
            </a>
          </div>
        </div>

        {/* Verified Badge */}
        <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full flex items-center space-x-1 text-xs font-semibold">
          <Shield className="w-3 h-3" />
          <span>Verified</span>
        </div>
      </div>

      {/* Glow effect */}
      <div className={`absolute inset-0 -z-10 bg-gradient-to-br ${getTierColor(
        identity.creditTier
      )} blur-3xl opacity-20`} />
    </motion.div>
  );
}
