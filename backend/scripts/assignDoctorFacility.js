const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Facility = require('../models/Facility');

async function assignDoctorFacility() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Find the doctor
    const doctor = await User.findOne({ email: 'michael.smith@hospital.com' });
    if (!doctor) {
      console.log('❌ Doctor not found');
      process.exit(1);
    }

    console.log('\n📋 Current Doctor Info:');
    console.log('Name:', doctor.name);
    console.log('Email:', doctor.email);
    console.log('Role:', doctor.role);
    console.log('Current FacilityId:', doctor.facilityId || 'NONE');

    // Get all facilities
    const facilities = await Facility.find().limit(5);
    console.log('\n🏥 Available Facilities:');
    facilities.forEach((f, i) => {
      console.log(`${i + 1}. ${f.name} - ${f.province} (ID: ${f._id})`);
    });

    // Assign first facility if doctor has none
    if (!doctor.facilityId && facilities.length > 0) {
      const facility = facilities[0];
      doctor.facilityId = facility._id;
      await doctor.save();
      
      console.log('\n✅ Assigned facility to doctor:');
      console.log('Facility:', facility.name);
      console.log('Province:', facility.province);
      console.log('FacilityId:', facility._id);
    } else if (doctor.facilityId) {
      console.log('\n✅ Doctor already has a facility assigned');
      const currentFacility = await Facility.findById(doctor.facilityId);
      if (currentFacility) {
        console.log('Current Facility:', currentFacility.name);
      }
    }

    // Also assign facility to some patients for testing
    console.log('\n👥 Assigning facilities to patients...');
    const patients = await User.find({ role: 'PATIENT' }).limit(3);
    
    for (let i = 0; i < patients.length && i < facilities.length; i++) {
      if (!patients[i].facilityId) {
        patients[i].facilityId = facilities[i % facilities.length]._id;
        await patients[i].save();
        console.log(`✅ Assigned ${facilities[i % facilities.length].name} to patient ${patients[i].name || patients[i].email}`);
      }
    }

    console.log('\n✅ Done! Please restart the backend server and refresh the page.');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

assignDoctorFacility();
