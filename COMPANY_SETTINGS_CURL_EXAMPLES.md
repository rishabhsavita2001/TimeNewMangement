# Company Settings APIs - CURL Examples

## Base URL
```
Production: https://api-layer.vercel.app
Local: http://localhost:3000
```

---

## 🔐 Step 1: Login (Get Authentication Token)

```bash
curl -X POST https://api-layer.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@email.com",
    "password": "password123"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john.doe@email.com",
      "role": "Developer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Note:** Copy the `token` value and use it in the `Authorization: Bearer <token>` header for all subsequent requests.

---

## 📋 Step 2: Get Company Settings

```bash
curl -X GET https://api-layer.vercel.app/api/company/settings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "success": true,
  "message": "Company settings retrieved successfully",
  "data": {
    "company": {
      "id": 1,
      "name": "Acme Inc.",
      "industry": "IT Company",
      "brand_color": "#6366F1",
      "brand_color_name": "Purple",
      "support_email": "Acmeinc@gmail.com",
      "company_phone": "(+1) 740-8521",
      "address": "45 Cloudy Bay, Auckland, NZ",
      "logo_url": "https://ui-avatars.com/api/?name=Acme+Inc&size=200&background=6366F1&color=ffffff",
      "website": "https://acme.inc",
      "timezone": "Pacific/Auckland",
      "founded_date": "2020-01-01",
      "employee_count": 150,
      "description": "Leading technology company providing innovative solutions"
    },
    "permissions": {
      "can_edit": true,
      "can_upload_logo": true,
      "role_required": "admin"
    }
  }
}
```

---

## ✏️ Step 3: Update Company Name

```bash
curl -X PUT https://api-layer.vercel.app/api/company/settings/name \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Inc."
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Company name updated successfully",
  "data": {
    "name": "Acme Inc.",
    "updated_at": "2026-01-23T10:30:00.000Z"
  }
}
```

---

## 🏭 Step 4: Update Industry/Category

```bash
curl -X PUT https://api-layer.vercel.app/api/company/settings/industry \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "industry": "IT Company"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Industry updated successfully",
  "data": {
    "industry": "IT Company",
    "updated_at": "2026-01-23T10:31:00.000Z"
  }
}
```

---

## 🎨 Step 5: Update Brand Color

```bash
curl -X PUT https://api-layer.vercel.app/api/company/settings/brand-color \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "brand_color": "#6366F1",
    "brand_color_name": "Purple"
  }'
```

**For Orange Color:**
```bash
curl -X PUT https://api-layer.vercel.app/api/company/settings/brand-color \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "brand_color": "#F97316",
    "brand_color_name": "Orange"
  }'
```

**For Custom Color:**
```bash
curl -X PUT https://api-layer.vercel.app/api/company/settings/brand-color \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "brand_color": "#8A6307",
    "brand_color_name": "Custom"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Edit brand color successfully updated",
  "data": {
    "brand_color": "#6366F1",
    "brand_color_name": "Purple",
    "updated_at": "2026-01-23T10:32:00.000Z"
  }
}
```

---

## 📧 Step 6: Update Support Email

```bash
curl -X PUT https://api-layer.vercel.app/api/company/settings/support-email \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "support_email": "Acmeinc@gmail.com"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Support email updated successfully",
  "data": {
    "support_email": "Acmeinc@gmail.com",
    "updated_at": "2026-01-23T10:33:00.000Z"
  }
}
```

---

## 📞 Step 7: Update Company Phone

```bash
curl -X PUT https://api-layer.vercel.app/api/company/settings/company-phone \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "company_phone": "(+1) 740-8521"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Company phone updated successfully",
  "data": {
    "company_phone": "(+1) 740-8521",
    "updated_at": "2026-01-23T10:34:00.000Z"
  }
}
```

---

## 🏠 Step 8: Update Address

```bash
curl -X PUT https://api-layer.vercel.app/api/company/settings/address \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "45 Cloudy Bay, Auckland, NZ"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Address updated successfully",
  "data": {
    "address": "45 Cloudy Bay, Auckland, NZ",
    "updated_at": "2026-01-23T10:35:00.000Z"
  }
}
```

---

## 🎨 Step 9: Get Available Brand Colors

```bash
curl -X GET https://api-layer.vercel.app/api/company/brand-colors \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Response:**
```json
{
  "success": true,
  "message": "Brand colors retrieved successfully",
  "data": {
    "colors": [
      { "id": 1, "name": "Blue", "hex": "#3B82F6", "icon": "🔵" },
      { "id": 2, "name": "Purple", "hex": "#6366F1", "icon": "🟣" },
      { "id": 3, "name": "Burgundy", "hex": "#991B1B", "icon": "🟤" },
      { "id": 4, "name": "Red", "hex": "#EF4444", "icon": "🔴" },
      { "id": 5, "name": "Midnight Blue", "hex": "#1E3A8A", "icon": "🔵" },
      { "id": 6, "name": "Orange", "hex": "#F97316", "icon": "🟠" },
      { "id": 7, "name": "Lavender Purple", "hex": "#A78BFA", "icon": "🟣" },
      { "id": 8, "name": "Customize Color", "hex": null, "icon": "🎨" }
    ]
  }
}
```

