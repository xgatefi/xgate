# xGate Setup Guide

Complete setup instructions for the xGate Protocol.

## Prerequisites

- **Node.js** 18+ 
- **pnpm** 8+ (install: `npm install -g pnpm`)
- **PostgreSQL database** (Neon recommended)
- **Coinbase account** (for x402 payments)

## Step 1: Install Dependencies

```bash
pnpm install
```

This will install all dependencies for the monorepo (gateway, sdk, shared packages).

## Step 2: Set Up Database

### Option A: Neon PostgreSQL (Recommended)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string

### Option B: Local PostgreSQL

```bash
# macOS (via Homebrew)
brew install postgresql
brew services start postgresql

# Create database
createdb xgate
```

## Step 3: Configure Environment

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```bash
# Database (from Neon or local)
DATABASE_URL="postgresql://user:password@host/xgate?sslmode=require"

# Gateway Configuration
NEXT_PUBLIC_GATEWAY_URL="http://localhost:3000"
FACILITATOR_URL="https://x402.coinbase.com"

# Your wallet address to receive payments
RECIPIENT_ADDRESS="0xYourWalletAddress"

# Payment settings
PAYMENT_ASSET="USDC"
PAYMENT_CHAIN="base"

# Generate a secure secret
JWT_SECRET="your-super-secret-jwt-key-change-this"

# Coinbase API (optional, for production)
COINBASE_API_KEY="your-api-key"
COINBASE_API_SECRET="your-api-secret"
```

### Important: Set RECIPIENT_ADDRESS

This is your wallet address where payments will be sent. Make sure:
- It's a valid Ethereum address (0x...)
- You control this wallet
- It can receive USDC on Base chain

## Step 4: Initialize Database

Generate Prisma client and push schema:

```bash
pnpm db:generate
pnpm db:push
```

Seed initial price rules:

```bash
cd scripts
npx tsx seed-prices.ts
```

## Step 5: Start Development Server

```bash
pnpm dev
```

The gateway will start at `http://localhost:3000`.

## Step 6: Test the Gateway

### Option 1: Browser

Visit `http://localhost:3000` - you'll see the xGate home page with documentation.

### Option 2: cURL

Test without payment (should return 402):

```bash
curl -i http://localhost:3000/api/tools/test
```

Expected response:
```
HTTP/1.1 402 Payment Required
X-402-Challenge: eyJ2ZXJ...
X-402-Price: 0.010000

{
  "error": "payment_required",
  "message": "Payment of $0.010000 required",
  "payment": { ... }
}
```

### Option 3: SDK

Create a test file:

```typescript
// test.ts
import { XGateClient, MockWallet } from '@xgate/sdk';

const client = new XGateClient({
  gatewayUrl: 'http://localhost:3000',
  wallet: new MockWallet(),
  autoPay: true,
});

const response = await client.get('/api/tools/test');
console.log(response.data);
```

Run it:

```bash
npx tsx test.ts
```

## Step 7: View Database

Open Prisma Studio to view payments and usage:

```bash
pnpm db:studio
```

Visit `http://localhost:5555` to browse:
- Payments and receipts
- Price rules
- Usage logs
- Credit ledger

## Production Deployment

### 1. Deploy Database

- **Neon**: Already hosted, just use connection string
- **Supabase**: Create PostgreSQL instance
- **AWS RDS**: Set up PostgreSQL instance

### 2. Deploy Gateway

#### Vercel (Recommended for Next.js)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd packages/gateway
vercel

# Set environment variables in Vercel dashboard
```

#### Docker

```dockerfile
# Coming soon: Dockerfile
```

### 3. Configure Production Wallet

⚠️ **Important**: In production, you MUST:

1. Replace `MockWallet` with real wallet provider
2. Implement proper on-chain verification in `lib/x402.ts`
3. Set up Coinbase Commerce API for payment verification
4. Use secure JWT_SECRET
5. Enable HTTPS only

### 4. Verify Blockchain Transactions

The current implementation accepts payments in development mode without blockchain verification. For production:

```typescript
// In packages/gateway/src/lib/x402.ts
// Replace verifyOnChain() with actual RPC calls:

import { ethers } from 'ethers';

async function verifyOnChain(proof: X402PaymentProof): Promise<boolean> {
  const provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
  
  // Get transaction receipt
  const receipt = await provider.getTransactionReceipt(proof.txHash);
  
  if (!receipt || receipt.status !== 1) {
    return false; // Transaction failed or not found
  }
  
  // Verify recipient, amount, etc.
  // ...
  
  return true;
}
```

## Troubleshooting

### Database connection fails

- Check `DATABASE_URL` is correct
- For Neon: Ensure `?sslmode=require` is in connection string
- Test connection: `pnpm db:studio`

### 402 not working

- Check `RECIPIENT_ADDRESS` is set
- Check `JWT_SECRET` is set
- View logs for errors

### Payments not verifying

- In development: Should auto-accept with MockWallet
- Check Prisma Studio for payment records
- View browser console for SDK logs

### TypeScript errors

```bash
# Regenerate types
pnpm db:generate
pnpm typecheck
```

## Next Steps

1. **Add More Endpoints**: Create tool endpoints in `packages/gateway/src/app/api/tools/`
2. **Implement Real Payments**: Integrate Coinbase Commerce or direct blockchain
3. **Build Console**: Create admin dashboard to manage prices
4. **Add Analytics**: Track usage and revenue
5. **Marketplace**: Let others publish tools behind your gateway

## Resources

- [x402 Spec](https://x402.org)
- [Coinbase x402 Docs](https://docs.cdp.coinbase.com)
- [Base Chain](https://base.org)
- [Neon Database](https://neon.tech)
- [Prisma Docs](https://prisma.io/docs)

## Support

For issues or questions:
- Open an issue on GitHub
- Check the examples in `/examples`
- Review the API docs in `/packages/*/README.md`

---

**Ready to build!** 🚀

