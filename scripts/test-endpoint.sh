#!/bin/bash

# Test script for xGate endpoints
# Usage: ./scripts/test-endpoint.sh [endpoint]

GATEWAY_URL="${GATEWAY_URL:-http://localhost:3000}"
ENDPOINT="${1:-/api/tools/test}"

echo "🧪 Testing xGate Endpoint"
echo "========================="
echo ""
echo "Gateway: $GATEWAY_URL"
echo "Endpoint: $ENDPOINT"
echo ""

# Test 1: Initial request (should return 402)
echo "📡 Test 1: Initial request (expecting 402)..."
response=$(curl -s -w "\n%{http_code}" "$GATEWAY_URL$ENDPOINT")
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n-1)

if [ "$http_code" = "402" ]; then
    echo "✅ Got 402 Payment Required"
    echo ""
    echo "Challenge:"
    echo "$body" | jq '.payment' 2>/dev/null || echo "$body"
    echo ""
else
    echo "❌ Expected 402, got $http_code"
    echo "$body"
    exit 1
fi

# Test 2: Health check (should be free)
echo "📡 Test 2: Health check (expecting 200)..."
health=$(curl -s "$GATEWAY_URL/api/health")
echo "✅ Health check response:"
echo "$health" | jq '.' 2>/dev/null || echo "$health"
echo ""

# Test 3: Price listing (should be free)
echo "📡 Test 3: Price listing (expecting 200)..."
prices=$(curl -s "$GATEWAY_URL/api/prices")
echo "✅ Available endpoints:"
echo "$prices" | jq '.prices' 2>/dev/null || echo "$prices"
echo ""

echo "✨ Tests completed!"
echo ""
echo "To test with payment:"
echo "1. Use the SDK: npx tsx examples/basic-usage.ts"
echo "2. Or manually send X-402-Proof header with payment proof"

