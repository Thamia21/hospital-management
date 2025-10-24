const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_management', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const updateDemoAccounts = async () => {
  try {
    console.log('🔄 Updating demo accounts with SA ID numbers...');

    // Update Patient Account
    const patient = await User.findOne({ email: 'john.doe@example.com' });
    if (patient) {
      patient.userId = '9001011234567';
      await patient.save();
      console.log('✅ Updated Patient account with SA ID: 9001011234567');
    } else {
      console.log('❌ Patient account not found');
    }

    // Update Nurse Account
    const nurse = await User.findOne({ email: 'mary.johnson@hospital.com' });
    if (nurse) {
      nurse.userId = '8506152345678';
      await nurse.save();
      console.log('✅ Updated Nurse account with SA ID: 8506152345678');
    } else {
      console.log('❌ Nurse account not found');
    }

    // Update Doctor Account
    const doctor = await User.findOne({ email: 'michael.smith@hospital.com' });
    if (doctor) {
      doctor.userId = '7803089876543';
      await doctor.save();
      console.log('✅ Updated Doctor account with SA ID: 7803089876543');
    } else {
      console.log('❌ Doctor account not found');
    }

    // Update Admin Account
    const admin = await User.findOne({ email: 'admin@hospital.com' });
    if (admin) {
      admin.userId = '7512154567890';
      await admin.save();
      console.log('✅ Updated Admin account with SA ID: 7512154567890');
    } else {
      console.log('❌ Admin account not found');
    }

    console.log('\n🎉 Demo accounts updated successfully!');
    console.log('\n📋 Updated Login Credentials:');
    console.log('Patient: SA ID 9001011234567, Password: patient123');
    console.log('Nurse: SA ID 8506152345678, Password: nurse123');
    console.log('Doctor: SA ID 7803089876543, Password: doctor123');
    console.log('Admin: SA ID 7512154567890, Password: admin123');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating demo accounts:', error);
    process.exit(1);
  }
};

updateDemoAccounts();
