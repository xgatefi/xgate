# Contributing to xGate

Thank you for your interest in contributing to xGate! This guide will help you add new features and tools.

## 🛠️ Development Setup

```bash
# Clone and install
git clone <your-fork>
cd xGate
pnpm install

# Setup database
pnpm db:generate
pnpm db:push

# Seed initial data
cd scripts && npx tsx seed-prices.ts && cd ..

# Start development
pnpm dev
```

## 📁 Project Structure

```
packages/
  gateway/          # Next.js API gateway
    src/app/api/    # API routes
      tools/        # Protected tool endpoints
      health/       # Public endpoints
    src/lib/        # Core libraries
      x402.ts       # Payment protocol
      middleware.ts # HTTP 402 handler
  
  sdk/              # Client SDK
    src/client.ts   # Main client
    src/wallet/     # Wallet providers
  
  shared/           # Shared code
    src/types.ts    # TypeScript types
    src/utils.ts    # Utilities
```

## ➕ Adding a New Tool Endpoint

### Step 1: Create Route File

Create `/packages/gateway/src/app/api/tools/[your-tool]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { withPaymentProtection } from '@/lib/middleware';

async function handleRequest(
  req: NextRequest,
  paymentId?: string
): Promise<NextResponse> {
  // Your tool logic here
  const result = await myToolFunction();
  
  return NextResponse.json({
    success: true,
    data: result,
    paymentId,
  });
}

export const POST = withPaymentProtection(handleRequest, {
  endpoint: '/api/tools/your-tool',
  method: 'POST',
  price: 0.05, // $0.05 USD
  useDatabase: false, // or true to use PriceRule
});
```

### Step 2: Add Price Rule (Optional)

If using database pricing, add to `scripts/seed-prices.ts`:

```typescript
{
  endpoint: '/api/tools/your-tool',
  name: 'Your Tool Name',
  description: 'What your tool does',
  priceUsd: 0.05,
  pricingType: 'fixed', // or 'metered'
  enabled: true,
}
```

Run: `cd scripts && npx tsx seed-prices.ts`

### Step 3: Test Your Endpoint

```typescript
// test-my-tool.ts
import { XGateClient, MockWallet } from '@xgate/sdk';

const client = new XGateClient({
  gatewayUrl: 'http://localhost:3000',
  wallet: new MockWallet(),
  autoPay: true,
});

const response = await client.post('/api/tools/your-tool', {
  // your parameters
});

console.log(response.data);
```

## 🎨 Advanced Patterns

### Metered Pricing (per KB)

```typescript
import { calculateMeteredPrice } from '@xgate/shared';

async function handleMeteredRequest(
  req: NextRequest,
  paymentId?: string
): Promise<NextResponse> {
  const result = await scrapeWebsite(url);
  const sizeKB = Buffer.byteLength(result) / 1024;
  
  // Calculate actual cost
  const actualPrice = calculateMeteredPrice(
    Buffer.byteLength(result),
    0.0001, // $0.0001 per KB
    'kb'
  );
  
  // Update payment record with actual size
  await prisma.payment.update({
    where: { id: paymentId },
    data: { responseSize: Buffer.byteLength(result) },
  });
  
  return NextResponse.json({
    success: true,
    data: result,
    metadata: {
      sizeKB,
      actualPrice,
    },
  });
}
```

### Tiered Pricing

```typescript
// Free tier (slow)
export const POST = withPaymentProtection(handleFree, {
  endpoint: '/api/tools/llm/free',
  method: 'POST',
  price: 0,
});

// Priority tier (fast)
export const POST_PRIORITY = withPaymentProtection(handlePriority, {
  endpoint: '/api/tools/llm/priority',
  method: 'POST',
  price: 0.02,
});
```

### Error Handling with Refunds

```typescript
import { issueRefund } from '@/lib/x402';

async function handleWithRefund(
  req: NextRequest,
  paymentId?: string
): Promise<NextResponse> {
  try {
    const result = await riskyOperation();
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    // Issue refund on failure
    if (paymentId) {
      const payment = await prisma.payment.findUnique({
        where: { id: paymentId },
      });
      
      if (payment) {
        await issueRefund(payment.txHash, 'Operation failed');
      }
    }
    
    return NextResponse.json(
      { error: 'Operation failed', refunded: true },
      { status: 500 }
    );
  }
}
```

