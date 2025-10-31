const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Facility = require('../models/Facility');

async function assignPatientFacilities() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Get all facilities
    const facilities = await Facility.find().limit(10);
    console.log(`🏥 Found ${facilities.length} facilities\n`);

    // Find all patients
    const patients = await User.find({ role: 'PATIENT' });
    console.log(`👥 Found ${patients.length} patients\n`);

    // Assign facilities to patients (distribute evenly)
    console.log('🔧 Assigning facilities to patients...\n');
    
    for (let i = 0; i < patients.length; i++) {
      const patient = patients[i];
      const facility = facilities[i % facilities.length]; // Round-robin assignment
      
      patient.facilityId = facility._id;
      await patient.save();
      
      console.log(`✅ ${patient.name || patient.email} → ${facility.name}`);
    }

    console.log('\n✅ All patients now have facilities assigned!');
    
    // Show distribution
    console.log('\n📊 Facility Distribution:\n');
    for (const facility of facilities) {
      const count = await User.countDocuments({ role: 'PATIENT', facilityId: facility._id });
      console.log(`${facility.name}: ${count} patients`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

assignPatientFacilities();
