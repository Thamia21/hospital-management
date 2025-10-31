const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Facility = require('../models/Facility');

async function checkAdminStaff() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Get admin user
    const admin = await User.findOne({ email: 'admin@hospital.com' });
    if (admin) {
      console.log('👤 Admin User:');
      console.log('Name:', admin.name);
      console.log('Email:', admin.email);
      console.log('Role:', admin.role);
      console.log('Facility ID:', admin.facilityId || 'NOT ASSIGNED');
      console.log('');
    } else {
      console.log('❌ Admin not found!\n');
    }

    // Get all staff
    const allStaff = await User.find({ role: { $in: ['DOCTOR', 'NURSE'] } })
      .populate('facilityId', 'name province');
    
    console.log(`📋 Total Staff: ${allStaff.length}\n`);

    // Group by facility
    const staffByFacility = {};
    let noFacility = 0;

    allStaff.forEach(staff => {
      if (staff.facilityId) {
        const facilityName = staff.facilityId.name;
        if (!staffByFacility[facilityName]) {
          staffByFacility[facilityName] = [];
        }
        staffByFacility[facilityName].push(staff);
      } else {
        noFacility++;
      }
    });

    console.log('📊 Staff Distribution by Facility:\n');
    Object.entries(staffByFacility).forEach(([facility, staffList]) => {
      console.log(`🏥 ${facility}: ${staffList.length} staff`);
      staffList.forEach(s => {
        console.log(`   - ${s.name} (${s.role})`);
      });
      console.log('');
    });

    if (noFacility > 0) {
      console.log(`⚠️  ${noFacility} staff members without facility assignment\n`);
    }

    // Check if admin should see facility-filtered staff
    if (admin && admin.facilityId) {
      console.log('='.repeat(60));
      console.log('\n🔍 Admin has a facility assigned!');
      console.log('Should admin see only staff from their facility?\n');
      
      const adminFacilityStaff = allStaff.filter(s => 
        s.facilityId && s.facilityId._id.toString() === admin.facilityId.toString()
      );
      
      console.log(`Staff in admin's facility: ${adminFacilityStaff.length}`);
      adminFacilityStaff.forEach(s => {
        console.log(`   - ${s.name} (${s.role})`);
      });
    } else {
      console.log('='.repeat(60));
      console.log('\n✅ Admin has no facility assigned');
      console.log('Admin should see ALL staff members (current behavior is correct)\n');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

checkAdminStaff();
