# Profile Image Upload API - Testing Guide

## API Endpoints Created

### 1. **PUT /api/profile/image** - Upload Profile Image
Upload or update user's profile image.

### 2. **GET /api/profile/image** - Get Profile Image URL
Retrieve the current user's profile image URL.

### 3. **DELETE /api/profile/image** - Delete Profile Image
Remove the current user's profile image.

---

## cURL Commands for Testing

### Step 1: Start the Server
```bash
# Start the API server
cd c:\Users\bhoomi\Desktop\api_layer
npm start
# Server will run on http://localhost:3002
```

### Step 2: Get Authentication Token
```bash
# Get a test token (any token works in demo mode)
curl -X GET http://localhost:3002/api/get-token
```

**Expected Response:**
```json
{
  "success": true,
  "token": "test-bearer-token-1234567890",
  "instructions": "Copy this token and use it in Swagger UI Authorize button..."
}
```

### Step 3: Test API Health
```bash
# Test basic API health
curl -X GET http://localhost:3002/api/health
```

### Step 4: Create a Test Image
```bash
# Create a simple test image file (1x1 pixel PNG)
# On Windows PowerShell:
$bytes = [byte[]] (0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A,0x00,0x00,0x00,0x0D,0x49,0x48,0x44,0x52,0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x08,0x02,0x00,0x00,0x00,0x90,0x77,0x53,0xDE,0x00,0x00,0x00,0x0C,0x49,0x44,0x41,0x54,0x08,0x57,0x63,0xF8,0x00,0x00,0x00,0x01,0x00,0x01,0x5C,0xC2,0x5D,0xB4,0x00,0x00,0x00,0x00,0x49,0x45,0x4E,0x44,0xAE,0x42,0x60,0x82)
[System.IO.File]::WriteAllBytes("test-image.png", $bytes)
```

### Step 5: Upload Profile Image
```bash
# Upload profile image (replace YOUR_TOKEN with actual token from step 2)
curl -X PUT http://localhost:3002/api/profile/image \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: multipart/form-data" \
  -F "image=@test-image.png"
```

**Windows PowerShell version:**
```powershell
# Upload profile image
$token = "test-bearer-token-1234567890"  # Replace with your actual token
curl.exe -X PUT http://localhost:3002/api/profile/image `
  -H "Authorization: Bearer $token" `
  -F "image=@test-image.png"
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Profile image updated successfully",
  "data": {
    "imageUrl": "/uploads/profile-images/user_1_1734567890123.png",
    "filename": "user_1_1734567890123.png",
    "user": {
      "id": 1,
      "first_name": "John",
      "last_name": "Doe",
      "email": "john.doe@example.com",
      "profile_image": "/uploads/profile-images/user_1_1734567890123.png"
    }
  }
}
```

### Step 6: Get Profile Image URL
```bash
# Get current profile image
curl -X GET http://localhost:3002/api/profile/image \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**PowerShell version:**
```powershell
curl.exe -X GET http://localhost:3002/api/profile/image `
  -H "Authorization: Bearer $token"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "imageUrl": "/uploads/profile-images/user_1_1734567890123.png",
    "hasImage": true
  }
}
```

### Step 7: Access the Uploaded Image
```bash
# Access the image directly via browser or curl
curl -I http://localhost:3002/uploads/profile-images/user_1_1734567890123.png
```

### Step 8: Delete Profile Image
```bash
# Delete profile image
curl -X DELETE http://localhost:3002/api/profile/image \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**PowerShell version:**
```powershell
curl.exe -X DELETE http://localhost:3002/api/profile/image `
  -H "Authorization: Bearer $token"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Profile image deleted successfully"
}
```

---

## Complete PowerShell Test Script

```powershell
# Complete test script for Windows PowerShell
cd "c:\Users\bhoomi\Desktop\api_layer"

# 1. Start server (run in separate terminal)
# npm start

