@echo off
echo Deploying API to production...
echo ===============================

cd /d "C:\Users\bhoomi\Desktop\api_layer"
echo Current directory: %CD%

echo.
echo Running vercel deploy --prod...
vercel --prod

echo.
echo Deployment completed!
echo You can test at: https://api-layer.vercel.app/api-docs

pause