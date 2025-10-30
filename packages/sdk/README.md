# @xgate/sdk

Client SDK for xGate Protocol with automatic HTTP 402 and x402 payment handling.

## Installation

```bash
npm install @xgate/sdk
# or
pnpm add @xgate/sdk
# or
yarn add @xgate/sdk
```

## Quick Start

```typescript
import { XGateClient, MockWallet } from '@xgate/sdk';

// Create client with mock wallet (for testing)
const client = new XGateClient({
  gatewayUrl: 'http://localhost:3000',
  wallet: new MockWallet(),
  autoPay: true,
  maxPrice: 1.0, // Maximum $1.00 per request
});

// Make a request - SDK handles 402 and payment automatically
const response = await client.get('/api/tools/test');
console.log(response.data);
```

## Features

- ✅ **Automatic 402 handling**: SDK detects payment requirements
- ✅ **Seamless payments**: Auto-pays via x402 protocol
- ✅ **Price protection**: Configure max price limit
- ✅ **TypeScript-first**: Full type safety
- ✅ **Mock wallet**: Test without blockchain
- ✅ **Flexible**: Bring your own wallet provider

## Usage

### Basic GET Request

```typescript
const response = await client.get('/api/tools/test');
console.log(response.data);
// {
//   success: true,
//   message: 'Payment verified!',
//   data: { ... }
// }
```

### POST Request with Body

```typescript
const response = await client.post('/api/tools/echo', {
  message: 'Hello xGate!',
});
```

### Manual Payment Control

```typescript
// Disable auto-pay
client.setAutoPay(false);

try {
  await client.get('/api/tools/test');
} catch (error) {
  // Will throw "Payment required but autoPay is disabled"
}

// Re-enable auto-pay
client.setAutoPay(true);
```

### Price Limits

```typescript
// Set maximum price willing to pay
client.setMaxPrice(0.05); // Max $0.05

// This will throw if price > $0.05
await client.get('/expensive/endpoint');
// Error: Price $0.10 exceeds maxPrice $0.05
```

## Wallet Providers

### Mock Wallet (Testing)

For development and testing:

```typescript
import { MockWallet } from '@xgate/sdk';

const wallet = new MockWallet();
const client = new XGateClient({
  gatewayUrl: 'http://localhost:3000',
  wallet,
});
```

### Custom Wallet Provider

Implement the `WalletProvider` interface:

```typescript
import { WalletProvider, PaymentParams, PaymentResult } from '@xgate/sdk';

class MyWallet implements WalletProvider {
  async getAddress(): Promise<string> {
    // Return wallet address
    return '0x...';
  }

  async signMessage(message: string): Promise<string> {
    // Sign message with private key
    return '0x...signature';
  }

  async sendPayment(params: PaymentParams): Promise<PaymentResult> {
    // Execute USDC transfer on Base chain
    const tx = await this.transferUSDC(
      params.recipient,
      params.amount
    );

    return {
      txHash: tx.hash,
      payer: await this.getAddress(),
      amount: params.amount,
      asset: params.asset,
      chain: params.chain,
      timestamp: Date.now(),
    };
  }
}

const client = new XGateClient({
  gatewayUrl: 'https://api.example.com',
  wallet: new MyWallet(),
});
```

### Coinbase Wallet Integration

```typescript
// Coming soon: @xgate/wallet-coinbase
import { CoinbaseWallet } from '@xgate/wallet-coinbase';

const wallet = new CoinbaseWallet({
  apiKey: process.env.COINBASE_API_KEY,
  apiSecret: process.env.COINBASE_API_SECRET,
});

const client = new XGateClient({
  gatewayUrl: 'https://api.example.com',
  wallet,
});
```

## API Reference

### `XGateClient`

#### Constructor

```typescript
new XGateClient(config: XGateClientConfig)
```

**Config options:**

- `gatewayUrl` (required): Gateway base URL
- `wallet` (optional): Wallet provider for payments
- `autoPay` (optional): Auto-pay for 402 responses (default: `true`)
- `maxPrice` (optional): Max price in USD (default: `1.0`)
- `timeout` (optional): Request timeout in ms (default: `30000`)

#### Methods

**`.get<T>(path, options?)`**
Make a GET request.

**`.post<T>(path, body?, options?)`**
Make a POST request.

**`.put<T>(path, body?, options?)`**
Make a PUT request.

**`.delete<T>(path, options?)`**
Make a DELETE request.

**`.request<T>(path, options)`**
Make a request with custom options.

**`.getWalletAddress()`**
Get current wallet address.

**`.isAutoPayEnabled()`**
Check if auto-pay is enabled.

**`.setAutoPay(enabled)`**
Enable/disable auto-pay.

**`.getMaxPrice()`**
Get max price limit.

**`.setMaxPrice(price)`**
Set max price limit.

### `RequestOptions`

```typescript
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
  autoPay?: boolean;
  maxPrice?: number;
}
```

### `XGateResponse<T>`

```typescript
interface XGateResponse<T> {
  data: T;
  status: number;
  headers: Record<string, string>;
  payment?: PaymentReceipt;
}
```

## Error Handling

```typescript
try {
  const response = await client.get('/api/tools/test');
  console.log(response.data);
} catch (error) {
  if (error.message.includes('exceeds maxPrice')) {
    console.error('Price too high!');
  } else if (error.message.includes('Payment required')) {
    console.error('Enable autoPay or configure wallet');
  } else {
    console.error('Request failed:', error.message);
  }
}
```

## Examples

Check out the `/examples` directory for complete examples:

- Basic usage
- Custom wallet integration
- Error handling
- Batch requests
- React integration

## License

MIT

