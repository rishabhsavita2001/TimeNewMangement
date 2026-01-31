# 4-Phase Company Registration API Guide

## Overview
Company registration process ko 4 phases mein divide kiya gaya hai. Har phase ka apna endpoint hai aur data temporary store hota hai session ID ke through.

---

## 🔹 PHASE 1: Company Information

### Endpoint
```
POST /api/auth/company-registration/step-1
```

### Request Body
```json
{
  "company_name": "InnoTech Solutions",
  "company_email": "info@innotech.com",
  "country": "United States",
  "timezone": "America/New_York"
}
```

### Response
```json
{
  "success": true,
  "message": "Company information saved successfully",
  "data": {
    "session_id": "REG_1769759241701_6gul1zfhn",
    "current_step": 1,
    "next_step": 2,
    "completed_data": {
      "company_name": "InnoTech Solutions",
      "company_email": "info@innotech.com",
      "country": "United States",
      "timezone": "America/New_York"
    },
    "expires_at": "2026-01-30T08:17:21.701Z"
  }
}
```

**Important:** Save the `session_id` - ye next steps ke liye required hai!

---

## 🔹 PHASE 2: Work Model Configuration

### Endpoint
```
POST /api/auth/company-registration/step-2
```

### Request Body
```json
{
  "session_id": "REG_1769759241701_6gul1zfhn",
  "default_work_model": "hybrid",
  "working_hours_per_day": 8,
  "working_days_per_week": 5,
  "default_break_duration": 60,
  "overtime_calculation": "daily"
}
```

### Valid Options
- **default_work_model**: `office`, `remote`, `hybrid`
- **working_hours_per_day**: 1-24 (number)
- **working_days_per_week**: 1-7 (number)
- **default_break_duration**: Minutes (number)
- **overtime_calculation**: `daily`, `weekly`, `monthly`

### Response
```json
{
  "success": true,
  "message": "Work model configuration saved successfully",
  "data": {
    "session_id": "REG_1769759241701_6gul1zfhn",
    "current_step": 2,
    "next_step": 3,
    "completed_data": {
      "company_info": {...},
      "work_model": {...}
    }
  }
}
```

---

## 🔹 PHASE 3: Admin Account Setup

### Endpoint
```
POST /api/auth/company-registration/step-3
```

### Request Body
```json
{
  "session_id": "REG_1769759241701_6gul1zfhn",
  "full_name": "David Anderson",
  "email_address": "david.anderson@innotech.com",
  "password": "SecurePass123",
  "confirm_password": "SecurePass123"
}
```

### Validation Rules
- ✅ Password minimum 6 characters
- ✅ Password and confirm_password must match
- ✅ Email must be valid format
- ✅ Email must not already exist
- ✅ Full name will be split into first_name and last_name

### Response
```json
{
  "success": true,
  "message": "Admin account details saved successfully",
  "data": {
    "session_id": "REG_1769759241701_6gul1zfhn",
    "current_step": 3,
    "next_step": 4,
    "completed_data": {
      "company_info": {...},
      "work_model": {...},
      "admin_account": {
        "full_name": "David Anderson",
        "email_address": "david.anderson@innotech.com"
      }
    }
  }
}
```

---

## 🔹 PHASE 4: Review and Finish

### Step 4a: Review (GET) - Optional
Sabhi filled data ko review karne ke liye:

```
GET /api/auth/company-registration/review/:session_id
```

### Example
```bash
curl --location 'http://localhost:3000/api/auth/company-registration/review/REG_1769759241701_6gul1zfhn'
```

### Response
```json
{
  "success": true,
  "message": "Registration data retrieved successfully",
  "data": {
    "session_id": "REG_1769759241701_6gul1zfhn",
    "current_step": 3,
    "company_info": {...},
    "work_model": {...},
    "admin_account": {...},
    "is_complete": true
  }
}
```

---

### Step 4b: Create Company (POST)

### Endpoint
```
POST /api/auth/company-registration/step-4
```

### Request Body
```json
{
  "session_id": "REG_1769759241701_6gul1zfhn"
}
```

### Response
```json
{
  "success": true,
  "message": "Company registration completed successfully",
  "data": {
    "company": {
      "id": 61764,
      "name": "InnoTech Solutions",
      "email": "info@innotech.com",
      "country": "United States",
      "timezone": "America/New_York",
      "logo_url": "...",
      "work_settings": {
        "default_work_model": "hybrid",
        "working_hours_per_day": 8,
        "working_days_per_week": 5,
        "default_break_duration": 60,
        "overtime_calculation": "daily"
      },
      "subscription_plan": "trial",
      "trial_expires": "2026-03-01T07:48:11.253Z"
    },
    "admin": {
      "id": 4,
      "name": "David Anderson",
      "email": "david.anderson@innotech.com",
      "role": "Admin",
      "employee_id": "ADM004"
    },
    "token": "eyJhbGci...",
    "auto_login": true
  }
}
```

**Important:** 
- ✅ Company successfully create ho gaya
- ✅ Admin user successfully create ho gaya
- ✅ Authentication token return ho gaya (use for auto-login)
- ✅ 30 days free trial activate ho gaya
- ✅ Temporary session data automatically delete ho gaya

