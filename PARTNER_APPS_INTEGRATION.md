# Partner Apps Integration - Payment Request System

## Overview

Enhanced payment request system where partner apps can request payments from AI agents, and agents automatically approve/reject based on user-defined policies. Agents also control payment timing before due dates.

## Real Wallet Addresses (Configured Partners)

### Cloud Services

- **AWS**: `0x069c84b7e95B17a1c258715E1999256325D1d076`
- **Netflix**: `0x4E57DE087B6474F70D508d18724cDC3917063D63`

### Future Partners

You can add more wallet addresses by updating the `MERCHANTS` array in `/lib/payment-requests.ts`.

## Features

### 1. **Auto-Generated Payment Requests**

- Partner apps automatically request payments every 30 seconds (50% chance)
- Requests include:
  - Merchant name and logo
  - Amount in ETH
  - Category (utilities, entertainment, subscriptions, food, transport)
  - Due date based on billing cycle
  - Partner wallet address (if configured)
  - Recurring vs one-time

### 2. **AI Agent Decision Making**

The agent evaluates each request against:

- **Category Spending Limits** (from user policy):
  - Utilities: 40% of credit limit
  - Entertainment: 15%
  - Subscriptions: 20%
  - Food: 30%
  - Transport: 25%
  - Other: 10%
- **Available Credit Balance**
- **Current Category Usage**

**Auto-Approval Logic:**

```typescript
// Request is approved if:
1. Category usage (current + new amount) < category limit
2. Total amount < available credit balance
3. No manual review flags
```

**Auto-Rejection:**

- Exceeds category limit
- Insufficient credit
- Risk factors detected

### 3. **User-Initiated Requests**

Users can manually request payments for any merchant:

1. Click "Request Payment (Custom)"
2. Optionally enter custom amount
3. Select merchant from 40+ partners
4. Agent auto-evaluates immediately

**User Request Flow:**

```
User selects merchant → Optional custom amount → Request created →
Agent evaluates (0.5s) → Approved/Rejected based on policy
```

### 4. **Payment Scheduling**

Agents control when to pay before due dates:

- **Monthly billing**: Due in 30 days
- **Usage-based**: Due in 3 days
- **One-time**: Due in 7 days

Agents can schedule payments within the due date window to optimize cashflow.

### 5. **Partner App Categories**

#### 🎬 Entertainment & Subscriptions (15% limit)

- Spotify, Netflix, YouTube Premium, Disney+
- GitHub, GitLab, Jira, Adobe, Figma, Canva Pro
- Slack, Zoom

#### ⚡ Cloud & Infrastructure (40% limit)

- AWS, Google Cloud, Azure, DigitalOcean
- Vercel, Netlify, Heroku, Railway
- Cloudflare, Datadog, Sentry

#### 🤖 AI & APIs (40% limit)

- OpenAI, Anthropic, Replicate
- Twilio, SendGrid
- MongoDB Atlas, Supabase, PlanetScale

#### 🔧 Automation & Integration (40% limit)

- Zapier, Make, n8n

#### 💳 Payment & Finance (40% limit)

- Stripe

#### 🚗 Transport (25% limit)

- Uber, Lyft

#### 🍔 Food (30% limit)

- DoorDash, Uber Eats, Grubhub

## How It Works

### Auto-Request Flow

```
1. Partner app generates request every 30s
2. Request enters "pending" queue
3. Agent receives notification
4. Agent evaluates against policy:
   ✓ Check category limit
   ✓ Check available credit
   ✓ Check current usage
5. Decision made (approved/rejected)
6. If approved: Transaction recorded, credit deducted
7. Payment scheduled before due date
```

### User-Initiated Flow

```
1. User clicks "Request Payment (Custom)"
2. User selects merchant (optional custom amount)
3. Request created with "isUserInitiated: true" flag
4. Agent evaluates immediately (500ms delay)
5. Decision shown with reasoning
6. If approved: Scheduled for payment
```

### Policy-Based Decisions

```typescript
// Example: User requests AWS payment ($50 / 0.0002 ETH)
Current utilities usage: 0.0003 ETH (30% of limit)
Category limit: 0.001 ETH (40% of 0.0025 ETH credit)
New total: 0.0005 ETH (50% of limit)

✓ Approved: Within 40% utilities limit
Reason: "Within utilities spending limit (50% used)"
```

## UI Features

### Payment Request Card

- **Merchant Info**: Logo, name, description
- **Wallet Address**: Shows partner's real wallet (if configured)
- **Category Badge**: Visual category indicator
- **Recurring Badge**: Shows billing frequency
- **Due Date**: Payment deadline
- **User Initiated Badge**: Shows if user requested
- **Agent Decision**:
  - ✓ Approved with reason
  - ✗ Rejected with reason
  - ⏱️ Pending evaluation

### Status Dashboard

