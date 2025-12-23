# Test Delete Account API
Write-Host "🔐 Testing Delete Account API" -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow

$baseUrl = "https://apilayer-mw09v8dwi-soludoo.vercel.app"

try {
    # Step 1: Login
    Write-Host "`n1. Logging in to get token..." -ForegroundColor Cyan
    $loginBody = @{
        email = "test@company.com"
        password = "password123"
    } | ConvertTo-Json

    $login = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method POST -ContentType "application/json" -Body $loginBody
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "Token: $($login.token.Substring(0, 20))..." -ForegroundColor Gray

    # Step 2: Test Delete Account
    Write-Host "`n2. Testing delete account endpoint..." -ForegroundColor Cyan
    $headers = @{
        'Authorization' = "Bearer $($login.token)"
        'Content-Type' = 'application/json'
    }
    
    $deleteBody = @{
        email = "test@company.com"
        password = "password123"
        confirmPassword = "password123"
        reason = "Testing API with email field from PowerShell script"
    } | ConvertTo-Json

    $deleteResult = Invoke-RestMethod -Uri "$baseUrl/auth/delete-account" -Method DELETE -Headers $headers -Body $deleteBody
    
    Write-Host "✅ DELETE ACCOUNT API IS WORKING!" -ForegroundColor Green
    Write-Host "Success: $($deleteResult.success)" -ForegroundColor Green
    Write-Host "Message: $($deleteResult.message)" -ForegroundColor Green
    
    if ($deleteResult.data) {
        Write-Host "Deleted at: $($deleteResult.data.deletedAt)" -ForegroundColor Gray
        Write-Host "Email: $($deleteResult.data.email)" -ForegroundColor Gray
    }

    # Step 3: Test Swagger UI
    Write-Host "`n3. Testing Swagger UI accessibility..." -ForegroundColor Cyan
    try {
        $swaggerTest = Invoke-WebRequest -Uri "$baseUrl/docs/" -Method GET -TimeoutSec 10
        Write-Host "✅ Swagger UI is accessible at $baseUrl/docs/" -ForegroundColor Green
        Write-Host "Status Code: $($swaggerTest.StatusCode)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Swagger UI test failed: $($_.Exception.Message)" -ForegroundColor Red
    }

} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Test completed!" -ForegroundColor Yellow