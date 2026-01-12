# Smart Contracts Integration Summary

## Overview

The PayFi platform uses multiple smart contracts deployed on Sepolia testnet to manage credit, income verification, agent wallets, and agent performance tracking.

## Deployed Contracts

### 1. **FlexCreditCore**

- **Address**: `0xbC3fC58882Aa2c49038f35cB7bbDe7cc118bf464`
- **Purpose**: Main credit management contract
- **Functions**:
  - `getCreditInfo(address user)` - Get complete credit info (income, limit, used, available)
  - `getAvailableCredit(address user)` - Get available credit balance
  - `applyIncomeScore(address user, uint256 incomeBucket)` - Apply income verification
  - `useCredit(uint256 amount)` - Borrow credit (deduct from available)
  - `repayCredit(uint256 amount)` - Repay borrowed credit
  - `getAgentRisk(address user, bytes32 agentId)` - Get agent risk score
  - `applyAgentPerformance(address user, bytes32 agentId, int256 pnlBucket)` - Update agent performance

### 2. **IncomeProofVerifier**

- **Address**: `0x0b82685505Ef4744Ee0744D777E9D3f9cc48714f`
- **Purpose**: Verify income proofs and apply credit scores
- **Functions**:
  - `submitIncomeProof(bytes32 proofHash, uint256 incomeBucket)` - Submit verified income proof
  - Income buckets: 0=low, 1=medium, 2=high, 3=very high

### 3. **AgentWalletFactory**

- **Address**: `0x5E2182aA00F15D099b3b563c19f301B4160c30B0`
- **Purpose**: Factory for creating and managing agent smart wallets
- **Functions**:
  - `createWallet(uint256 initialSpendingCap)` - Deploy new agent wallet
  - `getWallets(address owner)` - Get all wallets for an owner
  - `getWalletCount(address owner)` - Count wallets for owner

### 4. **AgentWallet** (Multiple instances)

- **Purpose**: Individual smart wallet for AI agents
- **Functions**:
  - `getStats()` - Get wallet stats (balance, credit, cap, reputation, nonce)
  - `executeAction(address target, uint256 value, bytes data)` - Execute agent action
  - `deposit()` - Deposit ETH to wallet
  - Balances tracked: ETH balance, credit allocated, credit used, spending cap

### 5. **AgentPolicy**

- **Address**: `0x4458D6534E83C933d5C54A41434CA74362d0362E`
- **Purpose**: Manage agent spending policies and limits
- **Functions**:
  - Policy enforcement for agent spending
  - Category-based spending limits
  - Auto-approval thresholds

### 6. **AgentPerformanceVerifier**

- **Address**: `0x30698293F53c856530F7D847a103C31709269541`
- **Purpose**: Verify and record agent trading performance
- **Functions**:
  - `submitAgentProofSimplified(address user, bytes32 agentId, int256 pnlBucket, bytes32 proofHash)`
  - PnL buckets: 1=WIN, 0=NEUTRAL, -1=LOSS
  - Updates agent risk scores on FlexCreditCore

## Frontend Integration

### Key Files:

1. **`lib/web3-config.ts`** - Contract addresses and ABIs
2. **`lib/payfi-contracts.ts`** - Smart contract interaction functions (REAL blockchain data)
3. **`lib/contract.ts`** - Legacy contract interface (uses mock data fallback)
4. **`lib/agent-wallet-factory.ts`** - Agent wallet management helpers

### Contract Interaction Pattern:

```typescript
// Read from blockchain (always real data)
import { getCreditInfo } from "@/lib/payfi-contracts";
const creditData = await getCreditInfo(userAddress);

// Write to blockchain (real transactions)
import { useCredit } from "@/lib/payfi-contracts";
await useCredit("1000000000000000000"); // 1 ETH in wei
```

## Agent Wallet Balance Display

### Component: `AgentWalletBalance`

Location: `components/agent/AgentWalletBalance.tsx`

**Features:**

- Real-time balance fetching from blockchain
- ETH balance display (native token)
- Credit allocated/used/available tracking
- Credit utilization percentage bar
- Spending cap and reputation display
- Transaction count (nonce)
- Auto-refresh capability
- Compact and detailed view modes

