# Cross-Hospital Medical Records Architecture

## Overview

This document describes the architecture for secure, shared patient medical records across multiple South African hospitals. The system enables patients to maintain continuity of care when moving between provinces while ensuring data integrity, security, and POPIA compliance.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Patient Identification](#patient-identification)
3. [Access Control & Permissions](#access-control--permissions)
4. [Data Models](#data-models)
5. [API Implementation](#api-implementation)
6. [POPIA Compliance](#popia-compliance)
7. [Implementation Guide](#implementation-guide)

---

## System Architecture

### Hybrid Federated Model

The system uses a **hybrid federated architecture** where:

- **Each hospital maintains its own database** with full control over their patient records
- **Central Patient Registry** enables patient identification across hospitals
- **Consent-based access** allows read-only viewing of records from other hospitals
- **No data replication** - records stay at the originating hospital

```
┌─────────────────────────────────────────────────────────────┐
│                  Central Patient Registry                    │
│  - Universal Patient IDs (patientUUID)                      │
│  - Hospital Registrations                                    │
│  - Consent Records                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼────────┐   ┌───────▼────────┐   ┌───────▼────────┐
│  Hospital 1    │   │  Hospital 2    │   │  Hospital 3    │
│  (Mpumalanga)  │   │  (Gauteng)     │   │  (KZN)         │
│                │   │                │   │                │
│  Local Records │   │  Local Records │   │  Local Records │
│  - Medical     │   │  - Medical     │   │  - Medical     │
│  - Prescriptions│   │  - Prescriptions│   │  - Prescriptions│
│  - Test Results│   │  - Test Results│   │  - Test Results│
└────────────────┘   └────────────────┘   └────────────────┘
```

---

## Patient Identification

### Universal Patient UUID

Each patient receives a **Universal Patient UUID** upon first registration:

**Format:** `ZA-{province}-{hash}-{checksum}`

**Example:** `ZA-MP-a3f5c8d9e2b1-47`

### Components:

1. **Country Code:** `ZA` (South Africa)
2. **Province Code:** `MP` (Mpumalanga), `GP` (Gauteng), etc.
3. **Hash:** 12-character hash derived from SA ID + facility code + timestamp
4. **Checksum:** 2-digit checksum for validation

### SA ID Number Hashing

Patient SA ID numbers are **never stored in plain text**. Instead, they are hashed using HMAC-SHA256:

```javascript
const nationalIdHash = crypto
  .createHmac('sha256', process.env.ID_HASH_SALT)
  .update(idNumber)
  .digest('hex');
```

### Patient Registration Flow

```
Patient visits Hospital 1 (First Time)
    │
    ├─> Hash SA ID Number
    │
    ├─> Check Central Registry
    │   ├─> Not Found → Create new PatientRegistry entry
    │   │   ├─> Generate patientUUID
    │   │   └─> Add Hospital 1 registration
    │   │
    │   └─> Found → Add Hospital 1 to existing registry
    │
    └─> Update User record with patientUUID
```

### Fuzzy Matching (Fallback)

For patients without SA ID numbers, the system uses demographic matching:

- **First Name** (30 points)
- **Last Name** (30 points)
- **Date of Birth** (30 points)
- **Phone Number** (10 points)

**Match Quality:**
- **High:** ≥80 points
- **Medium:** 60-79 points
- **Low:** <60 points

---

## Access Control & Permissions

### Permission Levels

#### 1. Local Hospital Access (Full Access)
- **Create** new records
- **Read** all records
- **Update** own records
- **Delete** (with restrictions)

#### 2. Cross-Hospital Access (Read-Only)
- **Read** records from other hospitals
- **Cannot modify** external records
- **Requires patient consent**
- **Audit logged**

### Consent Management

#### Consent Types:

1. **Full Access:** All medical records
2. **Limited Access:** Specific record types only
3. **Emergency Only:** Access only during emergencies
4. **Specific Records:** Individual record selection
5. **None:** No access granted

#### Consent Workflow:

```
Doctor at Hospital 2 requests Patient1's records
    │
    ├─> Check if consent exists
    │   │
    │   ├─> YES → Fetch records (read-only)
    │   │
    │   └─> NO → Send consent request to patient
    │       │
    │       ├─> Patient reviews request
    │       │
    │       ├─> Patient grants consent
    │       │   ├─> Set expiry date (e.g., 90 days)
    │       │   └─> Define access scope
    │       │
    │       └─> Doctor can now access records
```

#### Consent Expiry:

- **Default:** 90 days
- **Renewable:** Patient can extend
- **Withdrawable:** Patient can revoke anytime
- **Auto-expire:** System automatically expires old consents

### Role-Based Access Control (RBAC)

```javascript
// Permission matrix
{
  DOCTOR: {
    local: {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: false
    },
    crossHospital: {
      canViewExternal: true,
      canRequestRecords: true,
      requiresApproval: true
    }
  },
  NURSE: {
    local: {
      canCreate: true,
      canRead: true,
      canUpdate: true,
      canDelete: false
    },
    crossHospital: {
      canViewExternal: true,
      canRequestRecords: true,
      requiresApproval: true
    }
  },
  PATIENT: {
    local: {
      canCreate: false,
      canRead: true,
      canUpdate: false,
      canDelete: false
    },
    crossHospital: {
      canViewExternal: true,
      canRequestRecords: false,
      requiresApproval: false
    }
  }
}
```

---

## Data Models

### 1. PatientRegistry (Central)

**Purpose:** Universal patient identification across hospitals

**Key Fields:**
- `patientUUID` - Universal identifier
- `nationalIdHash` - Hashed SA ID number
- `registeredHospitals[]` - Array of hospital registrations
- `consentRecords[]` - Cross-hospital consent records
- `accessLog[]` - Audit trail

**Example:**
```javascript
{
  patientUUID: "ZA-MP-a3f5c8d9e2b1-47",
  nationalIdHash: "8f3a2b1c...",
  firstName: "Thabo",
  lastName: "Mokoena",
  dateOfBirth: "1985-03-15",
  registeredHospitals: [
    {
      facilityId: ObjectId("..."),
      facilityCode: "MP001",
      facilityName: "Rob Ferreira Hospital",
      localPatientId: ObjectId("..."),
      registrationDate: "2023-01-15",
      status: "active",
      lastVisit: "2024-10-20"
    },
    {
      facilityId: ObjectId("..."),
      facilityCode: "GP002",
      facilityName: "Charlotte Maxeke Hospital",
      registrationDate: "2024-10-25",
      status: "active",
      lastVisit: "2024-10-30"
    }
  ]
}
```

### 2. PatientConsent

**Purpose:** Manage patient consent for cross-hospital access

**Key Fields:**
- `patientUUID` - Patient identifier
- `sourceFacilityId` - Patient's current hospital
- `targetFacilityId` - Hospital requesting access
- `consentGiven` - Boolean consent status
- `consentType` - Type of access granted
- `accessScope` - Specific data types allowed
- `expiryDate` - Consent expiration date

**Example:**
```javascript
{
  patientUUID: "ZA-MP-a3f5c8d9e2b1-47",
  sourceFacilityId: ObjectId("..."), // Rob Ferreira
  targetFacilityId: ObjectId("..."), // Charlotte Maxeke
  consentGiven: true,
  consentDate: "2024-10-30",
  consentType: "limited_access",
  accessScope: {
    includeMedicalRecords: true,
    includePrescriptions: true,
    includeTestResults: true,
    includeAllergies: true
  },
  expiryDate: "2025-01-28", // 90 days
  approvalStatus: "approved"
}
```

### 3. RecordAccessLog

**Purpose:** Comprehensive audit trail for POPIA compliance

**Key Fields:**
- `userId` - Who accessed
- `sourceFacilityId` - From which hospital
- `patientUUID` - Which patient
- `resourceType` - What was accessed
- `action` - What action was performed
- `isCrossHospitalAccess` - Boolean flag
- `timestamp` - When it happened

**Example:**
```javascript
{
  userId: ObjectId("..."),
  userName: "Dr. Sarah Nkosi",
  userRole: "DOCTOR",
  sourceFacilityId: ObjectId("..."),
  sourceFacilityName: "Charlotte Maxeke Hospital",
  patientUUID: "ZA-MP-a3f5c8d9e2b1-47",
  resourceType: "medical_record",
  action: "view",
  isCrossHospitalAccess: true,
  targetFacilityId: ObjectId("..."),
  targetFacilityName: "Rob Ferreira Hospital",
  purpose: "treatment",
  legalBasis: "patient_consent",
  consentVerified: true,
  timestamp: "2024-10-30T14:30:00Z"
}
```

### 4. MedicalRecord (Enhanced)

**New Fields Added:**
- `patientUUID` - Universal patient identifier
- `facilityId` - Hospital where record was created
- `facilityCode` - Hospital facility code
- `isSharedRecord` - Boolean flag
- `originFacilityId` - Original hospital
- `accessPermissions[]` - Cross-hospital access rules

### 5. Prescription (Enhanced)

**New Fields Added:**
- `patientUUID` - Universal patient identifier
- `facilityId` - Hospital where prescribed
- `isSharedRecord` - Boolean flag
- `originFacilityId` - Original hospital

---

## API Implementation

### Patient Identification Service

#### Register or Identify Patient

```javascript
const patientIdentificationService = require('./services/patientIdentificationService');

// Register new patient or identify existing
const result = await patientIdentificationService.registerOrIdentifyPatient({
  idNumber: '8503155678089',
  firstName: 'Thabo',
  lastName: 'Mokoena',
  dateOfBirth: '1985-03-15',
  email: 'thabo.mokoena@example.com',
  phone: '+27821234567',
  localPatientId: user._id,
  registeredBy: adminUserId,
  ipAddress: req.ip
}, facilityId);

// Result:
{
  patientUUID: 'ZA-MP-a3f5c8d9e2b1-47',
  isNewPatient: false,
  registry: { ... }
}
```

#### Find Patient by ID Number

```javascript
const patient = await patientIdentificationService.findPatientByIdNumber('8503155678089');
```

#### Find Patient by UUID

```javascript
const patient = await patientIdentificationService.findPatientByUUID('ZA-MP-a3f5c8d9e2b1-47');
```

### Cross-Hospital Access Service

#### Request Patient Records

```javascript
const crossHospitalAccessService = require('./services/crossHospitalAccessService');

const result = await crossHospitalAccessService.requestPatientRecords({
  patientUUID: 'ZA-MP-a3f5c8d9e2b1-47',
  requestingDoctorId: doctorId,
  requestingFacilityId: facilityId,
  purpose: 'treatment',
  recordTypes: ['medical_records', 'prescriptions']
});

// If consent exists:
{
  status: 'success',
  records: {
    medicalRecords: [...],
    prescriptions: [...],
    summary: { ... }
  },
  accessLevel: 'read_only',
  hospitals: [...]
}

// If consent needed:
{
  status: 'pending_consent',
  message: 'Patient consent required...',
  consentRequired: true
}
```

#### Grant Patient Consent

```javascript
const result = await crossHospitalAccessService.grantPatientConsent(
  consentId,
  {
    digitalSignature: signatureData,
    ipAddress: req.ip
  }
);
```

#### Withdraw Consent

```javascript
const result = await crossHospitalAccessService.withdrawConsent(
  consentId,
  'No longer needed',
  patientUserId
);
```

---

## POPIA Compliance

### Lawfulness of Processing (Section 9)

**Lawful Bases Implemented:**
1. **Patient Consent** - Primary basis for cross-hospital access
2. **Legal Obligation** - Healthcare provider duties
3. **Legitimate Interest** - Continuity of care
4. **Emergency Treatment** - Life-threatening situations

### Purpose Specification (Section 13)

All data processing has a defined purpose:
- `treatment` - Direct patient care
- `consultation` - Medical consultation
- `emergency` - Emergency treatment
- `referral` - Patient referral
- `continuity_of_care` - Ongoing care
- `second_opinion` - Medical second opinion

### Data Minimization (Section 10)

Access scope limits what data is shared:

```javascript
accessScope: {
  includeMedicalRecords: true,    // Only if needed
  includePrescriptions: true,     // Only if needed
  includeTestResults: false,      // Not needed
  includeAppointments: false,     // Not needed
  includeAllergies: true,         // Critical for safety
  includeChronicConditions: true  // Important for treatment
}
```

### Consent Management (Section 11)

**POPIA-Compliant Consent Includes:**
- Purpose explained
- Data types explained
- Recipients explained
- Retention period explained
- Rights explained
- Consequences explained
- Voluntary confirmation

### Security Safeguards (Section 19)

**Implemented Measures:**
1. **Encryption:**
   - At rest: AES-256
   - In transit: TLS 1.3
   - SA ID hashing: HMAC-SHA256

2. **Access Control:**
   - Role-based permissions
   - Hospital-level isolation
   - Consent verification

3. **Audit Logging:**
   - All access logged
   - Immutable audit trail
   - POPIA-compliant retention

4. **Data Retention:**
   - Medical records: 20 years (HPCSA)
   - Audit logs: 7 years
   - Consent records: Treatment duration + 5 years

### Data Subject Rights (Sections 23-25)

**Implemented Rights:**
1. **Right to Access** - Patients can view all their records
2. **Right to Correction** - Patients can request corrections
3. **Right to Deletion** - With medical record exceptions
4. **Right to Object** - Patients can object to processing
5. **Right to Portability** - Patients can export their data

---

## Implementation Guide

### Step 1: Environment Setup

Add to `.env`:

```env
# Patient Identification
ID_HASH_SALT=your-secure-random-salt-change-in-production

# Cross-Hospital Network
HOSPITAL_API_KEY=your-api-key
HOSPITAL_CERTIFICATE_PATH=/path/to/certificate.pem
```

### Step 2: Database Migration

Run migration to add new fields to existing records:

```javascript
// Migration script
const User = require('./models/User');
const patientIdentificationService = require('./services/patientIdentificationService');

async function migrateExistingPatients() {
  const patients = await User.find({ role: 'PATIENT', patientUUID: { $exists: false } });
  
  for (const patient of patients) {
    if (patient.idNumber) {
      const result = await patientIdentificationService.registerOrIdentifyPatient({
        idNumber: patient.idNumber,
        firstName: patient.name.split(' ')[0],
        lastName: patient.name.split(' ').slice(1).join(' '),
        dateOfBirth: patient.dateOfBirth,
        email: patient.email,
        phone: patient.phone,
        localPatientId: patient._id
      }, patient.facilityId);
      
      patient.patientUUID = result.patientUUID;
      await patient.save();
      
      console.log(`Migrated patient: ${patient.name} -> ${result.patientUUID}`);
    }
  }
}
```

### Step 3: API Routes Integration

Create new routes file `backend/routes/crossHospitalRoutes.js`:

```javascript
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const crossHospitalAccessService = require('../services/crossHospitalAccessService');

// Request patient records from other hospitals
router.post('/request-records', auth, async (req, res) => {
  try {
    const result = await crossHospitalAccessService.requestPatientRecords({
      patientUUID: req.body.patientUUID,
      requestingDoctorId: req.user.id,
      requestingFacilityId: req.user.facilityId,
      purpose: req.body.purpose,
      recordTypes: req.body.recordTypes
    });
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Grant consent
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
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

Register in `server.js`:

```javascript
app.use('/api/cross-hospital', require('./routes/crossHospitalRoutes'));
```

### Step 4: Frontend Integration

#### Request Cross-Hospital Records

```javascript
// In doctor dashboard
const requestPatientHistory = async (patientUUID) => {
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
      // Show message: "Consent request sent to patient"
      setConsentPending(true);
    } else {
      // Display records (read-only)
      setExternalRecords(response.data.records);
    }
  } catch (error) {
    console.error('Error requesting records:', error);
  }
};
```

#### Grant Consent (Patient Portal)

```javascript
// In patient consent management page
const grantConsent = async (consentId, signature) => {
  try {
    const response = await axios.post(
      `/api/cross-hospital/consent/grant/${consentId}`,
      { signature },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    // Show success message
    alert('Consent granted successfully');
  } catch (error) {
    console.error('Error granting consent:', error);
  }
};
```

---

## Testing

### Unit Tests

```javascript
// Test patient identification
describe('Patient Identification Service', () => {
  it('should create new patient UUID', async () => {
    const result = await patientIdentificationService.registerOrIdentifyPatient({
      idNumber: '8503155678089',
      firstName: 'Thabo',
      lastName: 'Mokoena',
      // ...
    }, facilityId);
    
    expect(result.patientUUID).toMatch(/^ZA-[A-Z]{2,3}-[a-f0-9]{12}-\d{2}$/);
    expect(result.isNewPatient).toBe(true);
  });
  
  it('should identify existing patient', async () => {
    // Register first time
    await patientIdentificationService.registerOrIdentifyPatient(patientData, facility1Id);
    
    // Register at second hospital
    const result = await patientIdentificationService.registerOrIdentifyPatient(
      patientData,
      facility2Id
    );
    
    expect(result.isNewPatient).toBe(false);
    expect(result.registry.registeredHospitals).toHaveLength(2);
  });
});
```

### Integration Tests

```javascript
// Test cross-hospital access
describe('Cross-Hospital Access', () => {
  it('should require consent for first access', async () => {
    const result = await crossHospitalAccessService.requestPatientRecords({
      patientUUID: testPatientUUID,
      requestingDoctorId: doctorId,
      requestingFacilityId: facility2Id,
      purpose: 'treatment'
    });
    
    expect(result.status).toBe('pending_consent');
    expect(result.consentRequired).toBe(true);
  });
  
  it('should provide records after consent', async () => {
    // Grant consent
    await crossHospitalAccessService.grantPatientConsent(consentId, {});
    
    // Request records
    const result = await crossHospitalAccessService.requestPatientRecords({
      patientUUID: testPatientUUID,
      requestingDoctorId: doctorId,
      requestingFacilityId: facility2Id,
      purpose: 'treatment'
    });
    
    expect(result.status).toBe('success');
    expect(result.records).toBeDefined();
    expect(result.accessLevel).toBe('read_only');
  });
});
```

---

## Security Considerations

### 1. SA ID Number Protection
- **Never log** SA ID numbers
- **Never transmit** in plain text
- **Always hash** before storage
- **Use HMAC-SHA256** with strong salt

### 2. API Security
- **Authentication required** for all endpoints
- **Role-based authorization** enforced
- **Rate limiting** to prevent abuse
- **Input validation** on all requests

### 3. Audit Trail
- **Log all access** to patient records
- **Immutable logs** - cannot be modified
- **Retention policy** - 7 years minimum
- **Regular audits** - automated compliance checks

### 4. Data Encryption
- **At rest:** AES-256 encryption
- **In transit:** TLS 1.3
- **Key management:** Secure key rotation

---

## Monitoring & Alerts

### Suspicious Activity Detection

```javascript
// Automated monitoring
const suspiciousPatterns = {
  excessiveAccess: accessCount > 50,        // Too many records in 1 hour
  multiplePatients: uniquePatients > 20,    // Too many different patients
  bulkExport: exportCount > 10,             // Too many exports
  crossHospitalSpike: crossAccess > 15      // Too many cross-hospital accesses
};
```

### Compliance Reporting

```javascript
// Generate monthly compliance report
const report = await RecordAccessLog.generateComplianceReport(
  facilityId,
  startDate,
  endDate
);

// Report includes:
// - Total access count
// - Cross-hospital access count
// - Unauthorized attempts
// - Compliance rate
// - Breakdown by purpose and role
```

---

## Support & Maintenance

### Regular Tasks

1. **Daily:**
   - Monitor suspicious activity
   - Check system health

2. **Weekly:**
   - Review access logs
   - Check consent expirations

3. **Monthly:**
   - Generate compliance reports
   - Audit trail review
   - Performance optimization

4. **Quarterly:**
   - Security audit
   - POPIA compliance review
   - System updates

---

## Conclusion

This architecture provides a secure, scalable, and POPIA-compliant solution for cross-hospital medical record sharing in South Africa. The system ensures:

✅ **Data Integrity** - Records stay at originating hospital  
✅ **Security** - Encryption, hashing, and access control  
✅ **Privacy** - Consent-based access with audit trails  
✅ **Compliance** - Full POPIA compliance  
✅ **Scalability** - Easy to add new hospitals  
✅ **Continuity of Care** - Patients maintain medical history across provinces  

For questions or support, contact the development team.
