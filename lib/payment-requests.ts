/**
 * Payment Request System
 * Handles payment requests from merchants to AI agents
 */

import type { SpendingCategory } from './agent-policy';

export type PaymentRequestStatus = 'pending' | 'approved' | 'rejected' | 'paid' | 'failed';

export interface PaymentRequest {
  id: string;
  merchantName: string;
  merchantType: SpendingCategory;
  merchantWallet?: string; // Real wallet address for partner
  amount: number;
  description: string;
  recurring: boolean;
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  dueDate: string;
  timestamp: string;
  status: PaymentRequestStatus;
  isUserInitiated?: boolean; // True if user manually requested
  agentDecision?: {
    approved: boolean;
    reason: string;
    timestamp: string;
    categoryUsage: number;
    autoApproved: boolean;
  };
}

export interface Merchant {
  id: string;
  name: string;
  category: SpendingCategory;
  wallet?: string; // Real wallet address for partner
  logo: string;
  description: string;
  typicalAmount: number;
  recurringOptions: boolean;
  billingCycle: 'monthly' | 'usage-based' | 'one-time';
}

/**
 * Mock merchants that can request payments
 * Now with real wallet addresses for partner apps
 */
export const MERCHANTS: Merchant[] = [
  // Entertainment & Subscriptions
  {
    id: 'spotify',
    name: 'Spotify Premium',
    category: 'subscriptions',
    logo: '🎵',
    description: 'Music streaming service',
    typicalAmount: 0.00005,
    recurringOptions: true,
    billingCycle: 'monthly',
  },
  {
    id: 'netflix',
    name: 'Netflix',
    wallet: '0x4E57DE087B6474F70D508d18724cDC3917063D63',
    category: 'entertainment',
    logo: '🎬',
    description: 'Streaming entertainment',
    typicalAmount: 0.00006,
    recurringOptions: true,
    billingCycle: 'monthly',
  },
  {
    id: 'youtube',
    name: 'YouTube Premium',
    category: 'entertainment',
    logo: '📺',
    description: 'Ad-free videos',
    typicalAmount: 0.00004,
    recurringOptions: true,
    billingCycle: 'monthly',
  },
  {
    id: 'disney',
    name: 'Disney+',
    category: 'entertainment',
    logo: '🏰',
    description: 'Streaming service',
    typicalAmount: 0.00003,
    recurringOptions: true,
    billingCycle: 'monthly',
  },
  
  // Cloud & Infrastructure
  {
    id: 'aws',
    name: 'AWS Cloud Services',
    wallet: '0x069c84b7e95B17a1c258715E1999256325D1d076',
    category: 'utilities',
    logo: '☁️',
    description: 'Cloud computing platform',
    typicalAmount: 0.0002,
    recurringOptions: true,
    billingCycle: 'usage-based',
  },
  {
    id: 'gcp',
    name: 'Google Cloud',
    category: 'utilities',
    logo: '🌩️',
    description: 'GCP services',
    typicalAmount: 0.00015,
    recurringOptions: true,
    billingCycle: 'usage-based',
  },
  {
    id: 'azure',
    name: 'Azure',
    category: 'utilities',
    logo: '⛅',
    description: 'Microsoft cloud',
    typicalAmount: 0.00018,
    recurringOptions: true,
    billingCycle: 'usage-based',
  },
  {
    id: 'digitalocean',
    name: 'DigitalOcean',
    category: 'utilities',
    logo: '🌊',
    description: 'VPS hosting',
    typicalAmount: 0.00004,
    recurringOptions: true,
    billingCycle: 'monthly',
  },
  {
    id: 'vercel',
    name: 'Vercel Pro',
    category: 'utilities',
    logo: '▲',
    description: 'Frontend cloud platform',
    typicalAmount: 0.00008,
    recurringOptions: true,
    billingCycle: 'usage-based',
  },
  {
    id: 'netlify',
    name: 'Netlify',
    category: 'utilities',
    logo: '🦋',
    description: 'Jamstack hosting',
    typicalAmount: 0.00006,
    recurringOptions: true,
    billingCycle: 'monthly',
  },
  {
    id: 'heroku',
    name: 'Heroku',
    category: 'utilities',
    logo: '🟣',
    description: 'App platform',
    typicalAmount: 0.00003,
    recurringOptions: true,
    billingCycle: 'monthly',
  },
  {
    id: 'railway',
    name: 'Railway',
    category: 'utilities',
    logo: '🚄',
    description: 'Deployment platform',
    typicalAmount: 0.00002,
    recurringOptions: true,
    billingCycle: 'usage-based',
  },
  
  // Developer Tools
  {
    id: 'github',
    name: 'GitHub Pro',
    category: 'subscriptions',
    logo: '🐙',
    description: 'Code hosting platform',
    typicalAmount: 0.00002,
    recurringOptions: true,
    billingCycle: 'monthly',
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    category: 'subscriptions',
    logo: '🦊',
    description: 'DevOps platform',
    typicalAmount: 0.00006,
    recurringOptions: true,
    billingCycle: 'monthly',
  },
  {
    id: 'jira',
    name: 'Jira',
    category: 'subscriptions',
    logo: '📋',
    description: 'Project management',
    typicalAmount: 0.00003,
    recurringOptions: true,
    billingCycle: 'monthly',
  },
  
  // AI & APIs
  {
    id: 'openai',
    name: 'OpenAI API',
    category: 'utilities',
    logo: '🤖',
    description: 'AI API services',
    typicalAmount: 0.0001,
    recurringOptions: true,
    billingCycle: 'usage-based',
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    category: 'utilities',
    logo: '🧠',
    description: 'Claude API',
    typicalAmount: 0.00009,
    recurringOptions: true,
    billingCycle: 'usage-based',
  },
  {
    id: 'replicate',
    name: 'Replicate',
    category: 'utilities',
    logo: '🔮',
    description: 'ML models',
    typicalAmount: 0.00005,
    recurringOptions: true,
    billingCycle: 'usage-based',
  },
  
  // Automation & Integration
  {
    id: 'zapier',
    name: 'Zapier',
    category: 'utilities',
    logo: '⚡',
    description: 'Workflow automation platform',
    typicalAmount: 0.00008,
    recurringOptions: true,
    billingCycle: 'monthly',
  },
  {
    id: 'make',
    name: 'Make',
    category: 'utilities',
    logo: '🔧',
    description: 'Integration platform',
    typicalAmount: 0.00004,
    recurringOptions: true,
    billingCycle: 'monthly',
  },
  {
    id: 'n8n',
    name: 'n8n',
    category: 'utilities',
    logo: '🔗',
    description: 'Workflow automation',
    typicalAmount: 0.00002,
    recurringOptions: true,
    billingCycle: 'monthly',
  },
  
  // Design & Creative
  {
    id: 'adobe',
    name: 'Adobe Creative Cloud',
    category: 'subscriptions',
    logo: '🎨',
    description: 'Creative software suite',
    typicalAmount: 0.0002,
    recurringOptions: true,
    billingCycle: 'monthly',
  },
  {
    id: 'figma',
    name: 'Figma',
    category: 'subscriptions',
    logo: '🎯',
    description: 'Design tool',
    typicalAmount: 0.00005,
    recurringOptions: true,
    billingCycle: 'monthly',
  },
  {
    id: 'canva',
    name: 'Canva Pro',
    category: 'subscriptions',
    logo: '✨',
    description: 'Graphic design',
    typicalAmount: 0.00004,
    recurringOptions: true,
    billingCycle: 'monthly',
  },
  
  // Communication
  {
    id: 'slack',
    name: 'Slack',
    category: 'subscriptions',
    logo: '💬',
    description: 'Team chat',
    typicalAmount: 0.00003,
    recurringOptions: true,
    billingCycle: 'monthly',
  },
  {
    id: 'zoom',
    name: 'Zoom',
    category: 'subscriptions',
    logo: '🎥',
    description: 'Video conferencing',
    typicalAmount: 0.00006,
    recurringOptions: true,
    billingCycle: 'monthly',
  },
  {
    id: 'twilio',
    name: 'Twilio',
    category: 'utilities',
    logo: '📞',
    description: 'SMS & Voice API',
    typicalAmount: 0.00003,
    recurringOptions: true,
    billingCycle: 'usage-based',
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    category: 'utilities',
    logo: '📧',
    description: 'Email API',
    typicalAmount: 0.00004,
    recurringOptions: true,
    billingCycle: 'usage-based',
  },
  
  // Database & Storage
  {
    id: 'mongodb',
    name: 'MongoDB Atlas',
    category: 'utilities',
    logo: '🍃',
    description: 'Database hosting',
    typicalAmount: 0.00007,
    recurringOptions: true,
    billingCycle: 'usage-based',
  },
  {
    id: 'supabase',
    name: 'Supabase',
    category: 'utilities',
    logo: '⚡',
    description: 'Backend platform',
    typicalAmount: 0.00001,
    recurringOptions: true,
    billingCycle: 'usage-based',
  },
  {
    id: 'planetscale',
    name: 'PlanetScale',
    category: 'utilities',
    logo: '🌍',
    description: 'MySQL platform',
    typicalAmount: 0.00004,
    recurringOptions: true,
    billingCycle: 'usage-based',
  },
  
  // Security & Monitoring
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    category: 'utilities',
    logo: '🛡️',
    description: 'CDN & Security',
    typicalAmount: 0.00008,
    recurringOptions: true,
    billingCycle: 'monthly',
  },
  {
    id: 'datadog',
    name: 'Datadog',
    category: 'utilities',
    logo: '📊',
    description: 'Monitoring',
    typicalAmount: 0.00012,
    recurringOptions: true,
    billingCycle: 'usage-based',
  },
  {
    id: 'sentry',
    name: 'Sentry',
    category: 'utilities',
    logo: '🔍',
    description: 'Error tracking',
    typicalAmount: 0.00003,
    recurringOptions: true,
    billingCycle: 'monthly',
  },
  
  // Payment & Finance
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'utilities',
    logo: '💳',
    description: 'Payment processing',
    typicalAmount: 0.00005,
    recurringOptions: true,
    billingCycle: 'usage-based',
  },
  
  // Food & Transport
  {
    id: 'uber',
    name: 'Uber',
    category: 'transport',
    logo: '🚗',
    description: 'Ride sharing service',
    typicalAmount: 0.00003,
    recurringOptions: false,
    billingCycle: 'one-time',
  },
  {
    id: 'lyft',
    name: 'Lyft',
    category: 'transport',
    logo: '🚕',
    description: 'Ride sharing',
    typicalAmount: 0.00003,
    recurringOptions: false,
    billingCycle: 'one-time',
  },
  {
    id: 'doordash',
    name: 'DoorDash',
    category: 'food',
    logo: '🍔',
    description: 'Food delivery',
    typicalAmount: 0.00004,
    recurringOptions: false,
    billingCycle: 'one-time',
  },
  {
    id: 'ubereats',
    name: 'Uber Eats',
    category: 'food',
    logo: '🍕',
    description: 'Food delivery',
    typicalAmount: 0.00004,
    recurringOptions: false,
    billingCycle: 'one-time',
  },
  {
    id: 'grubhub',
    name: 'Grubhub',
    category: 'food',
    logo: '🥡',
    description: 'Food delivery',
    typicalAmount: 0.00004,
    recurringOptions: false,
    billingCycle: 'one-time',
  },
];

