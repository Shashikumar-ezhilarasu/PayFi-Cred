// Zustand store for global state management
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  WalletState,
  CreditIdentity,
  CreditData,
  Transaction,
  CartItem,
  MCPDecision,
} from '@/types';
import { processRepayment as processCreditRepayment } from '@/lib/creditEngine';
import { getCreditInfo, getWalletBalance } from '@/lib/payfi-contracts';
import type { AgentPolicy } from '@/lib/agent-policy';
import { DEFAULT_AGENT_POLICY, validatePolicy } from '@/lib/agent-policy';
import { assessCreditLimit, adjustCreditForBehavior, type BehaviorUpdate } from '@/lib/credit-calculator';

interface AppState {
  // Wallet state
  wallet: WalletState;
  setWallet: (wallet: Partial<WalletState>) => void;
  disconnectWallet: () => void;
  refreshWalletBalance: () => Promise<void>;
  setVerificationStatus: (verified: boolean) => void;

  // Credit Identity
  creditIdentity: CreditIdentity | null;
  setCreditIdentity: (identity: CreditIdentity) => void;

  // Credit Data
  creditData: CreditData | null;
  setCreditData: (data: CreditData) => void;
  refreshCreditData: () => Promise<void>;

  // Loading states
  isLoadingCredit: boolean;
  isLoadingWallet: boolean;

  // Transactions
  transactions: Transaction[];
  addTransaction: (transaction: Transaction) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;

  // Process repayment with credit engine
  processRepayment: (transactionId: string, paidDate: string) => {
    success: boolean;
    message: string;
    creditIncreased: boolean;
    fine: number;
  };

  // Shopping cart
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;

  // MCP Decision
  lastMCPDecision: MCPDecision | null;
  setMCPDecision: (decision: MCPDecision) => void;

  // Agent Policy
  agentPolicy: AgentPolicy;
  setAgentPolicy: (policy: Partial<AgentPolicy>) => void;
  
  // Credit Assessment
  assessCredit: (address: string) => Promise<void>;
  adjustCreditForBehavior: (behavior: BehaviorUpdate) => void;

  // UI state
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial wallet state
      wallet: {
        address: null,
        connected: false,
        network: null,
        balance: '0',
      },

      setWallet: (wallet) =>
        set((state) => ({
          wallet: { ...state.wallet, ...wallet },
        })),

      setVerificationStatus: (verified) =>
        set((state) => ({
          wallet: {
            ...state.wallet,
            isVerified: verified,
            verificationDate: verified ? new Date().toISOString() : undefined,
          },
          creditIdentity: state.creditIdentity
            ? {
                ...state.creditIdentity,
                isVerified: verified,
                verificationDate: verified ? new Date().toISOString() : undefined,
              }
            : null,
        })),

      disconnectWallet: () =>
        set({
          wallet: {
            address: null,
            connected: false,
            network: null,
            balance: '0',
          },
          creditIdentity: null,
          creditData: null,
        }),

      // Refresh wallet balance from blockchain
      refreshWalletBalance: async () => {
        const state = get();
        if (!state.wallet.address) return;

        try {
          set({ isLoadingWallet: true });
          const balance = await getWalletBalance(state.wallet.address);
          set((state) => ({
            wallet: { ...state.wallet, balance },
            isLoadingWallet: false,
          }));
        } catch (error) {
          console.error('Error refreshing wallet balance:', error);
          set({ isLoadingWallet: false });
        }
      },

      // Credit Identity
      creditIdentity: null,
      setCreditIdentity: (identity) => set({ creditIdentity: identity }),

      // Credit Data
      creditData: null,
      setCreditData: (data) => set({ creditData: data }),

      // Refresh credit data from blockchain
      refreshCreditData: async () => {
        const state = get();
        if (!state.wallet.address) {
          console.warn('Cannot refresh credit data: wallet not connected');
          return;
        }

        try {
          set({ isLoadingCredit: true });
          
          console.log('🔄 Refreshing credit data from blockchain...');
          const info = await getCreditInfo(state.wallet.address);
          
          // Convert to CreditData format (SHM uses 18 decimals)
          const creditData: CreditData = {
            creditScore: Number(info.income), // Using income tier as score
            creditLimit: Number(info.limit) / 1e18, // Convert from 18 decimals (SHM)
            availableBalance: Number(info.available) / 1e18, // Convert from 18 decimals (SHM)
            usedCredit: Number(info.used) / 1e18, // Convert from 18 decimals (SHM)
            repaymentRate: 100,
            riskLevel: 'LOW',
            creditTier: 'Bronze', // TODO: Calculate from score
          };

          set({ creditData, isLoadingCredit: false });
          console.log('✅ Credit data refreshed:', creditData);
        } catch (error) {
          console.error('Error refreshing credit data:', error);
          set({ isLoadingCredit: false });
        }
      },

      // Loading states
      isLoadingCredit: false,
      isLoadingWallet: false,

      // Transactions
      transactions: [],
      addTransaction: (transaction) =>
        set((state) => ({
          transactions: [transaction, ...state.transactions],
        })),