---

## 📷 Step 10: Upload Company Logo

```bash
curl -X POST https://api-layer.vercel.app/api/company/settings/logo \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "logo_data": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA...",
    "logo_type": "image/png"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Company logo uploaded successfully",
  "data": {
    "logo_url": "https://api-layer.vercel.app/api/company/logo/LOGO_1737628800000",
    "logo_id": "LOGO_1737628800000",
    "updated_at": "2026-01-23T10:40:00.000Z"
  }
}
```

---

## 🔄 Step 11: Update Complete Settings (All at Once)

```bash
curl -X PUT https://api-layer.vercel.app/api/company/settings \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Inc.",
    "industry": "IT Company",
    "brand_color": "#6366F1",
    "brand_color_name": "Purple",
    "support_email": "Acmeinc@gmail.com",
    "company_phone": "(+1) 740-8521",
    "address": "45 Cloudy Bay, Auckland, NZ",
    "website": "https://acme.inc",
    "description": "Leading technology company"
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "Company settings updated successfully",
  "data": {
    "company": {
      "id": 1,
      "name": "Acme Inc.",
      "industry": "IT Company",
      "brand_color": "#6366F1",
      "brand_color_name": "Purple",
      "support_email": "Acmeinc@gmail.com",
      "company_phone": "(+1) 740-8521",
      "address": "45 Cloudy Bay, Auckland, NZ",
      "logo_url": "https://ui-avatars.com/api/?name=Acme+Inc&size=200&background=6366F1&color=ffffff",
      "website": "https://acme.inc",
      "timezone": "Pacific/Auckland",
      "founded_date": "2020-01-01",
      "employee_count": 150,
      "description": "Leading technology company",
      "updated_at": "2026-01-23T10:45:00.000Z"
    }
  }
}
```

---

## 📝 Complete Flow Example (Step by Step)

### 1. Login
```bash
TOKEN=$(curl -s -X POST https://api-layer.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@email.com","password":"password123"}' \
  | grep -o '"token":"[^"]*' | cut -d'"' -f4)

echo "Token: $TOKEN"
```

### 2. Get Current Settings
```bash
curl -X GET https://api-layer.vercel.app/api/company/settings \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Update All Fields
```bash
# Update Company Name
curl -X PUT https://api-layer.vercel.app/api/company/settings/name \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Acme Inc."}'

# Update Industry
curl -X PUT https://api-layer.vercel.app/api/company/settings/industry \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"industry":"IT Company"}'

# Update Brand Color
curl -X PUT https://api-layer.vercel.app/api/company/settings/brand-color \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"brand_color":"#F97316","brand_color_name":"Orange"}'

# Update Support Email
curl -X PUT https://api-layer.vercel.app/api/company/settings/support-email \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"support_email":"Acmeinc@gmail.com"}'

# Update Company Phone
curl -X PUT https://api-layer.vercel.app/api/company/settings/company-phone \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"company_phone":"(+1) 740-8521"}'

# Update Address
curl -X PUT https://api-layer.vercel.app/api/company/settings/address \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"address":"45 Cloudy Bay, Auckland, NZ"}'
```

### 4. Verify Final Settings
```bash
curl -X GET https://api-layer.vercel.app/api/company/settings \
  -H "Authorization: Bearer $TOKEN"
```

---

## 🎯 API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/company/settings` | Get all company settings |
| PUT | `/api/company/settings` | Update all settings at once |
| PUT | `/api/company/settings/name` | Update company name |
| PUT | `/api/company/settings/industry` | Update industry/category |
| PUT | `/api/company/settings/brand-color` | Update brand color |
| PUT | `/api/company/settings/support-email` | Update support email |
| PUT | `/api/company/settings/company-phone` | Update company phone |
| PUT | `/api/company/settings/address` | Update address |
| POST | `/api/company/settings/logo` | Upload company logo |
| GET | `/api/company/brand-colors` | Get available brand colors |

---

## 🔑 Authentication Notes

1. All company settings APIs require authentication
2. Use `Authorization: Bearer <token>` header
3. Token expires in 24 hours
4. Get token from `/api/auth/login` endpoint

## ✅ Status Codes

- **200**: Success
- **400**: Bad request (missing/invalid data)
- **401**: Unauthorized (missing/invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not found
- **500**: Server error

---

## 🚀 Quick Test (PowerShell)

```powershell
# Run the test script
.\test_company_settings.ps1
```

## 🚀 Quick Test (Bash)

```bash
# Login and get token
TOKEN=$(curl -s -X POST https://api-layer.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john.doe@email.com","password":"password123"}' \
  | jq -r '.data.token')

# Test all endpoints
echo "Testing Company Settings APIs..."
curl -H "Authorization: Bearer $TOKEN" https://api-layer.vercel.app/api/company/settings
curl -H "Authorization: Bearer $TOKEN" https://api-layer.vercel.app/api/company/brand-colors
```

---

**Created:** January 23, 2026  
**Version:** 1.0  
**Author:** API Layer Team
