Write-Host "🚀 QUICK DEPLOYMENT SCRIPT" -ForegroundColor Yellow
Write-Host "=========================" -ForegroundColor Yellow

$currentDir = "C:\Users\bhoomi\Desktop\api_layer"
Set-Location $currentDir
Write-Host "📁 Current Directory: $currentDir" -ForegroundColor Green

Write-Host "`n🔄 Starting Vercel deployment..." -ForegroundColor Cyan

try {
    # Execute vercel deployment
    $deployResult = & vercel --prod 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
        Write-Host $deployResult -ForegroundColor White
    } else {
        Write-Host "❌ Deployment failed with exit code: $LASTEXITCODE" -ForegroundColor Red
        Write-Host $deployResult -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Error during deployment: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🔗 After deployment, check:" -ForegroundColor Yellow
Write-Host "   https://api-layer.vercel.app/api-docs" -ForegroundColor Blue
Write-Host "`n✅ Email field should now appear in DELETE /auth/delete-account" -ForegroundColor Green

Write-Host "`nPress any key to continue..." -ForegroundColor Gray
$Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") | Out-Null