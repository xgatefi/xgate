/**
 * Gateway Configuration
 */

import { GatewayConfig } from '@xgate/shared';

export const config: GatewayConfig = {
  facilitatorUrl: process.env.FACILITATOR_URL || 'https://x402.coinbase.com',
  recipientAddress: process.env.RECIPIENT_ADDRESS || '',
  asset: process.env.PAYMENT_ASSET || 'USDC',
  chain: process.env.PAYMENT_CHAIN || 'base',
  jwtSecret: process.env.JWT_SECRET || 'change-this-secret',
};

export const CHALLENGE_EXPIRY_SECONDS = parseInt(
  process.env.CHALLENGE_EXPIRY || '300',
  10
);

export function validateConfig(): void {
  if (!config.recipientAddress) {
    throw new Error('RECIPIENT_ADDRESS environment variable is required');
  }
  
  if (!config.jwtSecret || config.jwtSecret === 'change-this-secret') {
    console.warn('⚠️  WARNING: Using default JWT_SECRET. Set a secure secret in production!');
  }
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required');
  }
}

