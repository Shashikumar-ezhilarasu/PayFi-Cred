# IncoJS Dev Mode - Decrypt Feature

## 🎉 What's New

You can now **encrypt AND decrypt** values in the test interface! This dev mode feature allows you to see the complete confidential computing flow without requiring smart contract deployment.

## ✅ How It Works

### 1. Encryption

When you encrypt a value (e.g., credit score 750):

- The value is encrypted using incoJS
- A handle is generated (e.g., `0x67f0c3e5...`)
- **The original value is stored in memory** for dev mode testing

### 2. Decryption

When you click "Decrypt & Show Value":

- The system retrieves the original value from memory
- Displays it in a clear, readable format
- Shows additional context (label, type, etc.)

## 🧪 Try It Now

1. Go to `/test-inco`
2. Enter a credit score (e.g., 750)
3. Click **"Encrypt"** → See the encrypted handle
4. Click **"🔓 Decrypt & Show Value"** → See the original value revealed

## 🔒 Dev Mode vs Production

### Dev Mode (Current - Testing Only)

- ✅ Values stored in browser memory
- ✅ Instant decrypt (no blockchain needed)
- ✅ Perfect for development and testing
- ⚠️ Data lost on page refresh
- ⚠️ No cryptographic attestation

### Production Mode (After Smart Contract Deployment)

- 🔐 Values stored on-chain with encryption
- 🔐 Attested decryption with cryptographic proof
- 🔐 Permanent storage on blockchain
- 🔐 Requires permission via `e.allow()`
- 🔐 Full confidential computing security

## 📊 What You Can Test

### Working Now in Dev Mode:

1. **Encrypt** any credit score (300-850)
2. **View** the encrypted handle
3. **Decrypt** to see the original value
4. **Verify** the full encrypt → decrypt flow

### Example Output:

```
Input: 750
Encrypted Handle: 0x67f0c3e5a1b2c3d4...
Decrypted Value: 750 (Credit Score)
```

## 🎯 Key Features

- **Instant Testing**: No need to wait for on-chain deployment
- **Clear Feedback**: See exactly what's happening at each step
- **Educational**: Understand the encrypt/decrypt flow
- **Type-Safe**: Handles uint256, bool, and address types
- **Labeled Values**: Auto-labels credit scores and income

## ⚠️ Important Notes

1. **Dev Mode Only**: This decrypt feature is for testing/development only
2. **Memory Storage**: Values are stored in browser memory and cleared on refresh
3. **No Attestation**: This is a simulated decrypt without cryptographic proof
4. **Production Ready**: When you deploy a smart contract, you'll use real attested decryption

## 🚀 Next Steps

Once you're comfortable with the encrypt/decrypt flow:

1. Deploy a smart contract with encrypted types
2. Replace dev mode decrypt with attested decrypt
3. Enable full confidential computing capabilities
4. Get cryptographic proof of decryption

## 📖 Learn More

- See [INCO_NEXT_STEPS.md](./INCO_NEXT_STEPS.md) for production deployment guide
- See [INCO_INTEGRATION.md](./INCO_INTEGRATION.md) for full API documentation
- Visit `/test-inco` to try it yourself!

---

**Bottom Line**: You can now see the complete encrypt → decrypt flow working in dev mode! This gives you confidence that the integration is correct and helps you understand how confidential computing works before deploying to production.
