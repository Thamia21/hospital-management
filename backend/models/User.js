const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  phoneNumber: { type: String }, // Keep for backwards compatibility
  password: { type: String },
  role: { type: String, enum: ['ADMIN', 'DOCTOR', 'NURSE', 'PATIENT'], required: true },
  
  // Patient-specific fields
  idNumber: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other', 'prefer-not-to-say'] },
  address: { type: String },
  emergencyContact: { type: String },
  emergencyPhone: { type: String },
  
  // Professional fields (Doctor/Nurse)
  licenseNumber: { type: String },
  specialization: { type: String },
  department: { type: String },
  qualifications: { type: String },
  experience: { type: String },
  
  // Facility associations
  facilityIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Facility' }],
  facilityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility' },
  
  // Verification and security
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  
  createdAt: { type: Date, default: Date.now },
});

// Generate a unique userId before saving
userSchema.pre('save', async function(next) {
  // Only generate userId if it doesn't exist
  if (!this.userId) {
    const rolePrefix = this.role.substring(0, 2).toUpperCase();
    const randomDigits = Math.floor(10000 + Math.random() * 90000); // 5-digit number
    this.userId = `${rolePrefix}${randomDigits}`;
    
    // Ensure userId is unique
    const User = this.constructor;
    const existingUser = await User.findOne({ userId: this.userId });
    if (existingUser) {
      // If collision, try again with a different number
      const newRandomDigits = Math.floor(10000 + Math.random() * 90000);
      this.userId = `${rolePrefix}${newRandomDigits}`;
    }
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
