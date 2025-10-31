# Check doctors in database
$baseUrl = "http://localhost:5000/api"

# Login as admin
$loginBody = @{ email = "admin@hospital.com"; password = "admin123" } | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
$token = $loginResponse.token

# Get all staff
$headers = @{ Authorization = "Bearer $token" }
$staff = Invoke-RestMethod -Uri "$baseUrl/users?role=staff" -Method Get -Headers $headers

# Filter doctors
$doctors = $staff | Where-Object { $_.role -eq "DOCTOR" }

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "DOCTORS IN DATABASE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

foreach ($doctor in $doctors) {
    Write-Host "Name: $($doctor.name)" -ForegroundColor Yellow
    Write-Host "Email: $($doctor.email)" -ForegroundColor White
    Write-Host "Specialization: $($doctor.specialization)" -ForegroundColor White
    Write-Host "Facilities: $($doctor.facilityIds.Count)" -ForegroundColor Green
    if ($doctor.facilityNames) {
        foreach ($facility in $doctor.facilityNames) {
            Write-Host "  - $facility" -ForegroundColor Gray
        }
    }
    Write-Host ""
}

Write-Host "Total Doctors: $($doctors.Count)" -ForegroundColor Cyan
