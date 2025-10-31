const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Facility = require('../models/Facility');

async function assignAdminToFacility() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Get admin
    const admin = await User.findOne({ email: 'admin@hospital.com' });
    if (!admin) {
      console.log('❌ Admin not found!');
      return;
    }

    console.log('👤 Current Admin:');
    console.log('Name:', admin.name);
    console.log('Email:', admin.email);
    console.log('Current Facility ID:', admin.facilityId || 'NONE');
    console.log('');

    // Get Johannesburg General Hospital (has 2 staff members)
    const facility = await Facility.findOne({ name: 'Johannesburg General Hospital' });
    
    if (!facility) {
      console.log('❌ Facility not found!');
      return;
    }

    console.log('🏥 Assigning admin to:', facility.name);
    console.log('Facility ID:', facility._id);
    console.log('');

    // Update admin
    admin.facilityId = facility._id;
    await admin.save();

    console.log('✅ Admin facility updated!');
    console.log('');

    // Show staff in this facility
    const staff = await User.find({ 
      role: { $in: ['DOCTOR', 'NURSE'] },
      facilityId: facility._id
    });

    console.log(`📋 Staff in ${facility.name}: ${staff.length}`);
    staff.forEach(s => {
      console.log(`   - ${s.name} (${s.role})`);
    });
    console.log('');
    console.log('✅ Admin will now see these staff members in Staff Management!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

assignAdminToFacility();
