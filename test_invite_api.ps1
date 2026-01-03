# Test Invite Employee API
$headers = @{
    "Authorization" = "Bearer test-token"
    "Content-Type" = "application/json"
}

$body = @{
    firstName = "Rahul"
    lastName = "Kumar"
    email = "rahul.kumar@company.com"
    phone = "+919876543210"
    role = "Software Developer"
    department = "Engineering"
    workingHours = "40 hours/week"
    workingModel = "Remote"
    startDate = "2024-01-15"
} | ConvertTo-Json

Write-Host "🧪 Testing Invite Employee API..."
try {
    $response = Invoke-RestMethod -Uri "https://api-layer.vercel.app/api/employees/invite" -Method POST -Headers $headers -Body $body
    Write-Host "✅ SUCCESS!" -ForegroundColor Green
    Write-Host "Response:" -ForegroundColor Yellow
    $response | ConvertTo-Json -Depth 3
} catch {
    Write-Host "❌ ERROR:" -ForegroundColor Red
    Write-Host $_.Exception.Message
}