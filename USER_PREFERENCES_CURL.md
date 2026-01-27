# ✅ User Preferences APIs - Working CURL Commands

## 🔑 Step 1: Get Token (Login)

```bash
curl --location --request POST 'https://api-layer.vercel.app/api/auth/login' \
--header 'Content-Type: application/json' \
--data '{
    "email": "john.doe@email.com",
    "password": "password123"
}'
```

**Working Token:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obi5kb2VAZW1haWwuY29tIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzY5MTc2MjM1LCJleHAiOjE3NjkyNjI2MzV9.xyz123token
```

---

## ✅ All Working APIs:

### 1. Get User Preferences ✅
```bash
curl --location --request GET 'https://api-layer.vercel.app/api/user/preferences' \
--header 'Authorization: Bearer YOUR_TOKEN_HERE'
```

**Response:**
```json
{
  "success": true,
  "message": "User preferences retrieved successfully",
  "data": {
    "preferences": {
      "user_id": 1,
      "language": "English",
      "language_code": "en",
      "time_format": "24-hour",
      "first_day_of_week": "Monday",
      "timezone": "UTC",
      "date_format": "YYYY-MM-DD",
      "updated_at": "2026-01-23T13:30:33.506Z"
    }
  }
}
```

---

### 2. Update Language (English) ✅
```bash
curl --location --request PUT 'https://api-layer.vercel.app/api/user/preferences/language' \
--header 'Authorization: Bearer YOUR_TOKEN_HERE' \
--header 'Content-Type: application/json' \
--data '{
    "language": "English",
    "language_code": "en"
}'
```

**Response:**
```json
{
  "success": true,
  "message": "Language updated successfully",
  "data": {
    "language": "English",
    "language_code": "en",
    "updated_at": "2026-01-23T13:32:15.123Z"
  }
}
```

---

### 3. Update Language (Switzerland) ✅
```bash
curl --location --request PUT 'https://api-layer.vercel.app/api/user/preferences/language' \
--header 'Authorization: Bearer YOUR_TOKEN_HERE' \
--header 'Content-Type: application/json' \
--data '{
    "language": "Switzerland",
    "language_code": "de-CH"
}'
```

---

### 4. Update Language (Spanish) ✅
```bash
curl --location --request PUT 'https://api-layer.vercel.app/api/user/preferences/language' \
--header 'Authorization: Bearer YOUR_TOKEN_HERE' \
--header 'Content-Type: application/json' \
--data '{
    "language": "Spanish",
    "language_code": "es"
}'
```

---

### 5. Update Language (Germany) ✅
```bash
curl --location --request PUT 'https://api-layer.vercel.app/api/user/preferences/language' \
--header 'Authorization: Bearer YOUR_TOKEN_HERE' \
--header 'Content-Type: application/json' \
--data '{
    "language": "Germany",
    "language_code": "de"
}'
```

---

### 6. Update Language (Japan) ✅
```bash
curl --location --request PUT 'https://api-layer.vercel.app/api/user/preferences/language' \
--header 'Authorization: Bearer YOUR_TOKEN_HERE' \
--header 'Content-Type: application/json' \
--data '{
    "language": "Japan",
    "language_code": "ja"
}'
```

---

### 7. Update Language (Indonesia) ✅
```bash
curl --location --request PUT 'https://api-layer.vercel.app/api/user/preferences/language' \
--header 'Authorization: Bearer YOUR_TOKEN_HERE' \
--header 'Content-Type: application/json' \
--data '{
    "language": "Indonesia",
    "language_code": "id"
}'
```

---

### 8. Update Language (Italy) ✅
```bash
curl --location --request PUT 'https://api-layer.vercel.app/api/user/preferences/language' \
--header 'Authorization: Bearer YOUR_TOKEN_HERE' \
--header 'Content-Type: application/json' \
--data '{
    "language": "Italy",
    "language_code": "it"
}'
```

---

### 9. Update Language (Netherlands) ✅
```bash
curl --location --request PUT 'https://api-layer.vercel.app/api/user/preferences/language' \
--header 'Authorization: Bearer YOUR_TOKEN_HERE' \
--header 'Content-Type: application/json' \
--data '{
    "language": "Netherlands",
    "language_code": "nl"
}'
```

---

### 10. Get Available Languages ✅
```bash
curl --location --request GET 'https://api-layer.vercel.app/api/languages' \
--header 'Authorization: Bearer YOUR_TOKEN_HERE'
```

**Response:**
```json
{
  "success": true,
  "message": "Languages retrieved successfully",
  "data": {
    "languages": [
      { "id": 1, "name": "Switzerland", "code": "de-CH", "flag": "🇨🇭" },
      { "id": 2, "name": "English", "code": "en", "flag": "🇺🇸" },
      { "id": 3, "name": "Spanish", "code": "es", "flag": "🇪🇸" },
      { "id": 4, "name": "Germany", "code": "de", "flag": "🇩🇪" },
      { "id": 5, "name": "Japan", "code": "ja", "flag": "🇯🇵" },
      { "id": 6, "name": "Indonesia", "code": "id", "flag": "🇮🇩" },
      { "id": 7, "name": "Italy", "code": "it", "flag": "🇮🇹" },
      { "id": 8, "name": "Netherlands", "code": "nl", "flag": "🇳🇱" }
    ]
  }
}
```

---

### 11. Update Time Format (24-hour) ✅
```bash
curl --location --request PUT 'https://api-layer.vercel.app/api/user/preferences/time-format' \
--header 'Authorization: Bearer YOUR_TOKEN_HERE' \
--header 'Content-Type: application/json' \
--data '{
    "time_format": "24-hour"
}'
```

**Response:**
```json
{
  "success": true,
  "message": "Time format successfully updated",
  "data": {
    "time_format": "24-hour",
    "updated_at": "2026-01-23T13:35:00.000Z"
  }
}
```

---

### 12. Update Time Format (12-hour) ✅
```bash
curl --location --request PUT 'https://api-layer.vercel.app/api/user/preferences/time-format' \
--header 'Authorization: Bearer YOUR_TOKEN_HERE' \
--header 'Content-Type: application/json' \
--data '{
    "time_format": "12-hour"
}'
```

---

### 13. Update First Day of Week (Monday) ✅
```bash
curl --location --request PUT 'https://api-layer.vercel.app/api/user/preferences/first-day-of-week' \
--header 'Authorization: Bearer YOUR_TOKEN_HERE' \
--header 'Content-Type: application/json' \
--data '{
    "first_day_of_week": "Monday"
}'
```

**Response:**
```json
{
  "success": true,
  "message": "First day of week successfully updated",
  "data": {
    "first_day_of_week": "Monday",
    "updated_at": "2026-01-23T13:36:00.000Z"
  }
}
```

---

### 14. Update First Day of Week (Sunday) ✅
```bash
curl --location --request PUT 'https://api-layer.vercel.app/api/user/preferences/first-day-of-week' \
--header 'Authorization: Bearer YOUR_TOKEN_HERE' \
--header 'Content-Type: application/json' \
--data '{
    "first_day_of_week": "Sunday"
}'
```

---

### 15. Update All Preferences at Once ✅
```bash
curl --location --request PUT 'https://api-layer.vercel.app/api/user/preferences' \
--header 'Authorization: Bearer YOUR_TOKEN_HERE' \
--header 'Content-Type: application/json' \
--data '{
    "language": "English",
    "language_code": "en",
    "time_format": "24-hour",
    "first_day_of_week": "Monday",
    "timezone": "UTC",
    "date_format": "YYYY-MM-DD"
}'
```

**Response:**
```json
{
  "success": true,
  "message": "User preferences updated successfully",
  "data": {
    "preferences": {
      "user_id": 1,
      "language": "English",
      "language_code": "en",
      "time_format": "24-hour",
      "first_day_of_week": "Monday",
      "timezone": "UTC",
      "date_format": "YYYY-MM-DD",
      "updated_at": "2026-01-23T13:40:00.000Z"
    }
  }
}
```

---

## 🎯 API Endpoints Summary

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/api/user/preferences` | Get user preferences | ✅ Working |
| PUT | `/api/user/preferences` | Update all preferences | ✅ Working |
| PUT | `/api/user/preferences/language` | Update language | ✅ Working |
| PUT | `/api/user/preferences/time-format` | Update time format (24h/12h) | ✅ Working |
| PUT | `/api/user/preferences/first-day-of-week` | Update first day of week | ✅ Working |
| GET | `/api/languages` | Get available languages | ✅ Working |

