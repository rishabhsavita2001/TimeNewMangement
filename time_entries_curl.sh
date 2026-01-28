#!/bin/bash
# Time Entries API - Complete CURL Examples

echo "🚀 Time Entries API - All CURL Commands"
echo "========================================"

# Step 1: Get Authentication Token
echo ""
echo "1️⃣ GET TOKEN (Required First):"
echo "curl --location 'https://api-layer.vercel.app/api/get-token'"
echo ""

# Step 2: GET Time Entries
echo "2️⃣ GET All Time Entries:"
echo "curl --location 'https://api-layer.vercel.app/api/me/time-entries' \\"
echo "--header 'Authorization: Bearer YOUR_TOKEN'"
echo ""

# Step 3: GET with filters
echo "3️⃣ GET Time Entries with Date Filter:"
echo "curl --location 'https://api-layer.vercel.app/api/me/time-entries?date=2024-01-28' \\"
echo "--header 'Authorization: Bearer YOUR_TOKEN'"
echo ""

# Step 4: CREATE Time Entry
echo "4️⃣ CREATE New Time Entry (POST):"
echo "curl --location 'https://api-layer.vercel.app/api/me/time-entries' \\"
echo "--header 'Content-Type: application/json' \\"
echo "--header 'Authorization: Bearer YOUR_TOKEN' \\"
echo "--data '{"
echo '  "startTime": "2024-01-28T09:00:00.000Z",'
echo '  "endTime": "2024-01-28T17:00:00.000Z",'
echo '  "description": "Daily work task"'
echo "}'"
echo ""

# Step 5: UPDATE Time Entry (FIXED)
echo "5️⃣ UPDATE Time Entry (PUT) - FIXED:"
echo "curl --location --request PUT 'https://api-layer.vercel.app/api/me/time-entries/123' \\"
echo "--header 'Content-Type: application/json' \\"
echo "--header 'Authorization: Bearer YOUR_TOKEN' \\"
echo "--data '{"
echo '  "startTime": "2024-01-28T09:00:00.000Z",'
echo '  "endTime": "2024-01-28T17:30:00.000Z",'
echo '  "description": "Updated work entry"'
echo "}'"
echo ""

# Step 6: DELETE Time Entry
echo "6️⃣ DELETE Time Entry:"
echo "curl --location --request DELETE 'https://api-layer.vercel.app/api/me/time-entries/123' \\"
echo "--header 'Authorization: Bearer YOUR_TOKEN'"
echo ""

# Step 7: Manual Time Entry
echo "7️⃣ CREATE Manual Time Entry:"
echo "curl --location 'https://api-layer.vercel.app/api/me/time-entries/manual' \\"
echo "--header 'Content-Type: application/json' \\"
echo "--header 'Authorization: Bearer YOUR_TOKEN' \\"
echo "--data '{"
echo '  "date": "2024-01-28",'
echo '  "hours": 8.5,'
echo '  "description": "Manual time entry"'
echo "}'"
echo ""

echo "⚠️  IMPORTANT NOTES:"
echo "==================="
echo "• Replace YOUR_TOKEN with actual token from /api/get-token"
echo "• Replace '123' with actual time entry ID (not 'string')"
echo "• Use ISO date format: 2024-01-28T09:00:00.000Z"
echo "• All date/time fields should be in UTC timezone"
echo ""

echo "🎯 COMPLETE WORKING EXAMPLE:"
echo "============================"
echo "# Step 1: Get token"
echo 'TOKEN=$(curl -s "https://api-layer.vercel.app/api/get-token" | grep -o \'"token":"[^"]*\' | cut -d\'"'\'' -f4)'
echo ""
echo "# Step 2: Use the token to get time entries"
echo 'curl --location "https://api-layer.vercel.app/api/me/time-entries" \'
echo '--header "Authorization: Bearer $TOKEN"'
echo ""

echo "✅ Time Entries API Commands Ready!"