# API Data Consistency Test Script
# Client can run this to verify the fix themselves

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  API DATA CONSISTENCY TEST" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

$baseUrl = "https://api-layer.vercel.app"

# Step 1: Get Token
Write-Host "Step 1: Getting authentication token..." -ForegroundColor Cyan
$tokenResponse = Invoke-WebRequest -Uri "$baseUrl/api/get-token" -Method GET | ConvertFrom-Json
$token = $tokenResponse.data.token
Write-Host "✓ Token received: $($token.Substring(0,20))..." -ForegroundColor Green

# Step 2: Call /api/me three times
Write-Host "`nStep 2: Calling /api/me endpoint 3 times...`n" -ForegroundColor Cyan

$results = @()

for ($i = 1; $i -le 3; $i++) {
    Write-Host "  Call $i..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "$baseUrl/api/me" -Headers @{Authorization="Bearer $token"} -Method GET | ConvertFrom-Json
    $results += $response.data
    Start-Sleep -Milliseconds 500
}

# Step 3: Compare Results
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  TEST RESULTS" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Call 1:" -ForegroundColor Cyan
Write-Host "  ID: $($results[0].id)"
Write-Host "  Name: $($results[0].firstName) $($results[0].lastName)"
Write-Host "  Email: $($results[0].email)"
Write-Host "  Employee #: $($results[0].employeeNumber)`n"

Write-Host "Call 2:" -ForegroundColor Cyan
Write-Host "  ID: $($results[1].id)"
Write-Host "  Name: $($results[1].firstName) $($results[1].lastName)"
Write-Host "  Email: $($results[1].email)"
Write-Host "  Employee #: $($results[1].employeeNumber)`n"

Write-Host "Call 3:" -ForegroundColor Cyan
Write-Host "  ID: $($results[2].id)"
Write-Host "  Name: $($results[2].firstName) $($results[2].lastName)"
Write-Host "  Email: $($results[2].email)"
Write-Host "  Employee #: $($results[2].employeeNumber)`n"

# Verify Consistency
$allSame = (
    $results[0].id -eq $results[1].id -and $results[1].id -eq $results[2].id -and
    $results[0].firstName -eq $results[1].firstName -and $results[1].firstName -eq $results[2].firstName -and
    $results[0].lastName -eq $results[1].lastName -and $results[1].lastName -eq $results[2].lastName -and
    $results[0].email -eq $results[1].email -and $results[1].email -eq $results[2].email
)

Write-Host "========================================" -ForegroundColor Green
if ($allSame) {
    Write-Host "  ✓ PASS: All data is CONSISTENT!" -ForegroundColor Green
    Write-Host "  ✓ Bug is FIXED!" -ForegroundColor Green
} else {
    Write-Host "  ✗ FAIL: Data is INCONSISTENT!" -ForegroundColor Red
    Write-Host "  ✗ Bug still exists!" -ForegroundColor Red
}
Write-Host "========================================`n" -ForegroundColor Green

# Display comparison table
Write-Host "Comparison Table:" -ForegroundColor Cyan
Write-Host "┌────────┬────────┬────────┬────────┬──────────┐"
Write-Host "│ Field  │ Call 1 │ Call 2 │ Call 3 │  Status  │"
Write-Host "├────────┼────────┼────────┼────────┼──────────┤"
Write-Host "│ ID     │ $($results[0].id)      │ $($results[1].id)      │ $($results[2].id)      │ $(if($results[0].id -eq $results[1].id -and $results[1].id -eq $results[2].id){'✓ SAME'}else{'✗ DIFF'}) │"
Write-Host "│ Name   │ $($results[0].firstName) │ $($results[1].firstName) │ $($results[2].firstName) │ $(if($results[0].firstName -eq $results[1].firstName -and $results[1].firstName -eq $results[2].firstName){'✓ SAME'}else{'✗ DIFF'}) │"
Write-Host "└────────┴────────┴────────┴────────┴──────────┘`n"

Write-Host "Test completed at: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
