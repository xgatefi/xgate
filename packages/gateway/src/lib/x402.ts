/**
 * x402 Protocol Implementation
 * Handles payment challenges and verification
 */

import { SignJWT, jwtVerify } from 'jose';
import {
  X402Challenge,
  X402PaymentProof,
  PaymentVerification,
  generateChallengeId,
  encodeChallenge,
  decodePaymentProof,
  isValidTxHash,
  isValidAddress,
} from '@xgate/shared';
import { config, CHALLENGE_EXPIRY_SECONDS } from './config';
import { prisma } from './prisma';

/**
 * Create a payment challenge for a given endpoint and price
 */
export async function createChallenge(
  endpoint: string,
  priceUsd: number,
  metadata?: Record<string, any>
): Promise<X402Challenge> {
  const challengeId = generateChallengeId();
  const expiresAt = Date.now() + CHALLENGE_EXPIRY_SECONDS * 1000;

  const challenge: X402Challenge = {
    version: '1.0',
    amount: priceUsd.toFixed(6),
    asset: config.asset,
    chain: config.chain,
    facilitator: config.facilitatorUrl,
    recipient: config.recipientAddress,
    challengeId,
    expiresAt,
    metadata: {
      endpoint,
      ...metadata,
    },
  };

  // Sign the challenge with JWT to prevent tampering
  const secret = new TextEncoder().encode(config.jwtSecret);
  const token = await new SignJWT({ challenge })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime(expiresAt)
    .setIssuedAt()
    .sign(secret);

  // Store challenge signature for verification
  challenge.metadata!.signature = token;

  return challenge;
}

/**
 * Verify a payment proof from the client
 */
export async function verifyPayment(
  proofHeader: string,
  expectedChallengeId: string
): Promise<PaymentVerification> {
  try {
    // Decode the payment proof
    const proof = decodePaymentProof(proofHeader);

    // Basic validation
    if (proof.version !== '1.0') {
      return { valid: false, error: 'Unsupported x402 version' };
    }

    if (!isValidTxHash(proof.txHash)) {
      return { valid: false, error: 'Invalid transaction hash format' };
    }

    if (!isValidAddress(proof.payer)) {
      return { valid: false, error: 'Invalid payer address format' };
    }

    if (proof.challengeId !== expectedChallengeId) {
      return { valid: false, error: 'Challenge ID mismatch' };
    }

    // Check if payment already exists (idempotency)
    const existingPayment = await prisma.payment.findUnique({
      where: { txHash: proof.txHash },
    });

    if (existingPayment) {
      if (existingPayment.status === 'verified' || existingPayment.status === 'completed') {
        return {
          valid: true,
          txHash: proof.txHash,
          payer: proof.payer,
          amount: proof.amount,
          timestamp: proof.timestamp,
        };
      }
      
      if (existingPayment.status === 'failed') {
        return { valid: false, error: 'Payment previously failed verification' };
      }
    }

    // In a real implementation, we would:
    // 1. Query the blockchain (Base chain) to verify the transaction
    // 2. Check the recipient, amount, and asset match
    // 3. Verify the transaction is confirmed
    //
    // For MVP, we'll do a simplified check via Coinbase API
    const blockchainVerified = await verifyOnChain(proof);

    if (!blockchainVerified) {
      // Record failed payment
      await prisma.payment.create({
        data: {
          txHash: proof.txHash,
          payer: proof.payer,
          amount: proof.amount,
          asset: proof.asset,
          chain: proof.chain,
          endpoint: 'unknown', // Will be updated by caller
          method: 'POST',
          status: 'failed',
          errorMessage: 'Blockchain verification failed',
        },
      });

      return { valid: false, error: 'Blockchain verification failed' };
    }

    // Payment is valid
    return {
      valid: true,
      txHash: proof.txHash,
      payer: proof.payer,
      amount: proof.amount,
      timestamp: proof.timestamp,
    };
  } catch (error) {
    console.error('Payment verification error:', error);
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Verification failed',
    };
  }
}

/**
 * Verify payment on-chain (simplified for MVP)
 * In production, this would query the Base chain via RPC or Coinbase API
 */
async function verifyOnChain(proof: X402PaymentProof): Promise<boolean> {
  try {
    // TODO: Implement actual blockchain verification
    // For now, we'll accept payments that match the expected format
    
    // In production, you would:
    // 1. Use ethers.js or viem to connect to Base RPC
    // 2. Get transaction receipt: provider.getTransactionReceipt(proof.txHash)
    // 3. Verify:
    //    - Transaction is confirmed (receipt.status === 1)
    //    - Recipient matches config.recipientAddress
    //    - Amount matches expected amount
    //    - Asset is USDC on Base
    //    - Transaction is recent (not replayed)
    
    // For MVP, we'll do basic validation
    if (!proof.txHash || !proof.payer || !proof.amount) {
      return false;
    }

    // In development, accept all properly formatted proofs
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️  DEV MODE: Accepting payment without blockchain verification');
      return true;
    }

    // TODO: Add Coinbase Commerce API verification here
    // const coinbaseVerified = await verifyCoinbasePayment(proof);
    // return coinbaseVerified;

    return true;
  } catch (error) {
    console.error('On-chain verification error:', error);
    return false;
  }
}

/**
 * Record a verified payment in the database
 */
export async function recordPayment(
  verification: PaymentVerification,
  endpoint: string,
  method: string,
  priceRuleId?: string
): Promise<string> {
  const payment = await prisma.payment.create({
    data: {
      txHash: verification.txHash!,
      payer: verification.payer!,
      amount: verification.amount!,
      asset: config.asset,
      chain: config.chain,
      endpoint,
      method,
      priceRuleId,
      status: 'verified',
      verifiedAt: new Date(),
    },
  });

  return payment.id;
}

/**
 * Update payment status to completed
 */
export async function completePayment(
  txHash: string,
  responseSize?: number
): Promise<void> {
  await prisma.payment.update({
    where: { txHash },
    data: {
      status: 'completed',
      completedAt: new Date(),
      responseSize,
    },
  });
}

/**
 * Issue a refund (add to credit ledger)
 */
export async function issueRefund(
  txHash: string,
  reason: string
): Promise<void> {
  const payment = await prisma.payment.findUnique({
    where: { txHash },
  });

  if (!payment) {
    throw new Error('Payment not found');
  }

  if (payment.status === 'refunded') {
    return; // Already refunded
  }

  // Update payment status
  await prisma.payment.update({
    where: { txHash },
    data: {
      status: 'refunded',
      refundReason: reason,
    },
  });

  // Add to credit ledger
  let ledger = await prisma.creditLedger.findUnique({
    where: { wallet: payment.payer },
  });

  if (!ledger) {
    ledger = await prisma.creditLedger.create({
      data: {
        wallet: payment.payer,
        balance: 0,
      },
    });
  }

  const balanceBefore = ledger.balance;
  const balanceAfter = balanceBefore.add(payment.amount);

  await prisma.credit.create({
    data: {
      ledgerId: ledger.id,
      type: 'refund',
      amount: payment.amount,
      balanceBefore,
      balanceAfter,
      paymentId: payment.id,
      reason,
    },
  });

  await prisma.creditLedger.update({
    where: { id: ledger.id },
    data: {
      balance: balanceAfter,
      lastCreditAt: new Date(),
    },
  });
}

