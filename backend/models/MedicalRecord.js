const mongoose = require('mongoose');
const { Schema } = mongoose;

const medicalRecordSchema = new Schema({
  patientId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  doctorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  recordType: {
    type: String,
    enum: ['diagnosis', 'treatment', 'lab_result', 'vital_signs', 'consultation'],
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
  facility: String, // Denormalized for easier access
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('MedicalRecord', medicalRecordSchema);
