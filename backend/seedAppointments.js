const mongoose = require('mongoose');
const Appointment = require('./models/Appointment');
const User = require('./models/User');

// Sample appointments data
const createSampleAppointments = async () => {
  try {
    console.log('Creating sample appointments...');

    // Find existing doctors and patients
    const doctors = await User.find({ role: 'DOCTOR' }).limit(2);
    const patients = await User.find({ role: 'PATIENT' }).limit(3);

    if (doctors.length === 0) {
      console.log('No doctors found. Please run seedDoctors.js first.');
      return;
    }

    if (patients.length === 0) {
      console.log('No patients found. Creating sample patients...');
      
      // Create sample patients
      const samplePatients = [
        {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+27123456789',
          role: 'PATIENT',
          userId: 'PAT001',
          password: 'patient123',
          isVerified: true
        },
        {
          name: 'Jane Smith',
          email: 'jane.smith@example.com',
          phone: '+27987654321',
          role: 'PATIENT',
          userId: 'PAT002',
          password: 'patient123',
          isVerified: true
        },
        {
          name: 'Michael Johnson',
          email: 'michael.johnson@example.com',
          phone: '+27555123456',
          role: 'PATIENT',
          userId: 'PAT003',
          password: 'patient123',
          isVerified: true
        }
      ];

      for (const patientData of samplePatients) {
        const existingPatient = await User.findOne({ userId: patientData.userId });
        if (!existingPatient) {
          const patient = new User(patientData);
          await patient.save();
          patients.push(patient);
          console.log(`Created patient: ${patientData.name}`);
        }
      }
    }

    // Create sample appointments
    const sampleAppointments = [
      {
        patientId: patients[0]._id,
        doctorId: doctors[0]._id,
        date: new Date('2025-08-06T11:00:00.000Z'), // Wednesday, August 6, 2025, 11:00 AM
        reason: 'Regular checkup and blood pressure monitoring',
        type: 'CONSULTATION',
        status: 'SCHEDULED'
      },
      {
        patientId: patients[1]._id,
        doctorId: doctors[0]._id,
        date: new Date('2025-08-06T11:00:00.000Z'), // Same day, same time (for testing)
        reason: 'Follow-up consultation for diabetes management',
        type: 'CONSULTATION',
        status: 'SCHEDULED'
      },
      {
        patientId: patients[2]._id,
        doctorId: doctors[0]._id,
        date: new Date('2025-08-07T09:30:00.000Z'), // Thursday, August 7, 2025, 9:30 AM
        reason: 'Skin rash examination and treatment',
        type: 'CONSULTATION',
        status: 'PENDING'
      },
      {
        patientId: patients[0]._id,
        doctorId: doctors.length > 1 ? doctors[1]._id : doctors[0]._id,
        date: new Date('2025-08-08T14:00:00.000Z'), // Friday, August 8, 2025, 2:00 PM
        reason: 'Cardiology consultation - chest pain evaluation',
        type: 'CONSULTATION',
        status: 'SCHEDULED'
      }
    ];

    // Clear existing appointments for this doctor (optional)
    await Appointment.deleteMany({ doctorId: doctors[0]._id });
    console.log('Cleared existing appointments for testing');

    // Create new appointments
    for (const appointmentData of sampleAppointments) {
      const appointment = new Appointment(appointmentData);
      await appointment.save();
      console.log(`Created appointment: ${appointmentData.reason.substring(0, 30)}...`);
    }

    console.log('Sample appointments created successfully!');
    console.log(`Doctor ID for testing: ${doctors[0]._id}`);
    console.log(`Doctor name: ${doctors[0].name}`);

  } catch (error) {
    console.error('Error creating sample appointments:', error);
  }
};

// Run if called directly
if (require.main === module) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital-management')
    .then(() => {
      console.log('Connected to MongoDB');
      return createSampleAppointments();
    })
    .then(() => {
      console.log('Sample appointments creation completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

module.exports = createSampleAppointments;
