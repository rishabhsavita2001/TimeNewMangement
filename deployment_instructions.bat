@echo off
echo ⚠️  MANUAL DEPLOYMENT INSTRUCTIONS
echo.
echo Current Issue: Git author bhoomi@example.com needs access to team soludoo
echo.
echo 🔧 SOLUTIONS:
echo.
echo Option 1 - Fix Git Config:
echo    git config user.email "your-authorized-email@domain.com"
echo    vercel --prod
echo.
echo Option 2 - Use Different Account:
echo    vercel login
echo    vercel --prod
echo.
echo Option 3 - Team Invite:
echo    Ask soludoo team to invite bhoomi@example.com
echo.
echo 📋 What's Fixed in the Code:
echo ✅ GET /api/me/time-entries - Working with auth
echo ✅ GET /api/me/vacation/balance - Working with auth
echo ✅ GET /api/me/overtime/summary - ADDED with auth
echo ✅ GET /api/get-token - For testing
echo ✅ PUT /api/me/time-entries/:id - Fixed validation
echo.
echo 🧪 Test Commands (after deployment):
echo 1. curl "https://api-layer.vercel.app/api/get-token"
echo 2. curl -H "Authorization: Bearer TOKEN" "https://api-layer.vercel.app/api/me/overtime/summary"
echo.
echo 📁 Ready Files:
echo    - index.js (updated with overtime API)
echo    - package.json (configured)
echo    - vercel.json (if needed)
echo.
pause