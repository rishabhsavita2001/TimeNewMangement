# 🔐 Logout/Sign Out API Implementation Guide

## Overview
A new **Sign Out / Logout API endpoint** has been successfully implemented and deployed to the live Vercel server.

## API Details

### Endpoint
```
POST /api/auth/logout
```

### URL
```
https://api-layer.vercel.app/api/auth/logout
```

### Authentication
✅ **Required**: Bearer Token (JWT)
- Get token from: `https://api-layer.vercel.app/api/get-token`

### Request Headers
```json
{
  "Authorization": "Bearer <JWT_TOKEN>",
  "Content-Type": "application/json"
}
```

### Request Body
```json
{}
```
(Empty body - authentication is done via Bearer token)

### Success Response (200 OK)
```json
{
  "success": true,
  "message": "Your sign out success",
  "data": {
    "userId": 1,
    "loggedOutAt": "2025-12-30T10:30:45.123Z",
    "status": "logged_out"
  }
}
```

### Error Responses

#### 401 Unauthorized (No Token)
```json
{
  "success": false,
  "message": "Access token required. Use /api/get-token to get a test token.",
  "hint": "Add Authorization header: Bearer <token>"
}
```

#### 403 Forbidden (Invalid Token)
```json
{
  "success": false,
  "message": "Invalid or expired token. Get a new token from /api/get-token"
}
```

## Step-by-Step Testing

### 1. Get Bearer Token
```bash
curl -X GET "https://api-layer.vercel.app/api/get-token"
```

**Response:**
```json
{
  "success": true,
  "message": "Test Bearer token generated successfully",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "userId": 1,
      "firstName": "Test",
      "lastName": "User",
      "email": "test@example.com",
      "role": "employee"
    },
    "expiresIn": "24 hours",
    "usage": "Add this token in Authorization header as: Bearer ..."
  }
}
```

### 2. Call Logout API with Token
```bash
curl -X POST "https://api-layer.vercel.app/api/auth/logout" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json"
```

**Response:**
```json
{
  "success": true,
  "message": "Your sign out success",
  "data": {
    "userId": 1,
    "loggedOutAt": "2025-12-30T10:30:45.123Z",
    "status": "logged_out"
  }
}
```

## Testing via Swagger UI

1. **Open Swagger UI**: https://api-layer.vercel.app/api-docs
2. **Get Token**: 
   - Find endpoint: GET `/api/get-token`
   - Click "Try it out"
   - Click "Execute"
   - Copy the `token` from response
3. **Authorize in Swagger**:
   - Click "Authorize" button (top right)
   - Paste: `Bearer YOUR_TOKEN_HERE`
   - Click "Authorize"
4. **Test Logout**:
   - Find endpoint: POST `/api/auth/logout`
   - Click "Try it out"
   - Click "Execute"
   - Should see success response

## API Feature Summary

### ✅ Implemented
- [x] Logout endpoint with Bearer token authentication
- [x] Proper error handling (401, 403 status codes)
- [x] JWT token validation
- [x] Swagger documentation
- [x] Live deployment to Vercel
- [x] Response message: "Your sign out success" (as per your screenshot)

### 📝 Response Details
- **userId**: User ID of logged-out user
- **loggedOutAt**: ISO timestamp of logout time
- **status**: "logged_out" status indication

## Integration Example (JavaScript)

```javascript
// Step 1: Get Bearer Token
async function getToken() {
  const response = await fetch('https://api-layer.vercel.app/api/get-token', {
    method: 'GET'
  });
  const data = await response.json();
  return data.data.token;
}

// Step 2: Logout using token
async function logout(token) {
  const response = await fetch('https://api-layer.vercel.app/api/auth/logout', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  const data = await response.json();
  
  if (data.success) {
    console.log('✅ ' + data.message);
    console.log('Logged out at:', data.data.loggedOutAt);
  }
  
  return data;
}

// Usage
const token = await getToken();
const result = await logout(token);
```

## Integration Example (React/Flutter Mobile)

```javascript
// For your React/Flutter app
const handleSignOut = async (token) => {
  try {
    const response = await fetch('https://api-layer.vercel.app/api/auth/logout', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Show success message matching your screenshot
      showAlert('Your sign out success'); // ✅ Matches your UI
      
      // Clear local storage/SharedPreferences
      clearUserData();
      
      // Navigate to login screen
      navigation.navigate('LoginScreen');
    } else {
      showAlert('Sign out failed');
    }
  } catch (error) {
    showAlert('Error: ' + error.message);
  }
};
```

## Live API Status

🌍 **Domain**: https://api-layer.vercel.app  
📚 **API Docs**: https://api-layer.vercel.app/api-docs  
✅ **Deployment Status**: Active on Vercel  
📍 **Git Commit**: `a10d6d6` - "Update vercel.json to use server.js and add test files for logout API"

## Files Modified

1. **server.js**
   - Added POST `/api/auth/logout` endpoint with JWT authentication
   - Added Swagger documentation for logout endpoint
   - Properly integrated with authentication middleware

2. **vercel.json**
   - Updated to use `server.js` instead of `index.js`
   - Ensures correct deployment routing

## Important Notes

✅ **No breaking changes** - All existing APIs remain intact  
✅ **Backward compatible** - Works with existing auth system  
✅ **Production ready** - Live on Vercel, fully tested  
✅ **Swagger documented** - Available in /api-docs  

## Next Steps

1. ✅ API is live and working
2. ✅ Swagger UI updated with logout endpoint
3. ✅ Ready for mobile app integration
4. Test with your React/Flutter app using the token flow above

---

**Created**: December 30, 2025  
**Status**: ✅ Live & Working
