# Test all demo account logins
$accounts = @(
    @{ email = "admin@hospital.com"; password = "admin123"; role = "ADMIN" },
    @{ email = "john.doe@example.com"; password = "patient123"; role = "PATIENT" },
    @{ email = "mary.johnson@hospital.com"; password = "nurse123"; role = "NURSE" },
    @{ email = "michael.smith@hospital.com"; password = "doctor123"; role = "DOCTOR" }
)

Write-Host "🔐 Testing all demo account logins..." -ForegroundColor Cyan
Write-Host ""

foreach ($account in $accounts) {
    Write-Host "Testing: $($account.role) - $($account.email)" -ForegroundColor Yellow
    
    $body = @{
        email = $account.email
        password = $account.password
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
        Write-Host "  ✅ SUCCESS!" -ForegroundColor Green
        Write-Host "  User: $($response.user.name)" -ForegroundColor White
        Write-Host "  Role: $($response.user.role)" -ForegroundColor White
        Write-Host "  Token: $($response.token.Substring(0, 30))..." -ForegroundColor Gray
        
        if ($account.role -eq "ADMIN") {
            Write-Host ""
            Write-Host "🎉 ADMIN LOGIN WORKS! Use this token in Postman:" -ForegroundColor Green
            Write-Host $response.token -ForegroundColor Cyan
        }
    } catch {
        Write-Host "  ❌ FAILED" -ForegroundColor Red
        if ($_.ErrorDetails) {
            $errorMsg = $_.ErrorDetails.Message
            Write-Host "  Error: $errorMsg" -ForegroundColor Red
        }
    }
    Write-Host ""
}
