'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Zap, 
  Shield, 
  TrendingUp, 
  Bot,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function SmartContractHero() {
  const router = useRouter();

  return (
    <div className="relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-pink-900/10 to-blue-900/20 blur-3xl" />
      
      <div className="relative">
        {/* Main Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-300">
              Powered by Ethereum Smart Contracts
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              On-Chain Credit System
            </span>
          </h1>

          <p className="text-xl text-[var(--color-text-dim)] max-w-2xl mx-auto mb-8">
            Manage your decentralized credit with real-time blockchain interactions,
            AI-powered agents, and transparent on-chain verification
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/credit')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center gap-2"
            >
              <span>Open Dashboard</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.open('https://etherscan.io/address/0x21Ca49781F161CDCE7F75e801a7a42eFb2850f1b', '_blank')}
              className="px-8 py-4 bg-[var(--card)]/50 hover:bg-[var(--card)] border border-[var(--color-accent)]/20 rounded-xl font-semibold text-lg transition-all"
            >
              View Contract
            </motion.button>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <FeatureCard
            icon={<Zap className="w-6 h-6" />}
            title="Instant Transactions"
            description="Use and repay credit with real-time blockchain confirmations"
            color="purple"
            delay={0}
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6" />}
            title="Secure & Trustless"
            description="All operations verified on-chain with smart contract security"
            color="blue"
            delay={0.1}
          />
          <FeatureCard
            icon={<TrendingUp className="w-6 h-6" />}
            title="Dynamic Credit Limits"
            description="Credit limits adjust based on income score and performance"
            color="green"
            delay={0.2}
          />
          <FeatureCard
            icon={<Bot className="w-6 h-6" />}
            title="AI Agent Integration"
            description="Authorized agents can update scores and manage risk"
            color="pink"
            delay={0.3}
          />
        </div>

        {/* Contract Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-6 border border-[var(--color-accent)]/20/50"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold mb-2">Smart Contract Details</h3>
              <div className="flex items-center gap-2 text-sm text-[var(--color-text-dim)]">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span>Contract Address:</span>
                <code className="px-2 py-1 bg-[var(--card)] rounded text-purple-400">
                  0x21Ca...1b
                </code>
              </div>
            </div>
            
            <div className="flex gap-4">
              <StatBadge label="Functions" value="15+" />
              <StatBadge label="Events" value="5" />
              <StatBadge label="Network" value="ETH" />
            </div>
          </div>
        </motion.div>

        {/* Integration Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            'Real-time Updates',
            'Event Listeners',
            'Gas Optimization',
            'Error Handling',
            'Transaction History',
            'Multi-wallet Support',
            'Network Detection',
            'Auto Refresh'
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + index * 0.05 }}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--card)]/30 border border-[var(--color-accent)]/20/50 rounded-lg"
            >
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
              <span className="text-sm text-gray-300">{feature}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'purple' | 'blue' | 'green' | 'pink';
  delay: number;
}

function FeatureCard({ icon, title, description, color, delay }: FeatureCardProps) {
  const colorClasses = {
    purple: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400',
    blue: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400',
    green: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400',
    pink: 'from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className={`bg-gradient-to-br ${colorClasses[color]} backdrop-blur-xl rounded-2xl p-6 border`}
    >
      <div className={`inline-flex p-3 bg-gradient-to-br ${colorClasses[color]} rounded-xl mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-[var(--color-text-dim)]">{description}</p>
    </motion.div>
  );
}

// Stat Badge Component
interface StatBadgeProps {
  label: string;
  value: string;
}

function StatBadge({ label, value }: StatBadgeProps) {
  return (
    <div className="text-center">
      <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
        {value}
      </div>
      <div className="text-xs text-[var(--color-text-dim)]">{label}</div>
    </div>
  );
}
