# Profile Image API Test Script for Live Deployment
# Updated for serverless environment (base64 storage)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Profile Image API Test (Live)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "https://api-layer.vercel.app"

try {
    # Step 1: Check if live server is running
    Write-Host "1. Checking live API health..." -ForegroundColor Yellow
    try {
        $healthResponse = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method GET
        Write-Host "✅ Live API is running!" -ForegroundColor Green
        Write-Host "   Status: $($healthResponse.status)" -ForegroundColor Gray
        Write-Host "   Environment: $($healthResponse.environment)" -ForegroundColor Gray
    }
    catch {
        Write-Host "❌ Live API is not accessible: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }

    # Step 2: Get authentication token
    Write-Host "2. Getting authentication token..." -ForegroundColor Yellow
    $tokenResponse = Invoke-RestMethod -Uri "$baseUrl/api/get-token" -Method GET
    $token = $tokenResponse.token
    Write-Host "✅ Token acquired: $token" -ForegroundColor Green

    # Step 3: Create test image
    Write-Host "3. Creating test image..." -ForegroundColor Yellow
    $bytes = [byte[]] (0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A,0x00,0x00,0x00,0x0D,0x49,0x48,0x44,0x52,0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x08,0x02,0x00,0x00,0x00,0x90,0x77,0x53,0xDE,0x00,0x00,0x00,0x0C,0x49,0x44,0x41,0x54,0x08,0x57,0x63,0xF8,0x00,0x00,0x00,0x01,0x00,0x01,0x5C,0xC2,0x5D,0xB4,0x00,0x00,0x00,0x00,0x49,0x45,0x4E,0x44,0xAE,0x42,0x60,0x82)
    $imagePath = "test-profile-image-live.png"
    [System.IO.File]::WriteAllBytes($imagePath, $bytes)
    Write-Host "✅ Test image created: $imagePath" -ForegroundColor Green

    # Step 4: Test GET profile image (before upload)
    Write-Host "4. Testing GET profile image (before upload)..." -ForegroundColor Yellow
    try {
        $getResponse = Invoke-RestMethod -Uri "$baseUrl/api/profile/image" -Method GET -Headers @{ Authorization = "Bearer $token" }
        Write-Host "✅ GET request successful" -ForegroundColor Green
        Write-Host "   Has Image: $($getResponse.data.hasImage)" -ForegroundColor Gray
        if ($getResponse.data.imageData) {
            Write-Host "   Image Data Length: $($getResponse.data.imageData.Length) characters" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "📋 GET profile image: $($_.Exception.Message)" -ForegroundColor Yellow
    }

    # Step 5: Upload profile image using curl
    Write-Host "5. Uploading profile image to live API..." -ForegroundColor Yellow
    $curlResult = & curl.exe -s -X PUT "$baseUrl/api/profile/image" -H "Authorization: Bearer $token" -F "image=@$imagePath" 2>$null
    
    if ($curlResult) {
        try {
            $uploadResponse = $curlResult | ConvertFrom-Json
            if ($uploadResponse.success) {
                Write-Host "✅ Image upload successful!" -ForegroundColor Green
                Write-Host "   Filename: $($uploadResponse.data.filename)" -ForegroundColor Gray
                Write-Host "   Size: $($uploadResponse.data.size) bytes" -ForegroundColor Gray
                Write-Host "   Mime Type: $($uploadResponse.data.mimetype)" -ForegroundColor Gray
                Write-Host "   Image Data Length: $($uploadResponse.data.imageData.Length) characters" -ForegroundColor Gray
            }
            else {
                Write-Host "❌ Upload failed: $($uploadResponse.message)" -ForegroundColor Red
            }
        }
        catch {
            Write-Host "❌ Upload response parsing failed: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "Raw response: $curlResult" -ForegroundColor Gray
        }
    }
    else {
        Write-Host "❌ Upload failed - no response from server" -ForegroundColor Red
    }

    # Step 6: Test GET profile image (after upload)
    Write-Host "6. Testing GET profile image (after upload)..." -ForegroundColor Yellow
    try {
        $getResponse = Invoke-RestMethod -Uri "$baseUrl/api/profile/image" -Method GET -Headers @{ Authorization = "Bearer $token" }
        Write-Host "✅ GET request successful" -ForegroundColor Green
        Write-Host "   Has Image: $($getResponse.data.hasImage)" -ForegroundColor Gray
        if ($getResponse.data.imageData) {
            Write-Host "   Image Data Length: $($getResponse.data.imageData.Length) characters" -ForegroundColor Gray
            Write-Host "   Image starts with: $($getResponse.data.imageData.Substring(0, 50))..." -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "❌ GET failed: $($_.Exception.Message)" -ForegroundColor Red
    }

    # Step 7: Test Swagger UI access
    Write-Host "7. Testing Swagger UI access..." -ForegroundColor Yellow
    try {
        $swaggerResponse = Invoke-WebRequest -Uri "$baseUrl/api-docs" -Method GET
        if ($swaggerResponse.StatusCode -eq 200) {
            Write-Host "✅ Swagger UI accessible!" -ForegroundColor Green
            Write-Host "   Swagger URL: $baseUrl/api-docs" -ForegroundColor Gray
        }
    }
    catch {
        Write-Host "❌ Swagger UI not accessible: $($_.Exception.Message)" -ForegroundColor Red
    }

    # Step 8: Test DELETE profile image
    Write-Host "8. Testing DELETE profile image..." -ForegroundColor Yellow
    try {
        $deleteResponse = Invoke-RestMethod -Uri "$baseUrl/api/profile/image" -Method DELETE -Headers @{ Authorization = "Bearer $token" }
        Write-Host "✅ Image deletion successful!" -ForegroundColor Green
        Write-Host "   Message: $($deleteResponse.message)" -ForegroundColor Gray
    }
    catch {
        Write-Host "❌ DELETE failed: $($_.Exception.Message)" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "  LIVE API CURL Commands" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "# Get Token:" -ForegroundColor Yellow
    Write-Host "curl -X GET $baseUrl/api/get-token" -ForegroundColor White
    Write-Host ""
    Write-Host "# Upload Image:" -ForegroundColor Yellow
    Write-Host "curl -X PUT $baseUrl/api/profile/image \" -ForegroundColor White
    Write-Host "  -H `"Authorization: Bearer $token`" \" -ForegroundColor White
    Write-Host "  -F `"image=@your-image.jpg`"" -ForegroundColor White
    Write-Host ""
    Write-Host "# Get Image Info:" -ForegroundColor Yellow
    Write-Host "curl -X GET $baseUrl/api/profile/image \" -ForegroundColor White
    Write-Host "  -H `"Authorization: Bearer $token`"" -ForegroundColor White
    Write-Host ""
    Write-Host "# Delete Image:" -ForegroundColor Yellow
    Write-Host "curl -X DELETE $baseUrl/api/profile/image \" -ForegroundColor White
    Write-Host "  -H `"Authorization: Bearer $token`"" -ForegroundColor White
    Write-Host ""
    Write-Host "# Access Swagger UI:" -ForegroundColor Yellow
    Write-Host "$baseUrl/api-docs" -ForegroundColor White
}
catch {
    Write-Host "❌ Test failed with error: $($_.Exception.Message)" -ForegroundColor Red
}
finally {
    # Cleanup
    if (Test-Path $imagePath) {
        Remove-Item $imagePath -ErrorAction SilentlyContinue
        Write-Host "🧹 Cleanup: Test image file deleted" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "🎉 Live API test completed!" -ForegroundColor Green
Write-Host "🚀 Your Profile Image Upload API is now live at:" -ForegroundColor Cyan
Write-Host "   $baseUrl" -ForegroundColor White
Write-Host "📚 API Documentation:" -ForegroundColor Cyan
Write-Host "   $baseUrl/api-docs" -ForegroundColor White