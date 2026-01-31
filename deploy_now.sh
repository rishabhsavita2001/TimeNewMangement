#!/bin/bash

echo "🚀 Deploying to Vercel..."

# Add and commit changes
git add .
git commit -m "Deploy latest changes" || echo "No changes to commit"

# Deploy to Vercel (manual)
echo "📦 Please deploy manually:"
echo "1. Go to https://vercel.com/dashboard"
echo "2. Select your api_layer project"
echo "3. Click 'Redeploy' on the latest deployment"
echo ""
echo "OR run: vercel --prod (after logging in with: vercel login)"
echo ""
echo "✅ Local testing:"
echo "   curl -X POST 'http://localhost:3000/api/auth/login' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"email\":\"john.doe@email.com\",\"password\":\"password123\"}'"
