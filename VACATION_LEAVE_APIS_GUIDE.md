# Vacation/Leave Request APIs - Figma Implementation Guide

## 🌴 Overview
This document outlines the enhanced vacation/leave request APIs implemented to match the Figma mobile app screens for time tracking application.

## 🎯 Figma Screens Covered
1. **Empty States**: "No Current Requests" & "No Past Requests"
2. **Current Requests**: Active/pending vacation requests with status badges
3. **Past Requests**: Historical requests with approval status
4. **New Request Form**: Complete form with leave type dropdown and date picker
5. **Success State**: "Vacation request sent ✅" confirmation

## 📊 API Endpoints

### 1. Get Leave Types
**Endpoint**: `GET /api/leave-types`
**Purpose**: Populate the "Type of leave" dropdown in new request form

**Response Example**:
```json
{
  "success": true,
  "data": {
    "leave_types": [
      {
        "type": "paid_leave",
        "name": "Paid Leave",
        "description": "Paid time off for vacation, personal time",
        "is_paid": true,
        "max_days_per_year": 21,
        "requires_approval": true,
        "can_be_half_day": false,
        "color": "#4CAF50",
        "icon": "🌴"
      },
      {
        "type": "sick_leave", 
        "name": "Sick Leave",
        "description": "Medical leave for illness or health issues",
        "is_paid": true,
        "max_days_per_year": 10,
        "requires_approval": false,
        "can_be_half_day": true,
        "color": "#FF9800",
        "icon": "🏥"
      },
      {
        "type": "half_day",
        "name": "Half Day Leave", 
        "description": "Half day off (morning or afternoon)",
        "is_paid": true,
        "max_days_per_year": 12,
        "requires_approval": false,
        "can_be_half_day": true,
        "color": "#2196F3",
        "icon": "🕐"
      }
    ],
    "default_type": "paid_leave"
  }
}
```

### 2. Get Leave Requests (Current/Past)
**Endpoint**: `GET /api/me/leave-requests`
**Purpose**: Display current and past vacation requests with proper filtering

**Query Parameters**:
- `period`: `current` | `past` (filters based on date and status)
- `status`: `pending` | `approved` | `rejected` | `cancelled`
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Response Example**:
```json
{
  "success": true,
  "data": {
    "requests": [
      {
        "leave_request_id": 1,
        "title": "Family trip - Paid Leave",
        "leave_type": "paid_leave",
        "leave_type_name": "Paid Leave",
        "start_date": "2025-11-12",
        "end_date": "2025-11-14", 
        "duration": 3,
        "reason": "Family trip 🌴",
        "status": "pending",
        "status_display": "Pending",
        "status_color": "#FFA500",
        "is_paid": true,
        "is_half_day": false,
        "date_display": "12-14 Nov 2025"
      }
    ],
    "isEmpty": false,
    "emptyStateMessage": "",
    "emptyStateTitle": null,
    "currentPeriodCount": 2,
    "pastPeriodCount": 1,
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 4,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
}
```

**Empty State Response**:
```json
{
  "success": true,
  "data": {
    "requests": [],
    "isEmpty": true,
    "emptyStateMessage": "You haven't made any vacation requests yet.",
    "emptyStateTitle": "No Current Requests",
    "currentPeriodCount": 0,
    "pastPeriodCount": 0
  }
}
```

### 3. Create Leave Request
**Endpoint**: `POST /api/me/leave-requests`
**Purpose**: Submit new vacation request matching Figma form

**Request Body**:
```json
{
  "leave_type": "paid_leave",
  "start_date": "2025-11-12",
  "end_date": "2025-11-14",
  "reason": "Family trip 🌴",
  "is_half_day": false,
  "half_day_period": "morning"
}
```

**Response Example**:
```json
{
  "success": true,
  "message": "Vacation request sent ✅",
  "data": {
    "request": {
      "leave_request_id": 105,
      "title": "Paid Leave - Family trip 🌴",
      "leave_type": "paid_leave",
      "leave_type_name": "Paid Leave",
      "start_date": "2025-11-12",
      "end_date": "2025-11-14",
      "duration": 3,
      "reason": "Family trip 🌴",
      "status": "pending",
      "status_display": "Pending",
      "status_color": "#FFA500",
      "is_paid": true,
      "is_half_day": false,
      "date_display": "12-14 Nov 2025"
    },
    "success_message": "Vacation request sent ✅",
    "success_title": "Request Submitted",
    "success_subtitle": "Your leave request has been submitted for approval"
  }
}
```

## 🎨 UI Integration Guide

### Current Tab Implementation
```javascript
// Fetch current requests
const currentRequests = await fetch('/api/me/leave-requests?period=current');
const data = await currentRequests.json();

if (data.data.isEmpty) {
  // Show empty state
  showEmptyState(data.data.emptyStateTitle, data.data.emptyStateMessage);
} else {
  // Render requests with status badges
  data.data.requests.forEach(request => {
    renderRequestCard({
      title: request.title,
      dateRange: request.date_display,
      status: request.status_display,
      statusColor: request.status_color,
      isPaid: request.is_paid
    });
  });
}
```

### Past Tab Implementation  
```javascript
// Fetch past requests
const pastRequests = await fetch('/api/me/leave-requests?period=past');
// Similar rendering logic
```

### New Request Form
```javascript
// Load leave types for dropdown
const leaveTypes = await fetch('/api/leave-types');
const types = await leaveTypes.json();

// Populate dropdown
types.data.leave_types.forEach(type => {
  addDropdownOption(type.name, type.type, type.icon);
});

// Submit new request
const submitRequest = async (formData) => {
  const response = await fetch('/api/me/leave-requests', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  });
  
  const result = await response.json();
  if (result.success) {
    showSuccessMessage(result.message); // "Vacation request sent ✅"
    refreshRequestsList();
  }
};
```

## 🚀 Status Badge Colors
- **Pending**: `#FFA500` (Orange)
- **Approved**: `#00C851` (Green)
- **Rejected**: `#FF4444` (Red)
- **Cancelled**: `#9E9E9E` (Gray)

## 📱 Mobile App Features
- ✅ Current/Past tab filtering
- ✅ Empty state handling
- ✅ Status badges with colors
- ✅ Date range formatting
- ✅ Leave type dropdown with icons
- ✅ Half-day support
- ✅ Success confirmation
- ✅ Pagination support

## 🔄 Data Flow
1. **Load Screen** → `GET /leave-types` → Populate dropdown
2. **Switch Tabs** → `GET /me/leave-requests?period=current/past` → Filter display
3. **Submit Form** → `POST /me/leave-requests` → Show success → Refresh list
4. **Status Updates** → Auto-refresh or webhook integration

## 🎯 Figma Matching Summary
All 7 Figma screens are fully implemented:
- ✅ No Current Requests (empty state)
- ✅ No Past Requests (empty state)  
- ✅ Current requests with status badges
- ✅ Past requests history
- ✅ New request form with all fields
- ✅ Form with filled data
- ✅ Success state "Vacation request sent ✅"

## 📊 Testing Results
All APIs tested successfully on live server:
- **GET /api/leave-types**: ✅ Working
- **GET /api/me/leave-requests**: ✅ Working (with filtering)
- **POST /api/me/leave-requests**: ✅ Working
- **Empty states**: ✅ Working
- **Status filtering**: ✅ Working
- **Figma data matching**: ✅ 100% Compatible

## 🌐 Live API Documentation
Visit: https://apilayer-17sg2jttc-soludoo.vercel.app/api-docs
Check the Swagger UI for interactive testing of all vacation/leave request endpoints.