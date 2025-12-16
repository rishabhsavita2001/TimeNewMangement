# Simple API Test
Write-Host "=== API Testing Started ===" -ForegroundColor Green

# Test 1: Health
Write-Host "`nTesting Health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3002/health"
    Write-Host "✅ Health endpoint working" -ForegroundColor Green
    Write-Host "Status: $($response.status)"
    Write-Host "Version: $($response.version)"
} catch {
    Write-Host "❌ Health failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Test endpoint
Write-Host "`n2. Testing Test Endpoint..." -ForegroundColor Yellow
try {
    $testResponse = Invoke-WebRequest -Uri "$baseUrl/test" -UseBasicParsing
    Write-Host "✅ Test endpoint working" -ForegroundColor Green
    Write-Host $testResponse.Content
} catch {
    Write-Host "❌ Test endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Database debug
Write-Host "`n3. Testing Database Debug..." -ForegroundColor Yellow
try {
    $dbResponse = Invoke-WebRequest -Uri "$baseUrl/debug-db" -UseBasicParsing
    Write-Host "✅ Database debug working" -ForegroundColor Green
    Write-Host $dbResponse.Content
} catch {
    Write-Host "❌ Database debug failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Test login
Write-Host "`n4. Testing Test Login..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@company.com"
        password = "password123"
    } | ConvertTo-Json

    $loginResponse = Invoke-WebRequest -Uri "$baseUrl/test-login" -Method POST -Body $loginBody -ContentType "application/json" -UseBasicParsing
    Write-Host "✅ Test login working" -ForegroundColor Green
    Write-Host $loginResponse.Content
    
    # Extract token for further tests
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $global:token = $loginData.token
} catch {
    Write-Host "❌ Test login failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Auth login 
Write-Host "`n5. Testing Auth Login..." -ForegroundColor Yellow
try {
    $authLoginBody = @{
        email = "admin@company.com"
        password = "password123"
    } | ConvertTo-Json

    $authResponse = Invoke-WebRequest -Uri "$baseUrl/auth/login" -Method POST -Body $authLoginBody -ContentType "application/json" -UseBasicParsing
    Write-Host "✅ Auth login working" -ForegroundColor Green
    Write-Host $authResponse.Content
    
    # Extract real token
    $authData = $authResponse.Content | ConvertFrom-Json
    if ($authData.data -and $authData.data.token) {
        $global:realToken = $authData.data.token
    }
} catch {
    Write-Host "❌ Auth login failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Response.StatusCode)"
}

# Test 6: Protected API endpoints
Write-Host "`n6. Testing Protected API Endpoints..." -ForegroundColor Yellow

# Test API test endpoint
Write-Host "`n6a. Testing /api/test..." -ForegroundColor Cyan
try {
    $headers = @{}
    if ($global:realToken) {
        $headers["Authorization"] = "Bearer $($global:realToken)"
    } elseif ($global:token) {
        $headers["Authorization"] = "Bearer $($global:token)"
    }
    
    $apiTestResponse = Invoke-WebRequest -Uri "$baseUrl/api/test" -Headers $headers -UseBasicParsing
    Write-Host "✅ /api/test working" -ForegroundColor Green
    Write-Host $apiTestResponse.Content
} catch {
    Write-Host "❌ /api/test failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test user profile
Write-Host "`n6b. Testing /api/user/profile..." -ForegroundColor Cyan
try {
    $headers = @{}
    if ($global:realToken) {
        $headers["Authorization"] = "Bearer $($global:realToken)"
    } elseif ($global:token) {
        $headers["Authorization"] = "Bearer $($global:token)"
    }
    
    $profileResponse = Invoke-WebRequest -Uri "$baseUrl/api/user/profile" -Headers $headers -UseBasicParsing
    Write-Host "✅ /api/user/profile working" -ForegroundColor Green
    Write-Host $profileResponse.Content
} catch {
    Write-Host "❌ /api/user/profile failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test time entries
Write-Host "`n6c. Testing /api/time-entries..." -ForegroundColor Cyan
try {
    $headers = @{}
    if ($global:realToken) {
        $headers["Authorization"] = "Bearer $($global:realToken)"
    } elseif ($global:token) {
        $headers["Authorization"] = "Bearer $($global:token)"
    }
    
    $timeEntriesResponse = Invoke-WebRequest -Uri "$baseUrl/api/time-entries" -Headers $headers -UseBasicParsing
    Write-Host "✅ /api/time-entries working" -ForegroundColor Green
    Write-Host $timeEntriesResponse.Content
} catch {
    Write-Host "❌ /api/time-entries failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test projects
Write-Host "`n6d. Testing /api/projects..." -ForegroundColor Cyan
try {
    $headers = @{}
    if ($global:realToken) {
        $headers["Authorization"] = "Bearer $($global:realToken)"
    } elseif ($global:token) {
        $headers["Authorization"] = "Bearer $($global:token)"
    }
    
    $projectsResponse = Invoke-WebRequest -Uri "$baseUrl/api/projects" -Headers $headers -UseBasicParsing
    Write-Host "✅ /api/projects working" -ForegroundColor Green
    Write-Host $projectsResponse.Content
} catch {
    Write-Host "❌ /api/projects failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

# Test leave requests
Write-Host "`n6e. Testing /api/leave-requests..." -ForegroundColor Cyan
try {
    $headers = @{}
    if ($global:realToken) {
        $headers["Authorization"] = "Bearer $($global:realToken)"
    } elseif ($global:token) {
        $headers["Authorization"] = "Bearer $($global:token)"
    }
    
    $leaveResponse = Invoke-WebRequest -Uri "$baseUrl/api/leave-requests" -Headers $headers -UseBasicParsing
    Write-Host "✅ /api/leave-requests working" -ForegroundColor Green
    Write-Host $leaveResponse.Content
} catch {
    Write-Host "❌ /api/leave-requests failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host "`n=== API Testing Complete ===" -ForegroundColor Green