const mongoose = require('mongoose');

/**
 * PatientConsent - Manages patient consent for cross-hospital data sharing
 * POPIA-compliant consent management system
 */
const patientConsentSchema = new mongoose.Schema({
  // Patient identification
  patientUUID: {
    type: String,
    required: true,
    index: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  patientName: String,
  
  // Source facility (where patient is currently registered)
  sourceFacilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    required: true
  },
  sourceFacilityName: String,
  
  // Target facility (requesting access to records)
  targetFacilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    required: true
  },
  targetFacilityName: String,
  
  // Consent status
  consentGiven: {
    type: Boolean,
    default: false,
    required: true
  },
  consentDate: Date,
  
  // Consent type and scope
  consentType: {
    type: String,
    enum: ['full_access', 'limited_access', 'emergency_only', 'specific_records', 'none'],
    default: 'none',
    required: true
  },
  
  // Scope of access
  accessScope: {
    includeMedicalRecords: {
      type: Boolean,
      default: false
    },
    includePrescriptions: {
      type: Boolean,
      default: false
    },
    includeTestResults: {
      type: Boolean,
      default: false
    },
    includeAppointments: {
      type: Boolean,
      default: false
    },
    includeAllergies: {
      type: Boolean,
      default: false
    },
    includeChronicConditions: {
      type: Boolean,
      default: false
    },
    specificRecordIds: [String]
  },
  
  // Purpose of data sharing
  purpose: {
    type: String,
    enum: ['treatment', 'consultation', 'emergency', 'referral', 'continuity_of_care', 'second_opinion'],
    required: true
  },
  purposeDescription: String,
  
  // Validity period
  effectiveDate: {
    type: Date,
    default: Date.now
  },
  expiryDate: Date,
  
  // Withdrawal
  isWithdrawn: {
    type: Boolean,
    default: false
  },
  withdrawnDate: Date,
  withdrawnReason: String,
  
  // POPIA-compliant informed consent details
  informedConsent: {
    purposeExplained: {
      type: Boolean,
      default: false
    },
    dataTypesExplained: {
      type: Boolean,
      default: false
    },
    recipientsExplained: {
      type: Boolean,
      default: false
    },
    retentionPeriodExplained: {
      type: Boolean,
      default: false
    },
    rightsExplained: {
      type: Boolean,
      default: false
    },
    consequencesExplained: {
      type: Boolean,
      default: false
    },
    voluntaryConfirmed: {
      type: Boolean,
      default: false
    }
  },
  
  // Consent method
  consentMethod: {
    type: String,
    enum: ['electronic', 'written', 'verbal', 'implied'],
    default: 'electronic'
  },
  
  // Digital signature (for electronic consent)
  digitalSignature: {
    signatureData: String,
    signatureDate: Date,
    ipAddress: String,
    deviceInfo: String
  },
  
  // Witness information (if applicable)
  witness: {
    name: String,
    role: String,
    signature: String,
    date: Date
  },
  
  // Requesting healthcare provider
  requestingProvider: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    role: String,
    licenseNumber: String
  },
  
  // Approval workflow
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'expired'],
    default: 'pending'
  },
  approvedBy: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    date: Date
  },
  
  // Usage tracking
  usageLog: [{
    accessDate: Date,
    accessedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    recordsAccessed: [String],
    purpose: String
  }],
  
  // Renewal history
  renewalHistory: [{
    renewalDate: Date,
    previousExpiryDate: Date,
    newExpiryDate: Date,
    renewedBy: String
  }],
  
  // Audit trail
  auditLog: [{
    action: {
      type: String,
      enum: ['created', 'updated', 'withdrawn', 'renewed', 'accessed', 'expired']
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: String,
    ipAddress: String
  }],
  
  // Metadata
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Additional notes
  notes: String
});

// Compound indexes
patientConsentSchema.index({ patientUUID: 1, targetFacilityId: 1 });
patientConsentSchema.index({ patientId: 1, consentGiven: 1 });
patientConsentSchema.index({ targetFacilityId: 1, approvalStatus: 1 });
patientConsentSchema.index({ expiryDate: 1 });

// Method to check if consent is currently valid
patientConsentSchema.methods.isValid = function() {
  // Check if consent is given
  if (!this.consentGiven) {
    return false;
  }
  
  // Check if withdrawn
  if (this.isWithdrawn) {
    return false;
  }
  
  // Check if approved
  if (this.approvalStatus !== 'approved') {
    return false;
  }
  
  // Check if expired
  if (this.expiryDate && this.expiryDate < new Date()) {
    return false;
  }
  
  // Check if effective date has passed
  if (this.effectiveDate && this.effectiveDate > new Date()) {
    return false;
  }
  
  return true;
};

// Method to withdraw consent
patientConsentSchema.methods.withdraw = function(reason, userId) {
  this.isWithdrawn = true;
  this.withdrawnDate = new Date();
  this.withdrawnReason = reason;
  this.approvalStatus = 'rejected';
  
  this.auditLog.push({
    action: 'withdrawn',
    performedBy: userId,
    timestamp: new Date(),
    details: `Consent withdrawn: ${reason}`
  });
  
  return this.save();
};

// Method to renew consent
patientConsentSchema.methods.renew = function(newExpiryDate, userId) {
  this.renewalHistory.push({
    renewalDate: new Date(),
    previousExpiryDate: this.expiryDate,
    newExpiryDate: newExpiryDate,
    renewedBy: userId
  });
  
  this.expiryDate = newExpiryDate;
  this.isWithdrawn = false;
  this.approvalStatus = 'approved';
  
  this.auditLog.push({
    action: 'renewed',
    performedBy: userId,
    timestamp: new Date(),
    details: `Consent renewed until ${newExpiryDate}`
  });
  
  return this.save();
};

// Method to log usage
patientConsentSchema.methods.logUsage = function(accessedBy, recordsAccessed, purpose) {
  this.usageLog.push({
    accessDate: new Date(),
    accessedBy,
    recordsAccessed,
    purpose
  });
  
  return this.save();
};

// Static method to get active consents for a patient
patientConsentSchema.statics.getActiveConsents = async function(patientUUID) {
  return this.find({
    patientUUID,
    consentGiven: true,
    isWithdrawn: false,
    approvalStatus: 'approved',
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gte: new Date() } }
    ]
  }).populate('targetFacilityId sourceFacilityId');
};

// Static method to check if specific consent exists
patientConsentSchema.statics.hasValidConsent = async function(patientUUID, targetFacilityId) {
  const consent = await this.findOne({
    patientUUID,
    targetFacilityId,
    consentGiven: true,
    isWithdrawn: false,
    approvalStatus: 'approved',
    $or: [
      { expiryDate: { $exists: false } },
      { expiryDate: { $gte: new Date() } }
    ]
  });
  
  return consent ? consent.isValid() : false;
};

// Static method to expire old consents (run as cron job)
patientConsentSchema.statics.expireOldConsents = async function() {
  const result = await this.updateMany(
    {
      expiryDate: { $lt: new Date() },
      approvalStatus: { $ne: 'expired' }
    },
    {
      $set: { approvalStatus: 'expired' },
      $push: {
        auditLog: {
          action: 'expired',
          timestamp: new Date(),
          details: 'Consent automatically expired'
        }
      }
    }
  );
  
  return result;
};

// Update timestamp on save
patientConsentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('PatientConsent', patientConsentSchema);
