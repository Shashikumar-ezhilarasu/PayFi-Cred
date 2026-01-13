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
      <WavyBackground className="max-w-4xl mx-auto pb-40">
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
      </WavyBackground>

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto w-full">
          <WobbleCard
            containerClassName="col-span-1 lg:col-span-2 h-full bg-pink-800 min-h-[500px] lg:min-h-[300px]"
            className=""
          >
            <div className="max-w-xs">
              <h2 className="text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                Gippity AI powers the entire universe
              </h2>
              <p className="mt-4 text-left  text-base/6 text-neutral-200">
                With over 100,000 mothly active bot users, Gippity AI is the most
                popular AI platform for developers.
              </p>
            </div>
            <img
              src="/linear.webp"
              width={500}
              height={500}
              alt="linear demo image"
              className="absolute -right-4 lg:-right-[40%] grayscale filter -bottom-10 object-contain rounded-2xl"
            />
          </WobbleCard>
          <WobbleCard containerClassName="col-span-1 min-h-[300px]">
            <h2 className="max-w-80  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
              No shirt, no shoes, no weapons.
            </h2>
            <p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
              If someone yells “stop!”, goes limp, or taps out, the fight is over.
            </p>
          </WobbleCard>
          <WobbleCard containerClassName="col-span-1 lg:col-span-3 bg-blue-900 min-h-[500px] lg:min-h-[600px] xl:min-h-[300px]">
            <div className="max-w-sm">
              <h2 className="max-w-sm md:max-w-lg  text-left text-balance text-base md:text-xl lg:text-3xl font-semibold tracking-[-0.015em] text-white">
                Signup for blazing-fast cutting-edge state of the art Gippity AI
                wrapper today!
              </h2>
              <p className="mt-4 max-w-[26rem] text-left  text-base/6 text-neutral-200">
                With over 100,000 mothly active bot users, Gippity AI is the most
                popular AI platform for developers.
              </p>
            </div>
            <img
              src="/linear.webp"
              width={500}
              height={500}
              alt="linear demo image"
              className="absolute -right-10 md:-right-[40%] lg:-right-[20%] -bottom-10 object-contain rounded-2xl"
            />
          </WobbleCard>
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
