import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  subtext?: string;
  iconColor?: string;
}

export function StatsCard({ icon: Icon, label, value, subtext, iconColor = 'text-[var(--color-accent)]' }: StatsCardProps) {
  return (
    <div className="card p-6">
      <div className="flex items-center gap-3 mb-2">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <span className="text-sm text-[var(--color-muted)]">{label}</span>
      </div>
      <p className="text-3xl font-bold text-[var(--color-text)]">{value}</p>
      {subtext && <p className="text-xs text-[var(--color-muted)] mt-1">{subtext}</p>}
    </div>
  );
}
