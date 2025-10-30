/**
 * HTTP 402 Middleware for xGate Gateway
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  X402_HEADERS,
  PaymentRequiredResponse,
  encodeChallenge,
  decodePaymentProof,
} from '@xgate/shared';
import { createChallenge, verifyPayment, recordPayment } from './x402';
import { prisma } from './prisma';

/**
 * Payment-protected route handler wrapper
 */
export interface ProtectedRouteOptions {
  /** Endpoint path */
  endpoint: string;
  /** HTTP method */
  method: string;
  /** Price in USD (if fixed), or function to calculate price */
  price?: number | ((req: NextRequest) => Promise<number>);
  /** Whether to look up price from database */
  useDatabase?: boolean;
}

/**
 * Wrap a route handler with HTTP 402 payment protection
 */
export function withPaymentProtection(
  handler: (req: NextRequest, paymentId?: string) => Promise<NextResponse>,
  options: ProtectedRouteOptions
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const { endpoint, method, price, useDatabase = true } = options;

    try {
      // Check for payment proof header
      const proofHeader = req.headers.get(X402_HEADERS.PROOF);

      if (!proofHeader) {
        // No payment proof - return 402 with challenge
        return await handlePaymentRequired(endpoint, method, price, useDatabase);
      }

      // Verify payment proof
      const proof = decodePaymentProof(proofHeader);
      const verification = await verifyPayment(proofHeader, proof.challengeId);

      if (!verification.valid) {
        return NextResponse.json(
          {
            error: 'payment_verification_failed',
            message: verification.error || 'Invalid payment proof',
          },
          { status: 400 }
        );
      }

      // Get price rule if using database
      let priceRuleId: string | undefined;
      if (useDatabase) {
        const priceRule = await prisma.priceRule.findUnique({
          where: { endpoint },
        });
        priceRuleId = priceRule?.id;
      }

      // Record verified payment
      const paymentId = await recordPayment(
        verification,
        endpoint,
        method,
        priceRuleId
      );

      // Log usage
      await prisma.usageLog.create({
        data: {
          endpoint,
          method,
          paymentId,
          payer: verification.payer,
          amountUsd: verification.amount,
          duration: 0, // Will be updated after request
          statusCode: 200,
        },
      });

      // Execute the handler
      const startTime = Date.now();
      const response = await handler(req, paymentId);
      const duration = Date.now() - startTime;

      // Update usage log with actual duration and status
      await prisma.usageLog.updateMany({
        where: { paymentId },
        data: {
          duration,
          statusCode: response.status,
        },
      });

      // Add receipt header
      response.headers.set(X402_HEADERS.RECEIPT, paymentId);

      return response;
    } catch (error) {
      console.error('Payment protection error:', error);
      return NextResponse.json(
        {
          error: 'internal_error',
          message: 'Payment processing failed',
        },
        { status: 500 }
      );
    }
  };
}

/**
 * Handle 402 Payment Required response
 */
async function handlePaymentRequired(
  endpoint: string,
  method: string,
  price?: number | ((req: NextRequest) => Promise<number>),
  useDatabase: boolean = true
): Promise<NextResponse> {
  let priceUsd: number;

  // Determine price
  if (useDatabase) {
    const priceRule = await prisma.priceRule.findUnique({
      where: { endpoint },
    });

    if (!priceRule || !priceRule.enabled) {
      return NextResponse.json(
        {
          error: 'endpoint_not_configured',
          message: 'This endpoint is not configured for payments',
        },
        { status: 500 }
      );
    }

    priceUsd = parseFloat(priceRule.priceUsd.toString());
  } else if (typeof price === 'number') {
    priceUsd = price;
  } else {
    return NextResponse.json(
      {
        error: 'price_not_configured',
        message: 'Price not configured for this endpoint',
      },
      { status: 500 }
    );
  }

  // Create payment challenge
  const challenge = await createChallenge(endpoint, priceUsd, {
    method,
    timestamp: Date.now(),
  });

  // Encode challenge for header
  const encodedChallenge = encodeChallenge(challenge);

  // Create 402 response
  const response: PaymentRequiredResponse = {
    error: 'payment_required',
    message: `Payment of $${priceUsd.toFixed(6)} required to access this endpoint`,
    payment: challenge,
  };

  return NextResponse.json(response, {
    status: 402,
    headers: {
      [X402_HEADERS.CHALLENGE]: encodedChallenge,
      [X402_HEADERS.PRICE]: priceUsd.toFixed(6),
    },
  });
}

/**
 * Simple middleware to check if payment is required for a route
 */
export async function checkPaymentRequired(
  endpoint: string
): Promise<boolean> {
  const priceRule = await prisma.priceRule.findUnique({
    where: { endpoint },
  });

  return !!priceRule && priceRule.enabled;
}

/**
 * Get price for an endpoint
 */
export async function getEndpointPrice(endpoint: string): Promise<number | null> {
  const priceRule = await prisma.priceRule.findUnique({
    where: { endpoint },
  });

  if (!priceRule || !priceRule.enabled) {
    return null;
  }

  return parseFloat(priceRule.priceUsd.toString());
}

