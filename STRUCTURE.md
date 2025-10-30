# xGate Project Structure

Complete file tree of the xGate Protocol implementation.

```
xGate/
│
├── 📄 Core Documentation
│   ├── README.md                  # Main project overview
│   ├── SETUP.md                   # Detailed setup guide
│   ├── API.md                     # Complete API reference
│   ├── CONTRIBUTING.md            # How to contribute
│   ├── PROJECT_OVERVIEW.md        # Architecture deep-dive
│   ├── QUICK_REFERENCE.md         # Command cheat sheet
│   ├── CHANGELOG.md               # Version history
│   ├── LICENSE                    # MIT license
│   └── STRUCTURE.md               # This file
│
├── ⚙️  Configuration
│   ├── package.json               # Root workspace config
│   ├── pnpm-workspace.yaml        # Monorepo workspaces
│   ├── tsconfig.json              # Base TypeScript config
│   ├── .gitignore                 # Git ignore rules
│   └── .env.example               # Environment template
│
├── 🗄️  Database
│   └── prisma/
│       └── schema.prisma          # Complete database schema
│           ├── PriceRule          # Endpoint pricing
│           ├── Payment            # Transaction receipts
│           ├── UsageLog           # Analytics
│           ├── CreditLedger       # Refund balances
│           ├── Credit             # Credit transactions
│           └── ApiKey             # Optional auth
│
├── 📦 Packages
│   │
│   ├── 🌐 gateway/                # Next.js API Gateway
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── next.config.js
│   │   ├── tailwind.config.ts
│   │   ├── postcss.config.js
│   │   │
│   │   └── src/
│   │       ├── app/
│   │       │   ├── layout.tsx           # Root layout
│   │       │   ├── page.tsx             # Landing page
│   │       │   ├── globals.css          # Global styles
│   │       │   │
│   │       │   └── api/
│   │       │       ├── health/
│   │       │       │   └── route.ts     # Health check (free)
│   │       │       │
│   │       │       ├── prices/
│   │       │       │   └── route.ts     # Price listing (free)
│   │       │       │
│   │       │       └── tools/
│   │       │           └── test/
│   │       │               └── route.ts # Protected test ($0.01)
│   │       │
│   │       └── lib/
│   │           ├── prisma.ts            # Database client
│   │           ├── config.ts            # Configuration
│   │           ├── x402.ts              # x402 protocol
│   │           │   ├── createChallenge()
│   │           │   ├── verifyPayment()
│   │           │   ├── recordPayment()
│   │           │   ├── completePayment()
│   │           │   └── issueRefund()
│   │           │
│   │           └── middleware.ts        # HTTP 402 middleware
│   │               ├── withPaymentProtection()
│   │               ├── handlePaymentRequired()
│   │               ├── checkPaymentRequired()
│   │               └── getEndpointPrice()
│   │
│   ├── 📱 sdk/                    # Client SDK (npm package)
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── README.md              # SDK documentation
│   │   │
│   │   └── src/
│   │       ├── index.ts           # Public exports
│   │       │
│   │       ├── client.ts          # XGateClient
│   │       │   ├── get()
│   │       │   ├── post()
│   │       │   ├── put()
│   │       │   ├── delete()
│   │       │   ├── request()
│   │       │   ├── makePayment()
│   │       │   ├── getWalletAddress()
│   │       │   ├── setAutoPay()
│   │       │   └── setMaxPrice()
│   │       │
│   │       └── wallet/
│   │           └── mock.ts        # MockWallet for testing
│   │               ├── getAddress()
│   │               ├── signMessage()
│   │               └── sendPayment()
│   │
│   └── 🔧 shared/                 # Shared types & utilities
│       ├── package.json
│       ├── tsconfig.json
│       │
│       └── src/
│           ├── index.ts           # Public exports
│           │
│           ├── types.ts           # TypeScript interfaces
│           │   ├── X402Challenge
│           │   ├── X402PaymentProof
│           │   ├── PriceConfig
│           │   ├── PaymentVerification
│           │   ├── GatewayConfig
│           │   ├── XGateClientConfig
│           │   ├── WalletProvider
│           │   ├── PaymentParams
│           │   ├── PaymentResult
│           │   ├── XGateResponse
│           │   └── Constants
│           │
│           └── utils.ts           # Helper functions
│               ├── encodeChallenge()
│               ├── decodeChallenge()
│               ├── encodePaymentProof()
│               ├── decodePaymentProof()
│               ├── generateChallengeId()
│               ├── generateRequestId()
│               ├── isValidTxHash()
│               ├── isValidAddress()
│               ├── formatUSD()
│               ├── calculateMeteredPrice()
│               ├── isChallengeExpired()
│               ├── createError()
│               ├── sleep()
│               └── retryWithBackoff()
│
├── 📚 Examples
│   ├── README.md                  # Example instructions
│   ├── basic-usage.ts             # GET/POST with SDK
│   └── custom-wallet.ts           # Custom wallet provider
│
└── 🔧 Scripts
    ├── quickstart.sh              # Automated setup (executable)
    ├── test-endpoint.sh           # cURL testing (executable)
    └── seed-prices.ts             # Database seeding

```

