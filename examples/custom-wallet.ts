/**
 * Custom Wallet Provider Example
 * 
 * Shows how to implement a custom wallet provider
 * for real blockchain transactions.
 */

import { XGateClient } from '@xgate/sdk';
import { WalletProvider, PaymentParams, PaymentResult } from '@xgate/shared';

/**
 * Example custom wallet using ethers.js (pseudo-code)
 */
class EthersWallet implements WalletProvider {
  private wallet: any; // ethers.Wallet instance

  constructor(privateKey: string) {
    // In real implementation:
    // this.wallet = new ethers.Wallet(privateKey, provider);
    console.log('Initializing wallet with private key');
  }

  async getAddress(): Promise<string> {
    // return this.wallet.address;
    return '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
  }

  async signMessage(message: string): Promise<string> {
    // return await this.wallet.signMessage(message);
    return '0x...signature';
  }

  async sendPayment(params: PaymentParams): Promise<PaymentResult> {
    console.log(`\n💳 Sending payment:
    To:     ${params.recipient}
    Amount: ${params.amount} ${params.asset}
    Chain:  ${params.chain}
    `);

    // In real implementation using ethers.js:
    // 
    // 1. Get USDC contract on Base
    // const usdcAddress = '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'; // USDC on Base
    // const usdc = new ethers.Contract(usdcAddress, USDC_ABI, this.wallet);
    // 
    // 2. Convert amount to proper decimals (USDC has 6 decimals)
    // const amount = ethers.parseUnits(params.amount, 6);
    // 
    // 3. Send transaction
    // const tx = await usdc.transfer(params.recipient, amount);
    // await tx.wait();
    // 
    // 4. Return payment result
    // return {
    //   txHash: tx.hash,
    //   payer: await this.getAddress(),
    //   amount: params.amount,
    //   asset: params.asset,
    //   chain: params.chain,
    //   timestamp: Date.now(),
    // };

    // Mock response for example
    return {
      txHash: '0x' + '1234567890abcdef'.repeat(4),
      payer: await this.getAddress(),
      amount: params.amount,
      asset: params.asset,
      chain: params.chain,
      timestamp: Date.now(),
    };
  }
}

async function main() {
  // Create client with custom wallet
  const wallet = new EthersWallet(process.env.PRIVATE_KEY || '');
  
  const client = new XGateClient({
    gatewayUrl: 'http://localhost:3000',
    wallet,
    autoPay: true,
  });

  console.log('🔐 Using custom wallet provider\n');

  try {
    const response = await client.get('/api/tools/test');
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

if (require.main === module) {
  main();
}

