# Test APIs on Correct Domain - api-layer.vercel.app

$BASE_URL = "https://api-layer.vercel.app/api"
$headers = @{ "Content-Type" = "application/json" }

Write-Host "🎯 Testing APIs on CORRECT DOMAIN: api-layer.vercel.app" -ForegroundColor Magenta
Write-Host ""

try {
    # Test 1: Health Check
    Write-Host "💓 Test 1: Health Check" -ForegroundColor Yellow
    $health = Invoke-RestMethod -Uri "$BASE_URL/health" -Method GET -Headers $headers
    Write-Host "Status: $($health.status)" -ForegroundColor Green
    Write-Host "---"
    Write-Host ""

    # Test 2: Get Leave Types (Vacation APIs)
    Write-Host "🌴 Test 2: Leave Types API" -ForegroundColor Yellow
    $leaveTypes = Invoke-RestMethod -Uri "$BASE_URL/leave-types" -Method GET -Headers $headers
    Write-Host "Status: Success" -ForegroundColor Green
    Write-Host "Leave Types: $($leaveTypes.data.leave_types.Count)" -ForegroundColor Cyan
    Write-Host "Available Types:" -ForegroundColor White
    foreach ($type in $leaveTypes.data.leave_types) {
        Write-Host "  - $($type.name) $($type.icon)" -ForegroundColor Gray
    }
    Write-Host "---"
    Write-Host ""

    # Test 3: Dashboard Data
    Write-Host "📊 Test 3: Dashboard API" -ForegroundColor Yellow
    $dashboard = Invoke-RestMethod -Uri "$BASE_URL/dashboard/summary" -Method GET -Headers $headers
    Write-Host "Status: Success" -ForegroundColor Green
    Write-Host "Weekly Hours: $($dashboard.data.weekly_hours)" -ForegroundColor Cyan
    Write-Host "---"
    Write-Host ""

    # Test 4: Notifications
    Write-Host "🔔 Test 4: Notifications API" -ForegroundColor Yellow
    $notifications = Invoke-RestMethod -Uri "$BASE_URL/notifications" -Method GET -Headers $headers
    Write-Host "Status: Success" -ForegroundColor Green
    Write-Host "Notifications: $($notifications.data.notifications.Count)" -ForegroundColor Cyan
    Write-Host "---"
    Write-Host ""

    # Summary
    Write-Host "✅ DOMAIN DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
    Write-Host "🌐 Live API: https://api-layer.vercel.app" -ForegroundColor White
    Write-Host "📚 Swagger Docs: https://api-layer.vercel.app/api-docs" -ForegroundColor White
    Write-Host "🎯 All APIs working on correct domain!" -ForegroundColor Green

} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}