/**
 * Price discovery endpoint
 * Lists all available endpoints and their prices
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const priceRules = await prisma.priceRule.findMany({
      where: { enabled: true },
      select: {
        endpoint: true,
        name: true,
        description: true,
        priceUsd: true,
        pricingType: true,
        meterUnit: true,
        meterRate: true,
      },
      orderBy: { endpoint: 'asc' },
    });

    return NextResponse.json({
      success: true,
      prices: priceRules.map((rule) => ({
        endpoint: rule.endpoint,
        name: rule.name,
        description: rule.description,
        price: {
          usd: parseFloat(rule.priceUsd.toString()),
          type: rule.pricingType,
          meterUnit: rule.meterUnit,
          meterRate: rule.meterRate ? parseFloat(rule.meterRate.toString()) : null,
        },
      })),
    });
  } catch (error) {
    console.error('Price listing error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch prices',
      },
      { status: 500 }
    );
  }
}

