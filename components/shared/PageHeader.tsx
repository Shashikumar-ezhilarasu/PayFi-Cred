import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ icon: Icon, title, subtitle, actions }: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-6"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-8 h-8 text-[var(--color-accent)]" />
        <div>
          <h1 className="text-3xl font-bold neon-text">{title}</h1>
          {subtitle && <p className="text-sm text-[var(--color-text-alt)] mt-1">{subtitle}</p>}
        </div>
      </div>
      {actions && <div>{actions}</div>}
    </motion.div>
  );
}
