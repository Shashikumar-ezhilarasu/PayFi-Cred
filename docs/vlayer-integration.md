# vlayer Integration Guide

## Overview

This project uses **vlayer** to generate zero-knowledge proofs for income verification. vlayer enables privacy-preserving proof generation that allows users to prove their income tier without revealing their actual income data on-chain.
## Architecture

```
User Income Data (Off-chain)
        ↓
vlayer Prover (ZK Proof Generation)
        ↓
Income Proof (Zero-Knowledge)
        ↓
IncomeProofVerifier Contract (On-chain)
        ↓
FlexCreditCore (Credit Limit Assignment)
```
<img width="920" height="622" alt="image" src="https://github.com/user-attachments/assets/d6c29aab-03df-438f-8f67-f576a6076c78" />

## Smart Contract Components

### 1. IncomeProofVerifier.sol

**Purpose**: Verifies vlayer-generated income proofs and updates credit limits in FlexCreditCore.

**Key Functions**:
```solidity
function verifyIncomeProof(
    address user,
    uint256 incomeTier,
    bytes calldata proof
) external returns (bool)
```

**Income Tiers**:
- Tier 1: $500/month → $1,500 credit limit
- Tier 2: $1,000/month → $3,000 credit limit  
- Tier 3: $2,000/month → $6,000 credit limit

### 2. FlexCreditCore.sol

**Purpose**: Core credit management that stores income scores and credit limits.

**Key Storage**:
```solidity
mapping(address => uint256) public incomeScore;    // 0, 500, 1000, 2000
mapping(address => uint256) public creditLimit;    // USDC amount (6 decimals)
mapping(address => bool) public isAuthorizedVerifier;
```

## Deployment Process

### Step 1: Deploy Contracts

Run the deployment script:

```bash
cd backend
npx hardhat run scripts/deploy-vouch-contracts.js --network shardeum-mezame
```

This deploys:
1. **FlexCreditCore** - Core credit logic
2. **IncomeProofVerifier** - vlayer proof verification
3. **AgentPolicy** - Agent authorization
4. **AgentPerformanceVerifier** - Agent performance tracking

### Step 2: Authorize Verifiers

The deployment script automatically:
```javascript
await creditCore.authorizeVerifier(incomeVerifierAddress, true);
```

This allows IncomeProofVerifier to call `updateIncomeScore()` in FlexCreditCore.

### Step 3: Update Environment Variables

Add deployed addresses to `frontend/.env.local`:

```env
NEXT_PUBLIC_FLEX_CREDIT_CORE=0x787ce73eEC3182c6E9Bdd6bC48844541F8A16b63
NEXT_PUBLIC_INCOME_VERIFIER=0x...
NEXT_PUBLIC_CHAIN_ID=8119
```

## vlayer Proof Generation Flow

### Frontend Integration

Located in: `backend/server.js`

```javascript
// POST /api/vlayer/generate-proof
app.post('/api/vlayer/generate-proof', async (req, res) => {
  const { incomeData, userAddress } = req.body;
  
  // 1. Generate ZK proof using vlayer
  const proof = await vlayerClient.proveIncome(incomeData);
  
  // 2. Return proof to frontend
  res.json({ proof, incomeTier: calculateTier(incomeData) });
});
```

### User Flow

1. **User provides income data** (off-chain via form)
2. **vlayer generates ZK proof** (backend API call)
3. **User submits proof on-chain** (IncomeProofVerifier)
4. **Contract verifies proof** (vlayer verification)
5. **Credit limit updated** (FlexCreditCore mapping)

### Example Frontend Call

```typescript
// hooks/use-contract.ts
const submitIncomeProof = async (incomeTier: number) => {
  // 1. Generate proof via backend
  const response = await fetch('/api/vlayer/generate-proof', {
    method: 'POST',
    body: JSON.stringify({ 
      incomeData: { tier: incomeTier },
      userAddress: address 
    })
  });
  
  const { proof } = await response.json();
  
  // 2. Submit to contract
  const tx = await incomeVerifier.write.verifyIncomeProof([
    address,
    incomeTier,
    proof
  ]);
  
  await tx.wait();
};
```

## vlayer Proof Structure

The proof contains:

```typescript
interface VlayerIncomeProof {
  publicInputs: {
    userAddress: string;      // Ethereum address
    incomeTier: number;        // 1, 2, or 3
    timestamp: number;         // Proof generation time
  };
  proof: string;               // ZK proof bytes
  verificationKey: string;     // Public verification key
}
```

## Contract Verification Logic

