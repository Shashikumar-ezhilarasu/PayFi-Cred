'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Wallet, 
  DollarSign, 
  Bot, 
  Shield,
  TrendingUp,
  Calendar,
  Sparkles,
  FileCheck
} from 'lucide-react';
import { Header } from '@/components/layout/Header';
import CreditDashboard from '@/components/credit/CreditDashboard';
import IncomeVerification from '@/components/credit/IncomeVerification';
import VlayerIncomeProof from '@/components/credit/VlayerIncomeProof';
import AIAgentManager from '@/components/credit/AIAgentManager';
import AgentManager from '@/components/credit/AgentManager';

type TabType = 'credit' | 'income' | 'vlayer' | 'agents' | 'verifier';

export default function PayFiPage() {
  const [activeTab, setActiveTab] = useState<TabType>('credit');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-semibold text-purple-300">
              Income-Backed Credit • AI Agent Ready
            </span>
          </motion.div>

          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Pay-fi Protocol
            </span>
          </h1>

          <p className="text-xl text-[var(--color-text-dim)] max-w-3xl mx-auto mb-6">
            Under-collateralized credit based on your onchain income and cashflow. 
            Smart accounts designed for humans and their future AI agents.
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-[var(--color-text-dim)]">
            <div className="flex items-center gap-2 px-4 py-2 bg-[var(--card)]/50 rounded-full border border-[var(--color-accent)]/20">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Vlayer Verified</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[var(--card)]/50 rounded-full border border-[var(--color-accent)]/20">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Cashflow-Based</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[var(--card)]/50 rounded-full border border-[var(--color-accent)]/20">
              <Bot className="w-4 h-4 text-purple-400" />
              <span>Agent Ready</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-[var(--card)]/50 rounded-full border border-[var(--color-accent)]/20">
              <DollarSign className="w-4 h-4 text-yellow-400" />
              <span>Yellow Network</span>
            </div>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex justify-center mb-8"
        >
          <div className="inline-flex bg-[var(--card)]/50 backdrop-blur-xl rounded-2xl p-2 border border-[var(--color-accent)]/20/50 overflow-x-auto">
            <TabButton
              active={activeTab === 'credit'}
              onClick={() => setActiveTab('credit')}
              icon={<Wallet className="w-5 h-5" />}
              label="Credit Account"
            />
            <TabButton
              active={activeTab === 'income'}
              onClick={() => setActiveTab('income')}
              icon={<DollarSign className="w-5 h-5" />}
              label="Income Verification"
            />
            <TabButton
              active={activeTab === 'vlayer'}
              onClick={() => setActiveTab('vlayer')}
              icon={<FileCheck className="w-5 h-5" />}
              label="Vlayer Proof"
            />
            <TabButton
              active={activeTab === 'agents'}
              onClick={() => setActiveTab('agents')}
              icon={<Bot className="w-5 h-5" />}
              label="AI Agents"
            />
            <TabButton
              active={activeTab === 'verifier'}
              onClick={() => setActiveTab('verifier')}
              icon={<Shield className="w-5 h-5" />}
              label="Verifier Tools"
            />
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'credit' && <CreditDashboard />}
          {activeTab === 'income' && <IncomeVerification />}
          {activeTab === 'vlayer' && <VlayerIncomeProof />}
          {activeTab === 'agents' && <AIAgentManager />}
          {activeTab === 'verifier' && <AgentManager />}
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <FeatureCard
            icon={<Shield className="w-6 h-6" />}
            title="Vlayer Proofs"
            description="Cryptographic verification of income sources and cashflow history"
            gradient="from-green-500/20 to-emerald-500/20"
            borderColor="border-green-500/30"
          />
          <FeatureCard
            icon={<Wallet className="w-6 h-6" />}
            title="Smart Account"
            description="Programmable account where income lands and expenses are paid"
            gradient="from-purple-500/20 to-pink-500/20"
            borderColor="border-purple-500/30"
          />
          <FeatureCard
            icon={<Calendar className="w-6 h-6" />}
            title="Auto Repayment"
            description="Repayments automatically scheduled from future cashflows"
            gradient="from-blue-500/20 to-cyan-500/20"
            borderColor="border-blue-500/30"
          />
          <FeatureCard
            icon={<Bot className="w-6 h-6" />}
            title="AI Co-Pilots"
            description="Let AI agents manage bills and subscriptions under strict policies"
            gradient="from-orange-500/20 to-red-500/20"
            borderColor="border-orange-500/30"
          />
        </motion.div>

        {/* How It Works */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl rounded-2xl p-8 border border-[var(--color-accent)]/20/50"
        >
          <h2 className="text-2xl font-bold mb-6 text-center">How Pay-fi Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StepCard
              number="1"
              title="Connect Wallet"
              description="Link your wallet and create a smart account"
            />
            <StepCard
              number="2"
              title="Register Income"
              description="Add stablecoin income sources (payroll, grants, streams)"
            />
            <StepCard
              number="3"
              title="Verify with Vlayer"
              description="Generate cryptographic proof of your cashflow"
            />
            <StepCard
              number="4"
              title="Get Credit"
              description="Receive dynamic credit limit based on verified income"
            />
          </div>
        </motion.div>

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 bg-blue-500/10 border border-blue-500/30 rounded-xl p-6"
        >
          <h3 className="font-semibold text-blue-400 mb-3">Built With</h3>
          <div className="flex flex-wrap gap-3">
            {[
              'Polygon EVM',
              'Vlayer Web Proofs',
              'Yellow Network',
              'Smart Contracts',
              'ethers.js',
              'Next.js',
              'TypeScript'
            ].map((tech, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-lg text-sm text-blue-300"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  );
}

// Tab Button Component
interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-300 whitespace-nowrap ${
        active
          ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
          : 'text-[var(--color-text-dim)] hover:text-white'
      }`}
    >
      {icon}
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

// Feature Card Component
interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  gradient: string;
  borderColor: string;
}

function FeatureCard({ icon, title, description, gradient, borderColor }: FeatureCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      className={`bg-gradient-to-br ${gradient} backdrop-blur-xl rounded-2xl p-6 border ${borderColor}`}
    >
      <div className={`inline-flex p-3 bg-gradient-to-br ${gradient} rounded-xl mb-4`}>
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-[var(--color-text-dim)]">{description}</p>
    </motion.div>
  );
}

// Step Card Component
interface StepCardProps {
  number: string;
  title: string;
  description: string;
}

function StepCard({ number, title, description }: StepCardProps) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-bold text-lg mb-4">
        {number}
      </div>
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm text-[var(--color-text-dim)]">{description}</p>
    </div>
  );
}
