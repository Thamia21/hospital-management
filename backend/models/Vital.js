const mongoose = require('mongoose');

const VitalSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  measurementDate: {
    type: Date,
    default: Date.now,
    required: true,
  },
  bloodPressure: {
    systolic: { type: Number },
    diastolic: { type: Number },
  },
  heartRate: { type: Number },
  temperature: { type: Number },
  respiratoryRate: { type: Number },
  oxygenSaturation: { type: Number },
  height: { type: Number },
  weight: { type: Number },
  bmi: { type: Number },
  notes: { type: String },
  recordedBy: {
    type: String, // Can be a nurse's or doctor's name
  },
});

module.exports = mongoose.model('Vital', VitalSchema);
