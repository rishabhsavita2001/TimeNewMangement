# 🚀 Swagger UI API Testing - Complete Guide

## 📍 **Live Swagger URL:** 
https://api-layer.vercel.app/api-docs

## ✅ **API Status: ALL WORKING**

### 🔧 **How to Test APIs in Swagger:**

1. **Open Swagger UI:**
   ```
   https://api-layer.vercel.app/api-docs
   ```

2. **Authorization Setup:**
   - Click the **"Authorize"** button (🔒 lock icon) at the top
   - Enter: `Bearer mock-token-12345`
   - Click **"Authorize"** then **"Close"**

3. **Test Any API:**
   - Find any endpoint (e.g., `/api/me`)  
   - Click **"Try it out"**
   - Click **"Execute"**
   - See the response

### 📋 **Available APIs to Test:**

#### **✅ User Management**
- `GET /api/me` - Get user profile
- `GET /api/user/profile` - Get user profile (alias)
- `GET /api/user/dashboard` - Get dashboard data

#### **✅ Time Tracking**  
- `GET /api/time-entries` - Get time entries
- `GET /api/me/time-entries` - Get my time entries
- `POST /api/me/time-entries` - Create time entry

#### **✅ Leave Management**
- `GET /api/leave-requests` - Get leave requests  
- `GET /api/me/leave-requests` - Get my leave requests
- `POST /api/me/leave-requests` - Create leave request

#### **✅ Reference Data**
- `GET /api/projects` - Get projects list
- `GET /api/leave-types` - Get leave types

#### **✅ System**
- `GET /api/health` - Health check
- `GET /api/test` - API test

### 🎯 **Sample Responses:**

**Profile API Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "employeeNumber": "EMP001",
    "firstName": "Admin",
    "lastName": "User",
    "email": "admin@company.com",
    "tenantName": "Default Company"
  }
}
```

**Time Entries Response:**
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "time_entry_id": 1,
        "entry_date": "2024-12-15",
        "clock_in": "09:00:00",
        "clock_out": "17:00:00",
        "total_hours": 8,
        "project_name": "Web Development"
      }
    ]
  }
}
```

### 🔑 **Authentication Notes:**
- **Production Mode**: All APIs work without token (bypass enabled)
- **Token Format**: `Bearer <any-token>` 
- **Recommended**: Use `Bearer mock-token-12345` for testing
- **Swagger Authorization**: Fully functional for UI testing

### 🎉 **Status: ALL APIs WORKING PERFECTLY!**

**If you're having issues:**
1. Clear browser cache and refresh Swagger UI
2. Try different endpoints to verify functionality  
3. Check browser console for any JavaScript errors
4. All APIs should return 200 OK status