# 👨‍⚕️ How to Add Doctors with Facility Assignments

This guide shows you **all the ways** to add doctors to the database with their facility assignments.

---

## 🎯 Method 1: Using the Admin API Endpoint (Recommended)

### **API Endpoint**: `POST /api/users/add-staff`

This is the **easiest and recommended** way for admins to add doctors with facilities.

### **Request Format**:

```javascript
POST http://localhost:5000/api/users/add-staff
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Dr. Sarah Johnson",
  "email": "sarah.johnson@hospital.com",
  "role": "DOCTOR",
  "department": "Cardiology",
  "specialization": "Cardiology",
  "licenseNumber": "MP123456",
  "facilityIds": [
    "673c8f9e1234567890abcdef",  // Charlotte Maxeke Hospital
    "673c8f9e1234567890abcd00",  // Netcare Milpark
    "673c8f9e1234567890abcd01"   // Life Fourways
  ]
}
```

### **Response**:
```json
{
  "message": "DOCTOR added successfully. An email has been sent for them to set their password."
}
```

### **What Happens**:
1. ✅ Doctor account created in MongoDB
2. ✅ Assigned to multiple facilities
3. ✅ Email sent to doctor to set password
4. ✅ Auto-verified (no email verification needed)
5. ✅ Unique user ID generated (e.g., DO12345)

---

## 🔧 Method 2: Using Postman or API Testing Tool

### **Step-by-Step**:

#### **1. Get Admin Token**
First, login as admin to get the auth token:

```javascript
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@hospital.com",
  "password": "admin123"
}
```

Copy the `token` from the response.

#### **2. Get Facility IDs**
Get the list of facilities to know which IDs to use:

```javascript
GET http://localhost:5000/api/facilities
Authorization: Bearer <your_admin_token>
```

Response will show facilities with their `_id` values:
```json
[
  {
    "_id": "673c8f9e1234567890abcdef",
    "name": "Charlotte Maxeke Hospital",
    "type": "Hospital",
    "address": "..."
  },
  {
    "_id": "673c8f9e1234567890abcd00",
    "name": "Netcare Milpark",
    "type": "Hospital",
    "address": "..."
  }
]
```

#### **3. Add Doctor with Facilities**
```javascript
POST http://localhost:5000/api/users/add-staff
Authorization: Bearer <your_admin_token>
Content-Type: application/json

{
  "name": "Dr. Michael Chen",
  "email": "michael.chen@hospital.com",
  "role": "DOCTOR",
  "department": "Pediatrics",
  "specialization": "Pediatrics",
  "licenseNumber": "MP789012",
  "facilityIds": [
    "673c8f9e1234567890abcdef",
    "673c8f9e1234567890abcd00"
  ]
}
```

---

## 💻 Method 3: Direct MongoDB Insert (For Development/Testing)

If you have direct access to MongoDB, you can insert doctors directly:

### **Using MongoDB Compass or Shell**:

```javascript
// Connect to your MongoDB database
use hospital_management

// Insert a doctor with facilities
db.users.insertOne({
  name: "Dr. Lisa Anderson",
  email: "lisa.anderson@hospital.com",
  role: "DOCTOR",
  department: "Neurology",
  specialization: "Neurology",
  licenseNumber: "MP345678",
  facilityIds: [
    ObjectId("673c8f9e1234567890abcdef"),  // Charlotte Maxeke
    ObjectId("673c8f9e1234567890abcd00")   // Netcare Milpark
  ],
  isVerified: true,
  createdAt: new Date()
})
```

**Note**: You'll need to manually hash the password if adding one directly.

---

## 🖥️ Method 4: Create an Admin UI Form (Future Enhancement)

You can create a form in the admin panel for adding doctors. Here's what it would look like:

### **Frontend Component Example**:

```javascript
// AdminAddDoctor.jsx
import React, { useState, useEffect } from 'react';
import { facilityApi } from '../services/facilityApi';
import axios from 'axios';

function AdminAddDoctor() {
  const [facilities, setFacilities] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'DOCTOR',
    department: '',
    specialization: '',
    licenseNumber: '',
    facilityIds: []
  });

  useEffect(() => {
    // Load facilities
    facilityApi.getAll().then(setFacilities);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    const response = await axios.post(
      'http://localhost:5000/api/users/add-staff',
      formData,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    alert('Doctor added successfully!');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Doctor Name"
        value={formData.name}
        onChange={(e) => setFormData({...formData, name: e.target.value})}
      />
      
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
      />
      
      <input
        type="text"
        placeholder="Specialization"
        value={formData.specialization}
        onChange={(e) => setFormData({...formData, specialization: e.target.value})}
      />
      
      <input
        type="text"
        placeholder="License Number"
        value={formData.licenseNumber}
        onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
      />
      
      {/* Multi-select for facilities */}
      <select
        multiple
        value={formData.facilityIds}
        onChange={(e) => {
          const selected = Array.from(e.target.selectedOptions, option => option.value);
          setFormData({...formData, facilityIds: selected});
        }}
      >
        {facilities.map(facility => (
          <option key={facility._id} value={facility._id}>
            {facility.name}
          </option>
        ))}
      </select>
      
      <button type="submit">Add Doctor</button>
    </form>
  );
}
```

