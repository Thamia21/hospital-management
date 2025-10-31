$body = @{
    email = "admin@hospital.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "Token: $($response.token.Substring(0, 20))..." -ForegroundColor Cyan
    Write-Host "User: $($response.user.name)" -ForegroundColor Yellow
    Write-Host "Role: $($response.user.role)" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Login failed" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host $_.ErrorDetails.Message -ForegroundColor Red
    }
}