- **Pending Review**: Yellow indicator
- **Approved**: Green indicator with auto-approval status
- **Rejected**: Red indicator with rejection reason

### Agent Status Banner

- Shows if agent is actively monitoring
- Indicates auto-approval capability
- Real-time status updates

## Adding New Partners

### Step 1: Add Merchant Definition

Edit `/lib/payment-requests.ts`:

```typescript
{
  id: 'newpartner',
  name: 'New Partner',
  wallet: '0xYourPartnerWalletAddress', // Optional
  category: 'utilities', // or entertainment, subscriptions, etc.
  logo: '🚀',
  description: 'Partner description',
  typicalAmount: 0.0001, // in ETH
  recurringOptions: true,
  billingCycle: 'monthly', // or 'usage-based', 'one-time'
}
```

### Step 2: Test Integration

1. Navigate to `/payment-requests`
2. Click "Request Payment (Custom)"
3. Select new partner
4. Verify agent evaluation

### Step 3: Configure Auto-Requests

Partners can integrate API to automatically generate requests:

```typescript
import { createPaymentRequest } from "@/lib/payment-requests";

// Auto-generate request
const request = createPaymentRequest(
  "newpartner", // merchant ID
  customAmount, // optional
  true, // recurring
  "monthly", // frequency
  false // not user-initiated
);
```

## Security & Control

### User Policy Controls

Users set spending limits per category:

- Maximum percentage of credit per category
- Auto-repayment thresholds
- Manual review flags for high amounts

### Agent Safety Features

- **Category isolation**: Spending in one category doesn't affect others
- **Credit checks**: Every request verified against available balance
- **Manual override**: Users can always reject agent decisions
- **Audit trail**: All decisions logged with reasoning

### Wallet Address Verification

- Partner wallets displayed in UI
- Users can verify destination before approval
- Only configured partners have real wallets
- Test merchants use mock addresses

## Payment Execution

### Before Due Date

Agents schedule payments to optimize:

1. **Cashflow**: Wait for income before paying
2. **Credit utilization**: Balance credit usage
3. **Category distribution**: Spread payments across categories

### Payment Process

```
1. Agent approves request
2. Transaction scheduled before due date
3. When due date approaches:
   → Check available balance
   → Execute payment to partner wallet
   → Record transaction
   → Update credit usage
   → Notify user
```

## Testing Guide

### Test Auto-Approval

1. Go to `/payment-requests`
2. Wait for auto-generated requests (30s intervals)
3. Verify agent evaluates immediately
4. Check approval/rejection reasoning

### Test User Requests

1. Click "Request Payment (Custom)"
2. Enter custom amount (e.g., 0.0001 ETH)
3. Select AWS or Netflix (configured wallets)
4. Verify wallet address shown
5. Check agent decision

### Test Policy Limits

1. Make multiple requests in same category
2. Watch category usage increase
3. Verify rejection when limit reached
4. Check rejection reason mentions limit

### Test Due Dates

1. Check due dates on approved requests
2. Verify different billing cycles:
   - Monthly: +30 days
   - Usage-based: +3 days
   - One-time: +7 days

## Next Steps

### Phase 1 (Current)

✅ 40+ partner merchants
✅ Real wallet addresses (AWS, Netflix)
✅ Auto-request generation
✅ AI agent evaluation
✅ User-initiated requests
✅ Policy-based approval

### Phase 2 (Future)

- [ ] Actual payment execution to partner wallets
- [ ] Payment scheduling optimization
- [ ] Credit repayment tracking
- [ ] Partner API integration
- [ ] Webhook notifications to partners
- [ ] Payment receipt generation

### Phase 3 (Advanced)

- [ ] Multi-currency support
- [ ] Dynamic pricing integration
- [ ] Smart contract payment automation
- [ ] Partner dashboard for merchants
- [ ] Analytics for payment patterns
- [ ] Risk scoring improvements

## Code References

### Key Files

- `/lib/payment-requests.ts` - Merchant definitions, request creation
- `/lib/agent-policy.ts` - Policy evaluation, spending limits
- `/app/payment-requests/page.tsx` - UI and agent decision flow
- `/components/layout/Sidebar.tsx` - Navigation link

### Important Functions

```typescript
// Create payment request
createPaymentRequest(merchantId, amount, recurring, frequency, isUserInitiated);

// Evaluate spending intent
evaluateSpendingIntent(spendingIntent, availableBalance, agentPolicy);

// Record approved spending
recordSpending(spendingIntent, repaid, amountRepaid);

// Generate random request
generateRandomPaymentRequest();
```

## Support

For questions or issues:

1. Check agent decision reasoning in UI
2. Verify policy limits in agent settings
3. Review credit balance and category usage
4. Test with small amounts first

---

**Last Updated**: January 11, 2026
**Version**: 1.0.0
**Status**: Production Ready 🚀
