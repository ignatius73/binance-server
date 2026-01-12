#!/bin/bash

# Test script for Binance Signature Server
# Usage: ./test.sh [url]

URL="${1:-http://localhost:3333}"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🧪 Testing Binance Signature Server"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 URL: $URL"
echo ""

# Test 1: Health check
echo "📋 Test 1: Health Check"
echo "─────────────────────────────────────────"
HEALTH_RESPONSE=$(curl -s "$URL/health")
HEALTH_STATUS=$(echo $HEALTH_RESPONSE | grep -o '"status":"ok"')

if [ -n "$HEALTH_STATUS" ]; then
  echo "✅ Health check passed"
  echo "$HEALTH_RESPONSE" | jq '.' 2>/dev/null || echo "$HEALTH_RESPONSE"
else
  echo "❌ Health check failed"
  echo "$HEALTH_RESPONSE"
  exit 1
fi

echo ""

# Test 2: Signature generation
echo "📋 Test 2: Signature Generation"
echo "─────────────────────────────────────────"
TEST_SECRET="test_secret_key"
TEST_MESSAGE="timestamp=1768249627542&recvWindow=5000"

SIGN_RESPONSE=$(curl -s "$URL/sign?secret=$TEST_SECRET&message=$TEST_MESSAGE")
SIGNATURE=$(echo $SIGN_RESPONSE | grep -o '"signature":"[^"]*"' | cut -d'"' -f4)

if [ -n "$SIGNATURE" ] && [ ${#SIGNATURE} -eq 64 ]; then
  echo "✅ Signature generated successfully"
  echo "🔐 Signature: ${SIGNATURE:0:16}...${SIGNATURE:48:16}"
  echo "$SIGN_RESPONSE" | jq '.' 2>/dev/null || echo "$SIGN_RESPONSE"
else
  echo "❌ Signature generation failed"
  echo "$SIGN_RESPONSE"
  exit 1
fi

echo ""

# Test 3: Missing parameters
echo "📋 Test 3: Missing Parameters (Error Handling)"
echo "─────────────────────────────────────────"
ERROR_RESPONSE=$(curl -s "$URL/sign")
ERROR_CHECK=$(echo $ERROR_RESPONSE | grep -o '"error"')

if [ -n "$ERROR_CHECK" ]; then
  echo "✅ Error handling works correctly"
  echo "$ERROR_RESPONSE" | jq '.' 2>/dev/null || echo "$ERROR_RESPONSE"
else
  echo "❌ Error handling failed"
  echo "$ERROR_RESPONSE"
  exit 1
fi

echo ""

# Test 4: 404 handling
echo "📋 Test 4: 404 Handling"
echo "─────────────────────────────────────────"
NOT_FOUND=$(curl -s "$URL/nonexistent")
NOT_FOUND_CHECK=$(echo $NOT_FOUND | grep -o '"error"')

if [ -n "$NOT_FOUND_CHECK" ]; then
  echo "✅ 404 handling works correctly"
  echo "$NOT_FOUND" | jq '.' 2>/dev/null || echo "$NOT_FOUND"
else
  echo "❌ 404 handling failed"
  echo "$NOT_FOUND"
  exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ All tests passed!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
