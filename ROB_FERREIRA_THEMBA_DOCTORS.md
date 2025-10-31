# 👨‍⚕️ Doctors for Rob Ferreira & Themba Hospitals

## 🎯 Objective
Add 10 doctors specifically assigned to **Rob Ferreira Hospital** and **Themba Hospital**.

## 📋 Doctors to Add

### 1. **Dr. Sipho Mthembu** - Emergency Medicine
- **Email**: sipho.mthembu@hospital.com
- **License**: MP100001
- **Experience**: 15 years
- **Qualifications**: MBChB, FCS(SA) Emergency Medicine
- **Phone**: +27 13 759 0111

### 2. **Dr. Thandiwe Nkosi** - Pediatrics
- **Email**: thandiwe.nkosi@hospital.com
- **License**: MP100002
- **Experience**: 10 years
- **Qualifications**: MBChB, FCPaed(SA)
- **Phone**: +27 13 759 0112

### 3. **Dr. Mandla Dlamini** - General Surgery
- **Email**: mandla.dlamini@hospital.com
- **License**: MP100003
- **Experience**: 18 years
- **Qualifications**: MBChB, FCS(SA)
- **Phone**: +27 13 759 0113

### 4. **Dr. Nomsa Khumalo** - Obstetrics and Gynecology
- **Email**: nomsa.khumalo@hospital.com
- **License**: MP100004
- **Experience**: 12 years
- **Qualifications**: MBChB, FCOG(SA)
- **Phone**: +27 13 759 0114

### 5. **Dr. Thabo Mokoena** - Internal Medicine
- **Email**: thabo.mokoena@hospital.com
- **License**: MP100005
- **Experience**: 14 years
- **Qualifications**: MBChB, FCP(SA)
- **Phone**: +27 13 759 0115

### 6. **Dr. Zanele Sithole** - Cardiology
- **Email**: zanele.sithole@hospital.com
- **License**: MP100006
- **Experience**: 16 years
- **Qualifications**: MBChB, FCP(SA), Cert Cardiology
- **Phone**: +27 13 759 0116

### 7. **Dr. Bongani Ndlovu** - Orthopedics
- **Email**: bongani.ndlovu@hospital.com
- **License**: MP100007
- **Experience**: 13 years
- **Qualifications**: MBChB, FCS(SA) Ortho
- **Phone**: +27 13 759 0117

### 8. **Dr. Lindiwe Zulu** - Psychiatry
- **Email**: lindiwe.zulu@hospital.com
- **License**: MP100008
- **Experience**: 11 years
- **Qualifications**: MBChB, FCPsych(SA)
- **Phone**: +27 13 759 0118

### 9. **Dr. Siyabonga Cele** - Radiology
- **Email**: siyabonga.cele@hospital.com
- **License**: MP100009
- **Experience**: 9 years
- **Qualifications**: MBChB, MMed Radiology
- **Phone**: +27 13 759 0119

### 10. **Dr. Nokuthula Mkhize** - Anesthesiology
- **Email**: nokuthula.mkhize@hospital.com
- **License**: MP100010
- **Experience**: 10 years
- **Qualifications**: MBChB, FCA(SA)
- **Phone**: +27 13 759 0120

---

## 🔧 How to Add These Doctors

### **Method 1: Using Postman/Thunder Client** (Recommended)

#### Step 1: Get Facility IDs
```
GET http://localhost:5000/api/facilities
```

Find the `_id` values for:
- Rob Ferreira Hospital
- Themba Hospital

#### Step 2: Login as Admin
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@hospital.com",
  "password": "admin123"
}
```

Copy the `token` from response.

#### Step 3: Add Each Doctor
```
POST http://localhost:5000/api/users/add-staff
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Dr. Sipho Mthembu",
  "email": "sipho.mthembu@hospital.com",
  "role": "DOCTOR",
  "department": "Emergency Medicine",
  "specialization": "Emergency Medicine",
  "licenseNumber": "MP100001",
  "facilityIds": [
    "ROB_FERREIRA_ID_HERE",
    "THEMBA_ID_HERE"
  ]
}
```

Repeat for all 10 doctors.

---

### **Method 2: Using the Script** (When MongoDB is accessible)

If you can start MongoDB directly:

```bash
# Start MongoDB service first
# Then run:
node backend/scripts/addDoctorsToMongoDB.js
```

---

### **Method 3: Manual Database Insert**

If you have MongoDB Compass:

1. Connect to your MongoDB
2. Open `hospital_management` database
3. Open `users` collection
4. Click "Insert Document"
5. Paste this template (update facilityIds):

```json
{
  "name": "Dr. Sipho Mthembu",
  "email": "sipho.mthembu@hospital.com",
  "role": "DOCTOR",
  "department": "Emergency Medicine",
  "specialization": "Emergency Medicine",
  "licenseNumber": "MP100001",
  "facilityIds": [
    ObjectId("ROB_FERREIRA_ID"),
    ObjectId("THEMBA_ID")
  ],
  "experience": "15 years",
  "qualifications": "MBChB, FCS(SA) Emergency Medicine",
  "phone": "+27 13 759 0111",
  "isVerified": true,
  "createdAt": new Date()
}
```

---

## ✅ What Happens After Adding

Once these doctors are added:

1. **Patients at Rob Ferreira** → Will see all 10 doctors
2. **Patients at Themba** → Will see all 10 doctors
3. **Patients at other facilities** → Won't see these doctors
4. **Facility filtering** → Works automatically

---

## 🧪 Testing

After adding the doctors:

1. **Login as a patient** registered at Rob Ferreira or Themba
2. **Go to "Book Appointment"**
3. **Select "Doctor"**
4. **You should see these 10 doctors!** ✨

---

## 📊 Specializations Covered

- ✅ Emergency Medicine
- ✅ Pediatrics
- ✅ General Surgery
- ✅ Obstetrics and Gynecology
- ✅ Internal Medicine
- ✅ Cardiology
- ✅ Orthopedics
- ✅ Psychiatry
- ✅ Radiology
- ✅ Anesthesiology

A comprehensive medical team for both hospitals! 🏥

---

## 🔍 Verification

To verify doctors were added:

```
GET http://localhost:5000/api/users?role=staff&facilityIds=ROB_FERREIRA_ID
Authorization: Bearer YOUR_TOKEN
```

This will show all doctors assigned to Rob Ferreira Hospital.

---

**Need help adding these?** Let me know if you need assistance with any of the methods above!
