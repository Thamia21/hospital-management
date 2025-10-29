# PowerShell script to update messages components
Write-Host "Updating Messages Components..." -ForegroundColor Green

# Backup old files
Write-Host "Creating backups..." -ForegroundColor Yellow
Copy-Item "src\pages\doctor\DoctorMessages.jsx" "src\pages\doctor\DoctorMessages.jsx.backup" -Force
Copy-Item "src\pages\patient\PatientMessages.jsx" "src\pages\patient\PatientMessages.jsx.backup" -Force

# Replace with new files
Write-Host "Replacing DoctorMessages..." -ForegroundColor Yellow
Copy-Item "src\pages\doctor\DoctorMessages_NEW.jsx" "src\pages\doctor\DoctorMessages.jsx" -Force

Write-Host "Replacing PatientMessages..." -ForegroundColor Yellow
Copy-Item "src\pages\patient\PatientMessages_NEW.jsx" "src\pages\patient\PatientMessages.jsx" -Force

# Clean up new files
Write-Host "Cleaning up..." -ForegroundColor Yellow
Remove-Item "src\pages\doctor\DoctorMessages_NEW.jsx" -Force
Remove-Item "src\pages\patient\PatientMessages_NEW.jsx" -Force

Write-Host "Done! Messages components updated successfully!" -ForegroundColor Green
Write-Host "Backups saved as .backup files" -ForegroundColor Cyan
