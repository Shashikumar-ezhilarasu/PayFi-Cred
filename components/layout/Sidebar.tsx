'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';
import {
  LayoutDashboard,
  CreditCard,
  Receipt,
  DollarSign,
  User,
  Zap,
  Bot,
  CheckCircle,
  Settings,
} from 'lucide-react';
import { motion } from 'framer-motion';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Request Credit', href: '/request-credit', icon: CreditCard, highlight: true },
  { name: 'Payment Requests', href: '/payment-requests', icon: Zap },
  { name: 'Approved Payments', href: '/approved-payments', icon: CheckCircle },
  { name: 'Credit Identity', href: '/credit-identity', icon: CreditCard },
  { name: 'Transactions', href: '/transactions', icon: Receipt },
  { name: 'Repayment', href: '/repayment', icon: DollarSign },
];

const agentSection = [
  { name: 'AI Agent Cockpit', href: '/agent', icon: Bot },
  { name: 'Agent Settings', href: '/agent-settings', icon: Settings },
];

const profileSection = [
  { name: 'Profile', href: '/profile', icon: User },
];

const partnerApps = [];

export function Sidebar() {
  const pathname = usePathname();
  const { wallet } = useAppStore();
  
  // Don't show sidebar on landing page or if wallet not connected
  if (pathname === '/' || !wallet.connected) {
    return null;
  }

  return (
    <motion.aside
      initial={{ x: -100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:pt-16 border-r border-[var(--color-divider)] bg-[var(--card)]"
    >
      <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4 px-3">
        {/* Main Navigation */}
        <nav className="space-y-1">
          <p className="px-3 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-2">
            Credit & Payments
          </p>
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            const isHighlight = 'highlight' in item && item.highlight;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-grid px-3 py-2 text-sm font-medium rounded-xl transition-all relative ${
                  isActive
                    ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] neon-border'
                    : isHighlight
                    ? 'bg-[var(--color-accent2)]/10 text-[var(--color-accent2)] border border-[var(--color-accent2)]/30 hover:bg-[var(--color-accent2)]/20'
                    : 'text-[var(--color-text-alt)] hover:bg-[var(--elev)] hover:text-[var(--color-text)] border border-transparent'
                }`}
              >
                <Icon
                  className={`flex-shrink-0 h-5 w-5 transition-colors ${
                    isActive
                      ? 'text-[var(--color-accent)]'
                      : isHighlight
                      ? 'text-[var(--color-accent2)]'
                      : 'text-[var(--color-muted)] group-hover:text-[var(--color-text)]'
                  }`}
                />
                {item.name}
                {isHighlight && !isActive && (
                  <span className="ml-auto px-2 py-0.5 text-xs font-semibold bg-[var(--color-accent2)] text-[var(--bg)] rounded-full">
                    NEW
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Agent Section */}
        <nav className="mt-8 space-y-1">
          <p className="px-3 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-2">
            AI Agent
          </p>
          {agentSection.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-grid px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                  isActive
                    ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] neon-border'
                    : 'text-[var(--color-text-alt)] hover:bg-[var(--elev)] hover:text-[var(--color-text)] border border-transparent'
                }`}
              >
                <Icon
                  className={`flex-shrink-0 h-5 w-5 transition-colors ${
                    isActive
                      ? 'text-[var(--color-accent)]'
                      : 'text-[var(--color-muted)] group-hover:text-[var(--color-text)]'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Profile Section */}
        <nav className="mt-8 space-y-1">
          <p className="px-3 text-xs font-semibold text-[var(--color-muted)] uppercase tracking-wider mb-2">
            Account
          </p>
          {profileSection.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center gap-grid px-3 py-2 text-sm font-medium rounded-xl transition-all ${
                  isActive
                    ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] neon-border'
                    : 'text-[var(--color-text-alt)] hover:bg-[var(--elev)] hover:text-[var(--color-text)] border border-transparent'
                }`}
              >
                <Icon
                  className={`flex-shrink-0 h-5 w-5 transition-colors ${
                    isActive
                      ? 'text-[var(--color-accent)]'
                      : 'text-[var(--color-muted)] group-hover:text-[var(--color-text)]'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Info Card */}
        <div className="mt-auto p-4 bg-[var(--elev)] rounded-xl border border-[var(--color-divider)]">
          <h3 className="text-sm font-semibold text-[var(--color-accent)] mb-1">
            🚀 Pay-Fi Credit
          </h3>
          <p className="text-xs text-[var(--color-text-alt)] leading-relaxed">
            AI-powered income-backed credit
          </p>
        </div>
      </div>
    </motion.aside>
  );
}
