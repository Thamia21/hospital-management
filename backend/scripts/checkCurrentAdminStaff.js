const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Facility = require('../models/Facility');

async function checkCurrentAdminStaff() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Get admin
    const admin = await User.findOne({ email: 'admin@hospital.com' }).populate('facilityId', 'name');
    
    if (!admin) {
      console.log('❌ Admin not found!');
      return;
    }

    console.log('👤 Current Admin:');
    console.log('Name:', admin.name);
    console.log('Email:', admin.email);
    console.log('Facility ID:', admin.facilityId?._id || admin.facilityId);
    console.log('Facility Name:', admin.facilityId?.name || 'Unknown');
    console.log('');

    // Get staff in admin's facility
    const adminFacilityId = admin.facilityId?._id || admin.facilityId;
    
    const staff = await User.find({ 
      role: { $in: ['DOCTOR', 'NURSE'] },
      facilityId: adminFacilityId
    });

    console.log(`📋 Staff in ${admin.facilityId?.name || 'Admin\'s Facility'}: ${staff.length}\n`);

    if (staff.length === 0) {
      console.log('❌ NO STAFF FOUND in this facility!\n');
      console.log('This is why the Staff Management page shows 0 staff.\n');
      
      // Show all facilities with staff
      console.log('='.repeat(60));
      console.log('\n📊 Facilities with Staff:\n');
      
      const allStaff = await User.find({ role: { $in: ['DOCTOR', 'NURSE'] } })
        .populate('facilityId', 'name');
      
      const staffByFacility = {};
      
      allStaff.forEach(s => {
        if (s.facilityId) {
          const facilityName = s.facilityId.name;
          const facilityId = s.facilityId._id.toString();
          if (!staffByFacility[facilityId]) {
            staffByFacility[facilityId] = {
              name: facilityName,
              id: facilityId,
              staff: []
            };
          }
          staffByFacility[facilityId].staff.push(s);
        }
      });
      
      Object.values(staffByFacility).forEach(facility => {
        console.log(`🏥 ${facility.name} (${facility.id})`);
        console.log(`   ${facility.staff.length} staff members:`);
        facility.staff.forEach(s => {
          console.log(`   - ${s.name} (${s.role})`);
        });
        console.log('');
      });
      
      console.log('='.repeat(60));
      console.log('\n💡 SOLUTION: Assign admin to a facility that has staff!');
      console.log('\nRecommended facility: Johannesburg General Hospital');
      console.log('Run: node scripts/assignAdminToFacility.js');
      console.log('(This script assigns admin to Johannesburg General Hospital which has 2 staff)\n');
      
    } else {
      console.log('✅ Staff members found:\n');
      staff.forEach((s, index) => {
        console.log(`${index + 1}. ${s.name} (${s.role})`);
        console.log(`   Email: ${s.email}`);
        console.log('');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

checkCurrentAdminStaff();
