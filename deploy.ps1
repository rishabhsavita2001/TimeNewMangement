Write-Host "🚀 Deploying Updated Delete Account API to Vercel..." -ForegroundColor Yellow

try {
    # Deploy to production
    Write-Host "Starting deployment..." -ForegroundColor Cyan
    $output = & vercel --prod 2>&1
    
    Write-Host "`nDeployment Output:" -ForegroundColor Green
    Write-Host $output -ForegroundColor White
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`n✅ Deployment successful!" -ForegroundColor Green
        Write-Host "Updated API with email field is now live!" -ForegroundColor Green
    } else {
        Write-Host "`n❌ Deployment failed!" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error during deployment: $($_.Exception.Message)" -ForegroundColor Red
}