# 📮 Postman Guide: Add Doctors to Rob Ferreira & Themba

## 🎯 Step-by-Step Instructions

### **Step 1: Get Facility IDs**

**Request:**
```
Method: GET
URL: http://localhost:5000/api/facilities
```

**What to do:**
1. Open Postman
2. Create a new request
3. Set method to `GET`
4. Enter URL: `http://localhost:5000/api/facilities`
5. Click **Send**

**Find these facilities in the response:**
- Look for "Rob Ferreira" (search for `"name"` field containing "Rob Ferreira")
- Look for "Themba" (search for `"name"` field containing "Themba")
- **Copy their `_id` values** - you'll need these!

Example response snippet:
```json
{
  "_id": "68eed44e97d8cff007f56abc",
  "name": "Rob Ferreira Hospital",
  "type": "HOSPITAL",
  ...
}
```

**📝 Write down:**
- Rob Ferreira ID: `_________________`
- Themba ID: `_________________`

---

### **Step 2: Login as Admin**

**Request:**
```
Method: POST
URL: http://localhost:5000/api/auth/login
Headers:
  Content-Type: application/json
Body (raw JSON):
{
  "email": "admin@hospital.com",
  "password": "admin123"
}
```

**What to do:**
1. Create a new request in Postman
2. Set method to `POST`
3. Enter URL: `http://localhost:5000/api/auth/login`
4. Go to **Headers** tab
5. Add header: `Content-Type` = `application/json`
6. Go to **Body** tab
7. Select **raw** and **JSON**
8. Paste the JSON above
9. Click **Send**

**Response will look like:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "name": "Admin User",
    "role": "ADMIN"
  }
}
```

**📝 Copy the entire `token` value** - you'll use this for all doctor additions!

---

### **Step 3: Add Doctor #1 - Dr. Sipho Mthembu (Emergency Medicine)**

**Request:**
```
Method: POST
URL: http://localhost:5000/api/users/add-staff
Headers:
  Content-Type: application/json
  Authorization: Bearer YOUR_TOKEN_HERE
Body (raw JSON):
{
  "name": "Dr. Sipho Mthembu",
  "email": "sipho.mthembu@hospital.com",
  "role": "DOCTOR",
  "department": "Emergency Medicine",
  "specialization": "Emergency Medicine",
  "licenseNumber": "MP100001",
  "facilityIds": [
    "PASTE_ROB_FERREIRA_ID_HERE",
    "PASTE_THEMBA_ID_HERE"
  ]
}
```

**What to do:**
1. Create a new request
2. Set method to `POST`
3. Enter URL: `http://localhost:5000/api/users/add-staff`
4. Go to **Headers** tab
5. Add two headers:
   - `Content-Type` = `application/json`
   - `Authorization` = `Bearer YOUR_TOKEN_FROM_STEP_2`
6. Go to **Body** tab
7. Select **raw** and **JSON**
8. Paste the JSON above
9. **Replace** `PASTE_ROB_FERREIRA_ID_HERE` with actual ID from Step 1
10. **Replace** `PASTE_THEMBA_ID_HERE` with actual ID from Step 1
11. Click **Send**

**Success Response:**
```json
{
  "message": "DOCTOR added successfully. An email has been sent for them to set their password."
}
```

✅ **Doctor #1 added!**

---

### **Step 4: Add Doctor #2 - Dr. Thandiwe Nkosi (Pediatrics)**

**Use the same request as Step 3, but change the Body to:**

```json
{
  "name": "Dr. Thandiwe Nkosi",
  "email": "thandiwe.nkosi@hospital.com",
  "role": "DOCTOR",
  "department": "Pediatrics",
  "specialization": "Pediatrics",
  "licenseNumber": "MP100002",
  "facilityIds": [
    "PASTE_ROB_FERREIRA_ID_HERE",
    "PASTE_THEMBA_ID_HERE"
  ]
}
```

✅ **Doctor #2 added!**

---

### **Step 5: Add Doctor #3 - Dr. Mandla Dlamini (General Surgery)**

```json
{
  "name": "Dr. Mandla Dlamini",
  "email": "mandla.dlamini@hospital.com",
  "role": "DOCTOR",
  "department": "Surgery",
  "specialization": "General Surgery",
  "licenseNumber": "MP100003",
  "facilityIds": [
    "PASTE_ROB_FERREIRA_ID_HERE",
    "PASTE_THEMBA_ID_HERE"
  ]
}
```

✅ **Doctor #3 added!**

---

### **Step 6: Add Doctor #4 - Dr. Nomsa Khumalo (OB/GYN)**

```json
{
  "name": "Dr. Nomsa Khumalo",
  "email": "nomsa.khumalo@hospital.com",
  "role": "DOCTOR",
  "department": "Obstetrics and Gynecology",
  "specialization": "Obstetrics and Gynecology",
  "licenseNumber": "MP100004",
  "facilityIds": [
    "PASTE_ROB_FERREIRA_ID_HERE",
    "PASTE_THEMBA_ID_HERE"
  ]
}
```

✅ **Doctor #4 added!**

---

### **Step 7: Add Doctor #5 - Dr. Thabo Mokoena (Internal Medicine)**

