# 📱 Figma Screenshots से बनी APIs - Complete List

## 🔄 Time Correction APIs (Based on Mobile App Figma Designs)

### 1. GET /api/time-correction-types
**Purpose:** सभी issue types की list (Missing work entry, Wrong clock time, etc.)
**Response:** 4 types with colors & icons
```json
{
  "success": true,
  "data": [
    {
      "id": "missing_work_entry",
      "name": "Add missing work entry", 
      "color": "#4CAF50",
      "icon": "clock-plus"
    },
    {
      "id": "wrong_clock_time", 
      "name": "Wrong clock-in/out time",
      "color": "#FF9800",
      "icon": "clock-edit"
    }
  ]
}
```

### 2. GET /api/me/time-corrections  
**Purpose:** User की सभी time correction requests
**Response:** Pending/Approved requests with full details
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": 1,
        "type": "missing_work_entry",
        "date": "2024-12-20", 
        "status": "pending",
        "requested_time_in": "09:00:00",
        "requested_time_out": "17:00:00",
        "reason": "Forgot to clock in and out"
      }
    ],
    "total_count": 2,
    "pending_count": 1,
    "approved_count": 1
  }
}
```

### 3. POST /api/me/time-corrections
**Purpose:** नई time correction request submit करना
**Body Example:**
```json
{
  "type": "missing_work_entry",
  "date": "2025-01-01",
  "requested_time_in": "09:00:00", 
  "requested_time_out": "17:00:00",
  "reason": "System was down, unable to clock in/out",
  "issue_description": "Complete work day missing"
}
```

### 4. PUT /api/time-corrections/{id}/status
**Purpose:** Admin/Manager द्वारा request approve/reject करना  
**Body:**
```json
{
  "status": "approved", 
  "admin_comment": "Request verified and approved"
}
```

### 5. GET /api/me/time-corrections/history
**Purpose:** User का complete history with statistics
**Response:** Historical requests with analytics
```json
{
  "success": true,
  "data": {
    "history": [...],
    "total_requests": 5,
    "approved_requests": 3,
    "rejected_requests": 1,
    "pending_requests": 1
  }
}
```

## 🎯 Figma Design Features Implemented:

### Mobile App Screens → API Mapping:
- ✅ **Issue Type Selection Screen** → GET /time-correction-types
- ✅ **Request Form Screen** → POST /me/time-corrections  
- ✅ **My Requests Screen** → GET /me/time-corrections
- ✅ **History Screen** → GET /me/time-corrections/history
- ✅ **Admin Approval Screen** → PUT /time-corrections/{id}/status

### Status Flow (Exactly as per Figma):
1. **Submit Request** → status: "pending"
2. **Admin Review** → status: "approved"/"rejected" 
3. **History Tracking** → Complete audit trail

## 🔗 Live URLs:
- **API Base**: https://api-layer.vercel.app/api
- **Swagger Docs**: https://api-layer.vercel.app/api-docs
- **Authentication**: Bearer token from /api/get-token

## 📊 Current Status:
- ✅ All 5 APIs are LIVE and working
- ✅ Swagger documentation updated with "Time Corrections" tag
- ✅ Bearer token authentication working
- ✅ Ready for mobile app integration

## 🎨 Figma Screens Covered:
1. Time correction request forms ✅
2. Issue type selection with icons/colors ✅  
3. Status management (pending/approved/rejected) ✅
4. History view with statistics ✅
5. Admin approval workflow ✅