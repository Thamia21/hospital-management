const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');

async function findAllAdmins() {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Find ALL admin users
    const admins = await User.find({ role: 'ADMIN' }).lean();
    
    console.log(`📋 Found ${admins.length} admin user(s):\n`);
    
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. Admin:`);
      console.log(`   _id: ${admin._id}`);
      console.log(`   name: ${admin.name}`);
      console.log(`   email: ${admin.email}`);
      console.log(`   facilityId: ${admin.facilityId || 'NOT ASSIGNED'}`);
      console.log(`   userId: ${admin.userId || 'N/A'}`);
      console.log('');
    });
    
    console.log('='.repeat(60));
    console.log('\n💡 The logged-in admin ID from console was: 68b0dc2a8c09c0ef7ba01fed');
    console.log('Check if this ID matches any of the admins above.\n');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

findAllAdmins();
