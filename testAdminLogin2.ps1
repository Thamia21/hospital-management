$body = @{
    email = "admin@hospital.com"
    password = "admin123"
} | ConvertTo-Json

Write-Host "Testing admin login..." -ForegroundColor Cyan

try {
    $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
    Write-Host "SUCCESS! Admin login works!" -ForegroundColor Green
    Write-Host "Token:" -ForegroundColor Yellow
    Write-Host $response.token
} catch {
    Write-Host "FAILED - Invalid credentials" -ForegroundColor Red
    Write-Host "The admin password might be different." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Try these alternatives in Postman:" -ForegroundColor Cyan
    Write-Host "1. Password: Admin@123" -ForegroundColor White
    Write-Host "2. Password: Admin123" -ForegroundColor White
    Write-Host "3. Password: password" -ForegroundColor White
}
