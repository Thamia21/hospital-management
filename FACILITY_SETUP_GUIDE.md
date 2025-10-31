# 🏥 Facility Setup Guide

## Quick Start: Adding Facilities to Your Database

### 🚀 Method 1: Seed Pre-configured Facilities (Recommended)

The easiest way to get started is to use the pre-configured South African facilities:

```bash
cd backend
node scripts/seedFacilities.js
```

**What you get:**
- ✅ 55+ South African healthcare facilities
- ✅ Facilities across all 9 provinces
- ✅ Hospitals, clinics, and community health centers
- ✅ Complete facility information (address, phone, email)

**Output:**
```
Connected to MongoDB
Clearing existing facilities...
Existing facilities cleared
Seeding South African facilities...
✅ Successfully seeded 55 South African facilities

📊 Facilities by Province:
   Gauteng: 12 facilities
   Western Cape: 10 facilities
   KwaZulu-Natal: 8 facilities
   Eastern Cape: 6 facilities
   Mpumalanga: 5 facilities
   Limpopo: 4 facilities
   North West: 4 facilities
   Free State: 4 facilities
   Northern Cape: 2 facilities

🏥 Facilities by Type:
   HOSPITAL: 45 facilities
   CLINIC: 7 facilities
   CHC: 3 facilities

🎉 South African facilities seeding completed successfully!
```

---

## 🏥 Sample Facilities Included

### Gauteng Province
- Chris Hani Baragwanath Hospital (Soweto)
- Charlotte Maxeke Johannesburg Academic Hospital
- Steve Biko Academic Hospital (Pretoria)
- Helen Joseph Hospital (Johannesburg)
- Johannesburg General Hospital
- Kalafong Provincial Tertiary Hospital
- And more...

### Western Cape
- Groote Schuur Hospital (Cape Town)
- Tygerberg Hospital (Cape Town)
- Red Cross War Memorial Children's Hospital
- Victoria Hospital (Cape Town)
- And more...

### KwaZulu-Natal
- Inkosi Albert Luthuli Central Hospital (Durban)
- King Edward VIII Hospital (Durban)
- Addington Hospital (Durban)
- And more...

### Mpumalanga
- **Rob Ferreira Hospital** (Nelspruit) ⭐
- **Themba Hospital** (Kabokweni) ⭐
- Witbank Hospital
- And more...

*⭐ These facilities have doctors assigned*

---

## ➕ Adding Your Own Custom Facilities

### Option 1: Via API (Postman/Thunder Client)

**Step 1: Login as Admin**
```
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "admin@hospital.com",
  "password": "admin123"
}
```

**Step 2: Add Facility**
```
POST http://localhost:5000/api/facilities
Authorization: Bearer YOUR_TOKEN_HERE
Content-Type: application/json

{
  "name": "Your Hospital Name",
  "type": "HOSPITAL",
  "address": "123 Main Street, City, Postal Code",
  "province": "Gauteng",
  "district": "Johannesburg",
  "phone": "+27 11 123 4567",
  "email": "info@yourhospital.com",
  "website": "https://www.yourhospital.com",
  "services": ["Emergency", "Surgery", "Pediatrics"]
}
```

### Option 2: Direct MongoDB Insert

Using MongoDB Compass or shell:

```javascript
db.facilities.insertOne({
  name: "Your Hospital Name",
  type: "HOSPITAL",
  address: "123 Main Street, City, Postal Code",
  province: "Gauteng",
  district: "Johannesburg",
  phone: "+27 11 123 4567",
  email: "info@yourhospital.com",
  website: "https://www.yourhospital.com",
  services: ["Emergency", "Surgery", "Pediatrics"],
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### Option 3: Create a Custom Seed Script

Create `backend/scripts/seedMyFacilities.js`:

```javascript
const mongoose = require('mongoose');
const Facility = require('../models/Facility');

const myFacilities = [
  {
    name: "My Hospital 1",
    type: "HOSPITAL",
    address: "Address 1",
    province: "Gauteng",
    district: "Johannesburg",
    phone: "+27 11 111 1111",
    email: "hospital1@example.com"
  },
  {
    name: "My Clinic 1",
    type: "CLINIC",
    address: "Address 2",
    province: "Gauteng",
    district: "Johannesburg",
    phone: "+27 11 222 2222",
    email: "clinic1@example.com"
  }
];

