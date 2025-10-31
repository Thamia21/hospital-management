const mongoose = require('mongoose');
require('dotenv').config();

const Appointment = require('../models/Appointment');
const User = require('../models/User');

async function checkAppointments() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Get all appointments
    const appointments = await Appointment.find()
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email')
      .populate('nurseId', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);

    console.log(`📋 Found ${appointments.length} appointments (showing last 20):\n`);

    if (appointments.length === 0) {
      console.log('❌ No appointments found in the database!\n');
    } else {
      appointments.forEach((apt, index) => {
        console.log(`${index + 1}. Appointment ID: ${apt._id}`);
        console.log(`   Patient: ${apt.patientId?.name || 'Unknown'} (${apt.patientId?._id})`);
        console.log(`   Doctor: ${apt.doctorId?.name || 'None'} (${apt.doctorId?._id || 'N/A'})`);
        console.log(`   Nurse: ${apt.nurseId?.name || 'None'} (${apt.nurseId?._id || 'N/A'})`);
        console.log(`   Date: ${apt.date}`);
        console.log(`   Time: ${apt.time || 'Not specified'}`);
        console.log(`   Status: ${apt.status}`);
        console.log(`   Type: ${apt.type || 'Not specified'}`);
        console.log(`   Created: ${apt.createdAt}`);
        console.log('');
      });
    }

    // Check specific doctor
    console.log('='.repeat(60) + '\n');
    console.log('🔍 Checking appointments for Sandile Tshabalala:\n');
    
    const sandile = await User.findOne({ email: 'sedibekeneilwe9@gmail.com' });
    if (sandile) {
      console.log('Doctor ID:', sandile._id);
      console.log('Doctor Name:', sandile.name);
      
      const sandileAppointments = await Appointment.find({ doctorId: sandile._id })
        .populate('patientId', 'name email');
      
      console.log(`\nFound ${sandileAppointments.length} appointments for this doctor:\n`);
      
      if (sandileAppointments.length === 0) {
        console.log('❌ No appointments found for this doctor!\n');
        console.log('Possible reasons:');
        console.log('1. Appointments were booked with a different doctor');
        console.log('2. Appointments have nurseId instead of doctorId');
        console.log('3. Doctor ID mismatch in appointment records');
      } else {
        sandileAppointments.forEach((apt, index) => {
          console.log(`${index + 1}. Patient: ${apt.patientId?.name || 'Unknown'}`);
          console.log(`   Date: ${apt.date}`);
          console.log(`   Time: ${apt.time || 'Not specified'}`);
          console.log(`   Status: ${apt.status}`);
          console.log('');
        });
      }
    } else {
      console.log('❌ Doctor not found!');
    }

    // Check for appointments with nurseId
    console.log('='.repeat(60) + '\n');
    console.log('🔍 Checking appointments with nurseId (no doctorId):\n');
    
    const nurseAppointments = await Appointment.find({ 
      doctorId: { $exists: false },
      nurseId: { $exists: true }
    }).populate('patientId nurseId', 'name email');
    
    console.log(`Found ${nurseAppointments.length} appointments with nurse only:\n`);
    nurseAppointments.forEach((apt, index) => {
      console.log(`${index + 1}. Patient: ${apt.patientId?.name || 'Unknown'}`);
      console.log(`   Nurse: ${apt.nurseId?.name || 'Unknown'}`);
      console.log(`   Date: ${apt.date}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

checkAppointments();
