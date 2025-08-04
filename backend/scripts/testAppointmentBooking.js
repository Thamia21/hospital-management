require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const User = require('../models/User');

async function testAppointmentBooking() {
  console.log('🧪 Testing Appointment Booking with Email...\n');

  try {
    // Connect to MongoDB to get user IDs
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Get demo patient and doctor
    const patient = await User.findOne({ userId: 'PAT001' });
    const doctor = await User.findOne({ userId: 'DOC001' });

    if (!patient || !doctor) {
      console.log('❌ Demo accounts not found. Please run seed script first.');
      return;
    }

    console.log('👤 Patient:', patient.name, '(', patient.email, ')');
    console.log('👨‍⚕️ Doctor:', doctor.name, '(', doctor.email, ')');

    // First, login to get auth token
    console.log('\n🔐 Logging in as patient...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      userId: 'PAT001',
      password: 'patient123'
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');

    // Create appointment data
    const appointmentData = {
      patientId: patient._id,
      doctorId: doctor._id,
      date: new Date('2024-02-15T10:00:00Z'),
      time: '10:00 AM',
      reason: 'Test appointment booking with email confirmation',
      status: 'SCHEDULED',
      type: 'CONSULTATION'
    };

    console.log('\n📅 Booking appointment...');
    console.log('Appointment data:', {
      patientName: patient.name,
      doctorName: doctor.name,
      date: appointmentData.date,
      time: appointmentData.time,
      reason: appointmentData.reason
    });

    // Book the appointment
    const appointmentResponse = await axios.post(
      'http://localhost:5000/api/appointments',
      appointmentData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Appointment booked successfully!');
    console.log('📧 Check server logs for email confirmation details');
    console.log('Appointment ID:', appointmentResponse.data._id);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

testAppointmentBooking();
