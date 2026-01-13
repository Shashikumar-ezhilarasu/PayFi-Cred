# Smart Contracts: PayFi-Cred On-Chain Architecture

![Smart Contracts](https://img.shields.io/badge/Solidity-0.8.19-blue)
![Network](https://img.shields.io/badge/Shardeum-Testnet-orange)
![EVM](https://img.shields.io/badge/EVM-Compatible-green)

## 🎯 Overview

PayFi-Cred's smart contract architecture is deployed on **Shardeum EVM Testnet (Chain ID: 8119)**, a high-performance blockchain that enables fast, secure, and scalable decentralized credit operations. The system consists of five interconnected smart contracts that work together to provide instant credit approvals, income verification, and AI agent wallet management.

## 🏗️ Contract Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     PayFi-Cred Contract System                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌─────────────────┐         ┌────────────────────────┐         │
│  │ FlexCreditCore  │◄────────│ IncomeProofVerifier    │         │
│  │  (Main Credit)  │         │  (Income Validation)   │         │
│  └────────┬────────┘         └────────────────────────┘         │
│           │                                                       │
│           ├──────────┬──────────────┬──────────────────┐        │
│           │          │              │                  │         │
│  ┌────────▼────────┐ │     ┌───────▼──────────┐ ┌────▼────────┐│
│  │   AgentPolicy   │ │     │ AgentPerformance │ │AgentWallet  ││
│  │   (Spending)    │ │     │   Verifier       │ │  Factory    ││
│  └─────────────────┘ │     └──────────────────┘ └─────┬───────┘│
│                      │                                  │        │
│           ┌──────────▼───────────┐                     │        │
│           │  Multiple Agent      │◄────────────────────┘        │
│           │  Wallet Instances    │                              │
│           └──────────────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

## 📝 Deployed Smart Contracts

### Network Information

- **Network**: Shardeum EVM Testnet (Mezame)
- **Chain ID**: 8119
- **RPC URL**: https://api-mezame.shardeum.org
- **Explorer**: https://explorer-mezame.shardeum.org
- **Native Token**: SHM (for gas fees)

### Contract Addresses

| Contract Name                | Address                                      | Purpose                                    |
| ---------------------------- | -------------------------------------------- | ------------------------------------------ |
| **FlexCreditCore**           | `0xa8D44Ef33A40a18E8bDb22279b26309a4159AE5C` | Main credit management system              |
| **IncomeProofVerifier**      | `0x53240F03241A7bB259A60DA48c543c5679bEF0D5` | Income verification via vlayer proofs      |
| **AgentWalletFactory**       | `0xEb0B186f24d4fd6be637701551382b9F8f7f6738` | Factory for creating AI agent wallets      |
| **AgentPolicy**              | `0xa864A6f1A4a8320fE8ede2E4f95CAD8a0Fb623A1` | Agent spending policy enforcement          |
| **AgentPerformanceVerifier** | `0x29B97d27393256c0b776E1403FA594dbb48E1c08` | Agent trading performance verification     |

All contracts can be verified on [Shardeum Explorer](https://explorer-mezame.shardeum.org).

## 🔐 Core Contract: FlexCreditCore

### Purpose

The FlexCreditCore is the heart of the PayFi-Cred system, managing user credit limits, utilization tracking, and income-based credit scoring.

### Key Features

- **Dynamic Credit Limits**: Credit limits calculated as 3x verified monthly income
- **Real-time Utilization**: Track borrowed and available credit in real-time
- **Zero Interest Period**: 30-day interest-free repayment window
- **Agent Integration**: Support for AI agent wallets with risk scoring
- **Verifier Authorization**: Only authorized contracts can modify credit data

### State Variables

```solidity
mapping(address => uint256) public incomeScore;      // Monthly income (500, 1000, 2000 USDC)
mapping(address => uint256) public creditLimit;      // Max credit available (USDC, 6 decimals)
mapping(address => uint256) public usedCredit;       // Currently borrowed amount
mapping(address => mapping(bytes32 => int256)) public agentRiskScore; // Agent performance scores
mapping(address => bool) public authorizedVerifiers; // Authorized verifier contracts
uint256 public constant CREDIT_MULTIPLIER = 3;       // Credit = Income × 3
```

### Core Functions

#### Read Functions

```typescript
// Get complete credit information
function getCreditInfo(address user) 
  returns (uint256 income, uint256 limit, uint256 used, uint256 available)
```

Returns all credit-related data for a user in a single call.

**Example Usage:**
```typescript
import { getCreditInfo } from '@/lib/payfi-contracts';

const creditInfo = await getCreditInfo(userAddress);
console.log(`Available Credit: ${creditInfo.available}`);
```

```typescript
// Get available credit balance
function getAvailableCredit(address user) returns (uint256)
```

Returns the remaining credit available for borrowing (limit - used).

```typescript
// Get agent risk score
function getAgentRisk(address user, bytes32 agentId) returns (int256)
```

Returns the performance-based risk score for a specific AI agent (positive = good, negative = risky).

#### Write Functions

```solidity
// Apply income score and set credit limit
function applyIncomeScore(address user, uint256 incomeBucket) external
```

**Income Buckets:**
- `500`: $500/month → $1,500 credit limit
- `1000`: $1,000/month → $3,000 credit limit
- `2000`: $2,000/month → $6,000 credit limit

**Authorization**: Only callable by authorized verifier contracts (IncomeProofVerifier).

```solidity
// Borrow credit (reduces available credit)
function useCredit(uint256 amount) external
```

Allows users to borrow against their available credit. Reverts if amount exceeds available credit.

**Example:**
```typescript
import { useCredit } from '@/lib/payfi-contracts';

// Borrow 1000 USDC (1000 * 1e6 = 1000000000)
await useCredit('1000000000');
```

```solidity
// Repay borrowed credit
function repayCredit(uint256 amount) external payable
```

Repay borrowed credit with native tokens. Reduces `usedCredit` and increases available credit.

**Example:**
```typescript
import { repayCredit } from '@/lib/payfi-contracts';

// Repay 500 USDC
await repayCredit('500000000');
```

```solidity
// Update agent performance
function applyAgentPerformance(address user, bytes32 agentId, int256 pnlBucket) external
```

**PnL Buckets:**
- `1`: WIN (positive performance) → Increases agent risk score
- `0`: NEUTRAL (no change)
- `-1`: LOSS (negative performance) → Decreases agent risk score

**Authorization**: Only callable by AgentPerformanceVerifier.

### Events

```solidity
event IncomeScoreApplied(
    address indexed user,
    uint256 previousScore,
    uint256 newScore,
    uint256 newCreditLimit
);

event CreditUsed(
    address indexed user,
    uint256 amount,
    uint256 totalUsed
);

event CreditRepaid(
    address indexed user,
    uint256 amount,
    uint256 totalUsed
);

event AgentPerformanceApplied(
    address indexed user,
    bytes32 indexed agentId,
    int256 previousScore,
    int256 newScore
);
```

## 🔍 IncomeProofVerifier Contract

### Purpose

Verifies income proofs generated by vlayer's zero-knowledge proof system and applies verified income scores to FlexCreditCore.

### Key Features

- **Zero-Knowledge Verification**: Verify income without revealing exact amounts
- **vlayer Integration**: Support for vlayer ZK proofs
- **Proof Deduplication**: Prevent replay attacks with proof hash tracking
- **Simplified API**: Easy-to-use income bucket submission

### Core Functions

```solidity
// Submit income proof (simplified version)
function submitIncomeProofSimplified(
    address user,
    uint256 incomeBucket,
    bytes32 proofHash
) external
```

Submit a simplified income proof for testing/demo purposes.

**Parameters:**
- `user`: Wallet address to credit
- `incomeBucket`: Income tier (500, 1000, or 2000 USDC/month)
- `proofHash`: Unique hash of the income proof (from vlayer)

**Example:**
```typescript
import { submitIncomeProof } from '@/lib/payfi-contracts';

// Submit proof for $1,000/month income
await submitIncomeProof(
  userAddress,
  1000,
  '0x1234...' // Proof hash from vlayer
);
```

```solidity
// Full vlayer proof verification
function submitIncomeProof(
    bytes calldata proof,
    bytes calldata publicInputs
) external
```

Verify full vlayer ZK proofs with complete cryptographic validation.

### Events

```solidity
event IncomeProofSubmitted(
    address indexed user,
    uint256 incomeBucket,
    bytes32 proofHash,
    uint256 timestamp
);

event IncomeProofVerified(
    address indexed user,
    uint256 incomeBucket,
    uint256 newCreditLimit
);
```

### Privacy Properties

**What is Hidden:**
- ✅ Exact income amount
- ✅ Income source (employer, bank statements)
- ✅ Complete financial history
- ✅ Personal identifiable information

**What is Revealed:**
- ❌ Income bucket (tier: 500, 1000, or 2000)
- ❌ Wallet address
- ❌ Credit limit derived from tier

For more details on vlayer integration, see [vlayer Integration Guide](./vlayer-integration.md).

## 🤖 AgentWalletFactory Contract

### Purpose

Factory pattern contract for deploying and managing multiple AI agent smart wallets per user.

### Key Features

- **Multi-Wallet Support**: Each user can create unlimited agent wallets
- **Deterministic Deployment**: Consistent wallet addresses
- **Owner Tracking**: Map wallets to their owners
- **Gas Optimization**: Efficient wallet creation

### Core Functions

```solidity
// Create a new agent wallet
function createWallet(uint256 initialSpendingCap) external returns (address)
```

Deploy a new AgentWallet contract with specified spending limits.

**Parameters:**
- `initialSpendingCap`: Maximum spending limit for the agent (in wei)

**Returns:** Address of the newly created wallet

**Example:**
```typescript
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '@/lib/web3-config';

const factory = new ethers.Contract(
  CONTRACT_ADDRESSES.AgentWalletFactory,
  CONTRACT_ABIS.AgentWalletFactory,
  signer
);

// Create wallet with 1 ETH spending cap
const tx = await factory.createWallet(ethers.parseEther('1'));
const receipt = await tx.wait();

// Get wallet address from event
const walletAddress = receipt.logs[0].address;
```

```solidity
// Get all wallets owned by an address
function getWallets(address owner) external view returns (address[] memory)
```

Returns array of all agent wallet addresses created by the owner.

```solidity
// Get wallet count for an owner
function getWalletCount(address owner) external view returns (uint256)
```

### Events

```solidity
event WalletCreated(
    address indexed owner,
    address walletAddress
);
```

## 💼 AgentWallet Contract

### Purpose

Individual smart wallet for AI agents with built-in credit management, spending controls, and reputation tracking.

### Key Features

- **Spending Caps**: Enforced maximum spending limits
- **Credit Allocation**: Agent-specific credit from FlexCreditCore
- **Reputation System**: Performance-based trust scores
- **Action Execution**: Execute arbitrary transactions on behalf of owner
- **Gas Abstraction**: Agent can pay gas fees from wallet balance

### State Variables

```solidity
address public owner;              // Wallet owner (user)
address public agent;              // Authorized AI agent address
uint256 public spendingCap;        // Maximum spending limit
uint256 public creditAllocated;    // Total credit assigned to agent
uint256 public creditUsed;         // Credit currently used by agent
uint256 public reputation;         // Agent performance score (0-100)
uint256 public nonce;              // Transaction count
```

### Core Functions

```solidity
// Get complete wallet statistics
function getStats() external view returns (
    uint256 balance,
    uint256 _creditAllocated,
    uint256 _creditUsed,
    uint256 _spendingCap,
    uint256 _reputation,
    uint256 _nonce
)
```

Returns all wallet metrics in a single call for efficient frontend display.

**Example:**
```typescript
import { AgentStats } from '@/lib/payfi-contracts';

// Read wallet stats
const contract = new ethers.Contract(
  walletAddress,
  CONTRACT_ABIS.AgentWallet,
  provider
);

const stats = await contract.getStats();
console.log(`Balance: ${ethers.formatEther(stats.balance)} ETH`);
console.log(`Credit Used: ${stats._creditUsed}`);
console.log(`Reputation: ${stats._reputation}`);
```

```solidity
// Execute agent action
function executeAction(
    address target,
    uint256 value,
    bytes memory data
) external returns (bytes memory)
```

Execute arbitrary transactions through the wallet. Only callable by owner or authorized agent.

**Parameters:**
- `target`: Contract or address to call
- `value`: ETH to send (in wei)
- `data`: Encoded function call data

**Example:**
```typescript
// Execute a token swap through the agent wallet
const target = UNISWAP_ROUTER_ADDRESS;
const value = 0;
const data = uniswapRouter.interface.encodeFunctionData('swapExactTokensForTokens', [
  amountIn,
  amountOutMin,
  path,
  walletAddress,
  deadline
]);

const tx = await agentWallet.executeAction(target, value, data);
await tx.wait();
```

```solidity
// Allocate credit to agent
function allocateCredit(uint256 amount) external
```

Assign credit from FlexCreditCore to this agent wallet. Only callable by owner.

```solidity
// Update agent reputation
function updateReputation(uint256 newScore) external
```

Update the agent's performance score (0-100). Called by AgentPerformanceVerifier after trade verification.

```solidity
// Update spending cap
function updateSpendingCap(uint256 newCap) external
```

Modify the maximum spending limit. Only callable by owner.

```solidity
// Deposit funds
receive() external payable
```

Accept ETH deposits directly to the wallet.

```solidity
// Withdraw funds
function withdraw(uint256 amount) external
```

Withdraw ETH from the wallet. Only callable by owner.

### Events

```solidity
event Deposit(address indexed from, uint256 amount);
event Withdrawal(address indexed to, uint256 amount);
event ActionExecuted(address indexed target, uint256 value, bytes data);
event ReputationUpdated(uint256 oldScore, uint256 newScore);
event CreditAllocated(uint256 amount);
```

## 📋 AgentPolicy Contract

### Purpose

Manages spending policies and authorization rules for AI agents, including daily limits, per-transaction limits, and credit usage permissions.

### Key Features

- **Daily Spending Limits**: Reset every 24 hours
- **Per-Transaction Limits**: Maximum single transaction size
- **Credit Authorization**: Control which agents can use credit
- **Tier System**: Agent tiers based on performance (Bronze, Silver, Gold, Platinum)

### Agent Tiers

```solidity
enum AgentTier {
    BRONZE,    // New agents - restricted access
    SILVER,    // Proven agents - moderate limits
    GOLD,      // High-performing agents - high limits
    PLATINUM   // Elite agents - maximum limits
}
```

### Core Functions

```solidity
// Get agent policy
function getPolicy(address user, bytes32 agentId) external view returns (
    uint256 dailyLimit,
    uint256 perTxLimit,
    bool canUseCredit
)
```

Returns the spending policy for a specific agent.

```solidity
// Get agent tier
function getAgentTier(address user, bytes32 agentId) external view returns (uint8)
```

Returns the tier level (0-3) for an agent based on performance.

```solidity
// Get remaining daily limit
function getRemainingDailyLimit(address user, bytes32 agentId) external view returns (uint256)
```

Returns how much the agent can still spend today.

```solidity
// Set custom policy
function setPolicy(
    bytes32 agentId,
    uint256 dailyLimit,
    uint256 perTxLimit,
    bool canUseCredit
) external
```

Configure custom spending rules for an agent. Only callable by user.

**Example:**
```typescript
// Set policy: $10k daily, $1k per transaction, credit allowed
await agentPolicy.setPolicy(
  agentId,
  ethers.parseUnits('10000', 6), // 10k USDC
  ethers.parseUnits('1000', 6),  // 1k USDC
  true                            // Can use credit
);
```

### Events

```solidity
event PolicySet(
    address indexed user,
    bytes32 indexed agentId,
    uint256 dailyLimit,
    uint256 perTxLimit,
    bool canUseCredit
);

event AgentTierUpgraded(
    address indexed user,
    bytes32 indexed agentId,
    uint8 oldTier,
    uint8 newTier
);
```

## 📊 AgentPerformanceVerifier Contract

### Purpose

Verifies AI agent trading performance using zero-knowledge proofs and updates agent risk scores in FlexCreditCore.

### Key Features

- **Performance Tracking**: Win/loss/neutral trade outcomes
- **Risk Scoring**: Dynamic risk adjustments based on results
- **Proof Verification**: vlayer ZK proofs for trade validation
- **Reputation Updates**: Automatic reputation score updates

### Core Functions

```solidity
// Submit simplified performance proof
function submitAgentProofSimplified(
    address user,
    bytes32 agentId,
    int256 pnlBucket,
    bytes32 proofHash
) external
```

Submit agent trading performance with simplified verification.

**PnL Buckets:**
- `1`: WIN - Profitable trade (risk score +10)
- `0`: NEUTRAL - Break-even trade (no change)
- `-1`: LOSS - Losing trade (risk score -15)

**Example:**
```typescript
import { ethers } from 'ethers';

// Submit WIN proof
const agentId = ethers.id('trading-bot-1'); // bytes32 agent ID
await agentPerformanceVerifier.submitAgentProofSimplified(
  userAddress,
  agentId,
  1, // WIN
  proofHash
);
```

```solidity
// Full vlayer proof verification
function submitAgentProof(
    bytes calldata proof,
    bytes calldata publicInputs
) external
```

Verify complete vlayer ZK proofs for agent performance.

### Events

```solidity
event AgentProofSubmitted(
    address indexed user,
    bytes32 indexed agentId,
    int256 pnlBucket,
    bytes32 proofHash,
    uint256 timestamp
);

event AgentProofVerified(
    address indexed user,
    bytes32 indexed agentId,
    int256 pnlBucket,
    uint256 newDailyLimit
);
```

## 🔗 Contract Integration Examples

### Complete Credit Application Flow

```typescript
// 1. Submit income proof
import { submitIncomeProof } from '@/lib/payfi-contracts';

const proofHash = await generateVlayerProof(incomeData);
await submitIncomeProof(userAddress, 1000, proofHash);

// 2. Check credit info
import { getCreditInfo } from '@/lib/payfi-contracts';

const credit = await getCreditInfo(userAddress);
console.log(`Credit Limit: ${credit.limit}`);
console.log(`Available: ${credit.available}`);

// 3. Use credit
import { useCredit } from '@/lib/payfi-contracts';

await useCredit(ethers.parseUnits('500', 6)); // Borrow 500 USDC

// 4. Repay credit
import { repayCredit } from '@/lib/payfi-contracts';

await repayCredit(ethers.parseUnits('500', 6)); // Repay 500 USDC
```

### Create and Use Agent Wallet

```typescript
// 1. Create agent wallet
const factory = new ethers.Contract(
  CONTRACT_ADDRESSES.AgentWalletFactory,
  CONTRACT_ABIS.AgentWalletFactory,
  signer
);

const tx = await factory.createWallet(ethers.parseEther('1'));
const receipt = await tx.wait();
const walletAddress = receipt.logs[0].address;

// 2. Fund the wallet
await signer.sendTransaction({
  to: walletAddress,
  value: ethers.parseEther('0.1')
});

// 3. Set agent policy
const agentId = ethers.id('my-trading-bot');
await agentPolicy.setPolicy(
  agentId,
  ethers.parseUnits('5000', 6), // 5k daily
  ethers.parseUnits('500', 6),  // 500 per tx
  true                           // Can use credit
);

// 4. Execute agent action
const agentWallet = new ethers.Contract(
  walletAddress,
  CONTRACT_ABIS.AgentWallet,
  signer
);

await agentWallet.executeAction(
  targetContract,
  0,
  encodedData
);

// 5. Submit performance proof
await agentPerformanceVerifier.submitAgentProofSimplified(
  userAddress,
  agentId,
  1, // WIN
  proofHash
);
```

## 🔒 Security Features

### Access Control

- **Owner-Only Functions**: Critical functions restricted to contract owner
- **Verifier Authorization**: Only authorized contracts can update credit scores
- **Agent Authorization**: Agent wallets only execute for authorized agents
- **Reentrancy Guards**: Protection against reentrancy attacks

### Input Validation

- **Amount Checks**: Validate credit amounts and spending limits
- **Address Validation**: Ensure non-zero addresses
- **Bucket Validation**: Verify income and PnL buckets are valid
- **Balance Checks**: Ensure sufficient credit before borrowing

### Best Practices

```solidity
// Example: Protected function with checks
function useCredit(uint256 amount) external {
    require(amount > 0, "Amount must be positive");
    require(
        usedCredit[msg.sender] + amount <= creditLimit[msg.sender],
        "Insufficient credit"
    );
    
    usedCredit[msg.sender] += amount;
    emit CreditUsed(msg.sender, amount, usedCredit[msg.sender]);
}
```

## 🧪 Testing & Verification

### Local Testing with Hardhat

```bash
# Install dependencies
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to local network
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

### Testnet Deployment

```bash
# Deploy to Shardeum Testnet
npx hardhat run scripts/deploy.js --network shardeum-mezame

# Verify contracts (if supported)
npx hardhat verify --network shardeum-mezame <CONTRACT_ADDRESS>
```

### Contract Verification on Explorer

1. Visit [Shardeum Explorer](https://explorer-mezame.shardeum.org)
2. Search for contract address
3. Navigate to "Contract" tab
4. Click "Verify and Publish"
5. Upload Solidity source code and compiler settings

### Frontend Testing

```typescript
// Test contract integration
import { getCreditInfo, useCredit } from '@/lib/payfi-contracts';

async function testCreditFlow() {
  try {
    // Check initial credit
    const before = await getCreditInfo(userAddress);
    console.log('Before:', before);
    
    // Use credit
    await useCredit(ethers.parseUnits('100', 6));
    
    // Check updated credit
    const after = await getCreditInfo(userAddress);
    console.log('After:', after);
    
    console.assert(
      BigInt(after.used) === BigInt(before.used) + BigInt(ethers.parseUnits('100', 6)),
      'Credit usage mismatch'
    );
  } catch (error) {
    console.error('Test failed:', error);
  }
}
```

## 📦 ABI & Integration

### Contract ABIs

All contract ABIs are available in `lib/web3-config.ts`:

```typescript
import { CONTRACT_ADDRESSES, CONTRACT_ABIS } from '@/lib/web3-config';

// Get contract instance
const creditCore = new ethers.Contract(
  CONTRACT_ADDRESSES.FlexCreditCore,
  CONTRACT_ABIS.FlexCreditCore,
  provider
);
```

### Helper Functions

Pre-built helper functions in `lib/payfi-contracts.ts`:

```typescript
import {
  getCreditInfo,
  useCredit,
  repayCredit,
  submitIncomeProof,
  getAgentStats
} from '@/lib/payfi-contracts';
```

## 🌐 Network Configuration

### Add Shardeum to MetaMask

```javascript
await window.ethereum.request({
  method: 'wallet_addEthereumChain',
  params: [{
    chainId: '0x1F91', // 8119 in hex
    chainName: 'Shardeum EVM Testnet',
    nativeCurrency: {
      name: 'SHM',
      symbol: 'SHM',
      decimals: 18
    },
    rpcUrls: ['https://api-mezame.shardeum.org'],
    blockExplorerUrls: ['https://explorer-mezame.shardeum.org']
  }]
});
```

### Get Testnet Tokens

1. Visit [Shardeum Faucet](https://faucet.shardeum.org)
2. Connect wallet
3. Request testnet SHM tokens
4. Wait for confirmation (~30 seconds)

## 📊 Gas Optimization

### Estimated Gas Costs

| Operation                | Gas Used | Cost (SHM) | Cost (USD)* |
| ------------------------ | -------- | ---------- | ----------- |
| Submit Income Proof      | ~80,000  | 0.0016     | $0.016      |
| Use Credit               | ~50,000  | 0.001      | $0.010      |
| Repay Credit             | ~55,000  | 0.0011     | $0.011      |
| Create Agent Wallet      | ~250,000 | 0.005      | $0.050      |
| Execute Agent Action     | ~100,000 | 0.002      | $0.020      |
| Submit Agent Performance | ~70,000  | 0.0014     | $0.014      |

*Assuming 1 SHM = $10 (testnet prices may vary)

### Optimization Tips

- **Batch Operations**: Combine multiple calls in one transaction
- **Read from Cache**: Cache frequently accessed data in frontend
- **Use Events**: Listen to events instead of polling contract state
- **Multicall**: Use Multicall contracts for multiple reads
- **Gas Estimation**: Always estimate gas before transactions

## 🚀 Deployment Checklist

### Pre-Deployment

- [ ] Smart contracts compiled and tested
- [ ] Security audit completed (if production)
- [ ] Gas optimizations implemented
- [ ] Test suite passes 100%
- [ ] Environment variables configured

### Deployment Steps

1. **Deploy FlexCreditCore**
   ```bash
   npx hardhat run scripts/deploy-credit-core.js --network shardeum-mezame
   ```

2. **Deploy IncomeProofVerifier**
   ```bash
   # Pass FlexCreditCore address to constructor
   npx hardhat run scripts/deploy-income-verifier.js --network shardeum-mezame
   ```

3. **Deploy AgentWalletFactory**
   ```bash
   npx hardhat run scripts/deploy-agent-factory.js --network shardeum-mezame
   ```

4. **Deploy AgentPolicy**
   ```bash
   # Pass FlexCreditCore address to constructor
   npx hardhat run scripts/deploy-agent-policy.js --network shardeum-mezame
   ```

5. **Deploy AgentPerformanceVerifier**
   ```bash
   # Pass FlexCreditCore address to constructor
   npx hardhat run scripts/deploy-agent-performance.js --network shardeum-mezame
   ```

6. **Authorize Verifiers**
   ```javascript
   await creditCore.authorizeVerifier(incomeVerifierAddress, true);
   await creditCore.authorizeVerifier(agentPerformanceAddress, true);
   ```

### Post-Deployment

- [ ] Update `CONTRACT_ADDRESSES` in `lib/web3-config.ts`
- [ ] Verify contracts on explorer
- [ ] Update environment variables
- [ ] Test all contract interactions
- [ ] Deploy frontend with new addresses
- [ ] Update documentation with new addresses

## 📚 Additional Resources

### Documentation

- [Shardeum Integration Guide](./shardeum-integration.md) - Blockchain network details
- [vlayer Integration Guide](./vlayer-integration.md) - Zero-knowledge proof system
- [API Endpoints Documentation](./api-endpoints.md) - Backend API reference
- [MongoDB Integration](./mongodb-integration.md) - Database architecture

### Block Explorers

- **Shardeum Mezame**: https://explorer-mezame.shardeum.org
- View all deployed contracts, transactions, and events

### Developer Tools

- **Hardhat**: Ethereum development environment
- **ethers.js v6**: Web3 library for contract interaction
- **MetaMask**: Browser wallet for testing
- **Remix IDE**: Online Solidity IDE

### Community & Support

- **GitHub**: https://github.com/Shashikumar-ezhilarasu/PayFi-Cred
- **Documentation**: [Project Documentation](../README.md)
- **Smart Contract Summary**: [SMART_CONTRACTS_SUMMARY.md](../SMART_CONTRACTS_SUMMARY.md)

## 🔄 Upgrade Strategy

### Current Version: v1.0

The current contracts are **non-upgradeable** for security and simplicity. Future versions may implement:

- **Proxy Patterns**: UUPS or Transparent Proxy for upgradeability
- **Timelock**: Governance timelock for critical changes
- **Multi-sig**: Multi-signature authorization for upgrades
- **Migration Tools**: Safe data migration scripts

### Planned Features

- **Cross-Chain Bridge**: Multi-chain credit portability
- **DeFi Integration**: Compound, Aave lending integration
- **NFT Collateral**: Use NFTs as credit collateral
- **Flash Loans**: Uncollateralized instant loans
- **Governance Tokens**: Community governance system

---

**Last Updated**: January 2026  
**Network**: Shardeum EVM Testnet (Chain ID: 8119)  
**Status**: ✅ Production Ready  
**Contract Version**: v1.0
