# 🏥 Nurse-Patient Assignment System

## 📋 **Current Implementation:**

Currently, `NursePatients` fetches **ALL patients** in the system. This is a temporary implementation for demo purposes.

## 🎯 **How It SHOULD Work in Production:**

A nurse should only see patients who are:

### **1. Assigned to Their Care** 👨‍⚕️
- Patients specifically assigned to this nurse
- Patients in the nurse's ward/unit
- Patients under the nurse's direct care

### **2. Have Appointments with the Nurse** 📅
- Patients with upcoming appointments
- Patients with past appointments
- Patients scheduled for procedures with this nurse

### **3. Referred by Doctors** 🩺
- Patients referred by doctors for nursing care
- Patients requiring specific nursing procedures
- Post-operative patients assigned to nurse

### **4. Registered by the Nurse** 📝
- Patients the nurse has admitted
- Patients the nurse has registered in the system

## 🔧 **Backend Implementation Needed:**

### **Database Schema Changes:**

#### **1. Patient Assignment Table:**
```javascript
PatientAssignment {
  id: ObjectId,
  patientId: ObjectId,
  nurseId: ObjectId,
  assignedBy: ObjectId, // Doctor or Admin who assigned
  assignmentType: String, // 'DIRECT', 'APPOINTMENT', 'REFERRAL', 'WARD'
  ward: String,
  startDate: Date,
  endDate: Date,
  status: String, // 'ACTIVE', 'COMPLETED', 'TRANSFERRED'
  notes: String
}
```

#### **2. Update Appointment Model:**
```javascript
Appointment {
  // ... existing fields
  assignedNurseId: ObjectId, // Nurse assigned to this appointment
  nursingNotes: String
}
```

#### **3. Update Patient Model:**
```javascript
Patient {
  // ... existing fields
  primaryNurseId: ObjectId, // Primary nurse for this patient
  ward: String,
  assignedNurses: [ObjectId] // Array of nurse IDs
}
```

### **Backend API Endpoints:**

#### **1. Get Nurse's Patients:**
```javascript
GET /api/nurses/:nurseId/patients

// Returns patients based on:
// - Direct assignments
// - Appointments
// - Ward assignments
// - Referrals

Response: [
  {
    id: "patient123",
    name: "John Doe",
    assignmentType: "DIRECT",
    ward: "ICU",
    assignedDate: "2025-10-20",
    status: "Active",
    lastVisit: "2025-10-29",
    nextAppointment: "2025-11-01"
  }
]
```

#### **2. Assign Patient to Nurse:**
```javascript
POST /api/nurses/:nurseId/patients

Body: {
  patientId: "patient123",
  assignmentType: "DIRECT",
  ward: "ICU",
  notes: "Post-surgery care"
}
```

#### **3. Get Nurse's Appointments:**
```javascript
GET /api/nurses/:nurseId/appointments

// Returns appointments where this nurse is assigned
```

## 💻 **Frontend Implementation:**

### **Current Code (Temporary):**
```javascript
const fetchPatients = async () => {
  const data = await userService.getPatients(); // Gets ALL patients
  setPatients(data);
};
```

### **Production Code (Recommended):**
```javascript
const fetchPatients = async () => {
  const nurseId = user._id || user.id;
  const data = await userService.getNursePatients(nurseId);
  setPatients(data);
};
```

### **API Service Method:**
```javascript
// In src/services/api.js
async getNursePatients(nurseId) {
  const res = await axios.get(
    `${API_URL}/nurses/${nurseId}/patients`, 
    { headers: getAuthHeader() }
  );
  return res.data;
}
```

## 🔄 **Patient Assignment Workflow:**

### **Scenario 1: Doctor Assigns Patient to Nurse**
1. Doctor sees patient
2. Doctor assigns patient to specific nurse for care
3. System creates `PatientAssignment` record
4. Nurse sees patient in their patient list
5. Nurse can view patient details and add nursing notes

### **Scenario 2: Appointment-Based Assignment**
1. Patient books appointment
2. Appointment includes assigned nurse
3. Nurse sees patient in their list for appointment date
4. After appointment, patient may remain assigned or be unassigned

### **Scenario 3: Ward-Based Assignment**
1. Patient admitted to ward (e.g., ICU, Pediatrics)
2. All nurses in that ward see the patient
3. Primary nurse is designated for patient
4. Other ward nurses can view but have limited edit rights

