'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle, XCircle, Shield, TrendingUp, Clock, FileCheck } from 'lucide-react';
import type { MCPDecision } from '@/types';
import { MCP_EVALUATION_STEPS } from '@/lib/constants';
import { getRiskColor, getConfidenceColor } from '@/lib/mcp';

interface MCPDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDecision: (decision: MCPDecision) => void;
  decision: MCPDecision | null;
  isEvaluating: boolean;
}

export function MCPDecisionModal({
  isOpen,
  onClose,
  onDecision,
  decision,
  isEvaluating,
}: MCPDecisionModalProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    if (isEvaluating) {
      setCurrentStep(0);
      const stepDuration = 500;

      const interval = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev < MCP_EVALUATION_STEPS.length - 1) {
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, stepDuration);

      return () => clearInterval(interval);
    }
  }, [isEvaluating]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white dark:bg-[var(--card)] rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-[var(--color-accent)]/20"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[var(--color-accent)]/20">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">MCP Agent Decision</h2>
                    <p className="text-sm text-gray-600 dark:text-[var(--color-text-dim)]">
                      AI-Powered Credit Evaluation
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-[var(--card)] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                {isEvaluating ? (
                  /* Evaluation Steps */
                  <div className="space-y-4">
                    <div className="flex items-center justify-center mb-6">
                      <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    </div>

                    <div className="space-y-3">
                      {MCP_EVALUATION_STEPS.map((step, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{
                            opacity: currentStep >= index ? 1 : 0.3,
                            x: 0,
                          }}
                          className="flex items-center space-x-3"
                        >
                          {currentStep > index ? (
                            <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          ) : currentStep === index ? (
                            <Loader2 className="w-5 h-5 text-blue-500 animate-spin flex-shrink-0" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 flex-shrink-0" />
                          )}
                          <span
                            className={`text-sm ${
                              currentStep >= index
                                ? 'text-gray-900 dark:text-gray-100'
                                : 'text-[var(--color-text-dim)] dark:text-gray-600'
                            }`}
                          >
                            {step}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    <p className="text-center text-sm text-[var(--color-text-dim)] dark:text-[var(--color-text-dim)] mt-6">
                      Processing on-chain data...
                    </p>
                  </div>
                ) : decision ? (
                  /* Decision Result */
                  <div className="space-y-6">
                    {/* Approval Status */}
                    <div className="text-center">
                      {decision.approved ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', bounce: 0.5 }}
                        >
                          <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
                          <h3 className="text-2xl font-bold text-green-600 dark:text-green-400">
                            Approved!
                          </h3>
                        </motion.div>
                      ) : (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: 'spring', bounce: 0.5 }}
                        >
                          <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4" />
                          <h3 className="text-2xl font-bold text-red-600 dark:text-red-400">
                            Rejected
                          </h3>
                        </motion.div>
                      )}
                    </div>

                    {/* Amount */}
                    <div className="bg-gray-50 dark:bg-[var(--bg)] rounded-xl p-6 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-[var(--color-text-dim)]">
                          Requested Amount
                        </span>
                        <span className="font-bold text-lg">
                          ${decision.requestedAmount.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-[var(--color-text-dim)]">
                          Approved Amount
                        </span>
                        <span
                          className={`font-bold text-xl ${
                            decision.approved ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          ${decision.approvedAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-[var(--bg)] rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <TrendingUp className="w-4 h-4 text-[var(--color-text-dim)]" />
                          <span className="text-xs text-gray-600 dark:text-[var(--color-text-dim)]">
                            Confidence Score
                          </span>
                        </div>
                        <p className={`text-2xl font-bold ${getConfidenceColor(decision.confidenceScore)}`}>
                          {(decision.confidenceScore * 100).toFixed(0)}%
                        </p>
                      </div>

                      <div className="bg-gray-50 dark:bg-[var(--bg)] rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                          <Shield className="w-4 h-4 text-[var(--color-text-dim)]" />
                          <span className="text-xs text-gray-600 dark:text-[var(--color-text-dim)]">
                            Risk Level
                          </span>
                        </div>
                        <p className={`text-2xl font-bold ${getRiskColor(decision.riskAssessment)}`}>
                          {decision.riskAssessment}
                        </p>
                      </div>
                    </div>

                    {/* Reasoning */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center space-x-2">
                        <FileCheck className="w-5 h-5" />
                        <span>Decision Reasoning</span>
                      </h4>
                      <div className="space-y-2">
                        {decision.reasoning.map((reason, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-start space-x-2 text-sm"
                          >
                            <span>{reason}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Decision Hash */}
                    <div>
                      <div className="flex items-center space-x-2 mb-2">
                        <Clock className="w-4 h-4 text-[var(--color-text-dim)]" />
                        <span className="text-xs text-gray-600 dark:text-[var(--color-text-dim)]">
                          Decision Hash (On-Chain Proof)
                        </span>
                      </div>
                      <p className="font-mono text-xs bg-gray-100 dark:bg-[var(--bg)] p-2 rounded break-all">
                        {decision.decisionHash}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-3">
                      {decision.approved && (
                        <button
                          onClick={() => onDecision(decision)}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                        >
                          Spend from Credit
                        </button>
                      )}
                      <button
                        onClick={onClose}
                        className="flex-1 bg-gray-200 dark:bg-[var(--card)] py-3 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                      >
                        {decision.approved ? 'Cancel' : 'Close'}
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
