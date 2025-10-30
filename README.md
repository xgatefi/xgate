# xGate Protocol

**Pay-Per-Tool AI Agent Router** - An API gateway for AI agents where every tool call is a trustless micropayment via x402.

## 🎯 What is xGate?

xGate is an HTTP 402-based API gateway that enables:
- **Agent-native commerce**: AI agents can dynamically purchase API calls ($0.01-$0.05) without API keys
- **Frictionless monetization**: Meter expensive operations (LLM, OCR, scraping) per request
- **Zero signup flow**: Pay-as-you-go over plain HTTP using USDC on Base chain

## 🏗️ Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Client    │─────▶│   Gateway    │─────▶│   Tools     │
│  (SDK/AI)   │◀─────│  (Next.js)   │◀─────│  /ocr /llm  │
└─────────────┘      └──────────────┘      └─────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  PostgreSQL  │
                     │  (Receipts)  │
                     └──────────────┘
```

## 📦 Monorepo Structure

```
xGate/
├── packages/
│   ├── gateway/      # Next.js API gateway
│   ├── sdk/          # Client SDK (npm package)
│   └── shared/       # Shared types
├── prisma/           # Database schema
└── package.json      # Workspace root
```

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Set up environment
cp .env.example .env
# Edit .env with your Neon DB and Coinbase credentials

# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push

# Start development server
pnpm dev
```

## 💳 Payment Flow

1. **Client calls protected endpoint**: `GET /tools/vision`
2. **Gateway returns 402**: Payment Required with x402 challenge
3. **Client auto-pays**: USDC on Base via Coinbase
4. **Client retries**: With payment proof header
5. **Gateway verifies**: Checks blockchain receipt
6. **Tool executes**: Returns result

## 🔧 Environment Variables

See `.env.example` for required configuration:
- `DATABASE_URL`: Neon PostgreSQL connection
- `COINBASE_API_KEY`: Coinbase x402 facilitator
- `PAYMENT_CHAIN`: `base` (Base L2)
- `PAYMENT_ASSET`: `USDC`

## 📚 Core Components

### Gateway (`packages/gateway`)
- Next.js API routes with 402 middleware
- Price rules engine
- Payment verification
- Tool proxying

### SDK (`packages/sdk`)
- Automatic 402 handling
- Payment retry logic
- TypeScript-first

### Database (Prisma)
- Payment receipts
- Price rules
- Usage analytics
- Credit ledger

## 🎨 Features

- ✅ Fixed-price endpoints
- ✅ Metered pricing (per KB)
- ✅ Automatic refunds (on 5xx errors)
- ✅ Credit ledger system
- ✅ Usage analytics
- 🔜 Developer console
- 🔜 Agent marketplace
- 🔜 Dual-rail (L402 + x402)

## 📖 API Examples

### Protected Endpoint
```typescript
// /api/tools/vision - $0.03 per request
POST /tools/vision
Content-Type: application/json

{
  "image_url": "https://..."
}

// First call → 402 Payment Required
// SDK auto-pays and retries
// Returns vision analysis
```

### Metered Endpoint
```typescript
// /api/tools/scrape - $0.01 per 100KB
GET /tools/scrape?url=https://example.com

// Payment calculated based on response size
```

## 🔐 Security

- Payment proofs verified on-chain
- Idempotency keys prevent double-charging
- Rate limiting per wallet
- Challenge signing with JWT

## 📊 Database Schema

Key models:
- **PriceRule**: Endpoint pricing configuration
- **Payment**: x402 receipt records
- **UsageLog**: Analytics and monitoring
- **CreditLedger**: Refunds and prepaid balance

## 🛠️ Development

```bash
# Run gateway
pnpm dev

# Build all packages
pnpm build

# Type checking
pnpm typecheck

# Database studio
pnpm db:studio
```

## 🌟 Use Cases

1. **AI Agent Tooling**: LLM, OCR, Vision, Search
2. **Spam-proof APIs**: Webhooks require payment
3. **Premium CDN**: Per-megabyte content delivery
4. **Compute Marketplace**: Rent GPU cycles per second

## 📄 License

MIT

## 🤝 Contributing

Built on:
- [x402 spec](https://x402.org) by Coinbase
- [Neon](https://neon.tech) serverless Postgres
- [Base](https://base.org) L2 chain
- [Next.js](https://nextjs.org) framework

---

**Built for agents. Priced per call. Zero friction.**