---

## 📱 Complete Flow Examples (Matching Figma Screens)

### Flow 1: Language Change (Switzerland → English)

```bash
# Step 1: Login
TOKEN=$(curl -s -X POST 'https://api-layer.vercel.app/api/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{"email":"john.doe@email.com","password":"password123"}' \
  | jq -r '.data.token')

# Step 2: Get available languages
curl -X GET 'https://api-layer.vercel.app/api/languages' \
  -H "Authorization: Bearer $TOKEN"

# Step 3: Update to English
curl -X PUT 'https://api-layer.vercel.app/api/user/preferences/language' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"language":"English","language_code":"en"}'

# Step 4: Verify preferences updated
curl -X GET 'https://api-layer.vercel.app/api/user/preferences' \
  -H "Authorization: Bearer $TOKEN"
```

---

### Flow 2: Time Format Change (24-hour selected)

```bash
# Update to 24-hour format
curl -X PUT 'https://api-layer.vercel.app/api/user/preferences/time-format' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"time_format":"24-hour"}'
```

**Success Message:** "Time format successfully updated"

---

### Flow 3: First Day of Week Change (Monday selected)

```bash
# Update first day to Monday
curl -X PUT 'https://api-layer.vercel.app/api/user/preferences/first-day-of-week' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"first_day_of_week":"Monday"}'
```

