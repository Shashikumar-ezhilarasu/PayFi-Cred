'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { 
  Shield, 
  Zap, 
  Lock, 
  TrendingUp, 
  ArrowRight, 
  CheckCircle,
  Sparkles
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { wallet } = useAppStore();

  const handleGetStarted = () => {
    if (wallet.connected) {
      router.push('/dashboard');
    } else {
      // Wallet button in header will handle connection
      alert('Please connect your wallet to get started');
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-4xl mx-auto"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center space-x-2 bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/30 px-4 py-2 rounded-full mb-6"
          >
            <Sparkles className="w-4 h-4 text-[var(--color-accent)]" />
            <span className="text-sm font-semibold text-[var(--color-accent)]">
              Powered by Web3 & AI
            </span>
          </motion.div>

          {/* Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[var(--color-accent)] via-[var(--color-accent2)] to-[var(--color-accent)] bg-clip-text text-transparent">
            Income-Backed Credit for Onchain Workers
          </h1>

          <p className="text-xl md:text-2xl text-[var(--color-text-dim)] mb-8 max-w-2xl mx-auto">
            Under-collateralized credit based on your cashflow. Smart accounts ready for humans and AI agents.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleGetStarted}
              className="px-8 py-4 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent2)] text-black rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-[var(--card)] border-2 border-[var(--color-accent)]/30 rounded-xl font-semibold text-lg hover:border-[var(--color-accent)] transition-all"
            >
              Learn More
            </motion.button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            {[
              { label: 'Credit Limit', value: 'Up to $50K' },
              { label: 'Interest Rate', value: '0%' },
              { label: 'Approval Time', value: '< 3 sec' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl font-bold text-[var(--color-accent)]">
                  {stat.value}
                </p>
                <p className="text-sm text-[var(--color-text-dim)] mt-1">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">How On-Chain Credit Works</h2>
          <p className="text-xl text-gray-600 dark:text-[var(--color-text-dim)]">
            Transparent, trustless, and instant
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: Shield,
              title: 'Connect Wallet',
              description: 'Link your MetaMask wallet to get started',
              step: '01',
            },
            {
              icon: Sparkles,
              title: 'Mint Credit NFT',
              description: 'Create your on-chain credit identity',
              step: '02',
            },
            {
              icon: Zap,
              title: 'Spend from Credit',
              description: 'AI evaluates and approves in seconds',
              step: '03',
            },
            {
              icon: TrendingUp,
              title: 'Build Credit',
              description: 'Repay on time and increase your limit',
              step: '04',
            },
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative bg-[var(--card)] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-[var(--color-accent)]/20"
              >
                <div className="absolute -top-4 left-6 bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent2)] text-black w-12 h-12 rounded-lg flex items-center justify-center font-bold">
                  {item.step}
                </div>

                <div className="mt-8">
                  <Icon className="w-12 h-12 text-[var(--color-accent)] mb-4" />
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-[var(--color-text-dim)]">{item.description}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Why Choose PayForMe?</h2>
          <p className="text-xl text-gray-600 dark:text-[var(--color-text-dim)]">
            The future of decentralized finance
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: Lock,
              title: 'Trustless & Transparent',
              description: 'All credit decisions recorded on-chain with verifiable proof',
            },
            {
              icon: Zap,
              title: 'Instant Decisions',
              description: 'AI-powered MCP agent evaluates and approves in under 3 seconds',
            },
            {
              icon: Shield,
              title: 'Secure by Design',
              description: 'Your credit identity is a non-transferable NFT you control',
            },
            {
              icon: TrendingUp,
              title: 'Build Credit Score',
              description: 'Every successful repayment increases your on-chain credit',
            },
            {
              icon: CheckCircle,
              title: '0% Interest',
              description: 'Pay nothing extra when you repay within 30 days',
            },
            {
              icon: Sparkles,
              title: 'Web3 Native',
              description: 'Works across partner apps with one credit identity',
            },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-[var(--card)] rounded-xl p-6 shadow-lg border border-[var(--color-accent)]/20"
              >
                <Icon className="w-10 h-10 text-[var(--color-accent)] mb-4" />
                <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                <p className="text-[var(--color-text-dim)] text-sm">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-accent2)] rounded-3xl p-12 text-center text-black max-w-4xl mx-auto shadow-2xl"
        >
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join the future of decentralized credit today
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleGetStarted}
            className="px-8 py-4 bg-[var(--bg)] text-[var(--color-accent)] border-2 border-[var(--color-accent)] rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl transition-all"
          >
            Connect Wallet & Start
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}
