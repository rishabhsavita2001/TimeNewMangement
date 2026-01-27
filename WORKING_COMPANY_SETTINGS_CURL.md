# ✅ Working Company Settings APIs - CURL Commands

## 🔑 Step 1: Get Fresh Token (Login)

```bash
curl --location --request POST 'https://api-layer.vercel.app/api/auth/login' \
--header 'Content-Type: application/json' \
--data '{
    "email": "john.doe@email.com",
    "password": "password123"
}'
```

**Working Token (Valid for 24 hours):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obi5kb2VAZW1haWwuY29tIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzY5MTczOTY0LCJleHAiOjE3NjkyNjAzNjR9.i6Ln9NgKSssDcIBWbR-ThdzE2IlcOm-jQbod_1FCg14
```

---

## ✅ All Working APIs:

### 1. Update Company Name ✅
```bash
curl --location --request PUT 'https://api-layer.vercel.app/api/company/settings/name' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obi5kb2VAZW1haWwuY29tIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzY5MTczOTY0LCJleHAiOjE3NjkyNjAzNjR9.i6Ln9NgKSssDcIBWbR-ThdzE2IlcOm-jQbod_1FCg14' \
--header 'Content-Type: application/json' \
--data '{"name":"Acme Inc."}'
```

**Response:**
```json
{
  "success": true,
  "message": "Company name updated successfully",
  "data": {
    "name": "Acme Inc.",
    "updated_at": "2026-01-23T13:12:44.632Z"
  }
}
```

---

### 2. Update Company Phone ✅
```bash
curl --location --request PUT 'https://api-layer.vercel.app/api/company/settings/company-phone' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obi5kb2VAZW1haWwuY29tIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzY5MTczOTY0LCJleHAiOjE3NjkyNjAzNjR9.i6Ln9NgKSssDcIBWbR-ThdzE2IlcOm-jQbod_1FCg14' \
--header 'Content-Type: application/json' \
--data '{"company_phone":"(+1) 740-8521"}'
```

---

### 3. Update Brand Color (Purple) ✅
```bash
curl --location --request PUT 'https://api-layer.vercel.app/api/company/settings/brand-color' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obi5kb2VAZW1haWwuY29tIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzY5MTczOTY0LCJleHAiOjE3NjkyNjAzNjR9.i6Ln9NgKSssDcIBWbR-ThdzE2IlcOm-jQbod_1FCg14' \
--header 'Content-Type: application/json' \
--data '{"brand_color":"#6366F1","brand_color_name":"Purple"}'
```

---

### 4. Update Brand Color (Orange) ✅
```bash
curl --location --request PUT 'https://api-layer.vercel.app/api/company/settings/brand-color' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obi5kb2VAZW1haWwuY29tIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzY5MTczOTY0LCJleHAiOjE3NjkyNjAzNjR9.i6Ln9NgKSssDcIBWbR-ThdzE2IlcOm-jQbod_1FCg14' \
--header 'Content-Type: application/json' \
--data '{"brand_color":"#F97316","brand_color_name":"Orange"}'
```

---

### 5. Update Brand Color (Custom) ✅
```bash
curl --location --request PUT 'https://api-layer.vercel.app/api/company/settings/brand-color' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obi5kb2VAZW1haWwuY29tIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzY5MTczOTY0LCJleHAiOjE3NjkyNjAzNjR9.i6Ln9NgKSssDcIBWbR-ThdzE2IlcOm-jQbod_1FCg14' \
--header 'Content-Type: application/json' \
--data '{"brand_color":"#8A6307","brand_color_name":"Custom"}'
```

---

### 6. Update Support Email ✅
```bash
curl --location --request PUT 'https://api-layer.vercel.app/api/company/settings/support-email' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obi5kb2VAZW1haWwuY29tIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzY5MTczOTY0LCJleHAiOjE3NjkyNjAzNjR9.i6Ln9NgKSssDcIBWbR-ThdzE2IlcOm-jQbod_1FCg14' \
--header 'Content-Type: application/json' \
--data '{"support_email":"Acmeinc@gmail.com"}'
```

---

### 7. Update Industry/Category ✅
```bash
curl --location --request PUT 'https://api-layer.vercel.app/api/company/settings/industry' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obi5kb2VAZW1haWwuY29tIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzY5MTczOTY0LCJleHAiOjE3NjkyNjAzNjR9.i6Ln9NgKSssDcIBWbR-ThdzE2IlcOm-jQbod_1FCg14' \
--header 'Content-Type: application/json' \
--data '{"industry":"IT Company"}'
```

---

### 8. Update Address ✅
```bash
curl --location --request PUT 'https://api-layer.vercel.app/api/company/settings/address' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obi5kb2VAZW1haWwuY29tIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzY5MTczOTY0LCJleHAiOjE3NjkyNjAzNjR9.i6Ln9NgKSssDcIBWbR-ThdzE2IlcOm-jQbod_1FCg14' \
--header 'Content-Type: application/json' \
--data '{"address":"45 Cloudy Bay, Auckland, NZ"}'
```

---

### 9. Get Company Settings ✅
```bash
curl --location --request GET 'https://api-layer.vercel.app/api/company/settings' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obi5kb2VAZW1haWwuY29tIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzY5MTczOTY0LCJleHAiOjE3NjkyNjAzNjR9.i6Ln9NgKSssDcIBWbR-ThdzE2IlcOm-jQbod_1FCg14'
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
      "description": "Leading technology company providing innovative solutions",
      "updated_at": "2026-01-23T13:12:44.632Z"
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

