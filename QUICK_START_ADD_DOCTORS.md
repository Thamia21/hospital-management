# 🚀 Quick Start: Add Doctors to Database

## ⚡ Fastest Way (Using the Script)

### **Step 1: Make sure MongoDB is running**
```bash
# Check if MongoDB is running
mongosh
```

### **Step 2: Run the sample doctors script**
```bash
cd backend
node scripts/addSampleDoctors.js
```

This will automatically:
- ✅ Connect to your MongoDB database
- ✅ Find all existing facilities
- ✅ Add 5 sample doctors with random facility assignments
- ✅ Show you which doctors were added to which facilities

---

## 🎯 Manual Way (Using Postman/Thunder Client)

### **Step 1: Login as Admin**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@hospital.com",
  "password": "admin123"
}
```

Copy the `token` from response.

### **Step 2: Get Facility IDs**
```
GET http://localhost:5000/api/facilities
Authorization: Bearer YOUR_TOKEN_HERE
```

Copy the `_id` values of facilities you want.

### **Step 3: Add a Doctor**
```
POST http://localhost:5000/api/users/add-staff
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Dr. John Doe",
  "email": "john.doe@hospital.com",
  "role": "DOCTOR",
  "department": "Cardiology",
  "specialization": "Cardiology",
  "licenseNumber": "MP123456",
  "facilityIds": [
    "PASTE_FACILITY_ID_1_HERE",
    "PASTE_FACILITY_ID_2_HERE"
  ]
}
```

---

## 📋 Example with Real Data

Let's say you have these facilities:
- Charlotte Maxeke Hospital: `673c8f9e1234567890abcdef`
- Netcare Milpark: `673c8f9e1234567890abcd00`

**Add a doctor who works at both**:

```json
{
  "name": "Dr. Sarah Johnson",
  "email": "sarah.johnson@hospital.com",
  "role": "DOCTOR",
  "department": "Cardiology",
  "specialization": "Cardiology",
  "licenseNumber": "MP999999",
  "facilityIds": [
    "673c8f9e1234567890abcdef",
    "673c8f9e1234567890abcd00"
  ]
}
```

---

## ✅ Verify It Worked

### **Check all doctors**:
```
GET http://localhost:5000/api/users?role=staff
Authorization: Bearer YOUR_TOKEN_HERE
```

### **Check doctors at specific facility**:
```
GET http://localhost:5000/api/users?role=staff&facilityIds=673c8f9e1234567890abcdef
Authorization: Bearer YOUR_TOKEN_HERE
```

### **Test as patient**:
1. Login as a patient registered at Charlotte Maxeke
2. Go to "Book Appointment"
3. Select "Doctor"
4. You should see Dr. Sarah Johnson in the list! ✅

---

## 🎉 That's It!

You now have doctors in the database with facility assignments, and patients will only see doctors from their facilities when booking appointments!

## 📚 Need More Details?

See `HOW_TO_ADD_DOCTORS_WITH_FACILITIES.md` for comprehensive documentation.
