#!/bin/bash
set -e

echo "🚀 xGate Protocol - Quick Start"
echo "================================"
echo ""

# Check for pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ pnpm is not installed"
    echo "Install it with: npm install -g pnpm"
    exit 1
fi

echo "✅ pnpm found"
echo ""

# Check for .env file
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env created"
    echo "⚠️  Please edit .env with your database URL and recipient address"
    echo ""
else
    echo "✅ .env file exists"
    echo ""
fi

# Install dependencies
echo "📦 Installing dependencies..."
pnpm install
echo "✅ Dependencies installed"
echo ""

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
pnpm db:generate
echo "✅ Prisma client generated"
echo ""

# Check if DATABASE_URL is set
if grep -q "postgresql://user:password@localhost" .env; then
    echo "⚠️  WARNING: Default DATABASE_URL detected"
    echo "Please update DATABASE_URL in .env with your actual database connection"
    echo ""
    echo "For Neon PostgreSQL:"
    echo "1. Sign up at https://neon.tech"
    echo "2. Create a project"
    echo "3. Copy connection string to .env"
    echo ""
    read -p "Press Enter to continue or Ctrl+C to exit..."
    echo ""
fi

# Push database schema
echo "🗄️  Pushing database schema..."
if pnpm db:push 2>&1; then
    echo "✅ Database schema created"
    echo ""
    
    # Seed price rules
    echo "🌱 Seeding price rules..."
    cd scripts && npx tsx seed-prices.ts && cd ..
    echo "✅ Price rules seeded"
    echo ""
else
    echo "❌ Database push failed"
    echo "Please check your DATABASE_URL in .env"
    echo ""
    exit 1
fi

# Build shared package
echo "🔨 Building shared package..."
cd packages/shared && pnpm build && cd ../..
echo "✅ Shared package built"
echo ""

echo "✨ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Review .env and update RECIPIENT_ADDRESS"
echo "2. Start development server: pnpm dev"
echo "3. Visit http://localhost:3000"
echo "4. Test with SDK: npx tsx examples/basic-usage.ts"
echo ""
echo "Documentation:"
echo "- Setup Guide: SETUP.md"
echo "- API Docs: API.md"
echo "- README: README.md"
echo ""
echo "Happy building! 🎉"

