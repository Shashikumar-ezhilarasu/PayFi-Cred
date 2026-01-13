# PayFi-Cred: Decentralized Credit Protocol

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-38B2AC)](https://tailwindcss.com/)
[![Shardeum](https://img.shields.io/badge/Shardeum-EVM%20Testnet-orange)](https://shardeum.org/)

> **AI-Powered Credit Decisions in Seconds** - The future of decentralized credit on Shardeum

PayFi-Cred is a revolutionary Web3 credit protocol that enables instant credit approvals based on on-chain income verification. Built on Shardeum's EVM-compatible blockchain, it features AI-powered credit scoring, soulbound Credit NFTs, and zero-interest repayments within 30 days.

## 🌟 Key Features

- ⚡ **Instant Credit Approvals** - AI evaluates on-chain income in under 3 seconds
- 🏦 **Zero Interest for 30 Days** - Pay back within 30 days and owe nothing extra
- 🎨 **Credit NFT Ownership** - Soulbound NFT storing your complete credit history
- 🤖 **AI Agent Wallets** - Smart wallets with spending caps and policy enforcement
- 🔒 **Privacy-First** - vlayer zero-knowledge proofs for income verification
- 🌐 **Multi-Chain Ready** - Currently on Shardeum, extensible to other EVM chains

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MetaMask wallet
- Shardeum testnet SHM tokens (for gas fees)

### Installation

```bash
# Clone the repository
git clone https://github.com/Shashikumar-ezhilarasu/PayFi-Cred.git
cd PayFi-Cred

# Install dependencies
npm install

# Copy environment configuration
cp .env.local.example .env.local

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application running.

### Environment Configuration

See [ENV_CONFIG_GUIDE.md](./ENV_CONFIG_GUIDE.md) for detailed environment setup including:

- RPC endpoints configuration
- Smart contract addresses
- Network settings
- Custom provider setup

## 🏗️ Architecture Overview

### Tech Stack

- **Frontend**: Next.js 16.1.1 with App Router
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 4 with custom dark theme
- **State Management**: Zustand with persistence
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Web3**: ethers.js v6, MetaMask integration
- **Database**: IndexedDB for client-side storage

### Project Structure

```
PayFi-Cred/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── dashboard/         # User dashboard
│   ├── credit/            # Credit management
│   └── transactions/      # Transaction history
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── wallet/           # Wallet connection components
│   ├── credit/           # Credit-related components
│   └── agent/            # AI agent components
├── lib/                  # Utility libraries
│   ├── payfi-contracts.ts # Smart contract interactions
│   ├── networks.ts       # Network configuration
│   └── inco-storage.ts   # IndexedDB storage
├── store/               # Zustand state management
├── types/               # TypeScript type definitions
└── public/              # Static assets
```

## 🔗 Smart Contracts

PayFi-Cred operates on the Shardeum EVM Testnet (Chain ID: 8119) with multiple interconnected smart contracts:

### Core Contracts

| Contract                     | Address                                      | Purpose                                |
| ---------------------------- | -------------------------------------------- | -------------------------------------- |
| **FlexCreditCore**           | `0xbC3fC58882Aa2c49038f35cB7bbDe7cc118bf464` | Main credit management                 |
| **IncomeProofVerifier**      | `0x0b82685505Ef4744Ee0744D777E9D3f9cc48714f` | Income verification via vlayer proofs  |
| **AgentWalletFactory**       | `0x5E2182aA00F15D099b3b563c19f301B4160c30B0` | Factory for AI agent smart wallets     |
| **AgentPolicy**              | `0x4458D6534E83C933d5C54A41434CA74362d0362E` | Agent spending policy enforcement      |
| **AgentPerformanceVerifier** | `0x30698293F53c856530F7D847a103C31709269541` | Agent trading performance verification |

### Key Functions

#### Credit Management

```typescript
// Get user's complete credit information
const creditInfo = await getCreditInfo(userAddress);

// Apply for credit (borrow)
await useCredit(amountInWei);

// Repay credit
await repayCredit(amountInWei);
```

#### Income Verification

```typescript
// Submit income proof (via vlayer)
await submitIncomeProof(proofHash, incomeBucket);

// Income buckets: 0=low, 1=medium, 2=high, 3=very high
```

#### Agent Wallets

```typescript
// Create new agent wallet
const walletAddress = await createWallet(initialSpendingCap);

// Execute agent action
await executeAction(targetAddress, value, data);
```

For complete smart contract documentation, see [SMART_CONTRACTS_SUMMARY.md](./SMART_CONTRACTS_SUMMARY.md).

## 🔒 Privacy-First Architecture with Inco

> **"Privacy is the next frontier of Web3, and Inco is bringing it on-chain."**

PayFi-Cred leverages **Inco's confidential computing technology** - the TLS/SSL equivalent for Web3. Inco enables smart contracts to process encrypted data on public blockchains, ensuring sensitive financial information remains private while still being verifiable on-chain.

### Why Privacy Matters in DeFi

Traditional credit systems expose users' complete financial profiles:

- **Transaction history analysis** reveals spending habits and lifestyle
- **Credit limit & risk score** indicates financial health and borrowing capacity
- **Agent policies & category limits** show behavioral patterns and preferences

**Without privacy, this data becomes a permanent public record** that can be used for:

- Targeted advertising and surveillance
- Financial discrimination
- Identity theft and fraud
- Reputation damage

### Inco's Technology: TLS/SSL for Web3

Inco provides **confidential smart contracts** that can:

- ✅ **Process encrypted data** without decryption
- ✅ **Maintain data privacy** while enabling computation
- ✅ **Generate zero-knowledge proofs** of correct execution
- ✅ **Work on any EVM-compatible chain** (including Shardeum)

**Challenge Context**: Build next-gen, privacy-first dApps where sensitive data stays private while being processed on-chain. $600 USD prize for innovative confidential DeFi applications.

### incoJS Integration in PayFi-Cred

PayFi-Cred uses Inco's JavaScript SDK (`@inco/js`) for confidential credit scoring and income verification.

#### incoJS Integration Test Results

**Automated Tests:**

1. ✅ **Initialization**: Successfully initialized inco Lightning on chain 84532
2. ✅ **Wallet Connection**: Wallet connected: 0x202d...bcd6
3. ✅ **Encryption**: Encryption ready. Use manual test below to encrypt values.

**Manual Testing:**

1. **Encrypt a Credit Score** (750)

   ```
   ✓ Encrypted Handle: 0xdb3b7d04a3a513c0649316acd0c15fe2556f00d4f5851621dc31027c63000800000000000000000000000000000000000000000000000000000000000000004000000000000000000000000000000000000000000000000000000000000000bb04826c780ee130e4bc5acf780c99fd81bed41f57b133f6569a059fb8d856c534c5a0d82d04eae6427c8e02202b4ebbf8854a726f810bf27c77403ec201cf1a0e0bf3312fa4821d04e493ad4282c1c0bbdf65a2e0123d8d85dbdf28856d4c027244c5d1be2f4f850cc4fb7737bb70a0597d8314e4b10614443542ea596dc193c91dca809ea01896b39cedea1f94d93783f4da2244e5d58818c0146d7628311a6499d3be5d4048659d0173e70ec182c17df6c7a4ae6aee6ea7e5f6150000000000

   🔓 Decrypted Value: 750 (Credit Score)
   ```

2. **Eligibility Check** (Score >= 700): ✅ **ELIGIBLE**

#### Prerequisites Checklist

- ✅ MetaMask or Web3 wallet installed and connected
- ✅ Connected to Base Sepolia testnet
- ✅ Have test ETH for gas fees (faucet available)
- ✅ `@inco/js` package installed (`npm install @inco/js`)

#### Implementation Details

```typescript
// Initialize Inco client
import { Inco } from "@inco/js";

const inco = new Inco({
  chainId: 84532, // Base Sepolia
  provider: window.ethereum,
});

// Encrypt sensitive credit data
const encryptedScore = await inco.encrypt(750);
console.log("Encrypted handle:", encryptedScore.handle);

// Store encrypted data on-chain (requires contract deployment)
await contract.allow(encryptedScore.handle, userAddress);

// Perform confidential computations
const isEligible = await contract.checkEligibility(encryptedScore.handle);
```

**⚠️ Important Note:** Attested compute requires encrypted handles to be stored and allowed on-chain first via smart contracts using `e.allow(handle, address)`.

For complete Inco integration details, see [INCO_INTEGRATION.md](./INCO_INTEGRATION.md).

## 🌐 API Endpoints

### Agent Risk Analysis

```
POST /api/agent-risk
```

Analyzes agent trading performance and generates risk scores.

**Request Body:**

```json
{
  "tradeData": {
    "action": "WIN|LOSS|NEUTRAL",
    "profit": 100
  },
  "agentId": "agent-uuid",
  "userAddress": "0x..."
}
```

### PAN Verification

```
POST /api/pan-verification/send-otp
POST /api/pan-verification/verify-otp
```

India-specific KYC verification using PAN card numbers.

### Income Verification

```
POST /api/verify-income
```

Verifies user income through various sources (bank statements, payslips, etc.).

## 💾 Data Storage

### Client-Side Storage (IndexedDB)

- **Database**: `IncoEncryptionDB`
- **Purpose**: Secure storage of encrypted user data
- **Tables**:
  - `keys`: Encryption keys
  - `data`: Encrypted user information

### Smart Contract Storage

- **Network**: Shardeum EVM Testnet
- **Persistence**: All credit data stored on-chain
- **Privacy**: Zero-knowledge proofs for sensitive data

## 🔐 Security Features

### Zero-Knowledge Proofs

- **vlayer Integration**: Privacy-preserving income verification
- **Proof Generation**: Client-side proof creation without revealing sensitive data

### Smart Contract Security

- **Access Control**: Only authorized contracts can modify user data
- **Reentrancy Protection**: Built-in guards against reentrancy attacks
- **Input Validation**: Comprehensive validation of all contract inputs

### Frontend Security

- **MetaMask Integration**: Secure wallet connection
- **Transaction Signing**: User approval required for all blockchain writes
- **Input Sanitization**: All user inputs validated and sanitized

## 🎨 UI Components

### Core Components

#### Wallet Components

- **WalletButton**: MetaMask connection with network switching
- **NetworkChecker**: Automatic network validation and switching

#### Credit Components

- **CreditCard**: Animated credit card with utilization display
- **CreditScoreGauge**: Real-time credit score visualization
- **CreditNFT**: Soulbound NFT display with metadata

#### Agent Components

- **AgentWalletBalance**: Real-time agent wallet statistics
- **AgentPerformanceManager**: Agent performance tracking
- **AgentPolicyManager**: Spending policy configuration

### UI Library

- **Apple Cards Carousel**: Interactive feature showcase
- **Infinite Moving Cards**: Smooth testimonial animations
- **Wobble Cards**: Animated feature cards with noise textures

## 🚀 Deployment

### Build for Production

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables for Production

```bash
# Use production RPC providers
NEXT_PUBLIC_RPC_URL=https://your-production-rpc-endpoint

# Production contract addresses
NEXT_PUBLIC_FLEX_CREDIT_CORE=0x...

# Enable production features
NODE_ENV=production
```

## 🧪 Testing

### Smart Contract Testing

```bash
# Run contract tests (if available)
npm run test:contracts
```

### Frontend Testing

```bash
# Run component tests
npm run test

# Run E2E tests
npm run test:e2e
```

## 📚 Documentation

### Core Documentation

- **[PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md)** - Complete project overview and status
- **[SMART_CONTRACTS_SUMMARY.md](./SMART_CONTRACTS_SUMMARY.md)** - Detailed smart contract documentation
- **[QUICK_START.md](./QUICK_START.md)** - Getting started guide
- **[ENV_CONFIG_GUIDE.md](./ENV_CONFIG_GUIDE.md)** - Environment configuration

### Integration Guides

- **[INCO_INTEGRATION.md](./INCO_INTEGRATION.md)** - IncoJS encryption integration
- **[PARTNER_APPS_INTEGRATION.md](./PARTNER_APPS_INTEGRATION.md)** - Partner application integration
- **[THEME_SYSTEM.md](./THEME_SYSTEM.md)** - Dark/light theme system

### Inco Privacy Features

- **[INCO_STATUS.md](./INCO_STATUS.md)** - Current Inco integration status
- **[INCO_VERIFICATION_GUIDE.md](./INCO_VERIFICATION_GUIDE.md)** - Inco testing and verification
- **[INCO_NEXT_STEPS.md](./INCO_NEXT_STEPS.md)** - Future Inco development roadmap
- **[INCO_COMMIT_SUMMARY.md](./INCO_COMMIT_SUMMARY.md)** - Inco implementation history

### Development Resources

- **[INCO_DEV_MODE.md](./INCO_DEV_MODE.md)** - Development mode features
- **[DYNAMIC_API_IMPLEMENTATION.md](./DYNAMIC_API_IMPLEMENTATION.md)** - API implementation details
- **[RESET_INSTRUCTIONS.md](./RESET_INSTRUCTIONS.md)** - Development reset procedures
- **[DARK_THEME_COMPLETE.md](./DARK_THEME_COMPLETE.md)** - Complete theme system guide
- **[SPENDING_CAP_UI_ADDITIONS.md](./SPENDING_CAP_UI_ADDITIONS.md)** - UI spending cap features
- **[GITHUB_COMMIT_SUMMARY.md](./GITHUB_COMMIT_SUMMARY.md)** - Complete commit history

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use conventional commit messages
- Test all smart contract interactions
- Ensure responsive design
- Maintain dark mode compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Shardeum**: For providing the high-performance EVM-compatible blockchain
- **vlayer**: For zero-knowledge proof infrastructure
- **Inco**: For privacy-preserving encryption
- **OpenZeppelin**: For secure smart contract patterns

## 📞 Support

- **Documentation**: [docs.payfi-cred.com](https://docs.payfi-cred.com)
- **Discord**: [Join our community](https://discord.gg/payfi-cred)
- **GitHub Issues**: [Report bugs](https://github.com/Shashikumar-ezhilarasu/PayFi-Cred/issues)

---

**Built with ❤️ for the decentralized future**

[![Deployed on Shardeum](https://img.shields.io/badge/Deployed%20on-Shardeum-orange)](https://shardeum.org/)
[![Made with Next.js](https://img.shields.io/badge/Made%20with-Next.js-black)](https://nextjs.org/)
