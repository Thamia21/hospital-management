const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
const User = require('./models/User');

async function checkAppointments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital-management');

    // Find all appointments
    const appointments = await Appointment.find({})
      .populate('patientId doctorId nurseId', 'name email')
      .sort({ date: -1 });

    console.log('Total appointments found:', appointments.length);

    if (appointments.length > 0) {
      appointments.forEach((apt, index) => {
        console.log(`\nAppointment ${index + 1}:`);
        console.log('  ID:', apt._id);
        console.log('  Patient:', apt.patientId?.name || 'No patient');
        console.log('  Doctor:', apt.doctorId?.name || 'No doctor');
        console.log('  Nurse:', apt.nurseId?.name || 'No nurse');
        console.log('  Date:', apt.date);
        console.log('  Status:', apt.status);
        console.log('  Type:', apt.type);
      });
    } else {
      console.log('No appointments found in database');
    }

    // Check if patients exist
    const patients = await User.find({ role: 'PATIENT' }).limit(5);
    console.log('\nPatients in system:');
    patients.forEach((patient, index) => {
      console.log(`  ${index + 1}. ${patient.name} (${patient.email})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkAppointments();