## 📊 Statistics

- **Total Files**: 45+
- **Packages**: 3 (gateway, sdk, shared)
- **API Endpoints**: 3 (test, health, prices)
- **Database Models**: 7
- **Documentation Files**: 9
- **Example Files**: 2
- **Script Files**: 3
- **TypeScript Files**: 20+

## 🎯 Key Files

### Must Configure
1. `.env` - Database URL and recipient address
2. `prisma/schema.prisma` - Database schema

### Core Implementation
1. `packages/gateway/src/lib/x402.ts` - Payment protocol
2. `packages/gateway/src/lib/middleware.ts` - HTTP 402 handler
3. `packages/sdk/src/client.ts` - SDK client
4. `packages/shared/src/types.ts` - Type definitions

### API Routes
1. `packages/gateway/src/app/api/tools/test/route.ts` - Protected endpoint
2. `packages/gateway/src/app/api/health/route.ts` - Health check
3. `packages/gateway/src/app/api/prices/route.ts` - Price listing

### Documentation
1. `SETUP.md` - Start here for setup
2. `API.md` - API reference
3. `QUICK_REFERENCE.md` - Quick commands

## 🔄 Data Flow

```
Request → Middleware → x402 Check → Payment? → Tool → Response
                         ↓
                    Challenge
                         ↓
                      Client
                         ↓
                      Payment
                         ↓
                    Blockchain
                         ↓
                   Verification
                         ↓
                      Database
```

## 🗂️ Import Relationships

```
gateway
  ├─→ @xgate/shared (types, utils)
  └─→ @prisma/client (database)

sdk
  └─→ @xgate/shared (types, utils)

shared
  └─→ (no dependencies)
```

## 🚀 Getting Started

1. **Setup**: `./scripts/quickstart.sh`
2. **Develop**: `pnpm dev`
3. **Test**: `npx tsx examples/basic-usage.ts`
4. **Deploy**: See `SETUP.md`

## 📖 Reading Order

For new developers:

1. `README.md` - Overview
2. `SETUP.md` - Setup instructions
3. `packages/shared/src/types.ts` - Understand types
4. `packages/gateway/src/lib/x402.ts` - Payment logic
5. `packages/sdk/src/client.ts` - Client SDK
6. `API.md` - API reference
7. `CONTRIBUTING.md` - Add features

## 🎓 Learning Path

### Beginner
1. Run `./scripts/quickstart.sh`
2. Start gateway: `pnpm dev`
3. Run example: `npx tsx examples/basic-usage.ts`
4. Read `QUICK_REFERENCE.md`

### Intermediate
1. Add new endpoint (see `CONTRIBUTING.md`)
2. Create custom wallet provider
3. Implement metered pricing
4. Set up production database

### Advanced
1. Deploy to production
2. Implement real blockchain verification
3. Add marketplace features
4. Build custom tools

## 🔗 External Dependencies

### Production
- Next.js 14
- Prisma 5
- PostgreSQL (Neon)
- Jose (JWT)
- Zod (validation)

### Development
- TypeScript 5
- Tailwind CSS 3
- pnpm 8
- tsx (TypeScript executor)

### Future
- ethers.js (blockchain)
- viem (alternative)
- Coinbase SDK (payments)
- Redis (caching)

---

**Navigate**: Start with `README.md` → `SETUP.md` → `QUICK_REFERENCE.md`

