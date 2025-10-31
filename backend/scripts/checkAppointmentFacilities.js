const mongoose = require('mongoose');
require('dotenv').config();

const Appointment = require('../models/Appointment');
const User = require('../models/User');

async function checkAppointmentFacilities() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_management';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB\n');

    // Get Sandile's info
    const sandile = await User.findOne({ email: 'sedibekeneilwe9@gmail.com' });
    console.log('👨‍⚕️ Doctor: Sandile Tshabalala');
    console.log('Doctor ID:', sandile._id);
    console.log('Facility ID:', sandile.facilityId);
    console.log('');

    // Get all appointments for Sandile
    const appointments = await Appointment.find({ doctorId: sandile._id })
      .populate('patientId', 'name')
      .sort({ date: -1 });

    console.log(`📋 Found ${appointments.length} appointments for this doctor:\n`);

    let withFacility = 0;
    let withoutFacility = 0;

    appointments.forEach((apt, index) => {
      console.log(`${index + 1}. Patient: ${apt.patientId?.name || 'Unknown'}`);
      console.log(`   Date: ${apt.date}`);
      console.log(`   facilityId: ${apt.facilityId || 'NOT SET ❌'}`);
      console.log(`   Status: ${apt.status}`);
      
      if (apt.facilityId) {
        withFacility++;
        if (apt.facilityId.toString() === sandile.facilityId.toString()) {
          console.log(`   ✅ Matches doctor's facility`);
        } else {
          console.log(`   ⚠️  Different facility than doctor`);
        }
      } else {
        withoutFacility++;
        console.log(`   ❌ NO FACILITY ASSIGNED - This is why it's not showing!`);
      }
      console.log('');
    });

    console.log('='.repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`Total appointments: ${appointments.length}`);
    console.log(`With facilityId: ${withFacility}`);
    console.log(`Without facilityId: ${withoutFacility} ❌\n`);

    if (withoutFacility > 0) {
      console.log('🔧 SOLUTION: Appointments need facilityId to be set!');
      console.log(`The backend filters by facilityId, so appointments without it won't show.\n`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  }
}

checkAppointmentFacilities();
