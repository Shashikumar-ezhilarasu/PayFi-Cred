# incoJS Integration Guide

This guide explains how to use incoJS in the PayForMe project for confidential computations on encrypted data.

## Overview

incoJS enables:

- **Encryption**: Encrypt sensitive data (credit scores, income, amounts) before sending on-chain
- **Attested Decrypt**: Request decryption with cryptographic attestation
- **Attested Reveal**: Allow public decryption after explicit reveal
- **Attested Compute**: Perform confidential computations off-chain with attestation

## Installation

```bash
npm install @inco/js
```

## Project Structure

```
lib/
  ├── inco-config.ts      # Base configuration
  ├── inco-encryption.ts  # Encryption utilities
  ├── inco-decrypt.ts     # Decryption utilities
  ├── inco-compute.ts     # Computation utilities
  └── inco-storage.ts     # IndexedDB persistent storage

hooks/
  ├── useIncoEncryption.ts # React hook for encryption
  ├── useIncoDecryption.ts # React hook for decryption
  └── useIncoCompute.ts    # React hook for computation

components/inco/
  ├── PrivateCreditCheck.tsx         # Example: Private credit verification
  └── PrivateIncomeVerification.tsx  # Example: Private income verification
```

## Quick Start

### 1. Encrypt a Credit Score

```typescript
import { encryptCreditScore } from "@/lib/inco-encryption";

const encryptedHandle = await encryptCreditScore(750, {
  accountAddress: "0xYourAddress",
  dappAddress: "0xContractAddress",
});
```

### 2. Check Eligibility (Without Revealing Score)

```typescript
import { checkCreditEligibility } from "@/lib/inco-compute";

const result = await checkCreditEligibility(
  encryptedHandle,
  700 // minimum score
);

console.log(result.isEligible); // true/false
// Actual credit score (750) remains private!
```

### 3. Decrypt When Needed

```typescript
import { attestedDecryptSingle } from "@/lib/inco-decrypt";

const actualScore = await attestedDecryptSingle(encryptedHandle);
console.log(actualScore); // 750
```

## React Hooks Usage

### Encryption Hook

```typescript
"use client";

import { useIncoEncryption } from "@/hooks/useIncoEncryption";

export function MyComponent() {
  const { encryptScore, isEncrypting, error } = useIncoEncryption();

  const handleEncrypt = async () => {
    const handle = await encryptScore(750, accountAddress, dappAddress);
    console.log("Encrypted handle:", handle);
  };

  return (
    <button onClick={handleEncrypt} disabled={isEncrypting}>
      Encrypt Credit Score
    </button>
  );
}
```

### Compute Hook

```typescript
"use client";

import { useIncoCompute } from "@/hooks/useIncoCompute";

export function MyComponent() {
  const { verifyCreditScore, isComputing, error } = useIncoCompute();

  const handleVerify = async (handle) => {
    const result = await verifyCreditScore(handle, 700);
    console.log("Is eligible:", result?.isEligible);
  };

  return (
    <button onClick={() => handleVerify(myHandle)} disabled={isComputing}>
      Check Eligibility
    </button>
  );
}
```

### Storage and Retrieval

```typescript
import { getStoredValue, hasStoredValue } from "@/lib/inco-storage";

// Check if a handle exists
const exists = await hasStoredValue(handle);

// Retrieve stored value
const stored = await getStoredValue(handle);
console.log(stored.value); // Original value
console.log(stored.type); // 'uint256', 'bool', or 'address'
console.log(stored.label); // Optional label
```

**Note**: Values are automatically stored in IndexedDB when encrypted and persist across page reloads.

## Use Cases in PayForMe

### 1. Private Credit Scoring

- Encrypt user credit scores
- Check eligibility without revealing actual score
- Submit attestation on-chain for loan approval

### 2. Income Verification

- Encrypt income amounts
- Verify minimum income requirements
- Keep salary information confidential

### 3. Payment Amount Privacy

- Encrypt payment amounts
- Verify spending limits off-chain
- Reveal only when necessary

### 4. Agent Risk Assessment

- Encrypt risk scores
- Compare against thresholds privately
- Provide attestation for on-chain decisions

## Advanced Features

### Session Keys (Gasless Decryption)

```typescript
import {
  grantSessionKeyAllowance,
  attestedDecryptWithSession,
} from "@/lib/inco-decrypt";

// Grant session key (done once)
const { voucher, keypair } = await grantSessionKeyAllowance(3600000); // 1 hour

// Decrypt without wallet signature
const results = await attestedDecryptWithSession([handle], keypair, voucher);
```

### Reencryption for Delegates

```typescript
import { attestedDecryptForDelegate } from "@/lib/inco-decrypt";
import { generateSecp256k1Keypair } from "@inco/js/lite";

const delegateKeypair = generateSecp256k1Keypair();

const encryptedResults = await attestedDecryptForDelegate(
  [handle],
  delegateKeypair.encodePublicKey()
);

// Delegate decrypts using their private key
```

### Supported Operations

| Operation        | Function                              | Description      |
| ---------------- | ------------------------------------- | ---------------- |
| Equal            | `checkEquals(handle, target)`         | handle == target |
| Greater or Equal | `checkGreaterOrEqual(handle, target)` | handle >= target |
| Greater Than     | `checkGreaterThan(handle, target)`    | handle > target  |
| Less or Equal    | `checkLessOrEqual(handle, target)`    | handle <= target |
| Less Than        | `checkLessThan(handle, target)`       | handle < target  |

## Example Components

See the example components for complete implementations:

- **PrivateCreditCheck**: Demonstrates encrypting credit scores and checking eligibility
- **PrivateIncomeVerification**: Shows income verification without revealing amounts

## Configuration

The project is configured for Base Sepolia testnet by default:

```typescript
// lib/inco-config.ts
export const INCO_CHAIN_ID = supportedChains.baseSepolia;
export const INCO_NETWORK = "testnet" as const;
```

To change networks, update these constants.

## Best Practices

1. **Always encrypt sensitive data** before sending on-chain
2. **Use attested compute** to verify conditions without revealing values
3. **Request decryption only when necessary** to maintain privacy
4. **Use session keys** for better UX in applications requiring frequent decryption
5. **Verify attestations on-chain** before trusting computation results

## Troubleshooting

### "Wallet client not available"

Ensure you're in a browser environment with MetaMask or another wallet provider installed.

### "Handle not allowed"

Make sure the smart contract called `e.allow()` or `e.reveal()` on the handle before attempting decryption.

### Encryption fails

Verify that `accountAddress` and `dappAddress` are correct and properly formatted.

## Resources

- [incoJS Documentation](https://docs.inco.org/)
- [Encryption Guide](https://docs.inco.org/js-sdk/encryption)
- [Attested Decrypt Guide](https://docs.inco.org/attestations/attested-decrypt)
- [Attested Compute Guide](https://docs.inco.org/attestations/attested-compute)

## Next Steps

1. Deploy smart contracts that use inco's encrypted types (`euint256`, `ebool`, etc.)
2. Integrate the example components into your credit/payment flows
3. Add session key support for improved UX
4. Implement on-chain attestation verification
