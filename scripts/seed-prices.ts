/**
 * Seed script to populate initial price rules
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const priceRules = [
  {
    endpoint: '/api/tools/test',
    name: 'Test Endpoint',
    description: 'Simple test endpoint for development',
    priceUsd: 0.01,
    pricingType: 'fixed',
    enabled: true,
  },
  {
    endpoint: '/api/tools/ocr',
    name: 'OCR (Optical Character Recognition)',
    description: 'Extract text from images',
    priceUsd: 0.02,
    pricingType: 'fixed',
    enabled: false, // Not implemented yet
  },
  {
    endpoint: '/api/tools/vision',
    name: 'Vision Analysis',
    description: 'Analyze images with AI',
    priceUsd: 0.03,
    pricingType: 'fixed',
    enabled: false, // Not implemented yet
  },
  {
    endpoint: '/api/tools/scrape',
    name: 'Web Scraper',
    description: 'Scrape web pages',
    priceUsd: 0.01,
    pricingType: 'metered',
    meterUnit: 'kb',
    meterRate: 0.0001, // $0.0001 per KB
    enabled: false, // Not implemented yet
  },
  {
    endpoint: '/api/tools/llm',
    name: 'LLM Inference',
    description: 'AI text generation',
    priceUsd: 0.02,
    pricingType: 'metered',
    meterUnit: 'token',
    meterRate: 0.00001, // $0.00001 per token
    enabled: false, // Not implemented yet
  },
];

async function main() {
  console.log('🌱 Seeding price rules...\n');

  for (const rule of priceRules) {
    const result = await prisma.priceRule.upsert({
      where: { endpoint: rule.endpoint },
      update: rule,
      create: rule,
    });

    console.log(`✅ ${result.name} (${result.endpoint}): $${result.priceUsd}`);
  }

  console.log('\n✨ Seeding completed!');
}

main()
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

