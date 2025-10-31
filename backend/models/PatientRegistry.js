const mongoose = require('mongoose');
const crypto = require('crypto');

/**
 * PatientRegistry - Central registry for patient identification across hospitals
 * This model enables secure patient identification and tracking across multiple facilities
 */
const patientRegistrySchema = new mongoose.Schema({
  // Universal Patient Identifier (UUID)
  patientUUID: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  
  // Hashed SA ID Number for privacy (never store plain ID)
  nationalIdHash: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  
  // Basic Demographics (for matching)
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  
  // Contact Information
  phone: String,
  email: String,
  
  // Hospital Registrations - Track all hospitals where patient has been registered
  registeredHospitals: [{
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility',
      required: true
    },
    facilityCode: String,
    facilityName: String,
    localPatientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['active', 'transferred', 'inactive'],
      default: 'active'
    },
    lastVisit: Date
  }],
  
  // Cross-Hospital Consent Records
  consentRecords: [{
    targetFacilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility'
    },
    consentGiven: {
      type: Boolean,
      default: false
    },
    consentDate: Date,
    consentType: {
      type: String,
      enum: ['full_access', 'emergency_only', 'restricted', 'none'],
      default: 'none'
    },
    expiryDate: Date,
    withdrawnDate: Date,
    purpose: String
  }],
  
  // Audit Trail for Patient Registry Access
  accessLog: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'accessed', 'consent_given', 'consent_withdrawn']
    },
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facility'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String,
    details: String
  }],
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for performance
patientRegistrySchema.index({ nationalIdHash: 1 });
patientRegistrySchema.index({ patientUUID: 1 });
patientRegistrySchema.index({ 'registeredHospitals.facilityId': 1 });
patientRegistrySchema.index({ firstName: 1, lastName: 1, dateOfBirth: 1 });

// Static method to hash SA ID Number
patientRegistrySchema.statics.hashNationalId = function(idNumber) {
  const salt = process.env.ID_HASH_SALT || 'default-salt-change-in-production';
  return crypto
    .createHmac('sha256', salt)
    .update(idNumber)
    .digest('hex');
};

// Static method to generate Patient UUID
patientRegistrySchema.statics.generatePatientUUID = function(idNumber, facilityCode) {
  const hash = crypto
    .createHash('sha256')
    .update(`${idNumber}-${facilityCode}-${Date.now()}`)
    .digest('hex')
    .substring(0, 12);
  
  const provinceCode = this.getProvinceCode(facilityCode);
  const checksum = this.calculateChecksum(hash);
  
  return `ZA-${provinceCode}-${hash}-${checksum}`;
};

// Helper to get province code from facility
patientRegistrySchema.statics.getProvinceCode = function(facilityCode) {
  // Map facility codes to province codes
  const provinceMap = {
    'EC': 'EC', // Eastern Cape
    'FS': 'FS', // Free State
    'GP': 'GP', // Gauteng
    'KZN': 'KZN', // KwaZulu-Natal
    'LP': 'LP', // Limpopo
    'MP': 'MP', // Mpumalanga
    'NC': 'NC', // Northern Cape
    'NW': 'NW', // North West
    'WC': 'WC'  // Western Cape
  };
  
  const code = facilityCode?.substring(0, 2)?.toUpperCase();
  return provinceMap[code] || 'ZA';
};

// Helper to calculate checksum
patientRegistrySchema.statics.calculateChecksum = function(str) {
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i);
  }
  return (sum % 100).toString().padStart(2, '0');
};

// Method to add hospital registration
patientRegistrySchema.methods.addHospitalRegistration = function(facilityId, facilityCode, facilityName, localPatientId) {
  // Check if already registered at this facility
  const existingReg = this.registeredHospitals.find(
    reg => reg.facilityId.toString() === facilityId.toString()
  );
  
  if (existingReg) {
    existingReg.status = 'active';
    existingReg.lastVisit = new Date();
    return existingReg;
  }
  
  // Add new registration
  this.registeredHospitals.push({
    facilityId,
    facilityCode,
    facilityName,
    localPatientId,
    registrationDate: new Date(),
    status: 'active',
    lastVisit: new Date()
  });
  
  return this.registeredHospitals[this.registeredHospitals.length - 1];
};

// Method to grant consent for cross-hospital access
patientRegistrySchema.methods.grantConsent = function(targetFacilityId, consentType, expiryDate, purpose) {
  // Check if consent already exists
  const existingConsent = this.consentRecords.find(
    consent => consent.targetFacilityId.toString() === targetFacilityId.toString()
  );
  
  if (existingConsent) {
    existingConsent.consentGiven = true;
    existingConsent.consentDate = new Date();
    existingConsent.consentType = consentType;
    existingConsent.expiryDate = expiryDate;
    existingConsent.purpose = purpose;
    existingConsent.withdrawnDate = null;
    return existingConsent;
  }
  
  // Add new consent
  this.consentRecords.push({
    targetFacilityId,
    consentGiven: true,
    consentDate: new Date(),
    consentType,
    expiryDate,
    purpose
  });
  
  return this.consentRecords[this.consentRecords.length - 1];
};

// Method to withdraw consent
patientRegistrySchema.methods.withdrawConsent = function(targetFacilityId) {
  const consent = this.consentRecords.find(
    c => c.targetFacilityId.toString() === targetFacilityId.toString()
  );
  
  if (consent) {
    consent.consentGiven = false;
    consent.withdrawnDate = new Date();
  }
  
  return consent;
};

// Method to check if consent is valid
patientRegistrySchema.methods.hasValidConsent = function(targetFacilityId) {
  const consent = this.consentRecords.find(
    c => c.targetFacilityId.toString() === targetFacilityId.toString()
  );
  
  if (!consent || !consent.consentGiven) {
    return false;
  }
  
  // Check if consent has expired
  if (consent.expiryDate && consent.expiryDate < new Date()) {
    return false;
  }
  
  // Check if consent was withdrawn
  if (consent.withdrawnDate) {
    return false;
  }
  
  return true;
};

// Method to log access
patientRegistrySchema.methods.logAccess = function(action, facilityId, userId, ipAddress, details) {
  this.accessLog.push({
    action,
    facilityId,
    userId,
    timestamp: new Date(),
    ipAddress,
    details
  });
};

// Update timestamp on save
patientRegistrySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('PatientRegistry', patientRegistrySchema);
