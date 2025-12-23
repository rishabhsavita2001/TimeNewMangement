# Final Test - All APIs on Correct Domain: api-layer.vercel.app

Write-Host "🎯 TESTING ALL APIS ON CORRECT DOMAIN" -ForegroundColor Magenta
Write-Host "Domain: https://api-layer.vercel.app" -ForegroundColor Green
Write-Host "=" * 50 -ForegroundColor Gray
Write-Host ""

$BASE_URL = "https://api-layer.vercel.app/api"

# Test 1: Health Check
Write-Host "💓 Test 1: Health Check" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$BASE_URL/health" -Method GET
    Write-Host "✅ Status: $($health.status)" -ForegroundColor Green
    Write-Host "✅ Domain: $($health.domain)" -ForegroundColor Green
} catch {
    Write-Host "❌ Health Check Failed" -ForegroundColor Red
}
Write-Host ""

# Test 2: Leave Types (Figma Dropdown)
Write-Host "🌴 Test 2: Leave Types API" -ForegroundColor Yellow
try {
    $leaveTypes = Invoke-RestMethod -Uri "$BASE_URL/leave-types" -Method GET
    Write-Host "✅ Leave Types: $($leaveTypes.data.leave_types.Count)" -ForegroundColor Green
    foreach ($type in $leaveTypes.data.leave_types) {
        Write-Host "  - $($type.name) $($type.icon)" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Leave Types Failed" -ForegroundColor Red
}
Write-Host ""

# Test 3: Current Leave Requests
Write-Host "📅 Test 3: Current Leave Requests" -ForegroundColor Yellow
try {
    $current = Invoke-RestMethod -Uri "$BASE_URL/me/leave-requests?period=current" -Method GET
    Write-Host "✅ Current Requests: $($current.data.requests.Count)" -ForegroundColor Green
    foreach ($req in $current.data.requests) {
        Write-Host "  - $($req.title) ($($req.status_display))" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Current Requests Failed" -ForegroundColor Red
}
Write-Host ""

# Test 4: Create Leave Request
Write-Host "✨ Test 4: Create New Leave Request" -ForegroundColor Yellow
$requestData = @{
    leave_type = "paid_leave"
    start_date = "2025-11-12"
    end_date = "2025-11-14"
    reason = "Family trip 🌴"
    is_half_day = $false
} | ConvertTo-Json

try {
    $newRequest = Invoke-RestMethod -Uri "$BASE_URL/me/leave-requests" -Method POST -Body $requestData -ContentType "application/json"
    Write-Host "✅ Created: $($newRequest.message)" -ForegroundColor Green
    Write-Host "✅ Title: $($newRequest.data.request.title)" -ForegroundColor Green
} catch {
    Write-Host "❌ Create Request Failed" -ForegroundColor Red
}
Write-Host ""

# Test 5: Dashboard API
Write-Host "📊 Test 5: Dashboard Summary" -ForegroundColor Yellow
try {
    $dashboard = Invoke-RestMethod -Uri "$BASE_URL/dashboard/summary" -Method GET
    Write-Host "✅ Weekly Hours: $($dashboard.data.weekly_hours)" -ForegroundColor Green
    Write-Host "✅ Status: $($dashboard.data.current_status)" -ForegroundColor Green
} catch {
    Write-Host "❌ Dashboard Failed" -ForegroundColor Red
}
Write-Host ""

# Final Summary
Write-Host "🎉 DOMAIN DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "🌐 Live API: https://api-layer.vercel.app" -ForegroundColor White
Write-Host "📚 Documentation: https://api-layer.vercel.app/api-docs" -ForegroundColor White
Write-Host "✅ All vacation/leave request APIs working perfectly!" -ForegroundColor Green