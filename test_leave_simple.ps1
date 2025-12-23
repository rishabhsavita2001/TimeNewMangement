# Test Leave/Vacation Request APIs for Figma Screens

$BASE_URL = "https://apilayer-17sg2jttc-soludoo.vercel.app/api"
$headers = @{ "Content-Type" = "application/json" }

Write-Host "🚀 Testing Leave/Vacation Request APIs for Figma Screens" -ForegroundColor Green
Write-Host ""

try {
    # Test 1: Get Leave Types
    Write-Host "📋 Test 1: Get Leave Types API" -ForegroundColor Yellow
    $response1 = Invoke-RestMethod -Uri "$BASE_URL/leave-types" -Method GET -Headers $headers
    Write-Host "Status: Success" -ForegroundColor Green
    Write-Host "Leave Types Count: $($response1.data.leave_types.Count)" -ForegroundColor Cyan
    Write-Host "---"
    Write-Host ""

    # Test 2: Create New Leave Request  
    Write-Host "✨ Test 2: Create New Leave Request (Family Trip)" -ForegroundColor Yellow
    $newRequestData = @{
        leave_type = "paid_leave"
        start_date = "2025-11-12"
        end_date = "2025-11-14"
        reason = "Family trip 🌴"
        is_half_day = $false
    } | ConvertTo-Json

    $response2 = Invoke-RestMethod -Uri "$BASE_URL/me/leave-requests" -Method POST -Headers $headers -Body $newRequestData
    Write-Host "Status: Success" -ForegroundColor Green
    Write-Host "Message: $($response2.message)" -ForegroundColor Cyan
    Write-Host "---"
    Write-Host ""

    # Test 3: Get Current Leave Requests
    Write-Host "📅 Test 3: Get Current Leave Requests" -ForegroundColor Yellow
    $response4 = Invoke-RestMethod -Uri "$BASE_URL/me/leave-requests?period=current" -Method GET -Headers $headers
    Write-Host "Status: Success" -ForegroundColor Green
    Write-Host "Current Requests: $($response4.data.requests.Count)" -ForegroundColor Cyan
    Write-Host "---"
    Write-Host ""

    # Summary
    Write-Host "✅ Leave Request APIs Test Summary:" -ForegroundColor Green
    Write-Host "- ✅ GET /api/leave-types - Working" -ForegroundColor Green
    Write-Host "- ✅ POST /api/me/leave-requests - Working" -ForegroundColor Green  
    Write-Host "- ✅ GET /api/me/leave-requests?period=current - Working" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 All Vacation/Leave Request APIs are working perfectly!" -ForegroundColor Magenta

} catch {
    Write-Host "❌ Error testing Leave APIs: $($_.Exception.Message)" -ForegroundColor Red
}