# How to Reset and See Apply Credit Screen

## Option 1: Clear Browser Storage (Recommended)

1. Open browser DevTools (F12 or Cmd+Option+I)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Find **Local Storage** → `http://localhost:3000`
4. Click **Clear All** or delete the `app-store` key
5. Refresh the page (Cmd+R or Ctrl+R)

## Option 2: Use Browser Console

1. Open browser console (F12)
2. Type and run:

```javascript
localStorage.clear();
window.location.reload();
```

## Option 3: Incognito/Private Mode

1. Open new Incognito/Private window
2. Go to `http://localhost:3000`
3. Connect wallet
4. Navigate to dashboard

## What You Should See After Reset

### Step 1: Homepage

- Landing page with "Get Started" button
- Connect Wallet in top-right

### Step 2: After Connecting Wallet

- Click "Get Started"
- Redirected to `/dashboard`

### Step 3: Apply Credit Screen

You'll see a centered screen with:

- ⚡ Zap icon (cyan glow)
- "Apply for Pay-Fi Credit" heading (neon cyan)
- Description text
- "Apply for Credit" button (cyan with glow)

### Step 4: Click Apply Button

- App analyzes your Sepolia transactions
- Takes 2-3 seconds
- Shows loading spinner
- Then displays full dashboard with credit info

## Quick Navigation Map

```
Homepage (/)
    ↓
Click "Get Started" + Wallet Connected
    ↓
Dashboard (/dashboard)
    ↓
No Credit? → Apply Screen → Click Apply → Credit Assessed → Full Dashboard
Already Have Credit? → Full Dashboard (skip apply)
```

## Direct URLs

- **Homepage**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **Payment Requests**: http://localhost:3000/payment-requests
- **Credit Page**: http://localhost:3000/credit-identity
- **Transactions**: http://localhost:3000/transactions

## Troubleshooting

**Not seeing apply screen?**

- Clear localStorage and refresh
- Check wallet is connected
- Check browser console for errors

**Apply button not working?**

- Check you're on Sepolia testnet
- Check wallet has Sepolia address
- Check console for errors

**Dashboard shows immediately?**

- You already have credit data stored
- Clear storage to reset
- Or just use the existing credit!
