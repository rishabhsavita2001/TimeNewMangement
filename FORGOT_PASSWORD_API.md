# 🔐 Forgot Password API - Complete Flow

## 📋 API Endpoints:

### 1️⃣ Request OTP
**POST** `/auth/forgot-password`

### 2️⃣ Verify OTP  
**POST** `/auth/verify-otp`

### 3️⃣ Reset Password
**POST** `/auth/reset-password`

---

## 🚀 cURL Commands:

### Step 1: Request OTP
```bash
curl -X 'POST' \
  'https://api-layer.vercel.app/auth/forgot-password' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "OTP sent to your email address",
  "otpForTesting": "1234",
  "expiresIn": "5 minutes"
}
```

### Step 2: Verify OTP
```bash
curl -X 'POST' \
  'https://api-layer.vercel.app/auth/verify-otp' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "otp": "1234"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "resetToken": "reset_1765887886642_abc123xyz"
}
```

### Step 3: Reset Password
```bash
curl -X 'POST' \
  'https://api-layer.vercel.app/auth/reset-password' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "resetToken": "reset_1765887886642_abc123xyz",
    "newPassword": "mynewpassword123",
    "confirmPassword": "mynewpassword123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successfully. You can now login with your new password"
}
```

---

## 🔄 Complete Flow Test:

```bash
# Step 1: Request OTP
RESPONSE1=$(curl -s -X POST https://api-layer.vercel.app/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@example.com"}')

echo "Step 1 Response: $RESPONSE1"
OTP=$(echo $RESPONSE1 | jq -r '.otpForTesting')
echo "Generated OTP: $OTP"

# Step 2: Verify OTP
RESPONSE2=$(curl -s -X POST https://api-layer.vercel.app/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"demo@example.com\",\"otp\":\"$OTP\"}")

echo "Step 2 Response: $RESPONSE2"
RESET_TOKEN=$(echo $RESPONSE2 | jq -r '.resetToken')
echo "Reset Token: $RESET_TOKEN"

# Step 3: Reset Password
RESPONSE3=$(curl -s -X POST https://api-layer.vercel.app/auth/reset-password \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"demo@example.com\",\"resetToken\":\"$RESET_TOKEN\",\"newPassword\":\"newpass123\",\"confirmPassword\":\"newpass123\"}")

echo "Step 3 Response: $RESPONSE3"
```

---

## ⚠️ Error Cases:

### Invalid OTP:
```bash
curl -X 'POST' \
  'https://api-layer.vercel.app/auth/verify-otp' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "otp": "9999"
  }'
```

### Password Mismatch:
```bash
curl -X 'POST' \
  'https://api-layer.vercel.app/auth/reset-password' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "test@example.com",
    "resetToken": "valid_token",
    "newPassword": "pass123",
    "confirmPassword": "different123"
  }'
```

---

## 🎯 Features:

✅ **4-digit OTP generation**  
✅ **OTP expiration** (5 minutes)  
✅ **Failed attempt tracking** (max 3 attempts)  
✅ **Reset token security**  
✅ **Password confirmation**  
✅ **Swagger documentation**  
✅ **Complete error handling**

## 🔗 Swagger UI:
https://api-layer.vercel.app/api-docs

Test करने के लिए Authentication section में forgot password endpoints देखें!