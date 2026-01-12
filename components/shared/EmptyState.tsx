import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <Icon className="w-16 h-16 text-[var(--color-muted)] mx-auto mb-4" />
      <p className="text-[var(--color-text-alt)] mb-2">{title}</p>
      <p className="text-sm text-[var(--color-muted)] mb-4">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2 bg-[var(--color-accent)] text-[var(--bg)] rounded-lg hover:opacity-90 transition-opacity neon-glow"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
