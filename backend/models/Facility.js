const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['HOSPITAL', 'CLINIC'], required: true },
  address: { type: String },
  province: { 
    type: String,
    enum: ['Eastern Cape', 'Free State', 'Gauteng', 'KwaZulu-Natal', 'Limpopo', 'Mpumalanga', 'Northern Cape', 'North West', 'Western Cape']
  },
  district: { type: String },
  code: { type: String, unique: true, sparse: true }, // DOH facility code
  
  // Contact information
  phone: { type: String },
  email: { type: String },
  
  // Level of care
  level: {
    type: String,
    enum: ['primary', 'secondary', 'tertiary', 'specialized']
  },
  
  // Cross-hospital network configuration
  networkConfig: {
    apiEndpoint: String,
    publicKey: String,
    certificateHash: String,
    isActive: { type: Boolean, default: true },
    lastSyncDate: Date
  },
  
  // POPIA compliance
  popiaRegistration: { type: String },
  dataOfficer: {
    name: String,
    contact: String,
    email: String
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update timestamp on save
facilitySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model('Facility', facilitySchema);
