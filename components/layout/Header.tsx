'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import { WalletButton } from '@/components/wallet/WalletButton';
import { motion } from 'framer-motion';

export function Header() {
  const pathname = usePathname();
  const { wallet } = useAppStore();

  const isLandingPage = pathname === '/';

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 border-b border-[var(--color-divider)] bg-[var(--card)]/80 backdrop-blur-lg"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 neon-bg rounded-lg flex items-center justify-center">
              <span className="text-[var(--bg)] font-bold text-lg">P</span>
            </div>
            <span className="text-xl font-bold neon-text">
              Pay-Fi
            </span>
          </Link>

          {/* Center tagline - only show when connected and not on landing */}
          {!isLandingPage && wallet.connected && (
            <div className="hidden md:block">
              <p className="text-sm text-[var(--color-text-alt)]">
                Income-Backed Credit • AI Agent Ready
              </p>
            </div>
          )}

          {/* Right side - Wallet button */}
          <div className="flex items-center gap-4">
            <WalletButton />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
