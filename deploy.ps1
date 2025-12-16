# Vercel Deployment Commands

# Install Vercel CLI (if not already installed)
# npm install -g vercel

# Deploy to Vercel
Write-Host "Deploying to Vercel..." -ForegroundColor Green

# Set environment variables for Vercel
vercel env add NODE_ENV production
vercel env add USE_MOCK_DB true
vercel env add JWT_SECRET vercel-production-secret-key-2024
vercel env add VERCEL 1

# Deploy
vercel --prod

Write-Host "Deployment complete!" -ForegroundColor Green
Write-Host "Your API should be available at: https://api-layer-xxx.vercel.app" -ForegroundColor Cyan