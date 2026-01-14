# 📋 API Payload Examples - Mobile App Integration

## 🔐 SIGN-IN API (Login)

### Endpoint: `POST /api/auth/login`
**URL**: https://api-layer.vercel.app/api/auth/login

### Request Payload:
```json
{
  "email": "admin@company.com",
  "password": "password123"
}
```

### Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "tenantId": 1,
      "employeeNumber": "EMP001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "admin@company.com",
      "tenantName": "Demo Company"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Mobile App Integration Example:
```javascript
// Sign-in API call for mobile app
const signIn = async (email, password) => {
  try {
    const response = await fetch('https://api-layer.vercel.app/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Store token for future API calls
      localStorage.setItem('authToken', result.data.token);
      localStorage.setItem('userInfo', JSON.stringify(result.data.user));
      return { success: true, user: result.data.user, token: result.data.token };
    } else {
      return { success: false, message: result.message };
    }
  } catch (error) {
    return { success: false, message: 'Network error' };
  }
};
```

### Error Responses:
```json
// Missing credentials
{
  "success": false,
  "message": "Email and password required"
}

// Invalid credentials  
{
  "success": false,
  "message": "Invalid email or password"
}
```

## � FORGOT PASSWORD FLOW

### Step 1: Request OTP
**Endpoint**: `POST /api/auth/forgot-password`  
**URL**: https://api-layer.vercel.app/api/auth/forgot-password

#### Request Payload:
```json
{
  "email": "jenny.wilson@email.com"
}
```

#### Response:
```json
{
  "success": true,
  "message": "Verification code sent to your email address",
  "expiresIn": "5 minutes",
  "otpForTesting": "1234"
}
```

### Step 2: Verify OTP
**Endpoint**: `POST /api/auth/verify-otp`  
**URL**: https://api-layer.vercel.app/api/auth/verify-otp

#### Request Payload:
```json
{
  "email": "jenny.wilson@email.com",
  "otp": "1234"
}
```

#### Response:
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "resetToken": "reset_1768372640_jenny_wilson_email_com",
  "expiresIn": "15 minutes"
}
```

### Step 3: Reset Password
**Endpoint**: `POST /api/auth/reset-password`  
**URL**: https://api-layer.vercel.app/api/auth/reset-password

#### Request Payload:
```json
{
  "email": "jenny.wilson@email.com",
  "resetToken": "reset_1768372640_jenny_wilson_email_com",
  "newPassword": "mynewpassword123",
  "confirmPassword": "mynewpassword123"
}
```

#### Response:
```json
{
  "success": true,
  "message": "Password reset successfully. You can now login with your new password",
  "emailSent": true
}
```

### Mobile App Integration Example:
```javascript
// Complete forgot password flow for mobile app
class ForgotPasswordService {
  
