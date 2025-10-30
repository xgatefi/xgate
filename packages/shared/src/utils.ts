/**
 * xGate Protocol - Shared Utilities
 */

import { X402Challenge, X402PaymentProof } from './types';

/**
 * Encode x402 challenge to base64 JSON
 */
export function encodeChallenge(challenge: X402Challenge): string {
  return Buffer.from(JSON.stringify(challenge)).toString('base64');
}

/**
 * Decode x402 challenge from base64 JSON
 */
export function decodeChallenge(encoded: string): X402Challenge {
  const json = Buffer.from(encoded, 'base64').toString('utf-8');
  return JSON.parse(json);
}

/**
 * Encode x402 payment proof to base64 JSON
 */
export function encodePaymentProof(proof: X402PaymentProof): string {
  return Buffer.from(JSON.stringify(proof)).toString('base64');
}

/**
 * Decode x402 payment proof from base64 JSON
 */
export function decodePaymentProof(encoded: string): X402PaymentProof {
  const json = Buffer.from(encoded, 'base64').toString('utf-8');
  return JSON.parse(json);
}

/**
 * Generate unique challenge ID
 */
export function generateChallengeId(): string {
  return `ch_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

/**
 * Validate transaction hash format
 */
export function isValidTxHash(txHash: string): boolean {
  // Basic validation for Ethereum-style tx hash
  return /^0x[a-fA-F0-9]{64}$/.test(txHash);
}

/**
 * Validate wallet address format
 */
export function isValidAddress(address: string): boolean {
  // Basic validation for Ethereum-style address
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Format USD amount to fixed decimals
 */
export function formatUSD(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return num.toFixed(6);
}

/**
 * Calculate metered price based on size and rate
 */
export function calculateMeteredPrice(
  sizeBytes: number,
  ratePerUnit: number,
  unit: 'kb' | 'mb' | 'request'
): number {
  if (unit === 'request') {
    return ratePerUnit;
  }
  
  const divisor = unit === 'kb' ? 1024 : 1024 * 1024;
  const units = sizeBytes / divisor;
  return units * ratePerUnit;
}

/**
 * Check if challenge is expired
 */
export function isChallengeExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt;
}

/**
 * Create standard error object
 */
export function createError(message: string, statusCode: number = 500): Error & { statusCode: number } {
  const error = new Error(message) as Error & { statusCode: number };
  error.statusCode = statusCode;
  return error;
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await sleep(delay);
      }
    }
  }
  
  throw lastError!;
}

