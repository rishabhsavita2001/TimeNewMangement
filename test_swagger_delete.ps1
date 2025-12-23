# Test Delete Account API on Live Swagger
Write-Host "🔍 Testing Delete Account API on Swagger UI" -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

$liveUrl = "https://api-layer.vercel.app"

try {
    Write-Host "`n1. Testing Login API..." -ForegroundColor Cyan
    
    # Login to get token
    $loginBody = @{
        email = "test@company.com"
        password = "password123"
    } | ConvertTo-Json

    $login = Invoke-RestMethod -Uri "$liveUrl/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "Token: $($login.token.Substring(0, 20))..." -ForegroundColor Gray

    $headers = @{
        'Authorization' = "Bearer $($login.token)"
        'Content-Type' = 'application/json'
    }

    Write-Host "`n2. Testing DELETE Account API Current Structure..." -ForegroundColor Cyan
    
    # Test without email field (check if old version)
    Write-Host "   Testing WITHOUT email field (old version)..." -ForegroundColor Gray
    $deleteBodyOld = @{
        password = "password123"
        confirmPassword = "password123"
        reason = "Testing current API structure"
    } | ConvertTo-Json

    try {
        $deleteOld = Invoke-RestMethod -Uri "$liveUrl/auth/delete-account" -Method DELETE -Headers $headers -Body $deleteBodyOld
        Write-Host "🔄 API NEEDS UPDATE - accepts requests without email field" -ForegroundColor Yellow
        Write-Host "   Response: $($deleteOld.message)" -ForegroundColor Gray
    } catch {
        $errorResponse = $_.Exception.Response
        if ($_.Exception.Message -like "*email*" -or $errorResponse.StatusCode -eq 400) {
            Write-Host "✅ API ALREADY UPDATED - requires email field!" -ForegroundColor Green
        } else {
            Write-Host "❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    Write-Host "`n   Testing WITH email field (new version)..." -ForegroundColor Gray
    $deleteBodyNew = @{
        email = "test@company.com"
        password = "password123"
        confirmPassword = "password123"
        reason = "Testing API with email field from PowerShell"
    } | ConvertTo-Json

    try {
        $deleteNew = Invoke-RestMethod -Uri "$liveUrl/auth/delete-account" -Method DELETE -Headers $headers -Body $deleteBodyNew
        Write-Host "✅ DELETE ACCOUNT API WITH EMAIL FIELD WORKING!" -ForegroundColor Green
        Write-Host "   Success: $($deleteNew.success)" -ForegroundColor Green
        Write-Host "   Message: $($deleteNew.message)" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Delete with email failed: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "   Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Gray
    }

    Write-Host "`n3. Swagger UI Test Results:" -ForegroundColor Cyan
    Write-Host "   🌐 Live Swagger UI: $liveUrl/api-docs" -ForegroundColor Blue
    Write-Host "   📝 Manual Test Steps:" -ForegroundColor White
    Write-Host "      1. Open Swagger UI above" -ForegroundColor Gray
    Write-Host "      2. Use /auth/login with test@company.com / password123" -ForegroundColor Gray
    Write-Host "      3. Copy token and click 'Authorize' button" -ForegroundColor Gray
    Write-Host "      4. Test DELETE /auth/delete-account" -ForegroundColor Gray
    Write-Host "      5. Check if email field is required" -ForegroundColor Gray

} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Test completed!" -ForegroundColor Yellow