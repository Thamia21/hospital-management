require('dotenv').config();
const { sendAppointmentConfirmation, sendAppointmentReschedule, sendAppointmentCancellation } = require('../services/appointmentEmailService');

async function testAppointmentEmails() {
  console.log('🏥 Testing Appointment Email System...\n');

  // Test data using demo account credentials
  const testEmailData = {
    patientName: 'John Doe',
    patientEmail: 'managementhospital24@gmail.com', // Send to our own email for testing
    doctorName: 'Dr. Michael Smith',
    doctorSpecialization: 'General Practice',
    appointmentDate: new Date('2024-02-15T10:00:00Z'),
    appointmentTime: '10:00 AM',
    hospitalName: 'MediConnect Healthcare',
    hospitalLocation: 'Cape Town, South Africa',
    appointmentId: 'APT12345',
    reason: 'General consultation and health checkup'
  };

  console.log('📧 Test Email Configuration:');
  console.log('Patient Name:', testEmailData.patientName);
  console.log('Patient Email:', testEmailData.patientEmail);
  console.log('Doctor:', testEmailData.doctorName);
  console.log('Date:', testEmailData.appointmentDate.toLocaleDateString());
  console.log('Time:', testEmailData.appointmentTime);
  console.log('');

  try {
    // Test 1: Appointment Confirmation Email
    console.log('1️⃣ Testing Appointment Confirmation Email...');
    const confirmationResult = await sendAppointmentConfirmation(testEmailData);
    
    if (confirmationResult.success) {
      console.log('✅ Confirmation email sent successfully!');
      console.log('📧 Message ID:', confirmationResult.messageId);
    } else {
      console.log('❌ Confirmation email failed:', confirmationResult.error);
    }
    console.log('');

    // Wait a moment between emails
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Appointment Reschedule Email
    console.log('2️⃣ Testing Appointment Reschedule Email...');
    const rescheduleData = {
      ...testEmailData,
      oldAppointmentDate: new Date('2024-02-15T10:00:00Z'),
      oldAppointmentTime: '10:00 AM',
      newAppointmentDate: new Date('2024-02-16T14:00:00Z'),
      newAppointmentTime: '2:00 PM'
    };
    
    const rescheduleResult = await sendAppointmentReschedule(rescheduleData);
    
    if (rescheduleResult.success) {
      console.log('✅ Reschedule email sent successfully!');
      console.log('📧 Message ID:', rescheduleResult.messageId);
    } else {
      console.log('❌ Reschedule email failed:', rescheduleResult.error);
    }
    console.log('');

    // Wait a moment between emails
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3: Appointment Cancellation Email
    console.log('3️⃣ Testing Appointment Cancellation Email...');
    const cancellationResult = await sendAppointmentCancellation(testEmailData);
    
    if (cancellationResult.success) {
      console.log('✅ Cancellation email sent successfully!');
      console.log('📧 Message ID:', cancellationResult.messageId);
    } else {
      console.log('❌ Cancellation email failed:', cancellationResult.error);
    }
    console.log('');

    console.log('🎉 Appointment Email System Test Complete!');
    console.log('📬 Check the email inbox: managementhospital24@gmail.com');
    console.log('📧 You should see 3 test emails:');
    console.log('   1. Appointment Confirmation');
    console.log('   2. Appointment Reschedule');
    console.log('   3. Appointment Cancellation');

  } catch (error) {
    console.error('❌ Appointment Email Test Failed:', error);
    console.error('Error details:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('🔐 Authentication Error: Check EMAIL_USER and EMAIL_PASS in .env file');
    } else if (error.code === 'ENOTFOUND') {
      console.error('🌐 Network Error: Check internet connection');
    } else if (error.code === 'CERT_HAS_EXPIRED') {
      console.error('🔒 SSL Certificate Error: This is usually temporary');
    }
  }
}

// Run the test
console.log('🚀 Starting Appointment Email System Test...');
testAppointmentEmails();
