/**
 * Basic xGate SDK Usage Example
 */

import { XGateClient, MockWallet } from '@xgate/sdk';

async function main() {
  // Initialize client with mock wallet (for testing)
  const client = new XGateClient({
    gatewayUrl: 'http://localhost:3000',
    wallet: new MockWallet(),
    autoPay: true,
    maxPrice: 1.0, // Max $1.00 per request
  });

  console.log('🚀 xGate SDK Example\n');

  try {
    // Example 1: Simple GET request
    console.log('📡 Making GET request to /api/tools/test...');
    const response1 = await client.get('/api/tools/test');
    console.log('✅ Response:', response1.data);
    console.log('💳 Payment ID:', response1.payment?.id);
    console.log();

    // Example 2: POST request with body
    console.log('📡 Making POST request to /api/tools/test...');
    const response2 = await client.post('/api/tools/test', {
      message: 'Hello from xGate SDK!',
      timestamp: new Date().toISOString(),
    });
    console.log('✅ Response:', response2.data);
    console.log();

    // Example 3: Check wallet address
    const address = await client.getWalletAddress();
    console.log('👛 Wallet address:', address);
    console.log();

    // Example 4: Configure price limits
    console.log('⚙️  Setting max price to $0.02...');
    client.setMaxPrice(0.02);
    
    try {
      // This should work since test endpoint is $0.01
      await client.get('/api/tools/test');
      console.log('✅ Price within limit');
    } catch (error) {
      console.error('❌ Price exceeded:', error.message);
    }

    console.log('\n✨ All examples completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();