## 🔌 Adding Wallet Providers

Create `/packages/sdk/src/wallet/my-wallet.ts`:

```typescript
import { WalletProvider, PaymentParams, PaymentResult } from '@xgate/shared';

export class MyWalletProvider implements WalletProvider {
  async getAddress(): Promise<string> {
    // Return wallet address
    return '0x...';
  }
  
  async signMessage(message: string): Promise<string> {
    // Sign message
    return '0x...';
  }
  
  async sendPayment(params: PaymentParams): Promise<PaymentResult> {
    // Execute USDC transfer on Base
    const tx = await this.executePayment(params);
    
    return {
      txHash: tx.hash,
      payer: await this.getAddress(),
      amount: params.amount,
      asset: params.asset,
      chain: params.chain,
      timestamp: Date.now(),
    };
  }
  
  private async executePayment(params: PaymentParams) {
    // Implementation using ethers.js, viem, or Coinbase SDK
  }
}
```

Export in `/packages/sdk/src/index.ts`:

```typescript
export { MyWalletProvider } from './wallet/my-wallet';
```

## 🗄️ Database Migrations

When modifying schema:

```bash
# Edit prisma/schema.prisma

# Generate client
pnpm db:generate

# Push to database
pnpm db:push

# Or create migration (for production)
npx prisma migrate dev --name my_migration
```

## 🧪 Testing

### Manual Testing

```bash
# Start gateway
pnpm dev

# Test endpoint
curl -i http://localhost:3000/api/tools/test

# Test with SDK
npx tsx examples/basic-usage.ts
```

### Integration Testing

Create test files in `/tests`:

```typescript
import { XGateClient, MockWallet } from '@xgate/sdk';

describe('Payment Flow', () => {
  it('should handle 402 and payment', async () => {
    const client = new XGateClient({
      gatewayUrl: 'http://localhost:3000',
      wallet: new MockWallet(),
      autoPay: true,
    });
    
    const response = await client.get('/api/tools/test');
    expect(response.status).toBe(200);
    expect(response.data.success).toBe(true);
  });
});
```

## 📚 Documentation

When adding features, update:

1. **API.md** - Add endpoint documentation
2. **README.md** - Update feature list
3. **Code comments** - JSDoc for functions
4. **Examples** - Add usage examples

## 🎯 Code Style

- **TypeScript**: Use strict mode, no `any`
- **Naming**: camelCase for functions, PascalCase for types
- **Async/Await**: Prefer over promises
- **Error Handling**: Always catch and log errors
- **Comments**: Explain "why", not "what"

## 🚀 Pull Request Process

1. **Fork** the repository
2. **Create branch**: `git checkout -b feature/my-feature`
3. **Make changes** with clear commits
4. **Test thoroughly** - test endpoints and SDK
5. **Update docs** - README, API.md, etc.
6. **Submit PR** with clear description

### PR Template

```markdown
## Description
What does this PR do?

## Changes
- Added new endpoint: /api/tools/xyz
- Updated SDK to handle XYZ
- Added tests for ABC

## Testing
- [ ] Tested manually with cURL
- [ ] Tested with SDK
- [ ] Updated examples
- [ ] Added documentation

## Pricing
- Endpoint: /api/tools/xyz
- Price: $0.03 USD
- Type: fixed
```

## 🐛 Bug Reports

Use GitHub issues with:

- **Title**: Clear, descriptive
- **Description**: Steps to reproduce
- **Expected**: What should happen
- **Actual**: What actually happens
- **Environment**: OS, Node version, etc.
- **Logs**: Error messages, stack traces

## 💡 Feature Requests

Open an issue with:

- **Use case**: Why is this needed?
- **Proposed solution**: How should it work?
- **Alternatives**: Other approaches considered
- **Examples**: Similar features elsewhere

## 🎉 Recognition

Contributors will be:
- Listed in README.md
- Credited in release notes
- Given shoutouts on social media

Thank you for contributing to xGate! 🚀

