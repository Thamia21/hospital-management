const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Facility = require('../models/Facility');

async function verifyFacilityAssignments() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Check specific doctor
    console.log('🔍 Checking Sandile Tshabalala (sedibekeneilwe9@gmail.com):\n');
    const sandile = await User.findOne({ email: 'sedibekeneilwe9@gmail.com' });
    if (sandile) {
      console.log('MongoDB ID:', sandile._id);
      console.log('Name:', sandile.name);
      console.log('Role:', sandile.role);
      console.log('facilityId field:', sandile.facilityId);
      console.log('facilityId type:', typeof sandile.facilityId);
      console.log('facilityId is null?', sandile.facilityId === null);
      console.log('facilityId is undefined?', sandile.facilityId === undefined);
      
      if (sandile.facilityId) {
        const facility = await Facility.findById(sandile.facilityId);
        if (facility) {
          console.log('✅ Facility:', facility.name, '-', facility.province);
        } else {
          console.log('❌ Facility ID exists but facility not found!');
        }
      } else {
        console.log('❌ No facilityId assigned!');
      }
    } else {
      console.log('❌ Doctor not found!');
    }

    console.log('\n' + '='.repeat(60) + '\n');

    // Check all doctors
    console.log('📋 All Doctors:\n');
    const doctors = await User.find({ role: 'DOCTOR' }).populate('facilityId');
    doctors.forEach(doc => {
      console.log(`👨‍⚕️ ${doc.name || doc.email}`);
      console.log(`   ID: ${doc._id}`);
      console.log(`   facilityId: ${doc.facilityId ? doc.facilityId._id : 'NONE'}`);
      if (doc.facilityId) {
        console.log(`   Facility: ${doc.facilityId.name}`);
      }
      console.log('');
    });

    console.log('='.repeat(60) + '\n');

    // Check all patients
    console.log('👥 All Patients:\n');
    const patients = await User.find({ role: 'PATIENT' }).populate('facilityId');
    patients.forEach(patient => {
      console.log(`👤 ${patient.name || patient.email}`);
      console.log(`   ID: ${patient._id}`);
      console.log(`   facilityId: ${patient.facilityId ? patient.facilityId._id : 'NONE'}`);
      if (patient.facilityId) {
        console.log(`   Facility: ${patient.facilityId.name}`);
      }
      console.log('');
    });

    // Summary
    console.log('='.repeat(60) + '\n');
    console.log('📊 Summary:\n');
    const totalDoctors = await User.countDocuments({ role: 'DOCTOR' });
    const doctorsWithFacility = await User.countDocuments({ role: 'DOCTOR', facilityId: { $exists: true, $ne: null } });
    const totalPatients = await User.countDocuments({ role: 'PATIENT' });
    const patientsWithFacility = await User.countDocuments({ role: 'PATIENT', facilityId: { $exists: true, $ne: null } });

    console.log(`Doctors: ${doctorsWithFacility}/${totalDoctors} have facilities assigned`);
    console.log(`Patients: ${patientsWithFacility}/${totalPatients} have facilities assigned`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

verifyFacilityAssignments();
