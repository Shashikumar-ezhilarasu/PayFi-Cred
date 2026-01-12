export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-12 w-12',
    lg: 'h-16 w-16',
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div
        className={`animate-spin rounded-full border-t-2 border-b-2 border-[var(--color-accent)] ${sizeClasses[size]}`}
      ></div>
    </div>
  );
}