---

## 📋 Complete Flow Example

```bash
# Step 1: Company Info
SESSION_ID=$(curl -s -X POST 'http://localhost:3000/api/auth/company-registration/step-1' \
  -H 'Content-Type: application/json' \
  -d '{
    "company_name": "InnoTech Solutions",
    "company_email": "info@innotech.com",
    "country": "United States",
    "timezone": "America/New_York"
  }' | jq -r '.data.session_id')

echo "Session ID: $SESSION_ID"

# Step 2: Work Model
curl -X POST 'http://localhost:3000/api/auth/company-registration/step-2' \
  -H 'Content-Type: application/json' \
  -d "{
    \"session_id\": \"$SESSION_ID\",
    \"default_work_model\": \"hybrid\",
    \"working_hours_per_day\": 8,
    \"working_days_per_week\": 5,
    \"default_break_duration\": 60,
    \"overtime_calculation\": \"daily\"
  }"

# Step 3: Admin Account
curl -X POST 'http://localhost:3000/api/auth/company-registration/step-3' \
  -H 'Content-Type: application/json' \
  -d "{
    \"session_id\": \"$SESSION_ID\",
    \"full_name\": \"David Anderson\",
    \"email_address\": \"david.anderson@innotech.com\",
    \"password\": \"SecurePass123\",
    \"confirm_password\": \"SecurePass123\"
  }"

# Step 4a: Review (Optional)
curl "http://localhost:3000/api/auth/company-registration/review/$SESSION_ID"

# Step 4b: Create Company
TOKEN=$(curl -s -X POST 'http://localhost:3000/api/auth/company-registration/step-4' \
  -H 'Content-Type: application/json' \
  -d "{
    \"session_id\": \"$SESSION_ID\"
  }" | jq -r '.data.token')

echo "Token: $TOKEN"
```

---

## ⚠️ Important Notes

### Session Management
- ✅ Session ID har step ke liye required hai (Step 1 ke baad)
- ✅ Session automatically 30 minutes mein expire ho jata hai
- ✅ Expired session ka data automatically delete ho jata hai
- ✅ Step 4 complete hone ke baad session data clean up ho jata hai

### Validation Rules
- ✅ Har step ko sequence mein complete karna mandatory hai
- ✅ Step 2 ke liye Step 1 complete hona chahiye
- ✅ Step 3 ke liye Step 1 & 2 complete hone chahiye
- ✅ Step 4 ke liye sabhi steps (1, 2, 3) complete hone chahiye

### Error Handling
- ❌ Invalid session_id → "Invalid or expired registration session"
- ❌ Expired session → "Registration session expired"
- ❌ Missing required fields → List of required fields
- ❌ Email already exists → "Admin email already exists"
- ❌ Password mismatch → "Passwords do not match"
- ❌ Steps not completed → "Please complete previous steps first"

---

## 🎯 Features

### Auto-Generated Data
- ✅ Company logo (based on company name)
- ✅ Admin profile photo (based on full name)
- ✅ Employee ID (ADM001, ADM002, etc.)
- ✅ Company ID (random 5-digit number)
- ✅ 30-day trial subscription

### Work Settings Stored
- ✅ Default work model (office/remote/hybrid)
- ✅ Working hours per day
- ✅ Working days per week
- ✅ Default break duration
- ✅ Overtime calculation method

### Security
- ✅ Session expires in 30 minutes
- ✅ Email validation
- ✅ Password strength validation
- ✅ Duplicate email check
- ✅ JWT token generation for auto-login

---

## 📱 Frontend Integration Tips

```javascript
// Store session_id in state/context after Step 1
const [sessionId, setSessionId] = useState(null);
const [currentStep, setCurrentStep] = useState(1);

// Step 1
const handleStep1 = async (formData) => {
  const response = await fetch('/api/auth/company-registration/step-1', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  const data = await response.json();
  setSessionId(data.data.session_id);
  setCurrentStep(2);
};

// Step 2
const handleStep2 = async (formData) => {
  const response = await fetch('/api/auth/company-registration/step-2', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...formData, session_id: sessionId })
  });
  const data = await response.json();
  setCurrentStep(3);
};

// Step 3
const handleStep3 = async (formData) => {
  const response = await fetch('/api/auth/company-registration/step-3', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...formData, session_id: sessionId })
  });
  const data = await response.json();
  setCurrentStep(4);
};

// Step 4 - Review
const loadReviewData = async () => {
  const response = await fetch(`/api/auth/company-registration/review/${sessionId}`);
  const data = await response.json();
  return data.data;
};

// Step 4 - Create
const handleFinalCreate = async () => {
  const response = await fetch('/api/auth/company-registration/step-4', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ session_id: sessionId })
  });
  const data = await response.json();
  
  // Store token and redirect to dashboard
  localStorage.setItem('token', data.data.token);
  window.location.href = '/dashboard';
};
```

---

## 🎉 Success!

Ye 4-phase registration system successfully implement ho gaya hai! Ab aap easily step-by-step company registration kar sakte ho with proper validation and session management.