async function seedMyFacilities() {
  try {
    await mongoose.connect('mongodb://localhost:27017/hospital_management');
    console.log('Connected to MongoDB');
    
    const inserted = await Facility.insertMany(myFacilities);
    console.log(`✅ Added ${inserted.length} facilities`);
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

seedMyFacilities();
```

Run it:
```bash
node backend/scripts/seedMyFacilities.js
```

---

## 📋 Facility Types

Choose the appropriate type for your facility:

| Type | Description | Example |
|------|-------------|---------|
| `HOSPITAL` | General hospitals | Chris Hani Baragwanath |
| `CLINIC` | Community clinics | Local health clinic |
| `CHC` | Community Health Centers | District CHC |
| `ACADEMIC` | Teaching hospitals | Charlotte Maxeke |
| `DISTRICT` | District hospitals | District Hospital |
| `PROVINCIAL` | Provincial hospitals | Provincial Hospital |
| `PRIVATE` | Private hospitals | Netcare, Life Healthcare |

---

## 🔍 Viewing Facilities

### Via API
```bash
GET http://localhost:5000/api/facilities
```

### Via MongoDB Compass
1. Connect to `mongodb://localhost:27017`
2. Open `hospital_management` database
3. View `facilities` collection

### Via MongoDB Shell
```javascript
use hospital_management
db.facilities.find().pretty()

// Count facilities
db.facilities.countDocuments()

// Find by province
db.facilities.find({ province: "Gauteng" })

// Find by type
db.facilities.find({ type: "HOSPITAL" })
```

---

## 🔗 Linking Doctors to Facilities

After adding facilities, you need to assign doctors to them:

### Method 1: Use the Add Doctors Script
```bash
# Edit addDoctorsNow.js to use your facility IDs
node addDoctorsNow.js
```

### Method 2: Via API
```bash
POST http://localhost:5000/api/users/add-staff
Authorization: Bearer <admin_token>

{
  "name": "Dr. John Doe",
  "email": "john.doe@hospital.com",
  "role": "DOCTOR",
  "specialization": "Cardiology",
  "licenseNumber": "MP123456",
  "facilityIds": ["YOUR_FACILITY_ID_1", "YOUR_FACILITY_ID_2"]
}
```

### Method 3: Update Existing Doctor
```bash
PUT http://localhost:5000/api/users/{doctorId}
Authorization: Bearer <admin_token>

{
  "facilityIds": ["YOUR_FACILITY_ID_1", "YOUR_FACILITY_ID_2"]
}
```

---

## 🧪 Testing Facility Setup

### 1. Verify Facilities Were Added
```bash
# Check count
curl http://localhost:5000/api/facilities | jq 'length'

# View all facilities
curl http://localhost:5000/api/facilities | jq '.'
```

### 2. Test Facility-Based Filtering
1. Create/update a patient with a facility assignment
2. Login as that patient
3. Go to "Book Appointment"
4. Select "Doctor"
5. You should only see doctors from that facility

---

## 🐛 Troubleshooting

### Problem: "No facilities found"
**Solution**: Run the seed script:
```bash
cd backend
node scripts/seedFacilities.js
```

### Problem: "Duplicate key error"
**Solution**: Facilities already exist. Either:
- Skip seeding (facilities are already there)
- Clear and re-seed:
```javascript
// In MongoDB shell
db.facilities.deleteMany({})
// Then run seed script again
```

### Problem: "Cannot connect to MongoDB"
**Solution**: 
- Ensure MongoDB is running
- Check connection string in `.env`
- For Atlas, verify network access

---

## 📊 Facility Data Structure

```javascript
{
  _id: ObjectId("..."),
  name: "Hospital Name",
  type: "HOSPITAL",
  address: "Full address",
  province: "Province name",
  district: "District name",
  phone: "+27 XX XXX XXXX",
  email: "contact@hospital.com",
  website: "https://hospital.com",
  services: ["Emergency", "Surgery"],
  createdAt: ISODate("..."),
  updatedAt: ISODate("...")
}
```

---

## ✅ Checklist

After setting up facilities:

- [ ] Facilities seeded successfully
- [ ] Facilities visible via API
- [ ] Doctors assigned to facilities
- [ ] Patients assigned to facilities
- [ ] Facility-based filtering tested
- [ ] Appointment booking works correctly

---

## 🎯 Next Steps

After adding facilities:

1. **Add Doctors**: Assign doctors to your facilities
   ```bash
   node addDoctorsNow.js
   ```

2. **Assign Patients**: Link patients to facilities
   ```bash
   node assignFacilityToPatient.js
   ```

3. **Test Filtering**: Verify facility-based doctor filtering works

4. **Add More Data**: Add nurses, appointments, etc.

---

**Need help?** Check the main README.md or other documentation files for more information!
