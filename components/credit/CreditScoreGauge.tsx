'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CreditScoreGaugeProps {
  score: number;
  maxScore?: number;
}

export function CreditScoreGauge({ score, maxScore = 850 }: CreditScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const increment = score / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= score) {
        setAnimatedScore(score);
        clearInterval(timer);
      } else {
        setAnimatedScore(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [score]);

  const percentage = (score / maxScore) * 100;
  const rotation = (percentage / 100) * 180 - 90;

  const getScoreColor = (score: number) => {
    if (score >= 740) return 'text-green-500';
    if (score >= 670) return 'text-blue-500';
    if (score >= 580) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getScoreRating = (score: number) => {
    if (score >= 740) return 'Excellent';
    if (score >= 670) return 'Good';
    if (score >= 580) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="flex flex-col items-center">
      {/* Gauge */}
      <div className="relative w-48 h-24">
        {/* Background arc */}
        <svg className="w-full h-full" viewBox="0 0 200 100">
          <path
            d="M 20 90 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            className="text-gray-200 dark:text-gray-700"
          />
          {/* Colored segments */}
          <path
            d="M 20 90 A 80 80 0 0 1 60 30"
            fill="none"
            stroke="#f59e0b"
            strokeWidth="12"
            opacity="0.3"
          />
          <path
            d="M 60 30 A 80 80 0 0 1 100 10"
            fill="none"
            stroke="#eab308"
            strokeWidth="12"
            opacity="0.3"
          />
          <path
            d="M 100 10 A 80 80 0 0 1 140 30"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="12"
            opacity="0.3"
          />
          <path
            d="M 140 30 A 80 80 0 0 1 180 90"
            fill="none"
            stroke="#10b981"
            strokeWidth="12"
            opacity="0.3"
          />
        </svg>

        {/* Needle */}
        <motion.div
          className="absolute top-1/2 left-1/2 w-1 h-20 origin-bottom"
          style={{
            transform: 'translate(-50%, -100%)',
          }}
          initial={{ rotate: -90 }}
          animate={{ rotate: rotation }}
          transition={{ duration: 2, ease: 'easeOut' }}
        >
          <div className="w-full h-full bg-gradient-to-t from-gray-800 dark:from-gray-200 to-transparent rounded-full" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-[var(--card)] dark:bg-gray-200 rounded-full" />
        </motion.div>

        {/* Center circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-[var(--bg)] rounded-full border-2 border-gray-300 dark:border-gray-600" />
      </div>

      {/* Score display */}
      <div className="mt-4 text-center">
        <motion.p
          className={`text-4xl font-bold ${getScoreColor(score)}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {animatedScore}
        </motion.p>
        <p className="text-sm text-gray-600 dark:text-[var(--color-text-dim)] mt-1">
          {getScoreRating(score)} Credit Score
        </p>
        <p className="text-xs text-[var(--color-text-dim)] dark:text-[var(--color-text-dim)] mt-1">
          Out of {maxScore}
        </p>
      </div>
    </div>
  );
}