      updateTransaction: (id, updates) =>
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === id ? { ...t, ...updates } : t
          ),
        })),

      // Process repayment with credit engine
      processRepayment: (transactionId, paidDate) => {
        const state = get();
        const transaction = state.transactions.find((t) => t.id === transactionId);
        
        if (!transaction || !state.creditData) {
          return {
            success: false,
            message: 'Transaction or credit data not found',
            creditIncreased: false,
            fine: 0,
          };
        }

        // Use credit engine to process repayment
        const result = processCreditRepayment(
          state.creditData,
          transaction,
          paidDate
        );

        // Update credit data
        set({ creditData: result.newCredit });

        // Update transaction status
        set((state) => ({
          transactions: state.transactions.map((t) =>
            t.id === transactionId
              ? { ...t, status: 'Repaid', repaidDate: paidDate }
              : t
          ),
        }));

        // Update credit identity score
        if (state.creditIdentity) {
          set({
            creditIdentity: {
              ...state.creditIdentity,
              creditScore: result.newCredit.creditScore,
              creditTier: result.newCredit.creditTier,
            },
          });
        }

        // Refresh from blockchain after repayment
        get().refreshCreditData();

        return {
          success: true,
          message: result.statusMessage,
          creditIncreased: result.creditIncreased,
          fine: result.fine,
        };
      },

      // Shopping cart
      cart: [],

      addToCart: (item) =>
        set((state) => {
          const existingItem = state.cart.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              cart: state.cart.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i
              ),
            };
          }
          return { cart: [...state.cart, item] };
        }),

      removeFromCart: (itemId) =>
        set((state) => ({
          cart: state.cart.filter((item) => item.id !== itemId),
        })),

      updateCartQuantity: (itemId, quantity) =>
        set((state) => ({
          cart: state.cart.map((item) =>
            item.id === itemId ? { ...item, quantity } : item
          ),
        })),

      clearCart: () => set({ cart: [] }),

      getCartTotal: () => {
        const state = get();
        return state.cart.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        );
      },

      // MCP Decision
      lastMCPDecision: null,
      setMCPDecision: (decision) => set({ lastMCPDecision: decision }),

      // Agent Policy
      agentPolicy: DEFAULT_AGENT_POLICY,
      setAgentPolicy: (policy) => 
        set((state) => ({
          agentPolicy: validatePolicy({ ...state.agentPolicy, ...policy }),
        })),
      
      // Credit Assessment from Shardeum transactions
      assessCredit: async (address: string) => {
        try {
          set({ isLoadingCredit: true });
          console.log('🔍 Assessing credit from Shardeum transaction history...');
          
          const assessment = await assessCreditLimit(address);
          
          // Calculate credit score based on metrics or default for new users
          const calculatedScore = assessment.metrics.repaymentScore > 0 
            ? Math.floor(assessment.metrics.repaymentScore * 850 + 300) // Scale to 300-850
            : 500; // Default Bronze tier score for new users
          
          // Update credit data with assessment
          const creditData: CreditData = {
            creditScore: calculatedScore,
            creditLimit: assessment.creditLimit,
            availableBalance: assessment.creditLimit, // Initially all available
            usedCredit: 0,
            repaymentRate: assessment.metrics.repaymentScore * 100,
            riskLevel: assessment.creditLimit > 2000 ? 'LOW' : assessment.creditLimit > 1000 ? 'MEDIUM' : 'HIGH',
            creditTier: assessment.creditLimit >= 5000 ? 'Platinum' : assessment.creditLimit >= 2000 ? 'Gold' : assessment.creditLimit >= 1000 ? 'Silver' : 'Bronze',
            assessmentTimestamp: assessment.analysisTimestamp,
            transactionCount: assessment.transactionCount,
            cashflowMetrics: assessment.metrics,
          };
          
          set({ creditData, isLoadingCredit: false });
          
          // Mark as verified if credit was successfully assessed
          if (assessment.creditLimit > 0) {
            get().setVerificationStatus(true);
          }
          
          console.log('✅ Credit assessment complete:');
          assessment.reasoning.forEach(line => console.log(`   ${line}`));
        } catch (error) {
          console.error('Error assessing credit:', error);
          set({ isLoadingCredit: false });
        }
      },
      
      // Adjust credit based on user behavior
      adjustCreditForBehavior: (behavior: BehaviorUpdate) => {
        const state = get();
        if (!state.creditData) return;
        
        const result = adjustCreditForBehavior(state.creditData.creditLimit, behavior);
        
        set({
          creditData: {
            ...state.creditData,
            creditLimit: result.newLimit,
            availableBalance: state.creditData.availableBalance + result.adjustment,
          },
        });
        
        console.log(`💳 Credit adjusted: ${result.reason}`);
        console.log(`   ${state.creditData.creditLimit.toFixed(6)} SHM → ${result.newLimit.toFixed(6)} SHM`);
      },

      // UI state
      theme: 'dark',
      toggleTheme: () =>
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
        })),
    }),
    {
      name: 'payforme-storage',
      partialize: (state) => ({
        wallet: state.wallet,
        theme: state.theme,
        creditData: state.creditData,
        creditIdentity: state.creditIdentity,
        transactions: state.transactions,
        agentPolicy: state.agentPolicy,
      }),
    }
  )
);