/**
 * Generate a payment request from a merchant
 */
export function createPaymentRequest(
  merchantId: string,
  customAmount?: number,
  recurring?: boolean,
  frequency?: 'daily' | 'weekly' | 'monthly' | 'yearly',
  isUserInitiated = false
): PaymentRequest {
  const merchant = MERCHANTS.find(m => m.id === merchantId);
  if (!merchant) {
    throw new Error(`Merchant ${merchantId} not found`);
  }

  const amount = customAmount || merchant.typicalAmount;
  const now = new Date();
  
  // Calculate due date based on frequency or billing cycle
  let dueDate = new Date(now);
  if (frequency === 'monthly' || merchant.billingCycle === 'monthly') {
    dueDate.setMonth(dueDate.getMonth() + 1);
  } else if (frequency === 'yearly') {
    dueDate.setFullYear(dueDate.getFullYear() + 1);
  } else if (frequency === 'weekly') {
    dueDate.setDate(dueDate.getDate() + 7);
  } else if (frequency === 'daily') {
    dueDate.setDate(dueDate.getDate() + 1);
  } else if (merchant.billingCycle === 'usage-based') {
    dueDate.setDate(dueDate.getDate() + 3); // 3 days for usage-based
  } else {
    dueDate.setDate(dueDate.getDate() + 7); // Default 7 days
  }

  return {
    id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    merchantName: merchant.name,
    merchantType: merchant.category,
    merchantWallet: merchant.wallet,
    amount,
    description: `${recurring ? 'Recurring' : 'One-time'} payment for ${merchant.description}`,
    recurring: recurring || false,
    frequency: recurring ? frequency : undefined,
    dueDate: dueDate.toISOString(),
    timestamp: now.toISOString(),
    status: 'pending',
    isUserInitiated,
  };
}

/**
 * Simulate random payment requests from merchants
 */
export function generateRandomPaymentRequest(): PaymentRequest {
  const merchant = MERCHANTS[Math.floor(Math.random() * MERCHANTS.length)];
  const recurring = merchant.recurringOptions && Math.random() > 0.5;
  const frequency = recurring 
    ? (['monthly', 'yearly', 'weekly'] as const)[Math.floor(Math.random() * 3)]
    : undefined;
  
  // Vary the amount slightly
  const amountVariation = 0.8 + Math.random() * 0.4; // 80% to 120%
  const amount = merchant.typicalAmount * amountVariation;

  return createPaymentRequest(merchant.id, amount, recurring, frequency);
}

/**
 * Calculate category emoji
 */
export function getCategoryEmoji(category: SpendingCategory): string {
  const emojiMap: Record<SpendingCategory, string> = {
    utilities: '⚡',
    entertainment: '🎭',
    subscriptions: '📱',
    food: '🍔',
    transport: '🚗',
    other: '📦',
  };
  return emojiMap[category];
}
