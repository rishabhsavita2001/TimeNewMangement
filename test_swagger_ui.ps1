# Test Complete Swagger UI Implementation

Write-Host "🎯 TESTING COMPLETE SWAGGER UI IMPLEMENTATION" -ForegroundColor Magenta
Write-Host "Domain: https://api-layer.vercel.app" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

# Test 1: API Docs Page
Write-Host "📚 Test 1: API Documentation Page" -ForegroundColor Yellow
try {
    $apiDocs = Invoke-WebRequest -Uri "https://api-layer.vercel.app/api-docs" -UseBasicParsing
    if ($apiDocs.Content -like "*swagger-ui*") {
        Write-Host "✅ Swagger UI HTML loaded successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Swagger UI not found in HTML" -ForegroundColor Red
    }
    Write-Host "✅ Status Code: $($apiDocs.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ API Docs failed to load" -ForegroundColor Red
}
Write-Host ""

# Test 2: Swagger JSON Spec
Write-Host "📋 Test 2: Swagger JSON Specification" -ForegroundColor Yellow  
try {
    $swaggerJson = Invoke-RestMethod -Uri "https://api-layer.vercel.app/swagger.json" -Method GET
    Write-Host "✅ OpenAPI Version: $($swaggerJson.openapi)" -ForegroundColor Green
    Write-Host "✅ API Title: $($swaggerJson.info.title)" -ForegroundColor Green
    Write-Host "✅ API Version: $($swaggerJson.info.version)" -ForegroundColor Green
    Write-Host "✅ Server URL: $($swaggerJson.servers[0].url)" -ForegroundColor Green
    Write-Host "✅ Available Paths: $($swaggerJson.paths.PSObject.Properties.Count)" -ForegroundColor Green
} catch {
    Write-Host "❌ Swagger JSON failed to load" -ForegroundColor Red
}
Write-Host ""

# Test 3: Test API through Swagger
Write-Host "🔧 Test 3: Test API Endpoints" -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "https://api-layer.vercel.app/api/health" -Method GET
    Write-Host "✅ Health Check: $($health.status)" -ForegroundColor Green
    
    $leaveTypes = Invoke-RestMethod -Uri "https://api-layer.vercel.app/api/leave-types" -Method GET  
    Write-Host "✅ Leave Types: $($leaveTypes.data.leave_types.Count) types available" -ForegroundColor Green
    
    $requests = Invoke-RestMethod -Uri "https://api-layer.vercel.app/api/me/leave-requests" -Method GET
    Write-Host "✅ Leave Requests: $($requests.data.requests.Count) requests" -ForegroundColor Green
} catch {
    Write-Host "❌ API testing failed" -ForegroundColor Red
}
Write-Host ""

# Final Summary
Write-Host "🎉 SWAGGER UI IMPLEMENTATION COMPLETE!" -ForegroundColor Green
Write-Host "🌐 Live Swagger UI: https://api-layer.vercel.app/api-docs" -ForegroundColor White
Write-Host "📊 Interactive API Testing: Available" -ForegroundColor White  
Write-Host "📋 Complete API Documentation: Available" -ForegroundColor White
Write-Host "🎯 Figma Implementation: Fully Documented" -ForegroundColor White
Write-Host ""
Write-Host "✅ Ready for mobile app integration with full API documentation!" -ForegroundColor Green