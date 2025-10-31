# PowerShell script to add doctors via API
$baseUrl = "http://localhost:5000/api"

# Step 1: Login as admin to get token
Write-Host "🔐 Logging in as admin..." -ForegroundColor Cyan
$loginBody = @{
    email = "admin@hospital.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.token
    Write-Host "✅ Login successful!" -ForegroundColor Green
} catch {
    Write-Host "❌ Login failed. Make sure admin account exists." -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# Step 2: Get facilities
Write-Host "`n📍 Fetching facilities..." -ForegroundColor Cyan
$headers = @{
    Authorization = "Bearer $token"
}

try {
    $facilities = Invoke-RestMethod -Uri "$baseUrl/facilities" -Method Get -Headers $headers
    Write-Host "✅ Found $($facilities.Count) facilities" -ForegroundColor Green
    
    if ($facilities.Count -eq 0) {
        Write-Host "❌ No facilities found. Please add facilities first." -ForegroundColor Red
        exit 1
    }
    
    # Show facilities
    Write-Host "`nAvailable facilities:" -ForegroundColor Yellow
    for ($i = 0; $i -lt [Math]::Min(5, $facilities.Count); $i++) {
        Write-Host "  $($i+1). $($facilities[$i].name)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Failed to fetch facilities" -ForegroundColor Red
    Write-Host $_.Exception.Message
    exit 1
}

# Step 3: Define doctors to add
$doctors = @(
    @{
        name = "Dr. Sarah Johnson"
        email = "sarah.johnson@hospital.com"
        role = "DOCTOR"
        department = "Cardiology"
        specialization = "Cardiology"
        licenseNumber = "MP123456"
        facilityIds = @($facilities[0]._id, $facilities[1]._id)
    },
    @{
        name = "Dr. Michael Chen"
        email = "michael.chen@hospital.com"
        role = "DOCTOR"
        department = "Pediatrics"
        specialization = "Pediatrics"
        licenseNumber = "MP234567"
        facilityIds = @($facilities[0]._id)
    },
    @{
        name = "Dr. Lisa Anderson"
        email = "lisa.anderson@hospital.com"
        role = "DOCTOR"
        department = "Neurology"
        specialization = "Neurology"
        licenseNumber = "MP345678"
        facilityIds = @($facilities[1]._id, $facilities[2]._id)
    },
    @{
        name = "Dr. James Williams"
        email = "james.williams@hospital.com"
        role = "DOCTOR"
        department = "Orthopedics"
        specialization = "Orthopedics"
        licenseNumber = "MP456789"
        facilityIds = @($facilities[0]._id, $facilities[2]._id)
    },
    @{
        name = "Dr. Emily Brown"
        email = "emily.brown@hospital.com"
        role = "DOCTOR"
        department = "General Practice"
        specialization = "General Practice"
        licenseNumber = "MP567890"
        facilityIds = @($facilities[1]._id)
    }
)

# Step 4: Add each doctor
Write-Host "`n👨‍⚕️ Adding doctors..." -ForegroundColor Cyan
$successCount = 0
$skipCount = 0

foreach ($doctor in $doctors) {
    Write-Host "`nAdding: $($doctor.name)" -ForegroundColor Yellow
    
    $doctorBody = $doctor | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl/users/add-staff" -Method Post -Body $doctorBody -ContentType "application/json" -Headers $headers
        Write-Host "  ✅ $($response.message)" -ForegroundColor Green
        Write-Host "  📧 Email: $($doctor.email)" -ForegroundColor Gray
        Write-Host "  🏥 Specialization: $($doctor.specialization)" -ForegroundColor Gray
        Write-Host "  📍 Facilities: $($doctor.facilityIds.Count)" -ForegroundColor Gray
        $successCount++
    } catch {
        if ($_.Exception.Response.StatusCode -eq 400) {
            Write-Host "  ⚠️  Doctor already exists (skipping)" -ForegroundColor Yellow
            $skipCount++
        } else {
            Write-Host "  ❌ Failed to add doctor" -ForegroundColor Red
            Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Summary
Write-Host "`n" + "="*50 -ForegroundColor Cyan
Write-Host "📊 SUMMARY" -ForegroundColor Cyan
Write-Host "="*50 -ForegroundColor Cyan
Write-Host "✅ Successfully added: $successCount doctors" -ForegroundColor Green
Write-Host "⚠️  Already existed: $skipCount doctors" -ForegroundColor Yellow
Write-Host "📍 Total facilities: $($facilities.Count)" -ForegroundColor White

Write-Host "`n💡 Next steps:" -ForegroundColor Cyan
Write-Host "  1. Doctors will receive password setup emails" -ForegroundColor White
Write-Host "  2. Patients at assigned facilities can now see these doctors" -ForegroundColor White
Write-Host "  3. Test appointment booking to verify filtering works" -ForegroundColor White

Write-Host "`n🎉 Done!" -ForegroundColor Green
