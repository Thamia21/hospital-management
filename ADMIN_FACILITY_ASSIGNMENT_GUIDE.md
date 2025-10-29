# 🏥 Admin Facility Assignment Guide

## Why Admins Need Facility Assignment

### Security & Privacy Requirements:
- **Patient Data Protection**: Patient records are highly sensitive and must be isolated by facility
- **POPIA Compliance**: South African data protection law requires proper access controls
- **Facility-Based Access**: Each facility's data should only be accessible to authorized personnel
- **Audit Trail**: Clear tracking of who accessed which facility's data

### Access Control Model:
```
Admin → Assigned to Facility A → Can view Facility A patients only
Doctor → Assigned to Facility B → Can view Facility B patients only
Nurse → Assigned to Facility C → Can view Facility C patients only
```

---

## Methods to Assign Facility to Admin

### **Method 1: Automatic Assignment Script (Recommended)**

**Quick and automatic - assigns admin to first available facility or creates one.**

```bash
cd backend
node scripts/assignAdminFacility.js
```

**What it does:**
1. Connects to MongoDB
2. Finds all facilities
3. If no facilities exist, creates a default "Main Hospital"
4. Finds admin user
5. Assigns admin to the facility
6. Confirms assignment

**Output:**
```
✅ Connected to MongoDB

📋 Available Facilities:
1. Main Hospital (ID: 507f1f77bcf86cd799439011)

👤 Found Admin User: Admin User (admin@hospital.com)
Current facilityId: NOT ASSIGNED

✅ Admin assigned to facility: Main Hospital
Admin facilityId: 507f1f77bcf86cd799439011

🎉 Admin facility assignment complete!
```

---

### **Method 2: Interactive Assignment Script (More Control)**

**Interactive prompts - choose which admin and which facility.**

```bash
cd backend
node scripts/assignAdminFacilityInteractive.js
```

**Interactive Steps:**
1. Shows all available facilities
2. Option to create new facility if none exist
3. Shows all admin users
4. Select which admin to assign
5. Select which facility to assign
6. Confirm assignment

**Example Session:**
```
✅ Connected to MongoDB

📋 Available Facilities:
1. Main Hospital - HOSPITAL (ID: 507f1f77bcf86cd799439011)
   Address: 123 Main Street, Johannesburg, South Africa
   Status: ACTIVE

2. City Clinic - CLINIC (ID: 507f1f77bcf86cd799439012)
   Address: 456 Oak Avenue, Pretoria, South Africa
   Status: ACTIVE

👥 Admin Users:
1. Admin User (admin@hospital.com)
   Current Facility: NOT ASSIGNED

Select admin user (1-1): 1

Select facility to assign (1-2): 1

📝 Assignment Summary:
Admin: Admin User (admin@hospital.com)
Facility: Main Hospital (HOSPITAL)

Confirm assignment? (yes/no): yes

✅ SUCCESS! Admin assigned to facility.

👤 Admin: Admin User
🏥 Facility: Main Hospital
🆔 Facility ID: 507f1f77bcf86cd799439011

🎉 Admin can now view patients from this facility!
```

---

### **Method 3: Direct MongoDB Update**

**For advanced users - direct database modification.**

```javascript
// Using MongoDB Compass or mongo shell
db.users.updateOne(
  { role: 'ADMIN', email: 'admin@hospital.com' },
  { $set: { facilityId: ObjectId('507f1f77bcf86cd799439011') } }
)
```

**Steps:**
1. Open MongoDB Compass or mongo shell
2. Connect to your database
3. Find the admin user's `_id`
4. Find the facility's `_id`
5. Update the admin user with the facility `_id`

---

### **Method 4: Via Admin Registration/Setup**

**Future enhancement - assign facility during admin creation.**

This would be implemented in the admin registration or user management interface where:
1. Admin is created
2. Facility is selected from dropdown
3. Admin is automatically assigned to selected facility

---

## Creating Facilities (If None Exist)

### **Option 1: Use the Interactive Script**
The interactive script will prompt you to create a facility if none exist.

### **Option 2: Create via Facility Management Page**
1. Login as an existing admin (if possible)
2. Navigate to Facility Management
3. Add new facility with details

### **Option 3: Create via Script**

