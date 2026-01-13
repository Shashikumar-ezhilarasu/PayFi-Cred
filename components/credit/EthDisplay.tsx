/**
 * SHM Display Component with Full Precision
 * Shows complete SHM values without rounding
 */

interface EthDisplayProps {
  value: number | string;
  label?: string;
  showFiat?: boolean;
  fiatRate?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function EthDisplay({
  value,
  label,
  showFiat = false,
  fiatRate = 0.05, // Default SHM price
  size = 'md',
  className = '',
}: EthDisplayProps) {
  const ethValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Format with full precision
  const fullPrecision = ethValue.toFixed(18).replace(/\.?0+$/, ''); // Remove trailing zeros
  const roundedValue = ethValue.toFixed(2);
  const fiatValue = (ethValue * fiatRate).toFixed(2);
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-2xl',
  };
  
  return (
    <div className={`font-mono ${className}`}>
      {label && (
        <div className="text-xs text-[var(--color-text-dim)] dark:text-[var(--color-text-dim)] mb-1">
          {label}
        </div>
      )}
      <div className={`${sizeClasses[size]} font-semibold`}>
        <span className="text-green-600 dark:text-green-400">
          {fullPrecision}
        </span>
        <span className="text-[var(--color-text-dim)] ml-1">SHM</span>
      </div>
      <div className="text-xs text-[var(--color-text-dim)] mt-0.5">
        ≈ {roundedValue} SHM
        {showFiat && ` ($${fiatValue})`}
      </div>
    </div>
  );
}

/**
 * Credit Ratio Display (Used / Limit)
 */
interface CreditRatioDisplayProps {
  used: number;
  limit: number;
  available?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CreditRatioDisplay({
  used,
  limit,
  available,
  size = 'md',
  className = '',
}: CreditRatioDisplayProps) {
  const usedPrecision = used.toFixed(18).replace(/\.?0+$/, '');
  const limitPrecision = limit.toFixed(18).replace(/\.?0+$/, '');
  const utilizationPercent = limit > 0 ? (used / limit) * 100 : 0;
  
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
  };
  
  const getUtilizationColor = () => {
    if (utilizationPercent < 50) return 'text-green-500';
    if (utilizationPercent < 75) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  return (
    <div className={`font-mono ${className}`}>
      <div className={`${sizeClasses[size]} font-semibold`}>
        <span className={getUtilizationColor()}>
          {usedPrecision}
        </span>
        <span className="text-[var(--color-text-dim)] mx-2">/</span>
        <span className="text-blue-500">
          {limitPrecision}
        </span>
        <span className="text-[var(--color-text-dim)] ml-1">SHM</span>
      </div>
      
      <div className="text-xs text-[var(--color-text-dim)] mt-1 space-y-0.5">
        <div>Used: {used.toFixed(2)} SHM ({utilizationPercent.toFixed(1)}%)</div>
        <div>Limit: {limit.toFixed(2)} SHM</div>
        {available !== undefined && (
          <div className="text-green-400">Available: {available.toFixed(2)} SHM</div>
        )}
      </div>
    </div>
  );
}

/**
 * Mini SHM display for tables/lists
 */
interface MiniEthDisplayProps {
  value: number;
  className?: string;
}

export function MiniEthDisplay({ value, className = '' }: MiniEthDisplayProps) {
  const fullPrecision = value.toFixed(18).replace(/\.?0+$/, '');
  
  return (
    <span className={`font-mono text-sm ${className}`} title={`${fullPrecision} SHM`}>
      <span className="text-green-500">{value.toFixed(2)}</span>
      <span className="text-[var(--color-text-dim)] ml-1">SHM</span>
    </span>
  );
}
