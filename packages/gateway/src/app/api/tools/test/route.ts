/**
 * Test endpoint with payment protection
 * 
 * This is a simple endpoint that returns a message after payment.
 * Price: $0.01 USD
 */

import { NextRequest, NextResponse } from 'next/server';
import { withPaymentProtection } from '@/lib/middleware';

/**
 * GET /api/tools/test
 * Returns a test message after payment verification
 */
async function handleGet(req: NextRequest, paymentId?: string): Promise<NextResponse> {
  return NextResponse.json({
    success: true,
    message: 'Payment verified! This is a protected endpoint.',
    data: {
      timestamp: new Date().toISOString(),
      paymentId,
      endpoint: '/api/tools/test',
      note: 'You successfully made a micropayment via x402 protocol!',
    },
  });
}

/**
 * POST /api/tools/test
 * Echo back the request body after payment verification
 */
async function handlePost(req: NextRequest, paymentId?: string): Promise<NextResponse> {
  const body = await req.json().catch(() => ({}));

  return NextResponse.json({
    success: true,
    message: 'Payment verified! Request received.',
    data: {
      timestamp: new Date().toISOString(),
      paymentId,
      endpoint: '/api/tools/test',
      echo: body,
    },
  });
}

// Export GET handler with payment protection
export const GET = withPaymentProtection(handleGet, {
  endpoint: '/api/tools/test',
  method: 'GET',
  price: 0.01, // $0.01 USD
  useDatabase: false, // Use hardcoded price for MVP
});

// Export POST handler with payment protection
export const POST = withPaymentProtection(handlePost, {
  endpoint: '/api/tools/test',
  method: 'POST',
  price: 0.01,
  useDatabase: false,
});

