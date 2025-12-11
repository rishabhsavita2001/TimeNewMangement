# API Testing Guide with Swagger UI

## Swagger UI Access

Your API documentation is now available at: **http://localhost:3002/api-docs**

The Swagger UI provides:
- Complete API documentation
- Interactive testing interface
- Request/response examples
- Schema definitions
- Authentication testing

## Features Added

### 1. Swagger Configuration
- **File**: `config/swagger.js`
- Comprehensive OpenAPI 3.0 specification
- Authentication schemas (JWT Bearer)
- Complete data models and schemas

### 2. API Documentation
- All endpoints documented with Swagger annotations
- Request/response schemas defined
- Authentication requirements specified
- Example payloads provided

### 3. Interactive Testing
- Test endpoints directly from the browser
- Authentication support for protected routes
- Real-time request/response testing
- Parameter validation

## How to Test Your API

### Step 1: Access Swagger UI
Navigate to: http://localhost:3002/api-docs

### Step 2: Test Public Endpoints
1. **Health Check**: `GET /health`
   - No authentication required
   - Click "Try it out" → "Execute"

### Step 3: Test Authentication
1. **Register** (if needed): `POST /auth/register`
   ```json
   {
     "email": "test@example.com",
     "password": "password123",
     "firstName": "Test",
     "lastName": "User",
     "tenantId": 1
   }
   ```

2. **Login**: `POST /auth/login`
   ```json
   {
     "email": "test@example.com", 
     "password": "password123"
   }
   ```

3. **Copy the JWT token** from the login response

### Step 4: Authorize Protected Endpoints
1. Click the **"Authorize"** button at the top of Swagger UI
2. Enter: `Bearer YOUR_JWT_TOKEN_HERE`
3. Click "Authorize"

### Step 5: Test Protected Endpoints
Now you can test all protected endpoints:

- **User Profile**: `GET /api/me`
- **Dashboard**: `GET /api/me/dashboard`
- **Time Entries**: `GET /api/me/time-entries`
- **Create Time Entry**: `POST /api/me/time-entries`
- **Leave Requests**: `GET /api/me/leave-requests`
- **Create Leave Request**: `POST /api/me/leave-requests`
- **Vacation Balance**: `GET /api/me/vacation-balance`
- **Projects**: `GET /api/projects`
- **Leave Types**: `GET /api/leave-types`

## API Endpoint Categories

### 🏥 Health & Testing
- `GET /health` - Server health check
- `GET /api/test` - API connectivity test

### 🔐 Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration  
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/logout` - User logout

### 👤 User Profile
- `GET /api/me` - Get user profile
- `GET /api/me/dashboard` - Get dashboard data

### ⏰ Time Tracking
- `GET /api/me/time-entries` - List time entries (with pagination)
- `POST /api/me/time-entries` - Create time entry
- `PUT /api/me/time-entries/{id}` - Update time entry
- `DELETE /api/me/time-entries/{id}` - Delete time entry

### 🏖️ Leave Management
- `GET /api/me/vacation-balance` - Get vacation balance
- `GET /api/me/leave-requests` - List leave requests (with pagination)
- `POST /api/me/leave-requests` - Create leave request

### 📚 Reference Data
- `GET /api/leave-types` - Get leave types
- `GET /api/projects` - Get projects
- `GET /api/projects/{id}/tasks` - Get tasks for project

## Key Features

### 🔒 Authentication
- JWT Bearer token authentication
- Multi-tenant support
- Secure password hashing

### 📄 Pagination
- Configurable page size
- Total count and page information
- Sort options where applicable

### 🛡️ Security
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation

### 🔍 Filtering
- Date range filtering for time entries
- Status filtering for leave requests
- Tenant-based data isolation

## Example API Requests

### Authentication Example
```bash
# Login
curl -X POST http://localhost:3002/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Use token for protected requests
curl -X GET http://localhost:3002/api/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Time Entry Example
```bash
# Create time entry
curl -X POST http://localhost:3002/api/me/time-entries \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "date": "2023-11-10",
    "clockIn": "09:00",
    "clockOut": "17:00", 
    "breakDuration": 30,
    "notes": "Regular work day",
    "projectId": 1
  }'
```

### Leave Request Example
```bash
# Create leave request
curl -X POST http://localhost:3002/api/me/leave-requests \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "leaveTypeId": 1,
    "startDate": "2023-12-01",
    "endDate": "2023-12-05",
    "reason": "Family vacation",
    "isHalfDay": false
  }'
```

## Database Note
The server is currently configured to connect to a PostgreSQL database. Some endpoints may return mock data if database tables are not fully implemented, but the API structure and Swagger documentation are complete and ready for testing.

## Next Steps
1. ✅ Access Swagger UI at http://localhost:3002/api-docs
2. ✅ Test authentication flows
3. ✅ Explore all available endpoints
4. ✅ Use the interactive testing features
5. ✅ Validate request/response schemas
6. ✅ Test error scenarios

Your API is now fully documented and ready for testing! 🎉