const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  nurseId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  facilityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility' },
  date: { type: Date, required: true },
  time: { type: String },
  reason: { type: String },
  type: { type: String, enum: ['DOCTOR', 'NURSE', 'CONSULTATION'], default: 'CONSULTATION' },
  status: { type: String, enum: ['PENDING', 'SCHEDULED', 'COMPLETED', 'CANCELLED'], default: 'PENDING' },
  createdAt: { type: Date, default: Date.now },
  // Payment method and details
  paymentMethod: { type: String, enum: ['CASH', 'CARD', 'MEDICAL_AID', 'BANK_TRANSFER', 'INSURANCE'], default: 'CASH' },
  paymentStatus: { type: String, enum: ['UNPAID', 'PAID', 'REFUNDED', 'PENDING'], default: 'UNPAID' },
  paymentProvider: { type: String, enum: ['STRIPE', 'PAYPAL', 'CASH', 'OTHER'], required: false },
  paymentOrderId: { type: String },
  paymentAmount: { type: Number },
  paymentCurrency: { type: String, default: 'ZAR' },
  medicalAidNumber: { type: String }, // For medical aid payments
  medicalAidProvider: { type: String }, // Medical aid company name
  insurancePolicyNumber: { type: String }, // For insurance payments
  insuranceProvider: { type: String }, // Insurance company name
  bankReferenceNumber: { type: String }, // For bank transfer payments
  paymentNotes: { type: String } // Additional payment notes
});

// Validation: Either doctorId or nurseId must be provided
appointmentSchema.pre('validate', function(next) {
  if (!this.doctorId && !this.nurseId) {
    next(new Error('Either doctorId or nurseId must be provided'));
  } else {
    next();
  }
});

module.exports = mongoose.model('Appointment', appointmentSchema);
