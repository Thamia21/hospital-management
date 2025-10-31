const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

async function verifyAdminFacility() {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Get admin - RAW data without any transformations
    const admin = await User.findOne({ email: 'admin@hospital.com' }).lean();
    
    console.log('👤 Admin User (RAW from database):');
    console.log(JSON.stringify(admin, null, 2));
    console.log('');
    console.log('facilityId type:', typeof admin.facilityId);
    console.log('facilityId value:', admin.facilityId);
    console.log('facilityId is null?', admin.facilityId === null);
    console.log('facilityId is undefined?', admin.facilityId === undefined);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

verifyAdminFacility();
