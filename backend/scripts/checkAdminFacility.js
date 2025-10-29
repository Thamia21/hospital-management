const mongoose = require('mongoose');
const User = require('../models/User');
const Facility = require('../models/Facility');
require('dotenv').config();

async function checkAdminFacility() {
  try {
    // Connect to MongoDB - using IPv4 address to avoid connection issues
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_management';
    console.log(`🔌 Connecting to: ${mongoURI}`);
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      family: 4 // Force IPv4
    });
    console.log('✅ Connected to MongoDB\n');

    // Find all admin users
    const admins = await User.find({ role: 'ADMIN' }).populate('facilityId');
    
    if (admins.length === 0) {
      console.log('❌ No admin users found in the database.');
      return;
    }

    console.log('👥 ADMIN USERS STATUS:\n');
    console.log('='.repeat(80));

    for (const admin of admins) {
      console.log(`\n👤 Admin: ${admin.name}`);
      console.log(`📧 Email: ${admin.email}`);
      console.log(`🆔 User ID: ${admin._id}`);
      
      if (admin.facilityId) {
        console.log(`✅ Facility Assigned: YES`);
        console.log(`🏥 Facility Name: ${admin.facilityId.name || 'Unknown'}`);
        console.log(`🆔 Facility ID: ${admin.facilityId._id}`);
        console.log(`📍 Type: ${admin.facilityId.type || 'N/A'}`);
        console.log(`📊 Status: CAN VIEW PATIENTS ✓`);
      } else {
        console.log(`❌ Facility Assigned: NO`);
        console.log(`⚠️ Status: CANNOT VIEW PATIENTS`);
        console.log(`\n💡 Solution: Run assignAdminFacility.js to assign a facility`);
      }
      
      console.log('-'.repeat(80));
    }

    // Show available facilities
    const facilities = await Facility.find();
    console.log(`\n\n🏥 AVAILABLE FACILITIES (${facilities.length}):\n`);
    console.log('='.repeat(80));

    if (facilities.length === 0) {
      console.log('❌ No facilities found in the database.');
      console.log('💡 Run assignAdminFacility.js to create a default facility.');
    } else {
      facilities.forEach((facility, index) => {
        console.log(`\n${index + 1}. ${facility.name}`);
        console.log(`   Type: ${facility.type}`);
        console.log(`   ID: ${facility._id}`);
        console.log(`   Address: ${facility.address || 'N/A'}`);
        console.log(`   Status: ${facility.status || 'N/A'}`);
      });
    }

    console.log('\n' + '='.repeat(80));

    // Summary
    const assignedAdmins = admins.filter(a => a.facilityId).length;
    const unassignedAdmins = admins.length - assignedAdmins;

    console.log('\n📊 SUMMARY:');
    console.log(`   Total Admins: ${admins.length}`);
    console.log(`   ✅ Assigned: ${assignedAdmins}`);
    console.log(`   ❌ Unassigned: ${unassignedAdmins}`);
    console.log(`   🏥 Total Facilities: ${facilities.length}`);

    if (unassignedAdmins > 0) {
      console.log('\n⚠️ ACTION REQUIRED:');
      console.log('   Run: node scripts/assignAdminFacility.js');
      console.log('   Or:  node scripts/assignAdminFacilityInteractive.js');
    } else {
      console.log('\n✅ All admins are properly assigned to facilities!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed\n');
  }
}

// Run the script
checkAdminFacility();
