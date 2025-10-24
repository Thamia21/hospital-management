const mongoose = require('mongoose');

const AllergySchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  allergen: {
    type: String,
    required: true,
  },
  reaction: {
    type: String,
    required: true,
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe'],
    default: 'moderate',
  },
  notes: {
    type: String,
  },
  recordedBy: {
    type: String, // Doctor's or Nurse's name
  },
  recordedDate: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Allergy', AllergySchema);
