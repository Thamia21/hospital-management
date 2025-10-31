const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Facility = require('../models/Facility');

async function checkAndAssignFacilities() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Find all doctors
    const doctors = await User.find({ role: 'DOCTOR' });
    console.log(`📋 Found ${doctors.length} doctors:\n`);

    for (const doctor of doctors) {
      console.log(`👨‍⚕️ Doctor: ${doctor.name || doctor.email}`);
      console.log(`   Email: ${doctor.email}`);
      console.log(`   User ID: ${doctor.userId}`);
      console.log(`   MongoDB ID: ${doctor._id}`);
      console.log(`   Current facilityId: ${doctor.facilityId || 'NONE'}`);
      
      if (doctor.facilityId) {
        const facility = await Facility.findById(doctor.facilityId);
        if (facility) {
          console.log(`   ✅ Facility: ${facility.name} (${facility.province})`);
        } else {
          console.log(`   ❌ Facility ID exists but facility not found!`);
        }
      }
      console.log('');
    }

    // Get all facilities
    const facilities = await Facility.find().limit(10);
    console.log(`\n🏥 Available Facilities (${facilities.length}):\n`);
    facilities.forEach((f, i) => {
      console.log(`${i + 1}. ${f.name} - ${f.province}`);
      console.log(`   ID: ${f._id}`);
      console.log(`   Type: ${f.type}`);
      console.log('');
    });

    // Assign facilities to doctors without one
    const doctorsWithoutFacility = doctors.filter(d => !d.facilityId);
    
    if (doctorsWithoutFacility.length > 0 && facilities.length > 0) {
      console.log(`\n🔧 Assigning facilities to ${doctorsWithoutFacility.length} doctors...\n`);
      
      for (let i = 0; i < doctorsWithoutFacility.length; i++) {
        const doctor = doctorsWithoutFacility[i];
        const facility = facilities[i % facilities.length]; // Round-robin assignment
        
        doctor.facilityId = facility._id;
        await doctor.save();
        
        console.log(`✅ Assigned "${facility.name}" to ${doctor.name || doctor.email}`);
      }
      
      console.log('\n✅ All doctors now have facilities assigned!');
    } else if (doctorsWithoutFacility.length === 0) {
      console.log('\n✅ All doctors already have facilities assigned!');
    } else {
      console.log('\n❌ No facilities available to assign!');
    }

    // Show final status
    console.log('\n📊 Final Status:\n');
    const updatedDoctors = await User.find({ role: 'DOCTOR' }).populate('facilityId');
    for (const doctor of updatedDoctors) {
      console.log(`👨‍⚕️ ${doctor.name || doctor.email}`);
      if (doctor.facilityId) {
        console.log(`   ✅ Facility: ${doctor.facilityId.name} (${doctor.facilityId.province})`);
      } else {
        console.log(`   ❌ No facility assigned`);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

checkAndAssignFacilities();
