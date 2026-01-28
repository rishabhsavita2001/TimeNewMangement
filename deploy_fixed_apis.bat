@echo off
echo 🚀 Deploying FIXED APIs to Vercel...
echo.

echo 📋 Current Fix Status:
echo ✅ GET /api/me/time-entries - WORKING with authentication
echo ✅ GET /api/me/vacation/balance - WORKING with authentication  
echo ✅ GET /api/get-token - ADDED for authentication
echo ✅ PUT /api/me/time-entries/:id - FIXED parameter validation
echo.

echo 🔄 Attempting Vercel deployment...
vercel --prod

echo.
echo 🧪 Test commands after deployment:
echo 1. curl "https://api-layer.vercel.app/api/get-token"
echo 2. curl -H "Authorization: Bearer YOUR_TOKEN" "https://api-layer.vercel.app/api/me/time-entries"
echo 3. curl -H "Authorization: Bearer YOUR_TOKEN" "https://api-layer.vercel.app/api/me/vacation/balance"
echo.
echo 📚 Documentation: https://api-layer.vercel.app/api-docs
pause