# Cross-Hospital System - Quick Start Guide

## 🚀 Get Started in 5 Steps

### Step 1: Environment Setup (2 minutes)

Add this to your `.env` file:

```env
# Patient Identification Security
ID_HASH_SALT=your-secure-random-salt-change-in-production-use-long-random-string
```

Generate a secure salt:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Register API Routes (1 minute)

Add to `backend/server.js`:

```javascript
// Cross-hospital routes
app.use('/api/cross-hospital', require('./routes/crossHospitalRoutes'));
```

Create `backend/routes/crossHospitalRoutes.js`:

```javascript
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const crossHospitalAccessService = require('../services/crossHospitalAccessService');
const patientIdentificationService = require('../services/patientIdentificationService');

// Request patient records from other hospitals
router.post('/request-records', auth, async (req, res) => {
  try {
    const result = await crossHospitalAccessService.requestPatientRecords({
      patientUUID: req.body.patientUUID,
      requestingDoctorId: req.user.id,
      requestingFacilityId: req.user.facilityId,
      purpose: req.body.purpose,
      recordTypes: req.body.recordTypes || ['all']
    });
    res.json(result);
  } catch (error) {
    console.error('Error requesting records:', error);
    res.status(500).json({ error: error.message });
  }
});

// Grant consent for cross-hospital access
router.post('/consent/grant/:consentId', auth, async (req, res) => {
  try {
    const result = await crossHospitalAccessService.grantPatientConsent(
      req.params.consentId,
      {
        digitalSignature: req.body.signature,
        ipAddress: req.ip
      }
    );
    res.json(result);
  } catch (error) {
    console.error('Error granting consent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Withdraw consent
router.post('/consent/withdraw/:consentId', auth, async (req, res) => {
  try {
    const result = await crossHospitalAccessService.withdrawConsent(
      req.params.consentId,
      req.body.reason,
      req.user.id
    );
    res.json(result);
  } catch (error) {
    console.error('Error withdrawing consent:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get patient's registered hospitals
router.get('/patient/:patientUUID/hospitals', auth, async (req, res) => {
  try {
    const hospitals = await patientIdentificationService.getPatientHospitals(
      req.params.patientUUID
    );
    res.json(hospitals);
  } catch (error) {
    console.error('Error fetching hospitals:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### Step 3: Update Patient Registration (5 minutes)

Modify your patient registration endpoint to generate UUID:

```javascript
// In your existing registration route (e.g., authRoutes.js)
const patientIdentificationService = require('../services/patientIdentificationService');

