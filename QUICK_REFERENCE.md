# xGate Quick Reference

Cheat sheet for common tasks and commands.

## 🚀 Getting Started

```bash
# Quick setup (automated)
./scripts/quickstart.sh

# Manual setup
pnpm install
pnpm db:generate
pnpm db:push
cd scripts && npx tsx seed-prices.ts && cd ..
pnpm dev
```

## 📦 Commands

### Workspace
```bash
pnpm install              # Install all dependencies
pnpm build                # Build all packages
pnpm typecheck            # Type check all packages
pnpm clean                # Clean all build artifacts
```

### Gateway
```bash
pnpm dev                  # Start Next.js dev server
pnpm --filter gateway dev # Start only gateway
pnpm --filter gateway build
```

### Database
```bash
pnpm db:generate          # Generate Prisma client
pnpm db:push              # Push schema to database
pnpm db:studio            # Open Prisma Studio (localhost:5555)
npx prisma migrate dev    # Create migration
npx prisma migrate deploy # Deploy migrations (prod)
```

### Testing
```bash
./scripts/test-endpoint.sh              # Test with cURL
./scripts/test-endpoint.sh /api/tools/test
npx tsx examples/basic-usage.ts         # Test with SDK
```

## 🔧 Configuration

### Environment Variables
```bash
# Required
DATABASE_URL="postgresql://..."
RECIPIENT_ADDRESS="0x..."

# Optional
JWT_SECRET="your-secret"
COINBASE_API_KEY="..."
COINBASE_API_SECRET="..."
```

### Add Price Rule
```typescript
// scripts/seed-prices.ts
{
  endpoint: '/api/tools/my-tool',
  name: 'My Tool',
  priceUsd: 0.05,
  pricingType: 'fixed',
  enabled: true,
}
```

## 🛠️ Creating New Endpoint

### 1. Create Route File
```typescript
// packages/gateway/src/app/api/tools/my-tool/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPaymentProtection } from '@/lib/middleware';

async function handler(req: NextRequest, paymentId?: string) {
  return NextResponse.json({ success: true });
}

export const POST = withPaymentProtection(handler, {
  endpoint: '/api/tools/my-tool',
  method: 'POST',
  price: 0.05,
  useDatabase: false,
});
```

### 2. Test It
```bash
curl -i http://localhost:3000/api/tools/my-tool
# Should return 402
```

## 📡 Using SDK

### Basic Usage
```typescript
import { XGateClient, MockWallet } from '@xgate/sdk';

const client = new XGateClient({
  gatewayUrl: 'http://localhost:3000',
  wallet: new MockWallet(),
  autoPay: true,
  maxPrice: 1.0,
});

// GET
const response = await client.get('/api/tools/test');

// POST
const response = await client.post('/api/tools/test', {
  data: 'hello',
});
```

### Price Control
```typescript
client.setMaxPrice(0.05);  // Max $0.05
client.setAutoPay(false);  // Disable auto-pay
```

## 🔍 Common Patterns

### Fixed Price
```typescript
export const POST = withPaymentProtection(handler, {
  endpoint: '/api/tools/ocr',
  method: 'POST',
  price: 0.02,
});
```

### Database Price
```typescript
export const POST = withPaymentProtection(handler, {
  endpoint: '/api/tools/vision',
  method: 'POST',
  useDatabase: true, // Looks up in PriceRule table
});
```

### Free Endpoint
```typescript
// Just export handler directly, no middleware
export async function GET(req: NextRequest) {
  return NextResponse.json({ data: 'free' });
}
```

### Metered Pricing
```typescript
import { calculateMeteredPrice } from '@xgate/shared';

async function handler(req: NextRequest, paymentId?: string) {
  const result = await doWork();
  const size = Buffer.byteLength(result);
  
  const price = calculateMeteredPrice(size, 0.0001, 'kb');
  
  return NextResponse.json({ 
    data: result,
    metadata: { sizeKB: size / 1024, price }
  });
}
```

### With Refund
```typescript
import { issueRefund } from '@/lib/x402';

async function handler(req: NextRequest, paymentId?: string) {
  try {
    const result = await riskyOperation();
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    // Refund on error
    if (paymentId) {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });
      if (payment) {
        await issueRefund(payment.txHash, 'Operation failed');
      }
    }
    return NextResponse.json({ error: 'Failed', refunded: true }, { status: 500 });
  }
}
```

