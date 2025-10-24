const mongoose = require('mongoose');

const ConditionSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  conditionName: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'chronic'],
    default: 'active',
  },
  onsetDate: {
    type: Date,
    required: true,
  },
  resolvedDate: {
    type: Date,
  },
  notes: {
    type: String,
  },
  recordedBy: {
    type: String, // Doctor's name
  },
});

module.exports = mongoose.model('Condition', ConditionSchema);
