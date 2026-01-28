#!/bin/bash

# Working PUT API Test Script
echo "🚀 Testing Fixed PUT API..."

# Get token first
echo "1. Getting authentication token..."
TOKEN_RESPONSE=$(curl -s "https://api-layer.vercel.app/api/get-token")

if [[ $TOKEN_RESPONSE == *"token"* ]]; then
    TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    echo "✅ Token obtained: ${TOKEN:0:20}..."
else
    echo "❌ Cannot get token. Using demo token."
    TOKEN="demo-token-12345"
fi

# Test PUT API with CORRECT numeric ID
echo ""
echo "2. Testing PUT /api/me/time-entries/123 (FIXED - numeric ID)..."
curl --location --request PUT 'https://api-layer.vercel.app/api/me/time-entries/123' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $TOKEN" \
--data '{
  "startTime": "2004-01-01T12:11:40.143Z",
  "endTime": "2024-03-11T20:37:51.814Z",
  "description": "string"
}'

echo ""
echo ""
echo "3. Testing PUT /api/me/time-entries/string (should fail)..."
curl --location --request PUT 'https://api-layer.vercel.app/api/me/time-entries/string' \
--header 'Content-Type: application/json' \
--header "Authorization: Bearer $TOKEN" \
--data '{
  "startTime": "2004-01-01T12:11:40.143Z",
  "endTime": "2024-03-11T20:37:51.814Z",
  "description": "string"
}'

echo ""
echo ""
echo "🎯 PUT API Test Complete!"
echo ""
echo "📝 The Fix:"
echo "✅ Change /api/me/time-entries/string"  
echo "✅ To:     /api/me/time-entries/123"
echo ""
echo "The word 'string' is not a valid ID - use actual numbers!"