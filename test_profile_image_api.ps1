# Profile Image Upload API Test Script
# Run this script to test all profile image API endpoints

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Profile Image Upload API Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to the API directory
Set-Location "c:\Users\bhoomi\Desktop\api_layer"

$baseUrl = "http://localhost:3002"

try {
    # Step 1: Check if server is running
    Write-Host "1. Checking if server is running..." -ForegroundColor Yellow
    try {
        $healthResponse = Invoke-RestMethod -Uri "$baseUrl/api/health" -Method GET
        Write-Host "✅ Server is running!" -ForegroundColor Green
        Write-Host "   Status: $($healthResponse.status)" -ForegroundColor Gray
    }
    catch {
        Write-Host "❌ Server is not running. Please start with: npm start" -ForegroundColor Red
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
    $imagePath = "test-profile-image.png"
    [System.IO.File]::WriteAllBytes($imagePath, $bytes)
    Write-Host "✅ Test image created: $imagePath" -ForegroundColor Green

    # Step 4: Test GET profile image (before upload)
    Write-Host "4. Testing GET profile image (before upload)..." -ForegroundColor Yellow
    try {
        $getResponse = Invoke-RestMethod -Uri "$baseUrl/api/profile/image" -Method GET -Headers @{ Authorization = "Bearer $token" }
        Write-Host "✅ GET request successful" -ForegroundColor Green
        Write-Host "   Has Image: $($getResponse.data.hasImage)" -ForegroundColor Gray
        Write-Host "   Image URL: $($getResponse.data.imageUrl)" -ForegroundColor Gray
    }
    catch {
        Write-Host "📋 GET profile image: $($_.Exception.Message)" -ForegroundColor Yellow
    }

    # Step 5: Upload profile image using curl (PowerShell Invoke-RestMethod doesn't handle multipart well)
    Write-Host "5. Uploading profile image..." -ForegroundColor Yellow
    $curlResult = & curl.exe -s -X PUT "$baseUrl/api/profile/image" -H "Authorization: Bearer $token" -F "image=@$imagePath" 2>$null
    
    if ($curlResult) {
        $uploadResponse = $curlResult | ConvertFrom-Json
        if ($uploadResponse.success) {
            Write-Host "✅ Image upload successful!" -ForegroundColor Green
            Write-Host "   Filename: $($uploadResponse.data.filename)" -ForegroundColor Gray
            Write-Host "   Image URL: $($uploadResponse.data.imageUrl)" -ForegroundColor Gray
            $uploadedImageUrl = $uploadResponse.data.imageUrl
        }
        else {
            Write-Host "❌ Upload failed: $($uploadResponse.message)" -ForegroundColor Red
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
        Write-Host "   Image URL: $($getResponse.data.imageUrl)" -ForegroundColor Gray
    }
    catch {
        Write-Host "❌ GET failed: $($_.Exception.Message)" -ForegroundColor Red
    }

    # Step 7: Test static image access
    if ($uploadedImageUrl) {
        Write-Host "7. Testing static image access..." -ForegroundColor Yellow
        try {
            $staticUrl = "$baseUrl$uploadedImageUrl"
            $headers = Invoke-WebRequest -Uri $staticUrl -Method HEAD
            Write-Host "✅ Static image accessible!" -ForegroundColor Green
            Write-Host "   URL: $staticUrl" -ForegroundColor Gray
            Write-Host "   Content-Type: $($headers.Headers['Content-Type'])" -ForegroundColor Gray
        }
        catch {
            Write-Host "❌ Static image not accessible: $($_.Exception.Message)" -ForegroundColor Red
        }
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
    Write-Host "  CURL Commands for Manual Testing" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "# Get Token:" -ForegroundColor Yellow
    Write-Host "curl -X GET $baseUrl/api/get-token" -ForegroundColor White
    Write-Host ""
    Write-Host "# Upload Image:" -ForegroundColor Yellow
    Write-Host "curl -X PUT $baseUrl/api/profile/image \" -ForegroundColor White
    Write-Host "  -H `"Authorization: Bearer $token`" \" -ForegroundColor White
    Write-Host "  -F `"image=@test-profile-image.png`"" -ForegroundColor White
    Write-Host ""
    Write-Host "# Get Image Info:" -ForegroundColor Yellow
    Write-Host "curl -X GET $baseUrl/api/profile/image \" -ForegroundColor White
    Write-Host "  -H `"Authorization: Bearer $token`"" -ForegroundColor White
    Write-Host ""
    Write-Host "# Delete Image:" -ForegroundColor Yellow
    Write-Host "curl -X DELETE $baseUrl/api/profile/image \" -ForegroundColor White
    Write-Host "  -H `"Authorization: Bearer $token`"" -ForegroundColor White
    Write-Host ""
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
Write-Host "🎉 Test completed! Check the results above." -ForegroundColor Green
Write-Host "📚 For more details, see: PROFILE_IMAGE_API_GUIDE.md" -ForegroundColor Cyan