### **Scenario 4: Referral-Based Assignment**
1. Doctor refers patient for specific nursing care
2. Referral specifies nurse or nursing team
3. Nurse receives notification
4. Patient appears in nurse's list with referral details

## 🎨 **UI Enhancements for Production:**

### **Filter by Assignment Type:**
```javascript
<Tabs>
  <Tab label="All My Patients" />
  <Tab label="Direct Assignments" />
  <Tab label="Appointments" />
  <Tab label="Ward Patients" />
  <Tab label="Referrals" />
</Tabs>
```

### **Patient Card Shows Assignment Info:**
```javascript
<Card>
  <Chip label="Direct Assignment" color="primary" />
  <Chip label="Ward: ICU" color="secondary" />
  <Typography>Assigned by: Dr. Smith</Typography>
  <Typography>Assignment Date: Oct 20, 2025</Typography>
</Card>
```

## 🔐 **Security Considerations:**

### **Access Control:**
- ✅ Nurses can only view patients assigned to them
- ✅ Nurses cannot view all patients in the system
- ✅ Nurses can only edit records for their assigned patients
- ✅ Audit trail for all patient access

### **Backend Validation:**
```javascript
// Backend middleware
async function validateNursePatientAccess(req, res, next) {
  const nurseId = req.user.id;
  const patientId = req.params.patientId;
  
  const hasAccess = await checkNursePatientAssignment(nurseId, patientId);
  
  if (!hasAccess) {
    return res.status(403).json({ 
      error: 'You do not have access to this patient' 
    });
  }
  
  next();
}
```

## 📊 **Database Queries:**

### **Get Nurse's Patients (MongoDB):**
```javascript
// Find all patients assigned to this nurse
const patients = await Patient.aggregate([
  {
    $lookup: {
      from: 'patientassignments',
      localField: '_id',
      foreignField: 'patientId',
      as: 'assignments'
    }
  },
  {
    $match: {
      'assignments.nurseId': nurseId,
      'assignments.status': 'ACTIVE'
    }
  },
  {
    $lookup: {
      from: 'appointments',
      localField: '_id',
      foreignField: 'patientId',
      as: 'appointments'
    }
  }
]);
```

## 🚀 **Implementation Steps:**

### **Phase 1: Backend (Priority)**
1. ✅ Create `PatientAssignment` model
2. ✅ Add `assignedNurseId` to Appointment model
3. ✅ Create `/api/nurses/:nurseId/patients` endpoint
4. ✅ Create `/api/nurses/:nurseId/patients` POST endpoint (assign patient)
5. ✅ Add access control middleware

### **Phase 2: Frontend**
1. ✅ Update `userService.getNursePatients(nurseId)`
2. ✅ Update `NursePatients` to use new endpoint
3. ✅ Add assignment type filters
4. ✅ Show assignment details in UI

### **Phase 3: Features**
1. ✅ Doctor can assign patients to nurses
2. ✅ Admin can manage nurse-patient assignments
3. ✅ Notifications when patient is assigned
4. ✅ Transfer patient between nurses

## 📝 **Current Status:**

### **✅ What's Implemented:**
- Basic patient list display
- Search and filter functionality
- Add new patient form
- View patient details

### **⏳ What's Pending (Backend Required):**
- Nurse-specific patient filtering
- Patient assignment system
- Ward-based access
- Appointment-based access
- Referral system

## 🎯 **Temporary Workaround:**

Until the backend is implemented, the system shows all patients. To simulate nurse-specific patients, you can:

1. **Add a filter in the frontend:**
```javascript
const filteredData = data.filter(patient => {
  // Simulate: Only show patients whose name starts with A-M for this nurse
  return patient.name[0] <= 'M';
});
```

2. **Use localStorage to track assignments:**
```javascript
const assignedPatients = JSON.parse(localStorage.getItem('nursePatients') || '[]');
const filteredData = data.filter(p => assignedPatients.includes(p.id));
```

---

## 📌 **Summary:**

**Current:** Nurse sees ALL patients (temporary for demo)

**Production:** Nurse sees only:
- ✅ Directly assigned patients
- ✅ Patients with appointments
- ✅ Patients in their ward
- ✅ Patients referred to them

**Next Step:** Implement backend patient assignment system with proper access control.