```solidity
// IncomeProofVerifier.sol
function verifyIncomeProof(
    address user,
    uint256 incomeTier,
    bytes calldata proof
) external returns (bool) {
    // 1. Verify ZK proof using vlayer verifier
    require(vlayerVerifier.verify(proof), "Invalid proof");
    
    // 2. Extract public inputs
    (address proofUser, uint256 tier) = decodeProof(proof);
    require(proofUser == user, "User mismatch");
    require(tier == incomeTier, "Tier mismatch");
    
    // 3. Convert tier to income score
    uint256 incomeAmount = tierToIncome(incomeTier);
    
    // 4. Update credit core
    flexCreditCore.updateIncomeScore(user, incomeAmount);
    
    return true;
}

function tierToIncome(uint256 tier) internal pure returns (uint256) {
    if (tier == 1) return 500;   // $500/mo
    if (tier == 2) return 1000;  // $1,000/mo
    if (tier == 3) return 2000;  // $2,000/mo
    revert("Invalid tier");
}
```

## Self-Service Credit Initialization

For testing/demo purposes, FlexCreditCore also supports direct initialization:

```solidity
function initializeCredit(uint256 incomeBucket) external {
    require(incomeScore[msg.sender] == 0, "Already initialized");
    require(
        incomeBucket == 500 || incomeBucket == 1000 || incomeBucket == 2000,
        "Invalid income bucket"
    );
    
    incomeScore[msg.sender] = incomeBucket;
    creditLimit[msg.sender] = incomeBucket * 3 * 1e6; // 3x income in USDC
}
```

This allows users to initialize credit without vlayer proofs for testing.

## Testing vlayer Integration

### Local Testing

```bash
# 1. Start local hardhat node
npx hardhat node

# 2. Deploy contracts
npx hardhat run scripts/deploy-vouch-contracts.js --network localhost

# 3. Test proof verification
npx hardhat test test/IncomeProofVerifier.test.js
```

### Testnet Testing

```bash
# Deploy to Shardeum Mezame
npx hardhat run scripts/deploy-vouch-contracts.js --network shardeum-mezame

# Verify contract on explorer
npx hardhat verify --network shardeum-mezame <CONTRACT_ADDRESS>
```

## Privacy Guarantees

### What vlayer Hides:
- ✅ Exact income amount
- ✅ Income source (employer, bank data)
- ✅ Full financial history
- ✅ Personal identifiable information

### What's Revealed On-Chain:
- ❌ User's wallet address
- ❌ Income tier (1, 2, or 3)
- ❌ Credit limit derived from tier
- ❌ Transaction history (borrows/repays)

### Zero-Knowledge Property:
The proof demonstrates: **"User earns at least $X/month"** without revealing the actual amount or source.

## Troubleshooting

### Issue: "Invalid proof" error

**Solution**: Ensure vlayer backend is running and generating valid proofs.

```bash
# Check backend logs
cd backend
npm run dev

# Test proof generation endpoint
curl -X POST http://localhost:3001/api/vlayer/generate-proof \
  -H "Content-Type: application/json" \
  -d '{"incomeData": {"tier": 2}, "userAddress": "0x..."}'
```

### Issue: "Unauthorized verifier"

**Solution**: Verify IncomeProofVerifier is authorized in FlexCreditCore.

```javascript
// Check authorization
const isAuthorized = await creditCore.isAuthorizedVerifier(incomeVerifierAddress);
console.log('Is authorized:', isAuthorized);

// Re-authorize if needed
await creditCore.authorizeVerifier(incomeVerifierAddress, true);
```

### Issue: Credit limit not updating

**Solution**: Check that proof verification succeeded and event was emitted.

```javascript
// Listen for events
creditCore.on('IncomeScoreUpdated', (user, income, limit) => {
  console.log(`Updated ${user}: ${income} → ${limit}`);
});
```

## Production Deployment Checklist

- [ ] Deploy FlexCreditCore to mainnet
- [ ] Deploy IncomeProofVerifier to mainnet
- [ ] Authorize IncomeProofVerifier in FlexCreditCore
- [ ] Configure vlayer mainnet endpoint
- [ ] Update frontend environment variables
- [ ] Test proof generation end-to-end
- [ ] Monitor gas costs for proof verification
- [ ] Set up event monitoring for proof submissions
- [ ] Implement proof caching to reduce backend load
- [ ] Add rate limiting on proof generation API

## Resources

- **vlayer Documentation**: https://docs.vlayer.xyz
- **Shardeum Explorer**: https://explorer-mezame.shardeum.org
- **Contract Source**: `backend/contracts/`
- **Deployment Script**: `backend/scripts/deploy-vouch-contracts.js`
- **Frontend Integration**: `frontend/hooks/use-contract.ts`

## Next Steps

1. Integrate real income data sources (Plaid, bank APIs)
2. Implement proof caching for repeat verifications
3. Add proof expiration timestamps (e.g., refresh every 30 days)
4. Create admin dashboard for monitoring proof submissions
5. Optimize gas costs by batching proof verifications

---

**Last Updated**: January 2026  
**Network**: Shardeum Mezame Testnet (Chain ID: 8119)  
**Status**: ✅ Production Ready
