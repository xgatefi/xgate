# xGate API Documentation

Complete API reference for the xGate Protocol gateway.

## Base URL

```
http://localhost:3000  # Development
https://your-gateway.com  # Production
```

## Authentication

xGate uses HTTP 402 (Payment Required) instead of API keys. No authentication required - just pay per request.

## Headers

### Request Headers

- `Content-Type: application/json` - Required for POST/PUT requests
- `X-402-Proof: <base64>` - Payment proof for retry after 402

### Response Headers

- `X-402-Challenge: <base64>` - Payment challenge (on 402 response)
- `X-402-Price: <amount>` - Price in USD
- `X-402-Receipt: <id>` - Payment receipt ID (after successful payment)

## Endpoints

### System Endpoints

#### Health Check

```http
GET /api/health
```

**Description**: Check gateway health and database connectivity.

**Price**: Free

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "version": "0.1.0",
  "services": {
    "database": "connected",
    "gateway": "operational"
  }
}
```

#### List Prices

```http
GET /api/prices
```

**Description**: List all endpoints and their prices.

**Price**: Free

**Response**:
```json
{
  "success": true,
  "prices": [
    {
      "endpoint": "/api/tools/test",
      "name": "Test Endpoint",
      "description": "Simple test endpoint",
      "price": {
        "usd": 0.01,
        "type": "fixed",
        "meterUnit": null,
        "meterRate": null
      }
    }
  ]
}
```

### Tool Endpoints (Payment Required)

#### Test Endpoint (GET)

```http
GET /api/tools/test
```

**Description**: Test endpoint that returns a success message.

**Price**: $0.01 USD

**Payment Flow**:

1. **Initial Request** (no payment):
```http
GET /api/tools/test HTTP/1.1
Host: localhost:3000
```

2. **Response** (402 Payment Required):
```http
HTTP/1.1 402 Payment Required
X-402-Challenge: eyJ2ZXJzaW9uIjoiMS4wIi...
X-402-Price: 0.010000

{
  "error": "payment_required",
  "message": "Payment of $0.010000 required to access this endpoint",
  "payment": {
    "version": "1.0",
    "amount": "0.010000",
    "asset": "USDC",
    "chain": "base",
    "facilitator": "https://x402.coinbase.com",
    "recipient": "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    "challengeId": "ch_1234567890_abcdef",
    "expiresAt": 1705318200000,
    "metadata": {
      "endpoint": "/api/tools/test",
      "method": "GET"
    }
  }
}
```

3. **Retry with Payment**:
```http
GET /api/tools/test HTTP/1.1
Host: localhost:3000
X-402-Proof: eyJ2ZXJzaW9uIjoiMS4wIi...
```

4. **Success Response**:
```http
HTTP/1.1 200 OK
X-402-Receipt: cuid123456789

{
  "success": true,
  "message": "Payment verified! This is a protected endpoint.",
  "data": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "paymentId": "cuid123456789",
    "endpoint": "/api/tools/test",
    "note": "You successfully made a micropayment via x402 protocol!"
  }
}
```

#### Test Endpoint (POST)

```http
POST /api/tools/test
Content-Type: application/json

{
  "message": "Hello xGate!",
  "data": { ... }
}
```

**Description**: Test endpoint that echoes back your request body.

**Price**: $0.01 USD

**Success Response**:
```json
{
  "success": true,
  "message": "Payment verified! Request received.",
  "data": {
    "timestamp": "2024-01-15T10:30:00.000Z",
    "paymentId": "cuid123456789",
    "endpoint": "/api/tools/test",
    "echo": {
      "message": "Hello xGate!",
      "data": { ... }
    }
  }
}
```

## Payment Protocol (x402)

### Challenge Structure

When you request a payment-protected endpoint without proof, you receive an x402 challenge:

```typescript
interface X402Challenge {
  version: string;           // Protocol version (e.g., "1.0")
  amount: string;            // Amount in USD (e.g., "0.010000")
  asset: string;             // Asset symbol (e.g., "USDC")
  chain: string;             // Blockchain (e.g., "base")
  facilitator: string;       // Payment facilitator URL
  recipient: string;         // Recipient wallet address
  challengeId: string;       // Unique challenge ID
  expiresAt: number;         // Unix timestamp (milliseconds)
  metadata?: object;         // Additional metadata
}
```

### Payment Proof Structure

After making payment, send proof in retry request:

```typescript
interface X402PaymentProof {
  version: string;           // Protocol version (e.g., "1.0")
  txHash: string;            // Blockchain transaction hash
  payer: string;             // Payer wallet address
  amount: string;            // Amount paid
  asset: string;             // Asset symbol
  chain: string;             // Blockchain
  challengeId: string;       // Original challenge ID
  timestamp: number;         // Payment timestamp
  signature?: string;        // Optional signature
}
```

### Encoding

Both challenge and proof are base64-encoded JSON when sent in headers:

```javascript
// Encode challenge
const encodedChallenge = btoa(JSON.stringify(challenge));

