# 🚀 Swagger API Testing Guide

## 📍 Live URLs:
- **Swagger UI:** https://apilayer-6njhumcll-soludoo.vercel.app/api-docs  
- **API JSON:** https://apilayer-6njhumcll-soludoo.vercel.app/api-docs.json

## 🔐 Authentication:
Use this token for testing: `Bearer mock-token-12345`

## 📋 Profile API Testing Steps:

### 1. Open Swagger UI
Navigate to: https://apilayer-6njhumcll-soludoo.vercel.app/api-docs

### 2. Authorize First
1. Click **"Authorize"** button (🔒 icon)
2. Enter: `Bearer mock-token-12345`
3. Click **"Authorize"** then **"Close"**

### 3. Test Profile Endpoints

#### Method 1: `/api/me` endpoint
1. Find **"User Profile"** section
2. Click on **GET `/api/me`**
3. Click **"Try it out"**
4. Click **"Execute"**
5. Check Response (should be 200 OK)

#### Method 2: `/api/user/profile` endpoint  
1. Find **GET `/api/user/profile`**
2. Click **"Try it out"**
3. Click **"Execute"**
4. Check Response (should be 200 OK)

## ✅ Expected Response:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "employeeNumber": "EMP001", 
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@company.com",
    "tenantName": "Default Company",
    "role": "user",
    "isActive": true
  }
}
```

## 🎯 Other Available APIs to Test:
- `/api/health` - Health check
- `/api/test` - API connectivity 
- `/api/user/dashboard` - Dashboard data
- `/api/time-entries` - Time tracking
- `/api/leave-requests` - Leave management  
- `/api/projects` - Projects list

## 🔧 Direct API Testing (Alternative):
```bash
curl -X GET "https://apilayer-6njhumcll-soludoo.vercel.app/api/me" \
  -H "Authorization: Bearer mock-token-12345" \
  -H "Content-Type: application/json"
```

## ✨ Status: All APIs Working! ✅