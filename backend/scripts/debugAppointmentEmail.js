require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Appointment = require('../models/Appointment');

async function debugAppointmentEmail() {
  console.log('🔍 Debugging Appointment Email Issue...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if demo accounts exist and have email addresses
    console.log('\n📋 Checking Demo Accounts:');
    const demoAccounts = await User.find({
      userId: { $in: ['PAT001', 'DOC001', 'NUR001', 'ADM001'] }
    });

    demoAccounts.forEach(account => {
      console.log(`${account.role} (${account.userId}):`, {
        name: account.name,
        email: account.email || '❌ NO EMAIL',
        emailVerified: account.emailVerified
      });
    });

    // Check recent appointments
    console.log('\n📅 Checking Recent Appointments:');
    const recentAppointments = await Appointment.find({})
      .populate('patientId doctorId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    if (recentAppointments.length === 0) {
      console.log('❌ No appointments found in database');
    } else {
      recentAppointments.forEach((apt, index) => {
        console.log(`\nAppointment ${index + 1}:`);
        console.log('  ID:', apt._id.toString().slice(-8));
        console.log('  Patient:', apt.patientId?.name || 'Unknown');
        console.log('  Patient Email:', apt.patientId?.email || '❌ NO EMAIL');
        console.log('  Doctor:', apt.doctorId?.name || apt.nurseId?.name || 'Unknown');
        console.log('  Date:', apt.date);
        console.log('  Status:', apt.status);
        console.log('  Created:', apt.createdAt);
      });
    }

    // Test email configuration
    console.log('\n📧 Email Configuration:');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set');

    // Test email service directly
    console.log('\n🧪 Testing Email Service:');
    const { sendAppointmentConfirmation } = require('../services/appointmentEmailService');
    
    const testData = {
      patientName: 'Test Patient',
      patientEmail: process.env.EMAIL_USER, // Send to ourselves for testing
      doctorName: 'Dr. Test',
      doctorSpecialization: 'General Practice',
      appointmentDate: new Date(),
      appointmentTime: '10:00 AM',
      hospitalName: 'MediConnect Healthcare',
      hospitalLocation: 'Test Location',
      appointmentId: 'TEST123',
      reason: 'Test appointment'
    };

    const emailResult = await sendAppointmentConfirmation(testData);
    console.log('Email Test Result:', emailResult);

  } catch (error) {
    console.error('❌ Debug Error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Database connection closed');
  }
}

debugAppointmentEmail();
