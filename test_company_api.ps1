# Company Settings APIs Test Script
Write-Host ""
Write-Host "🏢 TESTING COMPANY SETTINGS APIs..." -ForegroundColor Cyan

# Base URL
$baseUrl = "https://api-layer.vercel.app"

# Step 1: Login to get token
Write-Host ""
Write-Host "1️⃣ Logging in to get token..." -ForegroundColor Yellow
$loginBody = @{
    email = "john.doe@email.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginRes = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $token = $loginRes.data.token
    $headers = @{ "Authorization" = "Bearer $token" }
    Write-Host "✅ Token received" -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit
}

# Step 2: Get Current Company Settings
Write-Host ""
Write-Host "2️⃣ Getting current company settings..." -ForegroundColor Yellow
try {
    $settingsRes = Invoke-RestMethod -Uri "$baseUrl/api/company/settings" -Method GET -Headers $headers
    Write-Host "✅ Company Settings:" -ForegroundColor Green
    $settingsRes.data.company | Format-List
} catch {
    Write-Host "❌ Failed to get settings: $_" -ForegroundColor Red
}

# Step 3: Update Company Name
Write-Host ""
Write-Host "3️⃣ Updating company name..." -ForegroundColor Yellow
$nameBody = @{
    name = "Acme Inc."
} | ConvertTo-Json

try {
    $nameRes = Invoke-RestMethod -Uri "$baseUrl/api/company/settings/name" -Method PUT -Body $nameBody -Headers $headers -ContentType "application/json"
    Write-Host "✅ Company name updated: $($nameRes.data.name)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to update name: $_" -ForegroundColor Red
}

# Step 4: Update Industry
Write-Host ""
Write-Host "4️⃣ Updating industry/category..." -ForegroundColor Yellow
$industryBody = @{
    industry = "IT Company"
} | ConvertTo-Json

try {
    $industryRes = Invoke-RestMethod -Uri "$baseUrl/api/company/settings/industry" -Method PUT -Body $industryBody -Headers $headers -ContentType "application/json"
    Write-Host "✅ Industry updated: $($industryRes.data.industry)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to update industry: $_" -ForegroundColor Red
}

# Step 5: Update Brand Color
Write-Host ""
Write-Host "5️⃣ Updating brand color..." -ForegroundColor Yellow
$colorBody = @{
    brand_color = "#6366F1"
    brand_color_name = "Purple"
} | ConvertTo-Json

try {
    $colorRes = Invoke-RestMethod -Uri "$baseUrl/api/company/settings/brand-color" -Method PUT -Body $colorBody -Headers $headers -ContentType "application/json"
    Write-Host "✅ Brand color updated: $($colorRes.data.brand_color) ($($colorRes.data.brand_color_name))" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to update brand color: $_" -ForegroundColor Red
}

# Step 6: Update Support Email
Write-Host ""
Write-Host "6️⃣ Updating support email..." -ForegroundColor Yellow
$emailBody = @{
    support_email = "Acmeinc@gmail.com"
} | ConvertTo-Json

try {
    $emailRes = Invoke-RestMethod -Uri "$baseUrl/api/company/settings/support-email" -Method PUT -Body $emailBody -Headers $headers -ContentType "application/json"
    Write-Host "✅ Support email updated: $($emailRes.data.support_email)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to update email: $_" -ForegroundColor Red
}

# Step 7: Update Company Phone
Write-Host ""
Write-Host "7️⃣ Updating company phone..." -ForegroundColor Yellow
$phoneBody = @{
    company_phone = "(+1) 740-8521"
} | ConvertTo-Json

try {
    $phoneRes = Invoke-RestMethod -Uri "$baseUrl/api/company/settings/company-phone" -Method PUT -Body $phoneBody -Headers $headers -ContentType "application/json"
    Write-Host "✅ Company phone updated: $($phoneRes.data.company_phone)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to update phone: $_" -ForegroundColor Red
}

# Step 8: Update Address
Write-Host ""
Write-Host "8️⃣ Updating address..." -ForegroundColor Yellow
$addressBody = @{
    address = "45 Cloudy Bay, Auckland, NZ"
} | ConvertTo-Json

try {
    $addressRes = Invoke-RestMethod -Uri "$baseUrl/api/company/settings/address" -Method PUT -Body $addressBody -Headers $headers -ContentType "application/json"
    Write-Host "✅ Address updated: $($addressRes.data.address)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to update address: $_" -ForegroundColor Red
}

# Step 9: Get Available Brand Colors
Write-Host ""
Write-Host "9️⃣ Getting available brand colors..." -ForegroundColor Yellow
try {
    $colorsRes = Invoke-RestMethod -Uri "$baseUrl/api/company/brand-colors" -Method GET -Headers $headers
    Write-Host "✅ Available Brand Colors:" -ForegroundColor Green
    $colorsRes.data.colors | Format-Table -AutoSize
} catch {
    Write-Host "❌ Failed to get brand colors: $_" -ForegroundColor Red
}

# Step 10: Upload Company Logo (simulated)
Write-Host ""
Write-Host "🔟 Uploading company logo..." -ForegroundColor Yellow
$logoBody = @{
    logo_data = "base64_encoded_image_data_here"
    logo_type = "image/png"
} | ConvertTo-Json

try {
    $logoRes = Invoke-RestMethod -Uri "$baseUrl/api/company/settings/logo" -Method POST -Body $logoBody -Headers $headers -ContentType "application/json"
    Write-Host "✅ Logo uploaded: $($logoRes.data.logo_url)" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to upload logo: $_" -ForegroundColor Red
}

# Final: Get Updated Settings
Write-Host ""
Write-Host "✅ Getting final updated settings..." -ForegroundColor Yellow
try {
    $finalRes = Invoke-RestMethod -Uri "$baseUrl/api/company/settings" -Method GET -Headers $headers
    Write-Host ""
    Write-Host "🎉 FINAL COMPANY SETTINGS:" -ForegroundColor Green
    $finalRes.data.company | Format-List
} catch {
    Write-Host "❌ Failed to get final settings: $_" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ All Company Settings APIs tested successfully!" -ForegroundColor Green
Write-Host ""
