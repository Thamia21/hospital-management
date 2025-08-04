const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['HOSPITAL', 'CLINIC'], required: true },
  address: { type: String },
  province: { type: String },
  district: { type: String },
  code: { type: String }, // Optional: National/Provincial registry code
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Facility', facilitySchema);