```json
{
  "name": "Dr. Thabo Mokoena",
  "email": "thabo.mokoena@hospital.com",
  "role": "DOCTOR",
  "department": "Internal Medicine",
  "specialization": "Internal Medicine",
  "licenseNumber": "MP100005",
  "facilityIds": [
    "PASTE_ROB_FERREIRA_ID_HERE",
    "PASTE_THEMBA_ID_HERE"
  ]
}
```

✅ **Doctor #5 added!**

---

### **Step 8: Add Doctor #6 - Dr. Zanele Sithole (Cardiology)**

```json
{
  "name": "Dr. Zanele Sithole",
  "email": "zanele.sithole@hospital.com",
  "role": "DOCTOR",
  "department": "Cardiology",
  "specialization": "Cardiology",
  "licenseNumber": "MP100006",
  "facilityIds": [
    "PASTE_ROB_FERREIRA_ID_HERE",
    "PASTE_THEMBA_ID_HERE"
  ]
}
```

✅ **Doctor #6 added!**

---

### **Step 9: Add Doctor #7 - Dr. Bongani Ndlovu (Orthopedics)**

```json
{
  "name": "Dr. Bongani Ndlovu",
  "email": "bongani.ndlovu@hospital.com",
  "role": "DOCTOR",
  "department": "Orthopedics",
  "specialization": "Orthopedics",
  "licenseNumber": "MP100007",
  "facilityIds": [
    "PASTE_ROB_FERREIRA_ID_HERE",
    "PASTE_THEMBA_ID_HERE"
  ]
}
```

✅ **Doctor #7 added!**

---

### **Step 10: Add Doctor #8 - Dr. Lindiwe Zulu (Psychiatry)**

```json
{
  "name": "Dr. Lindiwe Zulu",
  "email": "lindiwe.zulu@hospital.com",
  "role": "DOCTOR",
  "department": "Psychiatry",
  "specialization": "Psychiatry",
  "licenseNumber": "MP100008",
  "facilityIds": [
    "PASTE_ROB_FERREIRA_ID_HERE",
    "PASTE_THEMBA_ID_HERE"
  ]
}
```

✅ **Doctor #8 added!**

---

### **Step 11: Add Doctor #9 - Dr. Siyabonga Cele (Radiology)**

```json
{
  "name": "Dr. Siyabonga Cele",
  "email": "siyabonga.cele@hospital.com",
  "role": "DOCTOR",
  "department": "Radiology",
  "specialization": "Radiology",
  "licenseNumber": "MP100009",
  "facilityIds": [
    "PASTE_ROB_FERREIRA_ID_HERE",
    "PASTE_THEMBA_ID_HERE"
  ]
}
```

✅ **Doctor #9 added!**

---

### **Step 12: Add Doctor #10 - Dr. Nokuthula Mkhize (Anesthesiology)**

```json
{
  "name": "Dr. Nokuthula Mkhize",
  "email": "nokuthula.mkhize@hospital.com",
  "role": "DOCTOR",
  "department": "Anesthesiology",
  "specialization": "Anesthesiology",
  "licenseNumber": "MP100010",
  "facilityIds": [
    "PASTE_ROB_FERREIRA_ID_HERE",
    "PASTE_THEMBA_ID_HERE"
  ]
}
```

✅ **Doctor #10 added!**

---

## 🎉 All Done!

You've successfully added 10 doctors to Rob Ferreira and Themba hospitals!

---

## ✅ Verify Doctors Were Added

**Request:**
```
Method: GET
URL: http://localhost:5000/api/users?role=staff
Headers:
  Authorization: Bearer YOUR_TOKEN
```

This will show all staff (doctors and nurses). Look for the 10 doctors you just added!

---

## 🧪 Test the Filtering

1. **Create a test patient** at Rob Ferreira or Themba
2. **Login as that patient**
3. **Go to "Book Appointment"**
4. **Select "Doctor"**
5. **You should see all 10 doctors!** ✨

---

## 💡 Pro Tips

### **Save Time with Postman Collections:**
1. Save the "Add Staff" request
2. Duplicate it 10 times
3. Just change the body for each doctor
4. Run them one by one

### **If You Get "Already Exists" Error:**
That's okay! It means the doctor is already in the database.

### **If Token Expires:**
Just repeat Step 2 to get a new token.

---

## 🆘 Troubleshooting

### **Error: "Invalid credentials"**
- Make sure you're using: `admin@hospital.com` / `admin123`
- Check that backend server is running on port 5000

### **Error: "Invalid token"**
- Get a fresh token from Step 2
- Make sure you include "Bearer " before the token

### **Error: "User already exists"**
- The doctor is already in the database
- Skip to the next doctor

### **Error: "Unauthorized"**
- Make sure the Authorization header is correct
- Format: `Bearer YOUR_TOKEN` (with space after "Bearer")

---

## 📊 Summary

After completing all steps, you will have:
- ✅ 10 doctors added
- ✅ All assigned to Rob Ferreira Hospital
- ✅ All assigned to Themba Hospital
- ✅ Covering 10 different medical specializations
- ✅ Ready for patients to book appointments

**Happy doctor adding!** 🏥👨‍⚕️
