#!/bin/bash
# Vacation Balance API Test Script

echo "🚀 Testing Vacation Balance API..."
echo "================================="

# Method 1: Test current live API
echo "1. Testing current live API:"
echo "curl 'https://api-layer.vercel.app/api/me/vacation/balance' -H 'Authorization: Bearer test-token'"

response=$(curl -s -w "%{http_code}" "https://api-layer.vercel.app/api/me/vacation/balance" \
  -H "Authorization: Bearer test-token-12345")

http_code="${response: -3}"
body="${response%???}"

if [ "$http_code" = "200" ]; then
    echo "✅ SUCCESS! Vacation Balance API is working:"
    echo "$body" | jq . 2>/dev/null || echo "$body"
else
    echo "❌ FAILED with HTTP $http_code"
    echo "$body"
fi

echo ""
echo "🔧 SOLUTION: Use Swagger UI for now"
echo "=================================="
echo "1. Open: https://api-layer.vercel.app/api-docs"
echo "2. Find 'Vacation Balance' section"
echo "3. Click 'Try it out'"
echo "4. Execute to test"

echo ""
echo "📝 Working CURL Commands (after deployment):"
echo "=============================================="
echo "# Get vacation balance (detailed):"
echo "curl --location 'https://api-layer.vercel.app/api/me/vacation/balance' \\"
echo "--header 'Authorization: Bearer YOUR_TOKEN'"
echo ""
echo "# Get vacation balance (simple):"
echo "curl --location 'https://api-layer.vercel.app/api/me/vacation-balance' \\"
echo "--header 'Authorization: Bearer YOUR_TOKEN'"

echo ""
echo "🎯 Expected Response:"
echo "===================="
echo '{'
echo '  "success": true,'
echo '  "data": {'
echo '    "balance": {'
echo '      "available_days": 15.5,'
echo '      "used_days": 9.5,'
echo '      "total_allocated": 25,'
echo '      "pending_requests": 2,'
echo '      "expires_on": "2025-12-31"'
echo '    },'
echo '    "by_type": {'
echo '      "paid_leave": { "available": 20, "used": 5 },'
echo '      "sick_leave": { "available": 10, "used": 2 },'
echo '      "personal_leave": { "available": 5, "used": 2.5 }'
echo '    },'
echo '    "year": 2025'
echo '  }'
echo '}'