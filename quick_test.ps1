# Quick API Test
Write-Host "Testing Health Endpoint..."
try {
    $response = Invoke-RestMethod -Uri http://localhost:3002/health -Method GET
    Write-Host "✅ Health: " -NoNewline -ForegroundColor Green
    Write-Host "$($response.status)"
} catch {
    Write-Host "❌ Health failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "
Testing Test Endpoint..."
try {
    $response = Invoke-RestMethod -Uri http://localhost:3002/test -Method GET  
    Write-Host "✅ Test: " -NoNewline -ForegroundColor Green
    Write-Host "$($response.message)"
} catch {
    Write-Host "❌ Test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "
Testing Login..."
try {
    $body = @{ email = "admin@company.com"; password = "password123" } | ConvertTo-Json
    $response = Invoke-RestMethod -Uri http://localhost:3002/test-login -Method POST -Body $body -ContentType "application/json"
    Write-Host "✅ Login: " -NoNewline -ForegroundColor Green
    Write-Host "$($response.message)"
    $token = $response.token
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
}
