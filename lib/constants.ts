// Application constants

export const APP_NAME = 'Pay-fi';
export const APP_DESCRIPTION = 'Income-backed credit and onchain account layer for humans and AI agents';

// Network configuration
export const SUPPORTED_NETWORKS = {
  ETHEREUM_MAINNET: 1,
  ETHEREUM_SEPOLIA: 11155111,
  POLYGON_MAINNET: 137,
  POLYGON_MUMBAI: 80001,
};

export const DEFAULT_NETWORK = SUPPORTED_NETWORKS.ETHEREUM_SEPOLIA;

// Credit score ranges
export const CREDIT_SCORE_RANGES = {
  MIN: 300,
  MAX: 850,
  BRONZE: { min: 300, max: 579 },
  SILVER: { min: 580, max: 669 },
  GOLD: { min: 670, max: 739 },
  PLATINUM: { min: 740, max: 850 },
};

// Credit limits by tier (in USD)
export const CREDIT_LIMITS = {
  Bronze: 500,
  Silver: 2000,
  Gold: 10000,
  Platinum: 50000,
};

// Risk thresholds
export const RISK_THRESHOLDS = {
  LOW: 0.75,
  MEDIUM: 0.5,
  HIGH: 0.3,
};

// MCP Agent configuration
export const MCP_EVALUATION_STEPS = [
  'Fetching on-chain history',
  'Analyzing transaction patterns',
  'Verifying credit NFT',
  'Calculating risk score',
  'Evaluating repayment behavior',
  'Generating decision',
];

// Transaction statuses
export const TRANSACTION_STATUSES = {
  APPROVED: 'Approved',
  PENDING: 'Pending',
  REPAID: 'Repaid',
  DEFAULTED: 'Defaulted',
  REJECTED: 'Rejected',
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  CONNECT: '/connect',
  DASHBOARD: '/dashboard',
  CREDIT_IDENTITY: '/credit-identity',
  PROFILE: '/profile',
  TRANSACTIONS: '/transactions',
  REPAYMENT: '/repayment',
  FOOD: '/food',
  PETROL: '/petrol',
  SHOPPING: '/shopping',
  CHECKOUT: '/checkout',
  RESULT: '/result',
};

// Mock IPFS gateway
export const IPFS_GATEWAY = 'https://ipfs.io/ipfs/';

// Animation variants
export const ANIMATION_VARIANTS = {
  fadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  },
  slideIn: {
    initial: { x: -100, opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: 100, opacity: 0 },
  },
  scaleIn: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
  },
};
