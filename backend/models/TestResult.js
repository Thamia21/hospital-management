const mongoose = require('mongoose');

const TestResultSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  testName: {
    type: String,
    required: true,
  },
  testDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed', 'Reviewed'],
    default: 'Completed',
  },
  results: [
    {
      parameter: String,
      value: String,
      unit: String,
      referenceRange: String,
    },
  ],
  interpretation: {
    type: String,
  },
  orderedBy: {
    type: String, // Can be a doctor's name
  },
  facility: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('TestResult', TestResultSchema);
