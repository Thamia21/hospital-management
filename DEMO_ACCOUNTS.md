# 🎭 Demo Accounts - Hospital Management System

This document contains information about the demo accounts available for testing the hospital management system.

## 📋 Available Demo Accounts

### 🏥 Healthcare Roles

| Role | Email | Password | User ID | Name |
|------|-------|----------|---------|------|
| **Patient** | `john.doe@example.com` | `patient123` | Auto-generated | John Doe |
| **Nurse** | `mary.johnson@hospital.com` | `nurse123` | Auto-generated | Sister Mary Johnson |
| **Doctor** | `michael.smith@hospital.com` | `doctor123` | Auto-generated | Dr. Michael Smith |
| **Admin** | `admin@hospital.com` | `admin123` | Auto-generated | Admin User |

## 🔑 Login Methods

You can login using either:

1. **Email + Password** (recommended)
   - Email: Use the email from the table above
   - Password: Use the password from the table above

2. **User ID + Password** (if you know the generated User ID)
   - User ID: Check backend logs or database for generated IDs
   - Password: Same as above

## 🚀 Quick Start

### Option 1: Use Existing Demo Accounts
The demo accounts are already created in your database. Simply go to the login page and use any of the credentials above.

### Option 2: Recreate Demo Accounts
If you need to recreate the demo accounts:

```bash
# Navigate to backend directory
cd backend

# Create demo accounts via API (recommended)
npm run seed-demo-api

# OR create demo accounts via direct database (alternative)
npm run seed-demo

# Test that accounts work
npm run test-demo

# Verify accounts in database
npm run verify-demo
```

## 🎯 Testing Different Roles

### 👤 Patient Portal (`john.doe@example.com`)
- **Features to test:**
  - Dashboard with health summary
  - Book appointments with doctors/nurses
  - View medical records (read-only)
  - View test results
  - Manage prescriptions
  - Billing and payments
  - Messages with healthcare providers
  - Profile management
  - Multilingual support (11 South African languages)

### 👩‍⚕️ Nurse Portal (`mary.johnson@hospital.com`)
- **Features to test:**
  - Nurse dashboard
  - Patient management
  - Appointment scheduling
  - Medical records creation/editing
  - Medication administration
  - Patient communication

### 👨‍⚕️ Doctor Portal (`michael.smith@hospital.com`)
- **Features to test:**
  - Doctor dashboard with today's schedule
  - Patient management and medical history
  - Appointment management
  - Prescription writing
  - Medical records and consultations
  - Reports and analytics
  - Professional profile management

### 🔧 Admin Portal (`admin@hospital.com`)
- **Features to test:**
  - System administration
  - User management
  - Facility management
  - System reports
  - Configuration settings

## 🛠️ Backend Scripts

The following npm scripts are available in the `backend` directory:

```bash
# Seed demo accounts via API (recommended)
npm run seed-demo-api

# Seed demo accounts via direct database
npm run seed-demo

# Test demo account logins
npm run test-demo

# Verify demo accounts exist in database
npm run verify-demo

# Start the backend server
npm run dev
```

## 🌍 Multilingual Support

The system supports all 11 South African official languages:

- English (en) 🇬🇧
- Afrikaans (af) 🇿🇦
- isiZulu (zu) 🇿🇦
- isiXhosa (xh) 🇿🇦
- Sesotho (st) 🇿🇦
- Setswana (tn) 🇿🇦
- siSwati (ss) 🇿🇦
- isiNdebele (nr) 🇿🇦
- Xitsonga (ts) 🇿🇦
- Tshivenḓa (ve) 🇿🇦
- Sepedi (nso) 🇿🇦

Use the language selector in the top-right corner to switch languages.

## 📱 Demo Account Details

### Patient Account (John Doe)
- **Personal Info:** Male, born 1990-01-01
- **Contact:** +27123456789
- **Address:** 123 Main Street, Cape Town, 8001
- **Emergency Contact:** Jane Doe (+27987654321)
- **ID Number:** 9001011234567

### Nurse Account (Sister Mary Johnson)
- **License:** NUR2023001
- **Specialization:** General Nursing
- **Department:** General Ward
- **Qualifications:** BSc Nursing, University of Cape Town
- **Experience:** 8 years

### Doctor Account (Dr. Michael Smith)
- **License:** DOC2023001
- **Specialization:** General Practice
- **Department:** General Medicine
- **Qualifications:** MBChB, University of the Witwatersrand
- **Experience:** 12 years

### Admin Account
- **Department:** Administration
- **Qualifications:** MBA Healthcare Management
- **Experience:** 15 years

## 🔧 Troubleshooting

### Demo Accounts Not Working?

1. **Check Backend Server:**
   ```bash
   # Make sure backend is running
   cd backend
   npm run dev
   ```

2. **Recreate Accounts:**
   ```bash
   # Recreate demo accounts
   npm run seed-demo-api
   ```

3. **Test Accounts:**
   ```bash
   # Test that accounts work
   npm run test-demo
   ```

4. **Check Database:**
   ```bash
   # Verify accounts exist
   npm run verify-demo
   ```

### Common Issues

- **"User not found":** Account may not have been created. Run `npm run seed-demo-api`
- **"Invalid password":** Make sure you're using the exact passwords from the table above
- **"Server error":** Make sure the backend server is running on port 5000

## 📞 Support

If you encounter any issues with the demo accounts:

1. Check the backend server logs for error messages
2. Verify MongoDB is running and connected
3. Try recreating the accounts with `npm run seed-demo-api`
4. Test the accounts with `npm run test-demo`

## 🎉 Ready to Test!

Your demo accounts are now ready for testing. Visit the login page and start exploring the hospital management system with different user roles!

**Login URL:** `http://localhost:5173/login`

Enjoy testing the comprehensive South African hospital management system! 🏥✨