# 2. Get token
Write-Host "Getting authentication token..." -ForegroundColor Yellow
$response = curl.exe -s -X GET http://localhost:3002/api/get-token | ConvertFrom-Json
$token = $response.token
Write-Host "Token: $token" -ForegroundColor Green

# 3. Create test image
Write-Host "Creating test image..." -ForegroundColor Yellow
$bytes = [byte[]] (0x89,0x50,0x4E,0x47,0x0D,0x0A,0x1A,0x0A,0x00,0x00,0x00,0x0D,0x49,0x48,0x44,0x52,0x00,0x00,0x00,0x01,0x00,0x00,0x00,0x01,0x08,0x02,0x00,0x00,0x00,0x90,0x77,0x53,0xDE,0x00,0x00,0x00,0x0C,0x49,0x44,0x41,0x54,0x08,0x57,0x63,0xF8,0x00,0x00,0x00,0x01,0x00,0x01,0x5C,0xC2,0x5D,0xB4,0x00,0x00,0x00,0x00,0x49,0x45,0x4E,0x44,0xAE,0x42,0x60,0x82)
[System.IO.File]::WriteAllBytes("test-image.png", $bytes)
Write-Host "Test image created" -ForegroundColor Green

# 4. Upload image
Write-Host "Uploading profile image..." -ForegroundColor Yellow
$uploadResponse = curl.exe -s -X PUT http://localhost:3002/api/profile/image -H "Authorization: Bearer $token" -F "image=@test-image.png"
Write-Host "Upload response: $uploadResponse" -ForegroundColor Green

# 5. Get image info
Write-Host "Getting profile image info..." -ForegroundColor Yellow
$getResponse = curl.exe -s -X GET http://localhost:3002/api/profile/image -H "Authorization: Bearer $token"
Write-Host "Get response: $getResponse" -ForegroundColor Green

# 6. Delete image
Write-Host "Deleting profile image..." -ForegroundColor Yellow
$deleteResponse = curl.exe -s -X DELETE http://localhost:3002/api/profile/image -H "Authorization: Bearer $token"
Write-Host "Delete response: $deleteResponse" -ForegroundColor Green

# 7. Cleanup
Remove-Item "test-image.png" -ErrorAction SilentlyContinue
Write-Host "Test completed!" -ForegroundColor Cyan
```

---

## Error Responses

### 400 - Bad Request (No Image File)
```json
{
  "success": false,
  "message": "No image file provided"
}
```

### 400 - Invalid File Type
```json
{
  "success": false,
  "message": "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed."
}
```

### 413 - File Too Large
```json
{
  "success": false,
  "message": "File too large. Maximum size is 5MB."
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

---

## Features Implemented

✅ **File Upload with Multer**: Handles multipart/form-data
✅ **File Type Validation**: Only allows image files (JPEG, PNG, GIF, WebP)
✅ **File Size Limit**: 5MB maximum
✅ **Unique Filenames**: User ID + timestamp to prevent conflicts
✅ **Database Integration**: Stores image URL in user profile
✅ **Static File Serving**: Images accessible via /uploads/profile-images/
✅ **Old File Cleanup**: Removes old profile image when uploading new one
✅ **Audit Logging**: Logs image upload/delete actions
✅ **Error Handling**: Comprehensive error responses
✅ **RESTful API**: GET, PUT, DELETE operations
✅ **Swagger Documentation**: Full API documentation

---

## Testing with Swagger UI

1. Open http://localhost:3002/api-docs
2. Click "Authorize" button at top right
3. Enter any token (e.g., "test-token-123") in the Value field
4. Find the "User Profile" section
5. Use the PUT /api/profile/image endpoint
6. Upload an image file using the interface

---

## Production Considerations

- In production, consider using cloud storage (AWS S3, Azure Blob, etc.)
- Implement image compression/resizing
- Add virus scanning for uploaded files
- Use CDN for faster image delivery
- Consider image optimization for different sizes (thumbnails, etc.)
- Add rate limiting specifically for file uploads
- Implement proper backup for uploaded files