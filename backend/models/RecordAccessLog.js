const mongoose = require('mongoose');

/**
 * RecordAccessLog - Comprehensive audit trail for all medical record access
 * Critical for POPIA compliance and security monitoring
 */
const recordAccessLogSchema = new mongoose.Schema({
  // Who accessed
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  userName: String,
  userRole: {
    type: String,
    enum: ['ADMIN', 'DOCTOR', 'NURSE', 'PATIENT'],
    required: true
  },
  
  // From which facility
  sourceFacilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    required: true,
    index: true
  },
  sourceFacilityName: String,
  
  // What was accessed
  resourceType: {
    type: String,
    enum: ['medical_record', 'prescription', 'test_result', 'appointment', 'patient_profile', 'full_history'],
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    index: true
  },
  
  // Patient context
  patientUUID: {
    type: String,
    required: true,
    index: true
  },
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    index: true
  },
  patientName: String,
  
  // Action performed
  action: {
    type: String,
    enum: ['view', 'create', 'update', 'delete', 'export', 'print', 'share'],
    required: true
  },
  
  // Cross-hospital context
  isCrossHospitalAccess: {
    type: Boolean,
    default: false
  },
  targetFacilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility'
  },
  targetFacilityName: String,
  accessType: {
    type: String,
    enum: ['local', 'cross_hospital', 'emergency', 'with_consent', 'without_consent']
  },
  
  // Purpose and legal basis
  purpose: {
    type: String,
    enum: ['treatment', 'consultation', 'emergency', 'research', 'administrative', 'patient_request'],
    required: true
  },
  legalBasis: {
    type: String,
    enum: ['patient_consent', 'legal_obligation', 'legitimate_interest', 'emergency_treatment', 'public_health']
  },
  
  // Consent verification
  consentVerified: {
    type: Boolean,
    default: false
  },
  consentId: String,
  
  // Technical details
  ipAddress: String,
  userAgent: String,
  sessionId: String,
  
  // Request details
  requestMethod: String,
  requestUrl: String,
  requestBody: mongoose.Schema.Types.Mixed,
  
  // Response details
  responseStatus: Number,
  responseTime: Number, // in milliseconds
  
  // Data changes (for update/delete actions)
  changeLog: {
    before: mongoose.Schema.Types.Mixed,
    after: mongoose.Schema.Types.Mixed,
    fieldsChanged: [String]
  },
  
  // Security flags
  securityFlags: {
    suspiciousActivity: {
      type: Boolean,
      default: false
    },
    unauthorizedAttempt: {
      type: Boolean,
      default: false
    },
    dataExfiltration: {
      type: Boolean,
      default: false
    },
    anomalyScore: Number
  },
  
  // Geolocation
  location: {
    province: String,
    city: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now,
    index: true
  },
  
  // Additional metadata
  metadata: mongoose.Schema.Types.Mixed
});

// Compound indexes for common queries
recordAccessLogSchema.index({ patientUUID: 1, timestamp: -1 });
recordAccessLogSchema.index({ userId: 1, timestamp: -1 });
recordAccessLogSchema.index({ sourceFacilityId: 1, timestamp: -1 });
recordAccessLogSchema.index({ isCrossHospitalAccess: 1, timestamp: -1 });
recordAccessLogSchema.index({ 'securityFlags.suspiciousActivity': 1, timestamp: -1 });

// Static method to log access
recordAccessLogSchema.statics.logAccess = async function(accessData) {
  try {
    const log = new this(accessData);
    await log.save();
    return log;
  } catch (error) {
    console.error('Failed to log access:', error);
    // Don't throw - logging failures shouldn't break the main flow
    return null;
  }
};

// Static method to get patient access history
recordAccessLogSchema.statics.getPatientAccessHistory = async function(patientUUID, options = {}) {
  const {
    limit = 100,
    skip = 0,
    startDate,
    endDate,
    facilityId,
    accessType
  } = options;
  
  const query = { patientUUID };
  
  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate) query.timestamp.$gte = new Date(startDate);
    if (endDate) query.timestamp.$lte = new Date(endDate);
  }
  
  if (facilityId) {
    query.sourceFacilityId = facilityId;
  }
  
  if (accessType) {
    query.accessType = accessType;
  }
  
  return this.find(query)
    .sort({ timestamp: -1 })
    .limit(limit)
    .skip(skip)
    .populate('userId', 'name role')
    .populate('sourceFacilityId', 'name code')
    .populate('targetFacilityId', 'name code');
};

// Static method to detect suspicious activity
recordAccessLogSchema.statics.detectSuspiciousActivity = async function(userId, timeWindowMinutes = 60) {
  const timeWindow = new Date(Date.now() - timeWindowMinutes * 60 * 1000);
  
  const recentAccess = await this.find({
    userId,
    timestamp: { $gte: timeWindow }
  });
  
  // Check for suspicious patterns
  const suspiciousPatterns = {
    excessiveAccess: recentAccess.length > 50, // More than 50 records in time window
    multiplePatients: new Set(recentAccess.map(a => a.patientUUID)).size > 20, // More than 20 different patients
    bulkExport: recentAccess.filter(a => a.action === 'export').length > 10, // More than 10 exports
    crossHospitalSpike: recentAccess.filter(a => a.isCrossHospitalAccess).length > 15 // More than 15 cross-hospital accesses
  };
  
  return {
    isSuspicious: Object.values(suspiciousPatterns).some(v => v),
    patterns: suspiciousPatterns,
    accessCount: recentAccess.length
  };
};

// Static method to generate compliance report
recordAccessLogSchema.statics.generateComplianceReport = async function(facilityId, startDate, endDate) {
  const query = {
    sourceFacilityId: facilityId,
    timestamp: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  };
  
  const [
    totalAccess,
    crossHospitalAccess,
    unauthorizedAttempts,
    accessByPurpose,
    accessByRole
  ] = await Promise.all([
    this.countDocuments(query),
    this.countDocuments({ ...query, isCrossHospitalAccess: true }),
    this.countDocuments({ ...query, 'securityFlags.unauthorizedAttempt': true }),
    this.aggregate([
      { $match: query },
      { $group: { _id: '$purpose', count: { $sum: 1 } } }
    ]),
    this.aggregate([
      { $match: query },
      { $group: { _id: '$userRole', count: { $sum: 1 } } }
    ])
  ]);
  
  return {
    facilityId,
    period: { startDate, endDate },
    summary: {
      totalAccess,
      crossHospitalAccess,
      unauthorizedAttempts,
      complianceRate: ((totalAccess - unauthorizedAttempts) / totalAccess * 100).toFixed(2) + '%'
    },
    breakdown: {
      byPurpose: accessByPurpose,
      byRole: accessByRole
    }
  };
};

module.exports = mongoose.model('RecordAccessLog', recordAccessLogSchema);
