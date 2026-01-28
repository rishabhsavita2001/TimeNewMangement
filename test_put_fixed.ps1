# Test PUT API with proper curl equivalent
Write-Host "🚀 Testing PUT API Fix..." -ForegroundColor Green

# Step 1: Get token
Write-Host "`n1. Getting authentication token..." -ForegroundColor Yellow
try {
    $tokenResponse = Invoke-RestMethod -Uri "https://api-layer.vercel.app/api/get-token" -Method Get
    $token = $tokenResponse.token
    Write-Host "✅ Token obtained: $($token.Substring(0,20))..." -ForegroundColor Green
}
catch {
    Write-Host "❌ Failed to get token: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "The deployment may not have the /api/get-token endpoint yet." -ForegroundColor Yellow
    
    # Use a test token for demonstration
    $token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJ1c2VyIiwiaWF0IjoxNTkxNzk1NjAwfQ.test"
    Write-Host "🔧 Using test token for demonstration" -ForegroundColor Cyan
}

# Step 2: Test PUT API with numeric ID (should work)
Write-Host "`n2. Testing PUT /api/me/time-entries/123 (numeric ID)..." -ForegroundColor Yellow

$headers = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

$body = @{
    startTime = "2004-01-01T12:11:40.143Z"
    endTime = "2024-03-11T20:37:51.814Z"
    description = "string"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://api-layer.vercel.app/api/me/time-entries/123" -Method Put -Headers $headers -Body $body
    Write-Host "✅ PUT API SUCCESS!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 3 | Write-Host
}
catch {
    Write-Host "❌ PUT API Failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error details: $errorBody" -ForegroundColor Yellow
    }
}

# Step 3: Test PUT API with "string" ID (should fail with proper error)
Write-Host "`n3. Testing PUT /api/me/time-entries/string (should fail with proper error)..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "https://api-layer.vercel.app/api/me/time-entries/string" -Method Put -Headers $headers -Body $body
    Write-Host "Response:" -ForegroundColor White
    $response | ConvertTo-Json -Depth 3 | Write-Host
}
catch {
    Write-Host "Expected error for 'string' ID:" -ForegroundColor Yellow
    if ($_.Exception.Response) {
        $errorStream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorStream)
        $errorBody = $reader.ReadToEnd()
        Write-Host "$errorBody" -ForegroundColor Red
    }
}

Write-Host "`n🎯 PUT API Test Complete!" -ForegroundColor Green
Write-Host "`n📝 Summary:" -ForegroundColor White
Write-Host "• Use numeric ID: /api/me/time-entries/123 ✅" -ForegroundColor Green
Write-Host "• Don't use string: /api/me/time-entries/string ❌" -ForegroundColor Red
Write-Host "• Fields: startTime, endTime, description ✅" -ForegroundColor Green