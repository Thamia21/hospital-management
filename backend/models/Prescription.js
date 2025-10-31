const mongoose = require('mongoose');

const prescriptionSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    index: true
  },
  patientUUID: {
    type: String,
    index: true
  },
  doctorId: {
    type: String,
    required: true
  },
  doctorName: {
    type: String,
    required: true
  },
  medication: {
    type: String,
    required: true
  },
  dosage: {
    type: String,
    required: true
  },
  frequency: {
    type: String,
    required: true
  },
  duration: {
    type: String,
    required: true
  },
  instructions: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  prescribedDate: {
    type: Date,
    default: Date.now
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date
  },
  refillsRemaining: {
    type: Number,
    default: 0
  },
  
  // Facility tracking
  facilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility',
    index: true
  },
  facilityName: String,
  
  // Cross-hospital access
  isSharedRecord: {
    type: Boolean,
    default: false
  },
  originFacilityId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Facility'
  }
}, {
  timestamps: true
});

// Index for cross-hospital queries
prescriptionSchema.index({ patientUUID: 1, facilityId: 1 });

module.exports = mongoose.model('Prescription', prescriptionSchema);
