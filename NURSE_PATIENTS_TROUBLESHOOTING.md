# 🔍 Nurse Patients Not Fetching - Troubleshooting Guide

## ❌ **Issue:**
Patients are not showing up in the Nurse Patients page.

## 🔍 **Root Causes:**

### **1. Nurse Missing facilityId** ⚠️
**Problem:** The backend requires a `facilityId` to fetch patients. If the nurse doesn't have one, it returns an empty array.

**Check in browser console:**
```javascript
// Look for this log:
"Nurse has no facilityId assigned. Cannot fetch patients."
```

**Solution:**
The nurse account needs to be assigned to a facility. Update the nurse user in MongoDB:

```javascript
// In MongoDB or via backend
db.users.updateOne(
  { email: "mary.johnson@hospital.com" },
  { 
    $set: { 
      facilityId: "your-facility-id-here",
      facilityIds: ["your-facility-id-here"]
    } 
  }
);
```

### **2. No Patients in Database** 📭
**Problem:** There are no patients registered in the system yet.

**Check:**
- Open browser console
- Look for: `"Fetched patients: []"` or `"No patients found in facility"`

**Solution:**
Add patients to the database:
- Use the "Add New Patient" button in the nurse interface
- Or add via admin panel
- Or seed the database with test patients

### **3. Patients in Different Facility** 🏥
**Problem:** Patients exist but are assigned to a different facility than the nurse.

**Backend Logic:**
```javascript
// Backend filters patients by facilityId
if (role === 'PATIENT') {
  filter.facilityIds = facilityId; // Only returns patients in this facility
}
```

**Solution:**
Ensure patients and nurse are in the same facility.

### **4. Authentication Issues** 🔐
**Problem:** Token expired or invalid.

**Check console for:**
```
Error: 401 Unauthorized
"Session expired. Please log in again."
```

**Solution:**
- Log out and log back in
- Check if token is valid in localStorage

### **5. Backend Server Not Running** 🖥️
**Problem:** Backend API is not accessible.

**Check console for:**
```
Error: Network Error
Failed to load patients
```

**Solution:**
- Start backend server: `cd backend && npm start`
- Check if running on `http://localhost:5000`

## 🛠️ **Debugging Steps:**

### **Step 1: Open Browser Console**
1. Open the Nurse Patients page
2. Press F12 to open DevTools
3. Go to Console tab
4. Look for these logs:

```javascript
"Fetching patients for nurse:" { ... }
"Fetched patients:" [...]
"Filtered patient data:" [...]
```

### **Step 2: Check Nurse User Data**
Look for the nurse user object in console:
```javascript
{
  _id: "...",
  name: "Mary Johnson",
  email: "mary.johnson@hospital.com",
  role: "NURSE",
  facilityId: "..." // ⚠️ This must exist!
}
```

### **Step 3: Check Network Tab**
1. Go to Network tab in DevTools
2. Filter by "users"
3. Look for: `GET /api/users?role=PATIENT`
4. Check:
   - Status: Should be 200
   - Response: Should contain patient array
   - Headers: Should have Authorization token

### **Step 4: Check Backend Logs**
In your backend terminal, look for:
```
GET /api/users called with query: { role: 'PATIENT' }
User from token: { id: '...', role: 'NURSE', facilityId: '...' }
Found X users
```

## ✅ **Solutions:**

### **Solution 1: Assign Facility to Nurse**

**Via MongoDB Compass or Shell:**
```javascript
db.users.updateOne(
  { email: "mary.johnson@hospital.com" },
  { 
    $set: { 
      facilityId: ObjectId("your-facility-id"),
      facilityIds: [ObjectId("your-facility-id")]
    } 
  }
);
```

**Via Backend API (if you have admin access):**
```javascript
// PUT /api/users/:nurseId
{
  "facilityId": "your-facility-id",
  "facilityIds": ["your-facility-id"]
}
```

### **Solution 2: Add Test Patients**

**Option A: Use the UI**
1. Go to Nurse Patients page
2. Click "Add New Patient"
3. Fill in the form
4. Submit

**Option B: Via Backend**
```javascript
// POST /api/users/add-patient (requires admin auth)
{
  "name": "Test Patient",
  "email": "test.patient@example.com",
  "phone": "+27 123 456 789",
  "role": "PATIENT",
  "facilityId": "same-facility-as-nurse",
  "facilityIds": ["same-facility-as-nurse"]
}
```

**Option C: Seed Script**
Create `backend/seedPatients.js`:
```javascript
const mongoose = require('mongoose');
const User = require('./models/User');

async function seedPatients() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  const patients = [
    {
      name: "John Doe",
      email: "john.doe@example.com",
      phone: "+27 111 111 111",
      role: "PATIENT",
      facilityId: "your-facility-id",
      facilityIds: ["your-facility-id"],
      isVerified: true
    },
    // Add more patients...
  ];
  
  await User.insertMany(patients);
  console.log('Patients seeded!');
  process.exit(0);
}

seedPatients();
```

Run: `node backend/seedPatients.js`

### **Solution 3: Ensure Same Facility**

**Check patient facilityIds:**
```javascript
db.users.find({ role: 'PATIENT' }).forEach(p => {
  print(`${p.name}: facilityIds = ${p.facilityIds}`);
});
```

**Update patients to nurse's facility:**
```javascript
db.users.updateMany(
  { role: 'PATIENT' },
  { 
    $set: { 
      facilityIds: ["nurse-facility-id"]
    } 
  }
);
```

## 📊 **Expected Console Output (Success):**

```
Fetching patients for nurse: {
  _id: "67...",
  name: "Mary Johnson",
  email: "mary.johnson@hospital.com",
  role: "NURSE",
  facilityId: "facility123"
}

Fetched patients: [
  { _id: "...", name: "John Doe", role: "PATIENT", ... },
  { _id: "...", name: "Jane Smith", role: "PATIENT", ... }
]

Filtered patient data: [
  { _id: "...", name: "John Doe", role: "PATIENT", ... },
  { _id: "...", name: "Jane Smith", role: "PATIENT", ... }
]
```

## 🎯 **Quick Fix Checklist:**

- [ ] Backend server is running (`http://localhost:5000`)
- [ ] Nurse is logged in (check localStorage for token)
- [ ] Nurse has `facilityId` assigned
- [ ] Patients exist in database
- [ ] Patients have same `facilityId` as nurse
- [ ] Browser console shows no errors
- [ ] Network tab shows 200 response for `/api/users?role=PATIENT`

## 🔧 **Enhanced Error Handling:**

I've added better error handling to show specific messages:

1. **No facilityId:** "Your account is not assigned to a facility. Please contact your administrator."
2. **Session expired:** "Session expired. Please log in again."
3. **No permission:** "You do not have permission to view patients."
4. **General error:** "Failed to load patients. Please try again later."

## 📱 **Test After Fix:**

1. Refresh the page
2. Check console for logs
3. Should see patient list
4. If still empty, check if patients exist in same facility

---

**Most Common Issue:** Nurse doesn't have a `facilityId` assigned. Fix this first!
