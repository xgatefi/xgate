/**
 * Mock Wallet Provider for Testing
 * 
 * Simulates a wallet without actual blockchain transactions.
 * Use only for development and testing!
 */

import { WalletProvider, PaymentParams, PaymentResult } from '@xgate/shared';

export class MockWallet implements WalletProvider {
  private address: string;

  constructor(address?: string) {
    this.address = address || this.generateMockAddress();
  }

  async getAddress(): Promise<string> {
    return this.address;
  }

  async signMessage(message: string): Promise<string> {
    // Mock signature
    return `0x${Buffer.from(message).toString('hex').substring(0, 128)}`;
  }

  async sendPayment(params: PaymentParams): Promise<PaymentResult> {
    // Simulate network delay
    await this.sleep(500);

    // Generate mock transaction hash
    const txHash = this.generateMockTxHash();

    console.log(`
🔧 MOCK PAYMENT (Development Mode)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
From:     ${this.address}
To:       ${params.recipient}
Amount:   ${params.amount} ${params.asset}
Chain:    ${params.chain}
TxHash:   ${txHash}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  This is a simulated payment for testing.
    Use a real wallet in production!
`);

    return {
      txHash,
      payer: this.address,
      amount: params.amount,
      asset: params.asset,
      chain: params.chain,
      timestamp: Date.now(),
    };
  }

  private generateMockAddress(): string {
    const hex = '0123456789abcdef';
    let address = '0x';
    for (let i = 0; i < 40; i++) {
      address += hex[Math.floor(Math.random() * hex.length)];
    }
    return address;
  }

  private generateMockTxHash(): string {
    const hex = '0123456789abcdef';
    let hash = '0x';
    for (let i = 0; i < 64; i++) {
      hash += hex[Math.floor(Math.random() * hex.length)];
    }
    return hash;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