```javascript
// backend/scripts/createFacility.js
const mongoose = require('mongoose');
const Facility = require('../models/Facility');
require('dotenv').config();

async function createFacility() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const facility = new Facility({
    name: 'Main Hospital',
    type: 'HOSPITAL',
    address: '123 Main Street, Johannesburg, South Africa',
    phone: '+27 11 123 4567',
    email: 'info@mainhospital.co.za',
    capacity: 500,
    departments: ['Emergency', 'General Medicine', 'Surgery', 'Pediatrics'],
    services: ['Emergency Care', 'Outpatient Services', 'Laboratory'],
    status: 'ACTIVE'
  });

  await facility.save();
  console.log('Facility created:', facility._id);
  
  await mongoose.connection.close();
}

createFacility();
```

---

## Verification Steps

### **1. Check Admin Assignment**
```bash
cd backend
node scripts/checkAdminFacility.js
```

Or via MongoDB:
```javascript
db.users.findOne({ role: 'ADMIN', email: 'admin@hospital.com' })
// Should show facilityId field populated
```

### **2. Test Patient Fetching**
1. Login as admin
2. Navigate to Patient Management
3. Patient list should now load
4. Only patients from admin's facility will be visible

### **3. Verify in Browser Console**
```javascript
// Check the API response
// Should see patients array with data
```

---

## Common Issues & Solutions

### **Issue 1: "No facilities found"**
**Solution:** Run the assignment script - it will create a default facility automatically.

### **Issue 2: "Admin still can't see patients"**
**Checklist:**
- ✅ Admin has `facilityId` assigned (check in MongoDB)
- ✅ Patients exist in the database
- ✅ Patients have matching `facilityIds` array
- ✅ Backend server restarted after assignment
- ✅ Frontend cleared cache and refreshed

### **Issue 3: "Multiple admins need assignment"**
**Solution:** Use the interactive script to assign each admin individually, or create a batch script.

### **Issue 4: "Admin needs to manage multiple facilities"**
**Current Limitation:** The system currently supports one facility per admin.

**Workaround Options:**
1. Create separate admin accounts for each facility
2. Future enhancement: Support multiple facility assignments
3. Use a "super admin" role with cross-facility access (requires security review)

---

## Security Best Practices

### ✅ **DO:**
- Assign admins to their primary facility
- Document facility assignments
- Review access logs regularly
- Update assignments when admins change facilities
- Maintain audit trail of assignments

### ❌ **DON'T:**
- Give admins access to all facilities (privacy violation)
- Share admin accounts across facilities
- Bypass facility filtering (security risk)
- Assign admins to facilities they don't work at

---

## Future Enhancements

### **Multi-Facility Admin Support:**
```javascript
// Potential future schema
admin: {
  facilityId: ObjectId, // Primary facility
  additionalFacilities: [ObjectId], // Additional access
  accessLevel: 'SINGLE' | 'MULTI' | 'SUPER'
}
```

### **Facility-Based Roles:**
```javascript
// More granular permissions
admin: {
  facilities: [
    { facilityId: ObjectId, permissions: ['VIEW_PATIENTS', 'MANAGE_STAFF'] }
  ]
}
```

---

## Quick Start Commands

```bash
# Navigate to backend
cd backend

# Option 1: Quick automatic assignment
node scripts/assignAdminFacility.js

# Option 2: Interactive assignment with choices
node scripts/assignAdminFacilityInteractive.js

# Verify assignment
node -e "
const mongoose = require('mongoose');
const User = require('./models/User');
mongoose.connect('mongodb://localhost:27017/hospital-management').then(async () => {
  const admin = await User.findOne({ role: 'ADMIN' });
  console.log('Admin facilityId:', admin.facilityId);
  process.exit(0);
});
"
```

---

## Summary

**The admin facility assignment is necessary for:**
1. ✅ Patient data privacy and security
2. ✅ POPIA compliance
3. ✅ Proper access control
4. ✅ Audit trail maintenance

**To assign a facility to admin:**
1. Run `node scripts/assignAdminFacility.js` (automatic)
2. OR run `node scripts/assignAdminFacilityInteractive.js` (interactive)
3. Verify assignment
4. Admin can now view patients from their facility

This is a security feature, not a limitation! 🔒