  // Step 1: Request OTP
  static async requestOTP(email) {
    try {
      const response = await fetch('https://api-layer.vercel.app/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  }
  
  // Step 2: Verify OTP
  static async verifyOTP(email, otp) {
    try {
      const response = await fetch('https://api-layer.vercel.app/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  }
  
  // Step 3: Reset Password
  static async resetPassword(email, resetToken, newPassword, confirmPassword) {
    try {
      const response = await fetch('https://api-layer.vercel.app/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, resetToken, newPassword, confirmPassword })
      });
      return await response.json();
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  }
}
```

### Error Responses:
```json
// Step 1 - Missing email
{
  "success": false,
  "message": "Email is required"
}

// Step 2 - Invalid OTP
{
  "success": false,
  "message": "Invalid OTP. 2 attempts remaining."
}

// Step 2 - OTP expired
{
  "success": false,
  "message": "OTP has expired. Please request a new one."
}

// Step 3 - Passwords don't match
{
  "success": false,
  "message": "Passwords do not match"
}

// Step 3 - Reset token expired
{
  "success": false,
  "message": "Reset token has expired. Please start the process again."
}
```

## �🔐 Authentication (Required for all protected APIs)
```javascript
Headers: {
  'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  'Content-Type': 'application/json'
}
```

---

## 1️⃣ START WORKING API

### Endpoint: `POST /api/me/timer/start`

### Request Payload:
```json
{
  "projectId": 1,
  "locationId": 1,
  "notes": "Starting work on mobile app features"
}
```

### Response:
```json
{
  "success": true,
  "message": "Timer started successfully",
  "data": {
    "timerId": "timer_1_1736582400000",
    "startTime": "2026-01-11T09:00:00.000Z",
    "project": {
      "id": 1,
      "name": "Project A"
    },
    "location": {
      "id": 1,
      "name": "Office",
      "icon": "🏢"
    },
    "notes": "Starting work on mobile app features",
    "isRunning": true
  }
}
```

### cURL Example:
```bash
curl -X POST https://api-layer.vercel.app/api/me/timer/start \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": 1,
    "locationId": 1,
    "notes": "Starting work"
  }'
```

---

## 2️⃣ TAKE A BREAK API (Pause Timer)

### Endpoint: `POST /api/me/timer/break`

### Request Payload:
```json
{
  "breakType": "Lunch break",
  "breakTypeId": 2,
  "notes": "Time for lunch!"
}
```

### Response:
```json
{
  "success": true,
  "message": "Break started successfully",
  "data": {
    "breakType": "Lunch break",
    "breakIcon": "🍽️",
    "breakTypeId": 2,
    "breakNotes": "Time for lunch!",
    "pausedAt": "2026-01-11T13:00:00.000Z",
    "workDurationBeforeBreak": "4h 15m",
    "status": "on_break"
  }
}
```

### cURL Example:
```bash
curl -X POST https://api-layer.vercel.app/api/me/timer/break \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "breakType": "Lunch break",
    "breakTypeId": 2,
    "notes": "Time for lunch!"
  }'
```

---

## 3️⃣ LOCATIONS API (For Dropdown)

### Endpoint: `GET /api/locations`

### Request:
```javascript
// No body needed - just GET request
GET https://api-layer.vercel.app/api/locations
Headers: {
  'Authorization': 'Bearer YOUR_TOKEN'
}
```

### Response:
```json
{
  "success": true,
  "message": "Work locations retrieved successfully",
  "data": {
    "locations": [
      {
        "id": 1,
        "name": "Office",
        "description": "Main office location",
        "icon": "🏢",
        "address": "Company Headquarters"
      },
      {
        "id": 2,
        "name": "Home",
        "description": "Work from home",
        "icon": "🏠",
        "address": "Remote - Home Office"
      },
      {
        "id": 3,
        "name": "Client Site",
        "description": "At client premises",
        "icon": "🏬",
        "address": "Client Office Location"
      },
      {
        "id": 4,
        "name": "Remote",
        "description": "Other remote location",
        "icon": "🌍",
        "address": "Any Remote Location"
      }
    ],
    "total": 4
  }
}
```

### How to use in Mobile App:
```javascript
// Fetch locations for dropdown
const response = await fetch('https://api-layer.vercel.app/api/locations', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { locations } = response.data;

// Populate dropdown
locations.forEach(loc => {
  dropdown.addItem({
    label: loc.name,
    value: loc.id,
    icon: loc.icon
  });
});
```

---

## 4️⃣ BREAK TYPES API (For Dropdown)

### Endpoint: `GET /api/break-types`

### Request:
```javascript
// No body needed - just GET request
GET https://api-layer.vercel.app/api/break-types
Headers: {
  'Authorization': 'Bearer YOUR_TOKEN'
}
```

### Response:
```json
{
  "success": true,
  "message": "Break types retrieved successfully",
  "data": {
    "breakTypes": [
      {
        "id": 1,
        "name": "Coffee break",
        "icon": "☕",
        "description": "Quick coffee or snack break",
        "suggestedDuration": 15
      },
      {
        "id": 2,
        "name": "Lunch break",
        "icon": "🍽️",
        "description": "Lunch time",
        "suggestedDuration": 60
      },
      {
        "id": 3,
        "name": "Personal break",
        "icon": "🚶",
        "description": "Personal time or errands",
        "suggestedDuration": 30
      },
      {
        "id": 4,
        "name": "Other",
        "icon": "⏸️",
        "description": "Other break reason",
        "suggestedDuration": 20
      }
    ],
    "total": 4
  }
}
```

### How to use in Mobile App:
```javascript
// Fetch break types for dropdown
const response = await fetch('https://api-layer.vercel.app/api/break-types', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { breakTypes } = response.data;

// Populate dropdown
breakTypes.forEach(type => {
  dropdown.addItem({
    label: `${type.icon} ${type.name}`,
    value: type.id,
    duration: type.suggestedDuration
  });
});
```

---

## 5️⃣ PROJECTS API (User-Specific)

### Endpoint: `GET /api/me/projects`

### Request:
```javascript
GET https://api-layer.vercel.app/api/me/projects
Headers: {
  'Authorization': 'Bearer YOUR_TOKEN'
}
```

### Response:
```json
{
  "success": true,
  "message": "User projects retrieved successfully",
  "data": {
    "projects": [
      {
        "id": 1,
        "name": "Project A",
        "description": "Development and design work",
        "color": "#4CAF50",
        "status": "active",
        "role": "developer"
      },
      {
        "id": 5,
        "name": "Mobile App",
        "description": "Mobile application development",
        "color": "#E91E63",
        "status": "active",
        "role": "mobile-dev"
      }
    ],
    "total": 2,
    "userId": 1
  }
}
```

---

## 🔄 COMPLETE MOBILE APP FLOW

### Flow 1: Start Working
```javascript
// 1. Get user's projects
const projects = await GET('/api/me/projects');

// 2. Get locations
const locations = await GET('/api/locations');

// 3. User selects: Project A + Office
// 4. Start timer
await POST('/api/me/timer/start', {
  projectId: 1,      // Project A
  locationId: 1,     // Office
  notes: "Working on features"
});
```

### Flow 2: Take a Break
```javascript
// 1. Get break types
const breakTypes = await GET('/api/break-types');

// 2. User selects: Lunch break + adds note
// 3. Start break
await POST('/api/me/timer/break', {
  breakType: "Lunch break",
  breakTypeId: 2,
  notes: "Time for lunch!"
});
```

### Flow 3: Resume Work
```javascript
// Resume after break
await POST('/api/me/timer/resume', {
  resumeReason: "Back from lunch"
});
```

---

## ⚠️ ERROR RESPONSES

### Timer Already Running:
```json
{
  "success": false,
  "message": "Timer already running. Stop current timer first.",
  "data": {
    "currentTimer": {
      "timerId": "timer_1_1736582400000",
      "startTime": "2026-01-11T09:00:00.000Z",
      "isRunning": true
    }
  }
}
```

### No Active Timer for Break:
```json
{
  "success": false,
  "message": "No running timer found to pause"
}
```

### Invalid Project/Location:
```json
{
  "success": false,
  "message": "Invalid projectId or locationId"
}
```

---

## 📱 QUICK REFERENCE

| API | Method | Auth Required | Body Parameters |
|-----|--------|---------------|-----------------|
| Start Timer | POST /api/me/timer/start | ✅ | projectId, locationId, notes |
| Take Break | POST /api/me/timer/break | ✅ | breakType, breakTypeId, notes |
| Resume Work | POST /api/me/timer/resume | ✅ | resumeReason |
| Get Projects | GET /api/me/projects | ✅ | None |
| Get Locations | GET /api/locations | ❌ | None |
| Get Break Types | GET /api/break-types | ✅ | None |
| Timer Status | GET /api/me/timer | ✅ | None |

---

## 🚀 Base URL
```
Production: https://api-layer.vercel.app/api
```

**All APIs are live and tested! ✅**