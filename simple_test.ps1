# Simple API Test
$baseUrl = "http://localhost:3002"

Write-Host "Testing /health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/health" -UseBasicParsing
    Write-Host "✅ Success" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTesting /test endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/test" -UseBasicParsing  
    Write-Host "✅ Success" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTesting /auth/login endpoint..." -ForegroundColor Yellow
try {
    $loginData = @{
        email = "admin@company.com"
        password = "password123"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -Body $loginData -ContentType "application/json" -UseBasicParsing
    Write-Host "✅ Success" -ForegroundColor Green
    $loginResult = $response.Content | ConvertFrom-Json
    $loginResult | ConvertTo-Json -Depth 3
    
    # Save token for next test
    $global:authToken = $loginResult.data.token
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        try {
            $errorBody = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorBody)
            $errorText = $reader.ReadToEnd()
            Write-Host "Response: $errorText" -ForegroundColor Red
        } catch {}
    }
}

Write-Host "`nTesting protected endpoint /api/test..." -ForegroundColor Yellow
try {
    $headers = @{}
    if ($global:authToken) {
        $headers["Authorization"] = "Bearer $($global:authToken)"
    }
    
    $response = Invoke-WebRequest -Uri "$baseUrl/api/test" -Headers $headers -UseBasicParsing
    Write-Host "✅ Success" -ForegroundColor Green
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}