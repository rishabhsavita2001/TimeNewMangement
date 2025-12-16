Write-Host "=== Comprehensive API Testing ===" -ForegroundColor Green

$baseUrl = "http://localhost:3002"
$testResults = @()

# Helper function to test endpoint
function Test-Endpoint {
    param($Name, $Url, $Method = "GET", $Body = $null, $Headers = $null, $ContentType = "application/json")
    
    Write-Host "`nTesting $Name..." -ForegroundColor Yellow
    try {
        $params = @{
            Uri = $Url
            Method = $Method
            UseBasicParsing = $true
        }
        
        if ($Headers) { $params.Headers = $Headers }
        if ($Body) { 
            $params.Body = $Body
            $params.ContentType = $ContentType
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "✅ $Name SUCCESS" -ForegroundColor Green
        return @{ Success = $true; Response = $response; Error = $null }
    } catch {
        Write-Host "❌ $Name FAILED: $($_.Exception.Message)" -ForegroundColor Red
        return @{ Success = $false; Response = $null; Error = $_.Exception.Message }
    }
}

# Test 1: Health Check
$result = Test-Endpoint "Health Check" "$baseUrl/health"
$testResults += @{ Name = "Health"; Success = $result.Success }
if ($result.Success) {
    Write-Host "   Status: $($result.Response.status)" -ForegroundColor Cyan
}

# Test 2: Basic Test
$result = Test-Endpoint "Basic Test" "$baseUrl/test"
$testResults += @{ Name = "Test"; Success = $result.Success }
if ($result.Success) {
    Write-Host "   Message: $($result.Response.message)" -ForegroundColor Cyan
}

# Test 3: Test Login (Mock)
$loginBody = @{ email = "admin@company.com"; password = "password123" } | ConvertTo-Json
$result = Test-Endpoint "Test Login" "$baseUrl/test-login" "POST" $loginBody
$testResults += @{ Name = "Test Login"; Success = $result.Success }
$mockToken = $null
if ($result.Success) {
    $mockToken = $result.Response.token
    Write-Host "   Token: $($mockToken.Substring(0,20))..." -ForegroundColor Cyan
}

# Test 4: Auth Login (Real)
$result = Test-Endpoint "Auth Login" "$baseUrl/auth/login" "POST" $loginBody
$testResults += @{ Name = "Auth Login"; Success = $result.Success }
$authToken = $null
if ($result.Success) {
    $authToken = $result.Response.data.token
    Write-Host "   User: $($result.Response.data.user.firstName) $($result.Response.data.user.lastName)" -ForegroundColor Cyan
    Write-Host "   Token: $($authToken.Substring(0,20))..." -ForegroundColor Cyan
}

# Use the best available token
$token = if ($authToken) { $authToken } else { $mockToken }

if ($token) {
    Write-Host "`n=== Testing Protected Endpoints ===" -ForegroundColor Magenta
    $authHeaders = @{ Authorization = "Bearer $token" }
    
    # Test 5: API Test
    $result = Test-Endpoint "API Test" "$baseUrl/api/test" "GET" $null $authHeaders
    $testResults += @{ Name = "API Test"; Success = $result.Success }
    if ($result.Success) {
        Write-Host "   Message: $($result.Response.message)" -ForegroundColor Cyan
    }
    
    # Test 6: User Profile
    $result = Test-Endpoint "User Profile" "$baseUrl/api/user/profile" "GET" $null $authHeaders
    $testResults += @{ Name = "User Profile"; Success = $result.Success }
    if ($result.Success) {
        Write-Host "   User: $($result.Response.data.firstName) $($result.Response.data.lastName)" -ForegroundColor Cyan
    }
    
    # Test 7: Time Entries
    $result = Test-Endpoint "Time Entries" "$baseUrl/api/time-entries" "GET" $null $authHeaders
    $testResults += @{ Name = "Time Entries"; Success = $result.Success }
    if ($result.Success) {
        Write-Host "   Count: $($result.Response.data.count)" -ForegroundColor Cyan
    }
    
    # Test 8: Projects
    $result = Test-Endpoint "Projects" "$baseUrl/api/projects" "GET" $null $authHeaders
    $testResults += @{ Name = "Projects"; Success = $result.Success }
    if ($result.Success) {
        Write-Host "   Count: $($result.Response.data.count)" -ForegroundColor Cyan
    }
    
    # Test 9: Leave Requests
    $result = Test-Endpoint "Leave Requests" "$baseUrl/api/leave-requests" "GET" $null $authHeaders
    $testResults += @{ Name = "Leave Requests"; Success = $result.Success }
    if ($result.Success) {
        Write-Host "   Count: $($result.Response.data.count)" -ForegroundColor Cyan
    }
    
    # Test 10: Dashboard
    $result = Test-Endpoint "Dashboard" "$baseUrl/api/user/dashboard" "GET" $null $authHeaders
    $testResults += @{ Name = "Dashboard"; Success = $result.Success }
    if ($result.Success) {
        Write-Host "   Time entries today: $($result.Response.data.timeEntriesToday)" -ForegroundColor Cyan
    }
} else {
    Write-Host "`n❌ No valid token available - skipping protected endpoints" -ForegroundColor Red
}

# Summary
Write-Host "`n=== TEST SUMMARY ===" -ForegroundColor Green
$passed = ($testResults | Where-Object { $_.Success }).Count
$total = $testResults.Count
Write-Host "Passed: $passed/$total" -ForegroundColor $(if ($passed -eq $total) { "Green" } else { "Yellow" })

foreach ($test in $testResults) {
    $status = if ($test.Success) { "✅" } else { "❌" }
    Write-Host "$status $($test.Name)" -ForegroundColor $(if ($test.Success) { "Green" } else { "Red" })
}

Write-Host "`n=== Testing Complete ===" -ForegroundColor Green