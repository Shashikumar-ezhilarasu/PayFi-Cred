# Environment Configuration Guide

## Overview

This application uses environment variables for dynamic configuration. All blockchain-related settings can be customized without changing code.

## Configuration Files

- **`.env.local`** - Your local configuration (DO NOT commit to git)
- **`.env.local.example`** - Template with default values

## Environment Variables

### Network Configuration

```bash
# RPC Endpoint - Use your own provider for better reliability
NEXT_PUBLIC_RPC_URL=https://api-mezame.shardeum.org

# Chain ID (8119 for Shardeum Testnet)
NEXT_PUBLIC_CHAIN_ID=8119

# Network Name
NEXT_PUBLIC_CHAIN_NAME=Shardeum EVM Testnet

# Native Currency Symbol
NEXT_PUBLIC_CHAIN_CURRENCY=SHM

# Block Explorer URL
NEXT_PUBLIC_EXPLORER_URL=https://explorer-mezame.shardeum.org
```

### Smart Contract Addresses

```bash
# Main credit management contract
NEXT_PUBLIC_FLEX_CREDIT_CORE=0xF21C05d1AEE9b444C90855A9121a28bE941785B5

# Income verification contract
NEXT_PUBLIC_INCOME_PROOF_VERIFIER=0x9342FAFf81fC6D9baabe0a07F01B7847b5705d1E
```

## Using Custom RPC Providers

### Infura (Recommended for Production)

1. Create an account at [infura.io](https://infura.io)
2. Create a new API key
3. Enable Ethereum networks or custom networks
4. Update your `.env.local`:

```bash
NEXT_PUBLIC_RPC_URL=https://mainnet.infura.io/v3/YOUR_API_KEY
```

### Alchemy

1. Create an account at [alchemy.com](https://alchemy.com)
2. Create a new app
3. Copy your HTTP URL
4. Update your `.env.local`:

```bash
NEXT_PUBLIC_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY
```

### QuickNode

1. Create an account at [quicknode.com](https://quicknode.com)
2. Create an endpoint
3. Copy your HTTP URL
4. Update your `.env.local`:

```bash
NEXT_PUBLIC_RPC_URL=https://your-endpoint.quiknode.pro/YOUR_API_KEY
```

### Self-Hosted Node

If you run your own Shardeum node:

```bash
NEXT_PUBLIC_RPC_URL=http://your-node-ip:8545
```

## Setup Instructions

### 1. Copy the Example File

```bash
cp .env.local.example .env.local
```

### 2. Update Values

Edit `.env.local` with your configuration:

```bash
nano .env.local
# or
code .env.local
```

### 3. Restart Development Server

```bash
npm run dev
```

## Security Best Practices

### ✅ DO:

- Keep API keys in `.env.local` only
- Use different API keys for dev/staging/production
- Set rate limits on your RPC provider
- Use allowlists to restrict API key usage
- Monitor your API usage regularly
- Rotate API keys periodically

### ❌ DON'T:

- Commit `.env.local` to git (already in `.gitignore`)
- Share API keys publicly
- Use production keys in development
- Hardcode sensitive values in code

## Deployment

### Vercel

Add environment variables in your Vercel project settings:

1. Go to **Project Settings** → **Environment Variables**
2. Add each `NEXT_PUBLIC_*` variable
3. Deploy

### Other Platforms

Consult your platform's documentation for setting environment variables:

- **Netlify**: Site settings → Environment variables
- **AWS Amplify**: App settings → Environment variables
- **Render**: Environment → Environment Variables

## No Mock Data

**Important**: This application no longer uses mock data. All data comes from the blockchain.

- `DEV_MODE` is permanently set to `false`
- All contract calls fetch real data
- Errors are thrown if blockchain calls fail (no fallbacks)
- You must have a working RPC connection to use the app

## Troubleshooting

### Issue: "Failed to fetch credit info"

**Solution**: Check your RPC URL is accessible:

```bash
curl -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
  $NEXT_PUBLIC_RPC_URL
```

### Issue: Rate limiting errors

**Solution**: Use a paid RPC provider or implement request caching

### Issue: Wrong network data

**Solution**: Verify `NEXT_PUBLIC_CHAIN_ID` matches your RPC endpoint

## Support

For more help:

- Check [lib/networks.ts](lib/networks.ts) for network configuration
- Check [lib/contract.ts](lib/contract.ts) for contract integration
- Review Shardeum docs: https://docs.shardeum.org