router.post('/register', async (req, res) => {
  try {
    // Your existing user creation code
    const newUser = new User({
      name: req.body.name,
      email: req.body.email,
      password: hashedPassword,
      role: 'PATIENT',
      idNumber: req.body.idNumber,
      dateOfBirth: req.body.dateOfBirth,
      phone: req.body.phone,
      facilityId: req.body.facilityId
    });
    
    await newUser.save();
    
    // NEW: Register patient in central registry
    if (newUser.role === 'PATIENT' && newUser.idNumber) {
      try {
        const identificationResult = await patientIdentificationService.registerOrIdentifyPatient({
          idNumber: newUser.idNumber,
          firstName: newUser.name.split(' ')[0],
          lastName: newUser.name.split(' ').slice(1).join(' '),
          dateOfBirth: newUser.dateOfBirth,
          email: newUser.email,
          phone: newUser.phone,
          localPatientId: newUser._id,
          registeredBy: req.user?.id || newUser._id,
          ipAddress: req.ip
        }, newUser.facilityId);
        
        // Update user with patientUUID
        newUser.patientUUID = identificationResult.patientUUID;
        await newUser.save();
        
        console.log(`✅ Patient registered with UUID: ${identificationResult.patientUUID}`);
      } catch (error) {
        console.error('Error registering patient UUID:', error);
        // Don't fail registration if UUID generation fails
      }
    }
    
    // Your existing response code
    res.status(201).json({ message: 'User registered successfully' });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### Step 4: Test the System (5 minutes)

#### Test 1: Register a Patient

```bash
# Register patient at Hospital 1
POST http://localhost:5000/api/auth/register
{
  "name": "Thabo Mokoena",
  "email": "thabo@example.com",
  "password": "password123",
  "role": "PATIENT",
  "idNumber": "8503155678089",
  "dateOfBirth": "1985-03-15",
  "phone": "+27821234567",
  "facilityId": "hospital1_id_here"
}

# Check user has patientUUID
GET http://localhost:5000/api/users/me
# Should see: "patientUUID": "ZA-XX-xxxxxxxxxxxx-xx"
```

#### Test 2: Register Same Patient at Hospital 2

```bash
# Register at Hospital 2 (same SA ID)
POST http://localhost:5000/api/auth/register
{
  "name": "Thabo Mokoena",
  "email": "thabo@example.com",
  "idNumber": "8503155678089",  # Same ID
  "facilityId": "hospital2_id_here"  # Different hospital
}

# Should get SAME patientUUID
# Check patient registry shows both hospitals
```

#### Test 3: Request Cross-Hospital Records

```bash
# Doctor at Hospital 2 requests records
POST http://localhost:5000/api/cross-hospital/request-records
Authorization: Bearer {doctor_token}
{
  "patientUUID": "ZA-XX-xxxxxxxxxxxx-xx",
  "purpose": "treatment",
  "recordTypes": ["medical_records", "prescriptions"]
}

# First time: Will return pending_consent
# After patient grants consent: Will return records
```

### Step 5: Add Frontend UI (Optional)

#### Doctor Dashboard - View Patient History Button

```jsx
// In your doctor dashboard or patient view
import axios from 'axios';

const ViewPatientHistory = ({ patientUUID }) => {
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState(null);
  const [consentPending, setConsentPending] = useState(false);

  const requestHistory = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        '/api/cross-hospital/request-records',
        {
          patientUUID,
          purpose: 'treatment',
          recordTypes: ['medical_records', 'prescriptions']
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.status === 'pending_consent') {
        setConsentPending(true);
        alert('Consent request sent to patient. They will be notified.');
      } else {
        setRecords(response.data.records);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to request patient history');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button onClick={requestHistory} disabled={loading}>
        {loading ? 'Loading...' : 'View Patient History from Other Hospitals'}
      </button>
      
      {consentPending && (
        <p>Waiting for patient consent...</p>
      )}
      
      {records && (
        <div>
          <h3>Records from Other Hospitals (Read-Only)</h3>
          {records.medicalRecords.map(record => (
            <div key={record._id}>
              <p>Hospital: {record.sourceHospital}</p>
              <p>Diagnosis: {record.diagnosis}</p>
              <p>Treatment: {record.treatment}</p>
              <span style={{color: 'red'}}>READ ONLY</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## ✅ Verification Checklist

After completing the steps above, verify:

- [ ] Environment variable `ID_HASH_SALT` is set
- [ ] Cross-hospital routes are registered in server.js
- [ ] Patient registration generates patientUUID
- [ ] New patients get UUID in format `ZA-XX-xxxxxxxxxxxx-xx`
- [ ] Same patient at different hospitals gets same UUID
- [ ] Doctor can request cross-hospital records
- [ ] Consent request is created when no consent exists
- [ ] Records are returned as read-only after consent

---

## 🔍 Troubleshooting

### Issue: patientUUID not generated

**Check:**
1. Is `ID_HASH_SALT` set in .env?
2. Does patient have `idNumber` field?
3. Does patient have `facilityId` field?
4. Check server logs for errors

**Solution:**
```javascript
// Check if services are loaded
const patientIdentificationService = require('./services/patientIdentificationService');
console.log('Service loaded:', typeof patientIdentificationService.registerOrIdentifyPatient);
```

### Issue: "Cannot find module" error

**Solution:**
Make sure all files are in correct locations:
- `backend/models/PatientRegistry.js`
- `backend/models/PatientConsent.js`
- `backend/models/RecordAccessLog.js`
- `backend/services/patientIdentificationService.js`
- `backend/services/crossHospitalAccessService.js`

### Issue: Consent not working

**Check:**
1. Is consent record created in database?
2. Check `PatientConsent` collection in MongoDB
3. Verify `consentGiven: true` and `approvalStatus: 'approved'`

**Debug:**
```javascript
// Check consent status
const consent = await PatientConsent.findOne({
  patientUUID: 'your-patient-uuid',
  targetFacilityId: 'hospital-id'
});
console.log('Consent:', consent);
```

---

## 📚 Next Steps

1. **Read Full Documentation:** See `CROSS_HOSPITAL_ARCHITECTURE.md` for complete details
2. **Implement Frontend UI:** Add consent management to patient portal
3. **Add Notifications:** Notify patients when consent is requested
4. **Setup Monitoring:** Track cross-hospital access patterns
5. **Compliance Review:** Ensure POPIA compliance with legal team

---

## 🎯 Quick Reference

### Key Concepts

**Patient UUID:** Universal identifier across all hospitals  
**Consent:** Patient permission for cross-hospital access  
**Read-Only:** External records cannot be modified  
**Audit Log:** All access is tracked for compliance  

### Important Files

- `backend/services/patientIdentificationService.js` - Patient identification
- `backend/services/crossHospitalAccessService.js` - Access control
- `backend/models/PatientRegistry.js` - Central patient registry
- `CROSS_HOSPITAL_ARCHITECTURE.md` - Full documentation

### API Endpoints

- `POST /api/cross-hospital/request-records` - Request patient records
- `POST /api/cross-hospital/consent/grant/:id` - Grant consent
- `POST /api/cross-hospital/consent/withdraw/:id` - Withdraw consent
- `GET /api/cross-hospital/patient/:uuid/hospitals` - Get hospitals

---

## ✨ You're Ready!

Your cross-hospital medical records system is now operational. Patients can move between hospitals while maintaining their medical history, and doctors can access past records with proper consent.

For detailed information, see:
- `CROSS_HOSPITAL_ARCHITECTURE.md` - Complete technical documentation
- `CROSS_HOSPITAL_IMPLEMENTATION_SUMMARY.md` - Implementation overview

Good luck with your South African hospital management system! 🏥🇿🇦
