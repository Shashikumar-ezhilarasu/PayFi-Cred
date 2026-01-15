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
import { NoiseBackground } from '@/components/ui/noise-background';
import { WobbleCard } from '@/components/ui/wobble-card';
import { WavyBackground } from '@/components/ui/wavy-background';
import { InfiniteMovingCards } from '@/components/ui/infinite-moving-cards';
import AppleCardsCarouselDemo from '@/components/apple-cards-carousel-demo';

const testimonials = [
  {
    quote:
      "PayFi-Cred revolutionized how I access credit. As a freelance developer, traditional banks never understood my income streams. Now I get instant credit based on my actual on-chain earnings.",
    name: "Alex Chen",
    title: "Web3 Developer",
  },
  {
    quote:
      "The AI agent feature is incredible. It manages my spending caps and automatically handles repayments. I've never missed a payment since I started using PayFi-Cred.",
    name: "Sarah Mitchell",
    title: "DAO Contributor",
  },
  {
    quote:
      "Zero interest for 30 days is a game-changer. I can bridge cash flow gaps without worrying about accumulating debt. This is what DeFi should be.",
    name: "Marcus Johnson",
    title: "NFT Artist",
  },
  {
    quote:
      "My Credit NFT is my most valuable asset. It carries my entire credit history on-chain, and I can use it across multiple Shardeum apps. True financial portability.",
    name: "Elena Rodriguez",
    title: "DeFi Researcher",
  },
  {
    quote:
      "The income verification through vlayer proofs gave me a $25K credit line in under 3 seconds. No paperwork, no waiting, no traditional credit checks. The future is here.",
    name: "David Kim",
    title: "Smart Contract Auditor",
  },
];

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
    <div className="min-h-screen bg-[var(--bg)] overflow-x-hidden max-w-4xl ml-0 flex flex-col items-start justify-start">
      <WavyBackground className="max-w-4xl pb-40">
        <div className="max-w-4xl w-full">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-white text-center">
            Income-Backed Credit for Onchain Workers
          </h1>
          <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto text-center">
            Under-collateralized credit based on your cashflow. Smart accounts ready for humans and AI agents.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <NoiseBackground
              containerClassName="w-fit p-2 rounded-full mx-auto"
              gradientColors={[
                "rgb(255, 100, 150)",
                "rgb(100, 150, 255)",
                "rgb(255, 200, 100)",
              ]}
            >
              <button 
                onClick={handleGetStarted}
                className="h-full w-full cursor-pointer rounded-full bg-linear-to-r from-neutral-100 via-neutral-100 to-white px-8 py-4 text-black shadow-[0px_2px_0px_0px_var(--color-neutral-50)_inset,0px_0.5px_1px_0px_var(--color-neutral-400)] transition-all duration-100 active:scale-98 dark:from-black dark:via-black dark:to-neutral-900 dark:text-white dark:shadow-[0px_1px_0px_0px_var(--color-neutral-950)_inset,0px_1px_0px_0px_var(--color-neutral-800)] font-semibold text-lg flex items-center space-x-2"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </NoiseBackground>
          </div>
        </div>
      </WavyBackground>

      {/* How It Works */}
      <section className="container px-4 py-20 w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-left mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">How On-Chain Credit Works</h2>
          <p className="text-xl text-gray-600 dark:text-[var(--color-text-dim)]">
            Transparent, trustless, and instant
          </p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-8 max-w-6xl">
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
      <section className="container px-4 py-20 w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-left mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Why Choose PayFi-Cred?</h2>
          <p className="text-xl text-gray-600 dark:text-[var(--color-text-dim)]">
            The future of decentralized credit on Shardeum
          </p>
        </motion.div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl w-full">
          <WobbleCard
            containerClassName="col-span-1 lg:col-span-2 h-full bg-gradient-to-br from-indigo-900 to-purple-900 min-h-[500px] lg:min-h-[300px] flex items-center justify-center"
            className=""
          >
            <div className="max-w-lg mx-auto text-center">
              <h2 className="text-center text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                AI-Powered Credit Decisions in Seconds
              </h2>
              <p className="mt-4 text-center text-base/6 text-neutral-200">
                Our MCP AI Agent evaluates your on-chain income and approves credit requests in under 3 seconds. No lengthy applications, no credit bureaus—just transparent, trustless lending.
              </p>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-10 w-64 h-64 bg-gradient-to-br from-cyan-400/20 to-purple-400/20 rounded-full blur-3xl" />
          </WobbleCard>
          <WobbleCard containerClassName="col-span-1 min-h-[300px] bg-gradient-to-br from-emerald-900 to-teal-900 flex items-center justify-center">
            <div className="text-center mx-auto">
              <h2 className="max-w-80 mx-auto text-center text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                0% Interest on Repayments
              </h2>
              <p className="mt-4 max-w-[26rem] mx-auto text-center text-base/6 text-neutral-200">
                Pay back within 30 days and owe nothing extra. Build your on-chain credit score with every successful repayment.
              </p>
            </div>
          </WobbleCard>
          <WobbleCard containerClassName="col-span-1 lg:col-span-3 bg-gradient-to-br from-blue-900 to-cyan-900 min-h-[500px] lg:min-h-[600px] xl:min-h-[300px] flex items-center justify-center">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="max-w-lg mx-auto text-center text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                Credit NFT: Your Portable On-Chain Identity
              </h2>
              <p className="mt-4 max-w-[36rem] mx-auto text-center text-base/6 text-neutral-200">
                Mint a soulbound Credit NFT that stores your credit history, score, and limits. Use it across partner apps in the Shardeum ecosystem. Your credit identity, owned by you, secured by the blockchain.
              </p>
            </div>
            <div className="absolute left-1/2 -translate-x-1/2 -bottom-10 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl" />
          </WobbleCard>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container px-4 py-20 w-full max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-left mb-16"
        >
          <h2 className="text-4xl font-bold mb-4">Trusted by Web3 Builders</h2>
          <p className="text-xl text-gray-600 dark:text-[var(--color-text-dim)]">
            See what our users are saying about PayFi-Cred
          </p>
        </motion.div>
        <div className="rounded-md flex flex-col antialiased items-center justify-center relative overflow-hidden">
          <InfiniteMovingCards
            items={testimonials}
            direction="right"
            speed="slow"
          />
        </div>
      </section>

      {/* Features Carousel */}
      <section className="py-10 w-full max-w-4xl">
        <AppleCardsCarouselDemo />
      </section>
    </div>
  );
}
