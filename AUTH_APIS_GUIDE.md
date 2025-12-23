# 🔐 Auth APIs को Swagger UI में कैसे Test करें

## ✅ Current Status:
- ✅ **Login API**: Working (200 OK)
- ✅ **Register API**: Fixed और Working (201 Created) 
- ✅ **Password Validation**: Relaxed (minimum 6 characters)
- ✅ **Token Generation**: Working properly

## 📋 Step-by-Step Testing Guide:

### **Method 1: Swagger UI में Auth APIs Test करें**

#### Step 1: Swagger UI Open करें
🔗 **URL**: https://api-layer.vercel.app/api-docs

#### Step 2: Register New User
1. **Authentication section में `/auth/register` endpoint को expand करें**
2. **"Try it out" पर click करें**
3. **Request body में data fill करें**:
   ```json
   {
     "firstName": "Test",
     "lastName": "User", 
     "email": "test@example.com",
     "password": "password123",
     "employeeNumber": "EMP123"
   }
   ```
4. **"Execute" पर click करें**
5. **Status 201 और success response मिलेगा**

#### Step 3: Login करें
1. **`/auth/login` endpoint को expand करें**
2. **"Try it out" पर click करें**
3. **Login credentials enter करें**:
   ```json
   {
     "email": "admin@company.com",
     "password": "password123"
   }
   ```
4. **"Execute" पर click करें**
5. **Response में token मिलेगा**:
   ```json
   {
     "success": true,
     "message": "Login successful",
     "data": {
       "token": "mock-jwt-token-1765882350748",
       "user": {...}
     }
   }
   ```

#### Step 4: Token Use करें  
1. **Response से token copy करें**
2. **Top right में "Authorize" button पर click करें**
3. **Token paste करें** (बिना "Bearer" word के)
4. **"Authorize" और फिर "Close" पर click करें**

#### Step 5: Protected APIs Test करें
अब सभी protected APIs work करेंगी:
- ✅ `/api/profile` - User profile
- ✅ `/api/dashboard` - Dashboard data  
- ✅ `/api/time-entries` - Time tracking
- ✅ `/api/leave-requests` - Leave management

### **Method 2: Direct API Testing (PowerShell/Terminal)**

```powershell
# Register new user
$registerBody = @{
    firstName = "Test"
    lastName = "User"
    email = "test@example.com" 
    password = "password123"
    employeeNumber = "EMP123"
} | ConvertTo-Json

Invoke-WebRequest -Uri "https://api-layer.vercel.app/auth/register" -Method POST -Body $registerBody -ContentType "application/json"

# Login
$loginBody = @{
    email = "admin@company.com"
    password = "password123"
} | ConvertTo-Json

$loginResponse = Invoke-WebRequest -Uri "https://api-layer.vercel.app/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = ($loginResponse.Content | ConvertFrom-Json).data.token

# Use token for protected API
Invoke-WebRequest -Uri "https://api-layer.vercel.app/api/profile" -Headers @{Authorization = "Bearer $token"}
```

## 🎯 Key Points:

### **Login Credentials:**
- **Email**: `admin@company.com` 
- **Password**: `password123`

### **Password Requirements:**
- **Minimum**: 6 characters (relaxed for testing)
- **No special pattern required** (simplified)

### **Available Auth Endpoints:**
- `POST /auth/register` - Create new user
- `POST /auth/login` - Get authentication token
- `POST /auth/logout` - Logout (if implemented)  
- `POST /auth/refresh` - Refresh token (if implemented)

### **Token Usage:**
- Login से मिला token use करें
- Swagger UI में "Authorize" button से set करें
- सभी protected APIs access हो जाएंगी

## 🔧 Troubleshooting:

1. **Register fails**: Password minimum 6 characters होना चाहिए
2. **Login fails**: `admin@company.com` और `password123` use करें
3. **Token not working**: Login से fresh token generate करें
4. **APIs still 401**: Token properly authorize करना ensure करें

---
**🎉 अब सभी Auth APIs properly working हैं! Register → Login → Token → Protected APIs का flow complete है।**