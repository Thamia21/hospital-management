const mongoose = require('mongoose');
require('dotenv').config();

const MedicalRecord = require('../models/MedicalRecord');
const User = require('../models/User');
const Facility = require('../models/Facility');

async function checkMedicalRecordFacility() {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Find the most recent medical record
    const recentRecord = await MedicalRecord.findOne()
      .sort({ createdAt: -1 })
      .populate('doctorId', 'name email facilityId')
      .populate('facilityId', 'name');
    
    if (!recentRecord) {
      console.log('❌ No medical records found!');
      return;
    }

    console.log('📋 Most Recent Medical Record:');
    console.log('Record ID:', recentRecord._id);
    console.log('Diagnosis:', recentRecord.diagnosis);
    console.log('Doctor ID:', recentRecord.doctorId?._id || recentRecord.doctorId);
    console.log('Doctor Name (from record):', recentRecord.doctorName);
    console.log('Doctor Name (populated):', recentRecord.doctorId?.name);
    console.log('Facility ID (from record):', recentRecord.facilityId || 'NOT SET');
    console.log('Facility Name (populated):', recentRecord.facilityId?.name || 'NOT SET');
    console.log('Facility (legacy field):', recentRecord.facility || 'NOT SET');
    console.log('');

    // If no facilityId, try to get it from the doctor
    if (!recentRecord.facilityId && recentRecord.doctorId) {
      console.log('⚠️ Record has no facilityId, checking doctor\'s facility...\n');
      
      const doctor = await User.findById(recentRecord.doctorId).populate('facilityId', 'name');
      
      if (doctor && doctor.facilityId) {
        console.log('✅ Doctor has facility assigned:');
        console.log('Doctor:', doctor.name);
        console.log('Facility:', doctor.facilityId.name);
        console.log('Facility ID:', doctor.facilityId._id);
        console.log('');
        console.log('💡 We can update this record with the doctor\'s facility!');
        console.log('');
        
        // Update the record
        recentRecord.facilityId = doctor.facilityId._id;
        recentRecord.doctorName = doctor.name;
        await recentRecord.save();
        
        console.log('✅ Record updated with facility information!');
      } else {
        console.log('❌ Doctor has no facility assigned either.');
      }
    } else if (recentRecord.facilityId) {
      console.log('✅ Record already has facilityId set!');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

checkMedicalRecordFacility();
