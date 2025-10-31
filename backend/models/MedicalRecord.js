const mongoose = require('mongoose');
const { Schema } = mongoose;

const medicalRecordSchema = new Schema({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  patientUUID: {
    type: String,
    index: true
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  recordType: {
    type: String,
    enum: ['diagnosis', 'treatment', 'lab_result', 'vital_signs', 'consultation', 'surgery', 'procedure', 'imaging', 'other'],
    required: true,
  },
  recordDate: {
    type: Date,
    default: Date.now,
  },
  diagnosis: String,
  description: String,
  treatment: String,
  medications: String,
  symptoms: String,
  followUp: String,
  doctorName: String, // Denormalized for easier access
  
  // Facility tracking for cross-hospital access
  facilityId: {
    type: Schema.Types.ObjectId,
    ref: 'Facility',
    index: true
  },
  facility: String, // Denormalized for easier access
  facilityCode: String,
  
  // Cross-hospital access control
  isSharedRecord: {
    type: Boolean,
    default: false
  },
  originFacilityId: {
    type: Schema.Types.ObjectId,
    ref: 'Facility'
  },
  accessPermissions: [{
    facilityId: {
      type: Schema.Types.ObjectId,
      ref: 'Facility'
    },
    accessLevel: {
      type: String,
      enum: ['read_only', 'full_access'],
      default: 'read_only'
    },
    grantedDate: Date,
    expiryDate: Date
  }],
  
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  
  // Audit fields
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  lastModifiedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
});

// Indexes for cross-hospital queries
medicalRecordSchema.index({ patientUUID: 1, facilityId: 1 });
medicalRecordSchema.index({ facilityId: 1, recordDate: -1 });

// Update timestamp on save
medicalRecordSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