## 📊 Database Queries

### Get All Payments
```typescript
const payments = await prisma.payment.findMany({
  where: { status: 'completed' },
  orderBy: { createdAt: 'desc' },
  take: 10,
});
```

### Get Usage Stats
```typescript
const stats = await prisma.usageLog.groupBy({
  by: ['endpoint'],
  _count: { id: true },
  _sum: { amountUsd: true },
});
```

### Get User Balance
```typescript
const ledger = await prisma.creditLedger.findUnique({
  where: { wallet: '0x...' },
  include: { credits: true },
});
```

## 🔐 Payment Flow

### Manual 402 Handling
```typescript
// 1. Request endpoint
const res1 = await fetch('/api/tools/test');

// 2. Check for 402
if (res1.status === 402) {
  const { payment } = await res1.json();
  
  // 3. Make payment
  const proof = await makePayment(payment);
  
  // 4. Retry with proof
  const res2 = await fetch('/api/tools/test', {
    headers: {
      'X-402-Proof': encodePaymentProof(proof),
    },
  });
  
  const data = await res2.json();
}
```

### SDK (Automatic)
```typescript
// SDK handles everything automatically
const response = await client.get('/api/tools/test');
// Done! 💰
```

## 🌐 API Endpoints

| Endpoint | Method | Price | Description |
|----------|--------|-------|-------------|
| `/api/health` | GET | Free | Health check |
| `/api/prices` | GET | Free | List all prices |
| `/api/tools/test` | GET/POST | $0.01 | Test endpoint |

## 🐛 Debugging

### Check Database
```bash
pnpm db:studio
# Opens localhost:5555
```

### View Logs
```typescript
// Enable Prisma query logs
// In packages/gateway/src/lib/prisma.ts
new PrismaClient({
  log: ['query', 'error', 'warn'],
})
```

### Test Payment Flow
```bash
# 1. Check endpoint returns 402
curl -i http://localhost:3000/api/tools/test

# 2. Test with SDK (uses MockWallet)
npx tsx examples/basic-usage.ts

# 3. Check database
pnpm db:studio
# Look at Payment table
```

### Common Issues

**Database connection failed**
```bash
# Check DATABASE_URL in .env
# For Neon, ensure ?sslmode=require
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"
```

**Payment verification failed**
```bash
# In dev mode, should auto-accept MockWallet
# Check RECIPIENT_ADDRESS is set
# Check JWT_SECRET is set
```

**TypeScript errors**
```bash
pnpm db:generate    # Regenerate Prisma types
pnpm typecheck      # Check all packages
```

## 📚 Documentation

- **Setup**: `SETUP.md`
- **API Reference**: `API.md`
- **Contributing**: `CONTRIBUTING.md`
- **Architecture**: `PROJECT_OVERVIEW.md`
- **SDK Docs**: `packages/sdk/README.md`

## 💡 Tips

1. **Use MockWallet in dev** - No real payments needed
2. **Check Prisma Studio** - Visual database browser
3. **Test with cURL first** - Verify 402 response
4. **Then test with SDK** - Verify full flow
5. **Enable query logs** - Debug database issues
6. **Set max price** - Prevent overspending
7. **Use TypeScript** - Catch errors early

## 🚀 Deployment

### Vercel
```bash
cd packages/gateway
vercel
# Set env vars in dashboard
```

### Database
```bash
# Neon (recommended)
1. Create project at neon.tech
2. Copy connection string
3. Add to .env and Vercel

# Run migrations
npx prisma migrate deploy
```

### Production Checklist
- [ ] Set DATABASE_URL (Neon)
- [ ] Set RECIPIENT_ADDRESS (your wallet)
- [ ] Set JWT_SECRET (secure random)
- [ ] Configure COINBASE_API_KEY
- [ ] Implement real wallet in SDK
- [ ] Enable blockchain verification
- [ ] Set up monitoring
- [ ] Configure domain/SSL

## 📞 Getting Help

- **Examples**: Check `/examples` directory
- **Issues**: Open GitHub issue
- **Docs**: Read full documentation
- **Discord**: Join community (coming soon)

---

**Quick Links**:
- GitHub: [github.com/xgatefi](https://github.com)
- Docs: [xgate.fi](https://xgate.fi)
- x402 Spec: [x402.org](https://x402.org)

