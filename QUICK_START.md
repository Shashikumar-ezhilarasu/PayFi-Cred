# 🚀 Quick Start Guide - PayForMe Frontend

## Current Status

✅ **RUNNING** at http://localhost:3000

---

## 🎯 What You Have

### ✅ Fully Functional

- Landing page with animations
- Wallet connection (MetaMask)
- Credit NFT minting flow
- Dashboard with credit stats
- Credit score visualization
- Beautiful UI with dark mode
- Responsive design

### 📁 Complete Structure

- 9 components built
- 4 pages working
- 7 page directories ready
- Full type system
- Mock data layer
- State management

---

## 🏃 Running Commands

```bash
# Development
npm run dev          # http://localhost:3000

# Build
npm run build       # Production build

# Start production
npm start           # After building
```

---

## 🔧 Quick Edits

### Change Colors

File: `app/globals.css`

### Edit Mock Data

File: `lib/mockData.ts`

### Adjust Credit Limits

File: `lib/constants.ts`

### Add New Page

1. Create folder in `app/`
2. Add `page.tsx` file
3. Copy pattern from `dashboard/page.tsx`

---

## 🎨 Component Usage Examples

### Use Credit Card

```tsx
import { CreditCard } from "@/components/credit/CreditCard";

<CreditCard creditData={creditData} />;
```

### Use Wallet Button

```tsx
import { WalletButton } from "@/components/wallet/WalletButton";

<WalletButton />;
```

### Use MCP Modal

```tsx
import { MCPDecisionModal } from "@/components/mcp/MCPDecisionModal";

<MCPDecisionModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  decision={decision}
  isEvaluating={isEvaluating}
/>;
```

---

## 📊 State Management

```tsx
import { useAppStore } from "@/store/useAppStore";

const {
  wallet, // Wallet state
  creditData, // Credit information
  creditIdentity, // NFT data
  transactions, // Transaction history
  cart, // Shopping cart
} = useAppStore();
```

---

## 🔌 Integration Points

### Smart Contracts

Replace functions in `lib/wallet.ts`:

- mintCreditIdentity
- hasCreditIdentity
- executePayLater
- repayTransaction

### MCP Agent

Replace functions in `lib/mcp.ts`:

- evaluatePayLaterRequest
- storeMCPDecision

### Backend API

Replace mock data in `lib/mockData.ts`

---

## 📝 Todo: Build Remaining Pages

1. **Transactions** (`/transactions`) - List view
2. **Repayment** (`/repayment`) - Payment UI
3. **Profile** (`/profile`) - User info
4. **Food App** (`/food`) - Food ordering
5. **Petrol App** (`/petrol`) - Petrol payment
6. **Shopping** (`/shopping`) - E-commerce
7. **Checkout** (`/checkout`) - PayLater flow
8. **Result** (`/result`) - Success/failure

Copy pattern from `/dashboard/page.tsx`

---

## 🎓 Code Patterns

### Page Template

```tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { motion } from "framer-motion";

export default function YourPage() {
  const router = useRouter();
  const { wallet } = useAppStore();

  useEffect(() => {
    if (!wallet.connected) {
      router.push("/");
    }
  }, [wallet.connected, router]);

  return (
    <div className="min-h-screen pt-20 pb-12 px-4">
      <div className="container mx-auto max-w-7xl">{/* Your content */}</div>
    </div>
  );
}
```

---

## 🐛 Common Issues

### Port 3000 in use

```bash
lsof -ti:3000 | xargs kill -9
```

### MetaMask not detected

- Install MetaMask extension
- Refresh page after install

### Build errors

```bash
rm -rf .next
npm run build
```

---

## 📱 Responsive Breakpoints

- `sm:` - 640px
- `md:` - 768px
- `lg:` - 1024px
- `xl:` - 1280px
- `2xl:` - 1536px

---

## 🎨 Color Palette

### Primary

- Blue: `from-blue-600 to-purple-600`
- Green: `text-green-500`
- Red: `text-red-500`

### Backgrounds

- Light: `bg-gray-50`
- Dark: `dark:bg-gray-950`

---

## 📦 Key Dependencies

```json
{
  "next": "16.1.1",
  "react": "^19",
  "tailwindcss": "^3",
  "framer-motion": "latest",
  "zustand": "latest",
  "recharts": "latest",
  "ethers": "latest"
}
```

---

## 🚢 Deploy Checklist

- [ ] Test build locally
- [ ] Add environment variables
- [ ] Update smart contract addresses
- [ ] Connect MCP agent
- [ ] Add analytics
- [ ] Test on Vercel
- [ ] Custom domain

---

## 📞 Need Help?

Check these files:

- `README.md` - Full documentation
- `PROJECT_SUMMARY.md` - Detailed overview
- `lib/mockData.ts` - See data structure

---

**Your app is ready! Start building the remaining pages! 🎉**