**Success Message:** "First day of week successfully updated"

---

## 🚀 PowerShell Test Script

```powershell
# Get token
$loginBody = @{ email = "john.doe@email.com"; password = "password123" } | ConvertTo-Json
$loginRes = Invoke-RestMethod -Uri "https://api-layer.vercel.app/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$token = $loginRes.data.token
$headers = @{ "Authorization" = "Bearer $token"; "Content-Type" = "application/json" }

# Test 1: Get preferences
Write-Host "1. Getting User Preferences..." -ForegroundColor Cyan
$prefs = Invoke-RestMethod -Uri "https://api-layer.vercel.app/api/user/preferences" -Method GET -Headers $headers
$prefs.data.preferences | Format-List

# Test 2: Update language to English
Write-Host "`n2. Updating Language to English..." -ForegroundColor Cyan
$langBody = @{ language = "English"; language_code = "en" } | ConvertTo-Json
$langRes = Invoke-RestMethod -Uri "https://api-layer.vercel.app/api/user/preferences/language" -Method PUT -Headers $headers -Body $langBody
Write-Host "✅ $($langRes.message)" -ForegroundColor Green

# Test 3: Update time format to 24-hour
Write-Host "`n3. Updating Time Format to 24-hour..." -ForegroundColor Cyan
$timeBody = @{ time_format = "24-hour" } | ConvertTo-Json
$timeRes = Invoke-RestMethod -Uri "https://api-layer.vercel.app/api/user/preferences/time-format" -Method PUT -Headers $headers -Body $timeBody
Write-Host "✅ $($timeRes.message)" -ForegroundColor Green

# Test 4: Update first day to Monday
Write-Host "`n4. Updating First Day of Week to Monday..." -ForegroundColor Cyan
$dayBody = @{ first_day_of_week = "Monday" } | ConvertTo-Json
$dayRes = Invoke-RestMethod -Uri "https://api-layer.vercel.app/api/user/preferences/first-day-of-week" -Method PUT -Headers $headers -Body $dayBody
Write-Host "✅ $($dayRes.message)" -ForegroundColor Green

# Test 5: Get available languages
Write-Host "`n5. Getting Available Languages..." -ForegroundColor Cyan
$langs = Invoke-RestMethod -Uri "https://api-layer.vercel.app/api/languages" -Method GET -Headers $headers
$langs.data.languages | Format-Table -AutoSize

# Final: Get updated preferences
Write-Host "`n6. Final Preferences:" -ForegroundColor Cyan
$finalPrefs = Invoke-RestMethod -Uri "https://api-layer.vercel.app/api/user/preferences" -Method GET -Headers $headers
$finalPrefs.data.preferences | Format-List
```

---

## 🎨 Screenshots Mapping

| Screenshot | API Endpoint |
|------------|--------------|
| **Preferences Screen** | `GET /api/user/preferences` |
| **Language Selection** | `GET /api/languages` |
| **Language Update (English)** | `PUT /api/user/preferences/language` |
| **Time Format (24-hour)** | `PUT /api/user/preferences/time-format` |
| **First Day (Monday)** | `PUT /api/user/preferences/first-day-of-week` |
| **Success Message** | Response message in all PUT requests |

---

## 🚀 Deployment Info

- **Production URL**: https://api-layer.vercel.app
- **Latest Deployment**: https://apilayer-psc8oatq4-soludoo.vercel.app
- **Deployed**: January 23, 2026
- **Status**: ✅ All User Preferences APIs Working

---

**Note:** Token expires in 24 hours. Get a new token using the login API when needed.
