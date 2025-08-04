const { sendAppointmentConfirmation, sendAppointmentReschedule, sendAppointmentCancellation } = require('../services/appointmentEmailService');

async function testEmailService() {
  console.log('🧪 Testing Email Service...\n');

  // Test data for email
  const testEmailData = {
    patientName: 'John Doe',
    patientEmail: 'john.doe@example.com',
    doctorName: 'Dr. Michael Smith',
    doctorSpecialization: 'General Practice',
    appointmentDate: new Date('2024-01-15T10:00:00Z'),
    appointmentTime: '10:00 AM',
    hospitalName: 'MediConnect Healthcare',
    hospitalLocation: 'Cape Town, South Africa',
    appointmentId: 'APT12345',
    reason: 'General consultation and health checkup'
  };

  try {
    // Test 1: Appointment Confirmation Email
    console.log('📧 Testing Appointment Confirmation Email...');
    const confirmationResult = await sendAppointmentConfirmation(testEmailData);
    console.log('✅ Confirmation Email Result:', confirmationResult);
    console.log('');

    // Test 2: Appointment Reschedule Email
    console.log('📧 Testing Appointment Reschedule Email...');
    const rescheduleData = {
      ...testEmailData,
      oldAppointmentDate: new Date('2024-01-15T10:00:00Z'),
      oldAppointmentTime: '10:00 AM',
      newAppointmentDate: new Date('2024-01-16T14:00:00Z'),
      newAppointmentTime: '2:00 PM'
    };
    const rescheduleResult = await sendAppointmentReschedule(rescheduleData);
    console.log('✅ Reschedule Email Result:', rescheduleResult);
    console.log('');

    // Test 3: Appointment Cancellation Email
    console.log('📧 Testing Appointment Cancellation Email...');
    const cancellationResult = await sendAppointmentCancellation(testEmailData);
    console.log('✅ Cancellation Email Result:', cancellationResult);
    console.log('');

    console.log('🎉 All email tests completed successfully!');
    console.log('📬 Check the recipient email inbox for test emails.');

  } catch (error) {
    console.error('❌ Email Service Test Failed:', error);
    console.error('Error details:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('🔐 Authentication Error: Please check EMAIL_USER and EMAIL_PASS environment variables');
    } else if (error.code === 'ENOTFOUND') {
      console.error('🌐 Network Error: Please check internet connection and SMTP server settings');
    }
  }
}

// Run the test
testEmailService();
