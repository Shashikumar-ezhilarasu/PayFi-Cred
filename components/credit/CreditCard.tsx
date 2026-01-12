'use client';

import { motion } from 'framer-motion';
import type { CreditData } from '@/types';
import { Sparkles } from 'lucide-react';

interface CreditCardProps {
  creditData: CreditData;
}

export function CreditCard({ creditData }: CreditCardProps) {
  const utilizationPercentage = (creditData.usedCredit / creditData.creditLimit) * 100;

  const getTierGradient = (tier: string) => {
    switch (tier) {
      case 'Platinum':
        return 'from-gray-400 via-gray-300 to-gray-500';
      case 'Gold':
        return 'from-yellow-400 via-yellow-300 to-yellow-600';
      case 'Silver':
        return 'from-gray-300 via-gray-200 to-gray-400';
      default:
        return 'from-orange-400 via-orange-300 to-orange-600';
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`relative w-full h-52 bg-gradient-to-br ${getTierGradient(
        creditData.creditTier
      )} rounded-2xl p-6 shadow-2xl overflow-hidden`}
    >
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-24 -translate-x-24" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between text-white">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold text-sm">PayForMe Credit</span>
          </div>
          <div className="text-right">
            <p className="text-xs opacity-80">Credit Tier</p>
            <p className="font-bold">{creditData.creditTier}</p>
          </div>
        </div>

        {/* Credit Limit */}
        <div>
          <p className="text-xs opacity-80 mb-1">Available Credit</p>
          <p className="text-3xl font-bold">
            ${creditData.availableBalance.toLocaleString()}
          </p>
          <p className="text-xs opacity-80 mt-1">
            of ${creditData.creditLimit.toLocaleString()} limit
          </p>
        </div>

        {/* Utilization Bar */}
        <div>
          <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${utilizationPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-white rounded-full"
            />
          </div>
          <p className="text-xs opacity-80 mt-1">
            {utilizationPercentage.toFixed(1)}% utilized
          </p>
        </div>
      </div>
    </motion.div>
  );
}