---

## 📝 Method 5: Bulk Import via Script

For adding multiple doctors at once, create a script:

### **bulkAddDoctors.js**:

```javascript
const mongoose = require('mongoose');
const User = require('./backend/models/User');

const doctors = [
  {
    name: "Dr. John Smith",
    email: "john.smith@hospital.com",
    role: "DOCTOR",
    specialization: "Cardiology",
    department: "Cardiology",
    licenseNumber: "MP111111",
    facilityIds: ["673c8f9e1234567890abcdef", "673c8f9e1234567890abcd00"],
    isVerified: true
  },
  {
    name: "Dr. Emily Brown",
    email: "emily.brown@hospital.com",
    role: "DOCTOR",
    specialization: "Pediatrics",
    department: "Pediatrics",
    licenseNumber: "MP222222",
    facilityIds: ["673c8f9e1234567890abcd00"],
    isVerified: true
  },
  {
    name: "Dr. David Wilson",
    email: "david.wilson@hospital.com",
    role: "DOCTOR",
    specialization: "Orthopedics",
    department: "Orthopedics",
    licenseNumber: "MP333333",
    facilityIds: ["673c8f9e1234567890abcdef", "673c8f9e1234567890abcd01"],
    isVerified: true
  }
];

async function bulkAddDoctors() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hospital_management');
    console.log('Connected to MongoDB');
    
    for (const doctorData of doctors) {
      const doctor = new User(doctorData);
      await doctor.save();
      console.log(`✅ Added: ${doctorData.name} (${doctorData.email})`);
    }
    
    console.log('All doctors added successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

bulkAddDoctors();
```

**Run it**:
```bash
node bulkAddDoctors.js
```

---

## 🔍 Verify Doctors Were Added

### **Check in MongoDB**:
```javascript
db.users.find({ role: "DOCTOR" }).pretty()
```

### **Check via API**:
```javascript
GET http://localhost:5000/api/users?role=staff
Authorization: Bearer <admin_token>
```

### **Check with Facility Filter**:
```javascript
GET http://localhost:5000/api/users?role=staff&facilityIds=673c8f9e1234567890abcdef
Authorization: Bearer <admin_token>
```

---

## 📋 Complete Example: Adding a Multi-Facility Doctor

### **Scenario**: 
Dr. Sarah Johnson works at 3 hospitals:
- Charlotte Maxeke (Mondays, Wednesdays)
- Netcare Milpark (Tuesdays, Thursdays)
- Life Fourways (Fridays)

### **Using Postman**:

**Step 1**: Get facility IDs
```
GET http://localhost:5000/api/facilities
```

**Step 2**: Add doctor
```javascript
POST http://localhost:5000/api/users/add-staff
Authorization: Bearer <admin_token>

{
  "name": "Dr. Sarah Johnson",
  "email": "sarah.johnson@hospital.com",
  "role": "DOCTOR",
  "department": "Cardiology",
  "specialization": "Cardiology",
  "licenseNumber": "MP999999",
  "facilityIds": [
    "673c8f9e1234567890abcdef",  // Charlotte Maxeke
    "673c8f9e1234567890abcd00",  // Netcare Milpark
    "673c8f9e1234567890abcd01"   // Life Fourways
  ]
}
```

**Step 3**: Verify
```
GET http://localhost:5000/api/users?role=staff
```

---

## ✅ What Patients Will See

After adding Dr. Sarah Johnson to 3 facilities:

- **Patient at Charlotte Maxeke** → Will see Dr. Johnson ✅
- **Patient at Netcare Milpark** → Will see Dr. Johnson ✅
- **Patient at Life Fourways** → Will see Dr. Johnson ✅
- **Patient at another facility** → Won't see Dr. Johnson ❌

---

## 🎯 Quick Reference

| Method | Best For | Difficulty |
|--------|----------|------------|
| **Admin API** | Production use | ⭐ Easy |
| **Postman** | Testing/Development | ⭐⭐ Medium |
| **MongoDB Direct** | Quick testing | ⭐⭐ Medium |
| **Admin UI Form** | End users | ⭐ Easy (once built) |
| **Bulk Script** | Importing many doctors | ⭐⭐⭐ Advanced |

---

## 🚀 Recommended Workflow

1. **Get facility IDs** from `/api/facilities`
2. **Use Admin API** to add doctors with `facilityIds` array
3. **Verify** doctors appear for patients at those facilities
4. **Test** appointment booking to confirm filtering works

---

## 📞 Need Help?

- Check backend logs for errors
- Verify facility IDs are correct MongoDB ObjectIds
- Ensure admin token is valid
- Confirm `facilityIds` is an array, not a single value

The system is now ready to add doctors with multiple facility assignments! 🎉