**Usage:**

```tsx
import { AgentWalletBalance } from "@/components/agent/AgentWalletBalance";

<AgentWalletBalance
  walletAddress="0x..."
  showDetails={true} // Show full details or compact view
/>;
```

**Displayed Metrics:**

- **ETH Balance**: Native token balance in wallet
- **Credit Allocated**: Total USDC credit assigned
- **Credit Used**: Amount of credit currently borrowed
- **Credit Available**: Remaining credit (allocated - used)
- **Spending Cap**: Maximum spending limit
- **Reputation**: Agent performance score
- **Transactions**: Number of executed actions
- **Utilization**: Visual bar showing credit usage %

## Pages Using Contracts

### 1. **Dashboard (`/dashboard`)**

- Fetches user credit info via FlexCreditCore
- Displays credit limit, used, and available
- Shows agent policy status

### 2. **Agent Cockpit (`/agent?wallet=0x...`)**

- **NEW**: Displays AgentWalletBalance component
- Shows real-time wallet statistics
- Executes trades via agent wallet
- Submits performance proofs
- Updates agent risk scores

### 3. **Agent Wallets (`/agent-wallets`)**

- **UPDATED**: Uses AgentWalletBalance for each wallet
- Lists all user agent wallets
- Creates new wallets via factory
- Shows compact balance for each wallet
- Links to agent management page

### 4. **Credit Identity (`/credit-identity`)**

- Submits income proofs to IncomeProofVerifier
- Applies income scores to FlexCreditCore

### 5. **Repayment (`/repayment`)**

- Calls repayCredit() on FlexCreditCore
- Handles ETH payments for credit repayment

## Data Flow

```
User Action → Frontend Component → Web3 Library → Smart Contract
                                        ↓
                              Blockchain Transaction
                                        ↓
                              Event Emission
                                        ↓
                              Frontend Updates
```

## Contract State Verification

All contracts can be verified on Sepolia Etherscan:

- FlexCreditCore: https://sepolia.etherscan.io/address/0xbC3fC58882Aa2c49038f35cB7bbDe7cc118bf464
- IncomeProofVerifier: https://sepolia.etherscan.io/address/0x0b82685505Ef4744Ee0744D777E9D3f9cc48714f
- AgentWalletFactory: https://sepolia.etherscan.io/address/0x5E2182aA00F15D099b3b563c19f301B4160c30B0
- AgentPolicy: https://sepolia.etherscan.io/address/0x4458D6534E83C933d5C54A41434CA74362d0362E
- AgentPerformanceVerifier: https://sepolia.etherscan.io/address/0x30698293F53c856530F7D847a103C31709269541

## Key Features

✅ **All Read Operations**: Fetch REAL blockchain data
✅ **All Write Operations**: Submit REAL transactions to Sepolia
✅ **Agent Wallet Balances**: Displayed prominently in frontend
✅ **Credit Management**: Full lifecycle (apply → use → repay)
✅ **Agent Performance**: Track and verify trading results
✅ **Income Verification**: Vlayer proof integration
✅ **Multi-Wallet Support**: Create and manage multiple agent wallets
✅ **Real-Time Updates**: Refresh balances and stats on demand

## Best Practices

1. **Always check wallet connection** before contract calls
2. **Handle loading states** during blockchain reads/writes
3. **Show transaction hashes** for user verification on Etherscan
4. **Catch and display errors** gracefully
5. **Refresh UI** after successful transactions
6. **Use gasLimit** for complex transactions
7. **Validate inputs** before submitting to contracts
8. **Display balances** in human-readable formats (ETH, USDC)

## Recent Updates

- ✅ Created `AgentWalletBalance` component for unified balance display
- ✅ Integrated balance component into `/agent` page
- ✅ Updated `/agent-wallets` to use new balance component
- ✅ All contract interactions use theme colors (#00F5D4, #00E5FF)
- ✅ Real-time balance fetching with refresh capability
- ✅ Credit utilization visualization with progress bars
- ✅ Comprehensive wallet statistics display
