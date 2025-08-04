require('dotenv').config();
const nodemailer = require('nodemailer');

async function testBasicEmail() {
  console.log('🔧 Testing Basic Email Configuration...\n');
  
  console.log('Environment Variables:');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? '✅ Set' : '❌ Not set');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set');
  console.log('');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('❌ Email credentials not configured.');
    console.log('📝 Please set EMAIL_USER and EMAIL_PASS in your .env file');
    console.log('');
    console.log('Example .env configuration:');
    console.log('EMAIL_USER=your-email@gmail.com');
    console.log('EMAIL_PASS=your-app-password');
    return;
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    console.log('📧 Testing SMTP connection...');
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection successful!');
    
    // Send test email
    console.log('📤 Sending test email...');
    const info = await transporter.sendMail({
      from: `"MediConnect Healthcare" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to self for testing
      subject: 'Email Service Test - MediConnect Healthcare',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #667eea;">🎉 Email Service Test Successful!</h2>
          <p>This is a test email from your MediConnect Healthcare system.</p>
          <p><strong>Test Time:</strong> ${new Date().toLocaleString()}</p>
          <p>If you received this email, your email service is configured correctly!</p>
        </div>
      `
    });

    console.log('✅ Test email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('📬 Check your inbox for the test email.');

  } catch (error) {
    console.error('❌ Email test failed:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('🔐 Authentication failed. Please check:');
      console.error('   - EMAIL_USER is correct');
      console.error('   - EMAIL_PASS is a valid App Password (not regular password)');
      console.error('   - 2-Factor Authentication is enabled on Gmail');
    } else if (error.code === 'ENOTFOUND') {
      console.error('🌐 Network error. Please check your internet connection.');
    }
  }
}

testBasicEmail();
