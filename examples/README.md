# xGate Examples

Example usage of the xGate SDK.

## Running Examples

First, make sure the gateway is running:

```bash
# In the root directory
pnpm dev
```

Then run the examples:

```bash
# Basic usage
npx tsx examples/basic-usage.ts

# Custom wallet (pseudo-code)
npx tsx examples/custom-wallet.ts
```

## Examples

### `basic-usage.ts`

Demonstrates:
- GET and POST requests
- Automatic payment handling
- Price limits
- Wallet address retrieval

### `custom-wallet.ts`

Shows how to:
- Implement custom wallet provider
- Integrate with ethers.js
- Send real USDC on Base chain

## Notes

- Examples use `MockWallet` by default for testing
- Set up a real wallet provider for production
- Make sure your `.env` is configured with:
  - `DATABASE_URL` for Neon PostgreSQL
  - `RECIPIENT_ADDRESS` for payments
  - `JWT_SECRET` for signing challenges