### 10. Get Available Brand Colors ✅
```bash
curl --location --request GET 'https://api-layer.vercel.app/api/company/brand-colors' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obi5kb2VAZW1haWwuY29tIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzY5MTczOTY0LCJleHAiOjE3NjkyNjAzNjR9.i6Ln9NgKSssDcIBWbR-ThdzE2IlcOm-jQbod_1FCg14'
```

---

### 11. Upload Company Logo ✅
```bash
curl --location --request POST 'https://api-layer.vercel.app/api/company/settings/logo' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obi5kb2VAZW1haWwuY29tIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzY5MTczOTY0LCJleHAiOjE3NjkyNjAzNjR9.i6Ln9NgKSssDcIBWbR-ThdzE2IlcOm-jQbod_1FCg14' \
--header 'Content-Type: application/json' \
--data '{"logo_data":"data:image/png;base64,iVBORw0KGg...","logo_type":"image/png"}'
```

---

### 12. Update All Settings at Once ✅
```bash
curl --location --request PUT 'https://api-layer.vercel.app/api/company/settings' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImVtYWlsIjoiam9obi5kb2VAZW1haWwuY29tIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzY5MTczOTY0LCJleHAiOjE3NjkyNjAzNjR9.i6Ln9NgKSssDcIBWbR-ThdzE2IlcOm-jQbod_1FCg14' \
--header 'Content-Type: application/json' \
--data '{
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

---

## 🎯 API Endpoints Summary

| Method | Endpoint | Description | Status |
|--------|----------|-------------|--------|
| GET | `/api/company/settings` | Get all company settings | ✅ Working |
| PUT | `/api/company/settings` | Update all settings at once | ✅ Working |
| PUT | `/api/company/settings/name` | Update company name | ✅ Working |
| PUT | `/api/company/settings/industry` | Update industry/category | ✅ Working |
| PUT | `/api/company/settings/brand-color` | Update brand color | ✅ Working |
| PUT | `/api/company/settings/support-email` | Update support email | ✅ Working |
| PUT | `/api/company/settings/company-phone` | Update company phone | ✅ Working |
| PUT | `/api/company/settings/address` | Update address | ✅ Working |
| POST | `/api/company/settings/logo` | Upload company logo | ✅ Working |
| GET | `/api/company/brand-colors` | Get available brand colors | ✅ Working |

---

## 🚀 Deployment Info

- **Production URL**: https://api-layer.vercel.app
- **Latest Deployment**: https://apilayer-ofs02kwmm-soludoo.vercel.app
- **Deployed**: January 23, 2026
- **Status**: ✅ All APIs Working

---

**Note:** Token expires in 24 hours. Get a new token using the login API when needed.
