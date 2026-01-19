# 🚀 COMPLETE API ENDPOINTS LIST

## 📊 **TOTAL: 50 APIs LIVE**

---

## 🔐 **AUTHENTICATION & SYSTEM (5 APIs)**

1. **GET** `/api/health` - Server health check
2. **GET** `/api/test` - API test endpoint  
3. **GET** `/api/get-token` - Get authentication token
4. **POST** `/api/auth/register` - User registration
5. **POST** `/api/auth/login` - User login

---

## ⏰ **TIME CORRECTION MANAGEMENT (8 APIs)**

### Employee APIs:
6. **GET** `/api/time-correction-types` - Available correction types
7. **GET** `/api/me/time-corrections` - Employee's corrections
8. **POST** `/api/me/time-corrections` - Submit correction request
9. **GET** `/api/me/time-corrections/history` - Correction history

### Admin APIs (NEW):
10. **GET** `/api/correction-requests` - Admin view all requests
11. **POST** `/api/correction-requests/{id}/approve` - Approve request
12. **POST** `/api/correction-requests/{id}/reject` - Reject request
13. **PUT** `/api/time-corrections/{id}/status` - Update status

---

## 👤 **PROFILE MANAGEMENT (8 APIs)**

14. **GET** `/api/me/profile` - User profile details
15. **PUT** `/api/me/profile` - Update complete profile
16. **POST** `/api/me/profile/photo` - Upload profile photo
17. **PUT** `/api/me/profile/name` - Update name
18. **PUT** `/api/me/profile/email` - Update email
19. **PUT** `/api/me/profile/phone` - Update phone
20. **PUT** `/api/me/profile/password` - Change password
21. **DELETE** `/api/me/profile` - Delete profile

---

## 🏢 **COMPANY MANAGEMENT (9 APIs)**

22. **GET** `/api/company/settings` - Company settings
23. **PUT** `/api/company/settings` - Update company settings
24. **POST** `/api/company/logo` - Upload company logo
25. **PUT** `/api/company/name` - Update company name
26. **PUT** `/api/company/industry` - Update industry
27. **PUT** `/api/company/brand-color` - Update brand color
28. **PUT** `/api/company/support-email` - Update support email
29. **PUT** `/api/company/phone` - Update company phone
30. **PUT** `/api/company/address` - Update company address

---

## ⏱️ **TIME TRACKING & WORK (7 APIs)**

31. **GET** `/api/dashboard` - Dashboard data
32. **POST** `/api/me/timer/start` - Start work timer
33. **POST** `/api/me/timer/stop` - Stop work timer
34. **GET** `/api/me/timer/current` - Current timer status
35. **GET** `/api/me/work-summary/today` - Today's work summary
36. **GET** `/api/me/work-summary/weekly` - Weekly work summary
37. **POST** `/api/me/manual-time-entry` - Manual time entry

---

## 🏖️ **LEAVE MANAGEMENT (5 APIs)**

38. **GET** `/api/leave-types` - Available leave types
39. **GET** `/api/me/leave-requests` - Employee leave requests
40. **POST** `/api/me/leave-requests` - Submit leave request
41. **PUT** `/api/me/leave-requests/{id}` - Update leave request
42. **GET** `/api/me/leave-balance` - Leave balance

---

## 📊 **DASHBOARD & NOTIFICATIONS (5 APIs)**

43. **GET** `/api/notifications` - User notifications
44. **PUT** `/api/notifications/read` - Mark notifications read
45. **GET** `/api/me/updates` - User updates
46. **GET** `/api/quick-actions` - Quick actions
47. **GET** `/api/me/recent-activities` - Recent activities

---

## 👥 **TEAM & PROJECTS (4 APIs)**

48. **GET** `/api/projects` - Projects list
49. **GET** `/api/projects/{id}/tasks` - Project tasks
50. **GET** `/api/team-members` - Team members
51. **GET** `/api/me/team` - User's team

---

## 📖 **DOCUMENTATION (2 APIs)**

52. **GET** `/api-docs` - Swagger UI documentation
53. **GET** `/swagger.json` - Swagger JSON specification

---

## 🎯 **LATEST ADDITIONS (Today)**

### New Correction Request Admin APIs:
- **GET** `/api/correction-requests` - Admin requests view
- **POST** `/api/correction-requests/{id}/approve` - Approve requests  
- **POST** `/api/correction-requests/{id}/reject` - Reject requests

### Features Added:
✅ **Admin approval workflow**  
✅ **Request filtering** (status, issue type, employee, date)  
✅ **Comprehensive mock data**  
✅ **Status management**  

---

## 🚀 **DEPLOYMENT INFO**

- **Live Domain**: `apilayer.vercel.app`
- **Documentation**: `apilayer.vercel.app/api-docs`
- **Authentication**: Bearer Token Required
- **CORS**: Enabled for frontend
- **Status**: All APIs Live & Working ✅

---

## 📱 **READY FOR INTEGRATION**

सारी APIs आपके **Figma designs** के अनुसार ready हैं:
- Time Correction System ✅
- Leave Management ✅  
- Profile Management ✅
- Company Settings ✅
- Dashboard & Notifications ✅