// Decode proof
const proof = JSON.parse(atob(encodedProof));
```

## Error Responses

### 400 Bad Request

```json
{
  "error": "payment_verification_failed",
  "message": "Invalid payment proof"
}
```

### 402 Payment Required

```json
{
  "error": "payment_required",
  "message": "Payment of $0.010000 required to access this endpoint",
  "payment": { ... }
}
```

### 404 Not Found

```json
{
  "error": "not_found",
  "message": "Endpoint not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "internal_error",
  "message": "Payment processing failed"
}
```

## Rate Limiting

Currently no rate limiting. Future versions will implement:
- Per-wallet rate limits
- Per-endpoint rate limits
- Credit-based rate limiting

## Pricing Models

### Fixed Price

Simple per-request pricing:
- `/api/tools/test`: $0.01 per request

### Metered Price

Charge based on usage:
- `/api/tools/scrape`: $0.01 per 100KB of response
- `/api/tools/llm`: $0.00001 per token

### Tiered Price

Different prices for different service levels:
- `/api/tools/llm/free`: Free (slower queue)
- `/api/tools/llm/priority`: $0.02 (fast queue)

## Payment Verification

1. **Client** makes payment on Base chain (USDC)
2. **Client** sends transaction hash in `X-402-Proof` header
3. **Gateway** verifies transaction on-chain:
   - Transaction is confirmed
   - Recipient matches expected address
   - Amount matches required price
   - Asset is USDC
   - Transaction is recent (not replayed)
4. **Gateway** records payment in database
5. **Gateway** executes request and returns result

## Refunds

Automatic refunds issued for:
- Server errors (5xx) within 60 seconds
- Failed tool execution
- Gateway downtime during request

Refunds are credited to your wallet's credit ledger and can be used for future requests.

## Database Schema

Key models tracked:

### Payment

- Transaction hash
- Payer address
- Amount, asset, chain
- Endpoint and method
- Status (pending, verified, completed, refunded, failed)
- Timestamps

### PriceRule

- Endpoint path
- Price in USD
- Pricing type (fixed, metered, tiered)
- Enabled status

### UsageLog

- Endpoint
- Payment details
- Response time
- Status code

### CreditLedger

- Wallet address
- Balance
- Transaction history

## SDK Usage

Instead of manual HTTP requests, use the SDK:

```typescript
import { XGateClient, MockWallet } from '@xgate/sdk';

const client = new XGateClient({
  gatewayUrl: 'http://localhost:3000',
  wallet: new MockWallet(),
  autoPay: true,
});

// SDK automatically handles 402 and payment
const response = await client.get('/api/tools/test');
```

See [SDK Documentation](./packages/sdk/README.md) for details.

## Examples

### cURL

```bash
# 1. Get challenge
curl -i http://localhost:3000/api/tools/test

# 2. Make payment (using Coinbase or wallet)
# ... execute USDC transfer on Base chain ...

# 3. Retry with proof
curl -i http://localhost:3000/api/tools/test \
  -H "X-402-Proof: eyJ2ZXJzaW9uIjoiMS4wIi..."
```

### JavaScript (Fetch)

```javascript
// Initial request
const res1 = await fetch('http://localhost:3000/api/tools/test');

if (res1.status === 402) {
  const { payment } = await res1.json();
  
  // Make payment...
  const txHash = await payWithWallet(payment);
  
  // Create proof
  const proof = {
    version: '1.0',
    txHash,
    payer: '0x...',
    amount: payment.amount,
    asset: payment.asset,
    chain: payment.chain,
    challengeId: payment.challengeId,
    timestamp: Date.now(),
  };
  
  // Retry with proof
  const res2 = await fetch('http://localhost:3000/api/tools/test', {
    headers: {
      'X-402-Proof': btoa(JSON.stringify(proof)),
    },
  });
  
  const data = await res2.json();
  console.log(data);
}
```

### Python

```python
import requests
import json
import base64

# Initial request
url = 'http://localhost:3000/api/tools/test'
response = requests.get(url)

if response.status_code == 402:
    payment = response.json()['payment']
    
    # Make payment...
    tx_hash = pay_with_wallet(payment)
    
    # Create proof
    proof = {
        'version': '1.0',
        'txHash': tx_hash,
        'payer': '0x...',
        'amount': payment['amount'],
        'asset': payment['asset'],
        'chain': payment['chain'],
        'challengeId': payment['challengeId'],
        'timestamp': int(time.time() * 1000),
    }
    
    # Retry with proof
    headers = {
        'X-402-Proof': base64.b64encode(
            json.dumps(proof).encode()
        ).decode()
    }
    response = requests.get(url, headers=headers)
    print(response.json())
```

## Coming Soon

- More tool endpoints (OCR, Vision, LLM, Scraping)
- WebSocket support with streaming payments
- Batch payment credits (prepaid balance)
- Developer dashboard (manage prices, view analytics)
- Agent marketplace (publish and monetize your tools)
- L402 support (Lightning Network alternative)
- Webhook notifications for payments

## Support

- GitHub: [github.com/xgatefi/xgate](https://github.com)
- Documentation: [xgate.dev/fi](https://xgate.fi)

