# incoJS Integration Verification Guide

This guide helps you verify that incoJS is properly integrated and working in your PayForMe project.

## Quick Verification Steps

### 1. Check Installation

Verify the package is installed:

```bash
npm list @inco/js
```

Expected output: `@inco/js@<version>`

### 2. Check Files Created

Ensure all integration files exist:

```bash
# Core libraries
ls -la lib/inco-*.ts

# React hooks
ls -la hooks/useInco*.ts

# Example components
ls -la components/inco/

# Test page
ls -la app/test-inco/
```

**Expected files:**

- ✅ `lib/inco-config.ts` - Base configuration
- ✅ `lib/inco-encryption.ts` - Encryption utilities
- ✅ `lib/inco-decrypt.ts` - Decryption utilities
- ✅ `lib/inco-compute.ts` - Computation utilities
- ✅ `hooks/useIncoEncryption.ts` - Encryption hook
- ✅ `hooks/useIncoDecryption.ts` - Decryption hook
- ✅ `hooks/useIncoCompute.ts` - Compute hook
- ✅ `components/inco/PrivateCreditCheck.tsx` - Example component
- ✅ `components/inco/PrivateIncomeVerification.tsx` - Example component
- ✅ `app/test-inco/page.tsx` - Test page

### 3. Run TypeScript Type Checking

Check for type errors:

```bash
npm run build
```

or

```bash
npx tsc --noEmit
```

**Expected:** No TypeScript errors related to inco files.

### 4. Test in Browser

#### Prerequisites:

1. **Install MetaMask** or another Web3 wallet
2. **Switch to Base Sepolia testnet**
   - Network Name: Base Sepolia
   - RPC URL: https://sepolia.base.org
   - Chain ID: 84532
   - Currency: ETH
   - Block Explorer: https://sepolia.basescan.org
3. **Get test ETH** from Base Sepolia faucet

#### Run the test page:

```bash
npm run dev
```

Navigate to: **http://localhost:3000/test-inco**

### 5. Run Automated Tests

On the test page, click **"Run All Tests"**:

1. ✅ **Initialization Test** - Verifies inco Lightning can be initialized
2. ✅ **Wallet Connection Test** - Checks if wallet is connected
3. ✅ **Encryption Test** - Tests encrypting a value

### 6. Manual Testing

Use the manual testing section on the test page:

#### Test Encryption:

1. Enter a credit score (e.g., 750)
2. Click "Encrypt"
3. ✅ Should display encrypted handle (0x...)

#### Test Compute:

1. After encryption, click "Run Eligibility Check"
2. ✅ Should return whether score >= 700 WITHOUT revealing actual score

## Common Issues & Solutions

### Issue: "Wallet client not available"

**Solution:**

- Install MetaMask or another Web3 wallet
- Refresh the page after installation
- Make sure you're testing in a browser (not SSR)

### Issue: "Account not connected"

**Solution:**

- Click "Connect Wallet" in MetaMask
- Approve the connection request
- Refresh the page

### Issue: "Wrong network"

**Solution:**

- Switch to Base Sepolia testnet in MetaMask
- Network details:
  - Chain ID: 84532
  - RPC: https://sepolia.base.org

### Issue: TypeScript errors

**Solution:**

- Run `npm install` to ensure all dependencies are installed
- Check that `@inco/js` is in package.json
- Restart TypeScript server in VS Code

### Issue: "Cannot find module '@/lib/inco-config'"

**Solution:**

- Verify tsconfig.json has proper path mapping for `@/*`
- Check that files exist in `lib/` directory
- Restart dev server

## Integration Checklist

- [ ] Package installed (`@inco/js` in package.json)
- [ ] No TypeScript errors (`npm run build` succeeds)
- [ ] Test page loads (`/test-inco`)
- [ ] Wallet connects successfully
- [ ] Initialization test passes
- [ ] Encryption test passes
- [ ] Can encrypt values manually
- [ ] Can run compute operations
- [ ] Example components render without errors

## Testing with Your Smart Contracts

Once basic verification passes, integrate with your contracts:

### 1. Update Contract Address

In your component:

```typescript
const dappAddress = "0xYourContractAddress"; // Your deployed contract
```

### 2. Ensure Contract Uses inco

Your Solidity contract should:

```solidity
import {euint256, e, inco} from "@inco/lightning/src/Lib.sol";

contract YourContract {
    euint256 private encryptedValue;

    function storeEncrypted(bytes memory ciphertext) external {
        encryptedValue = e.asEuint256(ciphertext);
        e.allow(encryptedValue, msg.sender);
    }
}
```

### 3. Test Full Flow

1. Encrypt value on client
2. Send ciphertext to contract
3. Perform computation off-chain
4. Submit attestation on-chain

## Performance Benchmarks

Expected operation times:

- **Initialization**: 100-500ms
- **Encryption**: 500-2000ms
- **Compute**: 1000-3000ms
- **Decryption**: 1000-3000ms

## Next Steps

After verification:

1. ✅ Integrate into credit verification flow
2. ✅ Add to income verification
3. ✅ Use in payment privacy features
4. ✅ Implement session keys for better UX
5. ✅ Add error handling and loading states

## Support

- [inco Documentation](https://docs.inco.org/)
- [Base Sepolia Faucet](https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet)
- [MetaMask Setup Guide](https://metamask.io/download/)

## Verification Complete? ✅

If all tests pass:

- ✅ incoJS is properly integrated
- ✅ You can encrypt sensitive data
- ✅ You can perform confidential computations
- ✅ Ready for production use

Start integrating into your PayForMe features!
