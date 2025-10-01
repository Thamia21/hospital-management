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
  // Optional payment metadata
  paymentStatus: { type: String, enum: ['UNPAID', 'PAID', 'REFUNDED'], default: 'UNPAID' },
  paymentProvider: { type: String, enum: ['PAYPAL', 'OTHER'], required: false },
  paymentOrderId: { type: String },
  paymentAmount: { type: Number },
  paymentCurrency: { type: String },
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
