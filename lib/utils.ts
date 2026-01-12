export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function getCategoryColor(category: string): string {
  // Use consistent theme color for all categories
  return 'text-[var(--color-accent)]';
}

export function getStatusBadgeClasses(status: string): string {
  switch (status) {
    case 'completed':
    case 'approved':
      return 'px-3 py-1 bg-green-500/20 text-green-400 text-xs rounded-full';
    case 'pending':
      return 'px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full';
    case 'failed':
    case 'rejected':
      return 'px-3 py-1 bg-red-500/20 text-red-400 text-xs rounded-full';
    default:
      return 'px-3 py-1 bg-[var(--elev)] text-[var(--color-muted)] text-xs rounded-full';
  }
}
