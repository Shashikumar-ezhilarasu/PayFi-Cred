// Mock data for development
import type { 
  CreditIdentity, 
  CreditData, 
  Transaction, 
  Repayment, 
  OnChainActivity,
  Product 
} from '@/types';
import { INITIAL_CREDIT_STATE } from './creditEngine';

// Mock Credit Identity
export const mockCreditIdentity: CreditIdentity = {
  tokenId: '1337',
  walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  creditTier: 'Bronze',
  creditScore: 300,
  ipfsMetadataUri: 'QmX7Kz8J9Y2h3W4fT5N6vB8xL9mP1qR3sA4cD5eF6gH7i',
  mintedAt: '2024-01-15T10:30:00Z',
};

// Mock Credit Data - Start with initial state
export const mockCreditData: CreditData = {
  ...INITIAL_CREDIT_STATE,
  // For demo, you can show a slightly progressed state
  // Uncomment below to show user who has made 3 successful repayments
  // creditLimit: 8, // $1 -> $2 -> $4 -> $8
  // availableBalance: 8,
  // creditScore: 450, // 300 + 50 + 50 + 50
};

// Mock Transactions
export const mockTransactions: Transaction[] = [
  {
    id: 'tx-001',
    amount: 850,
    merchantName: 'Tasty Bites Restaurant',
    merchantType: 'Food',
    status: 'Repaid',
    date: '2024-12-20T14:30:00Z',
    dueDate: '2025-01-20T23:59:59Z',
    repaidDate: '2024-12-28T10:15:00Z',
    transactionHash: '0x1a2b3c4d5e6f7890abcdef1234567890abcdef12',
  },
  {
    id: 'tx-002',
    amount: 1200,
    merchantName: 'Fashion Hub',
    merchantType: 'Shopping',
    status: 'Approved',
    date: '2024-12-25T16:45:00Z',
    dueDate: '2025-01-25T23:59:59Z',
    transactionHash: '0x2b3c4d5e6f7890abcdef1234567890abcdef1234',
  },
  {
    id: 'tx-003',
    amount: 450,
    merchantName: 'QuickFuel Petrol',
    merchantType: 'Petrol',
    status: 'Approved',
    date: '2024-12-26T09:20:00Z',
    dueDate: '2025-01-26T23:59:59Z',
    transactionHash: '0x3c4d5e6f7890abcdef1234567890abcdef123456',
  },
  {
    id: 'tx-004',
    amount: 2100,
    merchantName: 'Tech Store Pro',
    merchantType: 'Shopping',
    status: 'Repaid',
    date: '2024-11-10T11:00:00Z',
    dueDate: '2024-12-10T23:59:59Z',
    repaidDate: '2024-12-05T15:30:00Z',
    transactionHash: '0x4d5e6f7890abcdef1234567890abcdef12345678',
  },
  {
    id: 'tx-005',
    amount: 320,
    merchantName: 'Coffee & More',
    merchantType: 'Food',
    status: 'Repaid',
    date: '2024-12-15T08:45:00Z',
    dueDate: '2025-01-15T23:59:59Z',
    repaidDate: '2024-12-22T12:00:00Z',
    transactionHash: '0x5e6f7890abcdef1234567890abcdef1234567890',
  },
];

// Mock Repayments
export const mockRepayments: Repayment[] = [
  {
    id: 'rep-001',
    transactionId: 'tx-002',
    amount: 1200,
    dueDate: '2025-01-25T23:59:59Z',
    status: 'Pending',
  },
  {
    id: 'rep-002',
    transactionId: 'tx-003',
    amount: 450,
    dueDate: '2025-01-26T23:59:59Z',
    status: 'Pending',
  },
];

// Mock On-Chain Activity
export const mockOnChainActivity: OnChainActivity = {
  totalTransactions: 28,
  successfulRepayments: 26,
  avgRepaymentTime: 18, // days
  defaultCount: 0,
  lastActivityDate: '2024-12-26T09:20:00Z',
};

// Mock credit score history
export const mockCreditScoreHistory = [
  { month: 'Jul', score: 680 },
  { month: 'Aug', score: 695 },
  { month: 'Sep', score: 710 },
  { month: 'Oct', score: 720 },
  { month: 'Nov', score: 735 },
  { month: 'Dec', score: 742 },
];

// Mock Products - Food
export const mockFoodProducts: Product[] = [
  {
    id: 'food-001',
    name: 'Margherita Pizza',
    description: 'Classic Italian pizza with fresh mozzarella',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400',
    category: 'Pizza',
  },
  {
    id: 'food-002',
    name: 'Chicken Burger',
    description: 'Grilled chicken with special sauce',
    price: 8.99,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400',
    category: 'Burgers',
  },
  {
    id: 'food-003',
    name: 'Caesar Salad',
    description: 'Fresh romaine lettuce with Caesar dressing',
    price: 7.49,
    image: 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400',
    category: 'Salads',
  },
  {
    id: 'food-004',
    name: 'Pasta Carbonara',
    description: 'Creamy Italian pasta with bacon',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?w=400',
    category: 'Pasta',
  },
];

// Mock Products - Shopping
export const mockShoppingProducts: Product[] = [
  {
    id: 'shop-001',
    name: 'Wireless Headphones',
    description: 'Premium noise-canceling headphones',
    price: 299.99,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
    category: 'Electronics',
  },
  {
    id: 'shop-002',
    name: 'Smart Watch',
    description: 'Fitness tracking and notifications',
    price: 199.99,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
    category: 'Electronics',
  },
  {
    id: 'shop-003',
    name: 'Running Shoes',
    description: 'Comfortable athletic footwear',
    price: 89.99,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400',
    category: 'Fashion',
  },
  {
    id: 'shop-004',
    name: 'Backpack',
    description: 'Durable travel backpack',
    price: 59.99,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400',
    category: 'Accessories',
  },
];

// Mock Petrol pricing
export const mockPetrolPricing = {
  regular: { price: 3.45, unit: 'per gallon' },
  premium: { price: 3.85, unit: 'per gallon' },
  diesel: { price: 3.65, unit: 'per gallon' },
};
