const nodemailer = require('nodemailer');
require('dotenv').config();

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Professional appointment confirmation email template
const getAppointmentConfirmationTemplate = (appointmentData) => {
  const {
    patientName,
    doctorName,
    doctorSpecialization,
    appointmentDate,
    appointmentTime,
    hospitalName,
    hospitalLocation,
    appointmentId,
    reason
  } = appointmentData;

  return {
    subject: `Appointment Confirmation - ${hospitalName || 'MediConnect Healthcare'}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .appointment-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .detail-row { margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #555; }
          .detail-value { color: #333; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Appointment Confirmed</h1>
            <p>Your appointment has been successfully scheduled</p>
          </div>
          
          <div class="content">
            <h2>Hello ${patientName},</h2>
            <p>We are pleased to confirm your appointment with our healthcare team.</p>
            
            <div class="appointment-details">
              <h3>📋 Appointment Details</h3>
              <div class="detail-row">
                <div class="detail-label">👨‍⚕️ Healthcare Provider:</div>
                <div class="detail-value">${doctorName}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">🏥 Specialization:</div>
                <div class="detail-value">${doctorSpecialization}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">📅 Date:</div>
                <div class="detail-value">${new Date(appointmentDate).toLocaleDateString()}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">🕐 Time:</div>
                <div class="detail-value">${appointmentTime}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">🏢 Hospital:</div>
                <div class="detail-value">${hospitalName}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">📍 Location:</div>
                <div class="detail-value">${hospitalLocation}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">🆔 Appointment ID:</div>
                <div class="detail-value">${appointmentId}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">📝 Reason:</div>
                <div class="detail-value">${reason}</div>
              </div>
            </div>
            
            <p>Please arrive 15 minutes before your appointment time.</p>
            <p>If you have any questions, please contact us at +27 21 123 4567.</p>
            
            <div style="text-align: center; margin-top: 30px; color: #666; font-size: 14px;">
              <p><strong>${hospitalName}</strong></p>
              <p>Your trusted healthcare partner</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

// Appointment reschedule email template
const getAppointmentRescheduleTemplate = (appointmentData) => {
  const {
    patientName,
    doctorName,
    doctorSpecialization,
    oldAppointmentDate,
    oldAppointmentTime,
    newAppointmentDate,
    newAppointmentTime,
    hospitalName,
    appointmentId,
    reason
  } = appointmentData;

  return {
    subject: `Appointment Rescheduled - ${hospitalName || 'MediConnect Healthcare'}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #ff9800 0%, #f57c00 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .old-appointment { background: #ffebee; padding: 15px; border-radius: 5px; margin: 10px 0; }
          .new-appointment { background: #e8f5e8; padding: 15px; border-radius: 5px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Appointment Rescheduled</h1>
            <p>Your appointment has been moved to a new date and time</p>
          </div>
          
          <div class="content">
            <h2>Hello ${patientName},</h2>
            <p>We wanted to inform you that your appointment has been rescheduled.</p>
            
            <div class="old-appointment">
              <h4>❌ Previous Appointment:</h4>
              <p><strong>Date:</strong> ${new Date(oldAppointmentDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${oldAppointmentTime}</p>
            </div>
            
            <div class="new-appointment">
              <h4>✅ New Appointment:</h4>
              <p><strong>Date:</strong> ${new Date(newAppointmentDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${newAppointmentTime}</p>
              <p><strong>Healthcare Provider:</strong> ${doctorName}</p>
              <p><strong>Specialization:</strong> ${doctorSpecialization}</p>
              <p><strong>Hospital:</strong> ${hospitalName}</p>
              <p><strong>Appointment ID:</strong> ${appointmentId}</p>
              <p><strong>Reason:</strong> ${reason}</p>
            </div>
            
            <p>We apologize for any inconvenience. If you have questions, please contact us.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

// Appointment cancellation email template
const getAppointmentCancellationTemplate = (appointmentData) => {
  const {
    patientName,
    doctorName,
    doctorSpecialization,
    appointmentDate,
    appointmentTime,
    hospitalName,
    appointmentId,
    reason
  } = appointmentData;

  return {
    subject: `Appointment Cancelled - ${hospitalName || 'MediConnect Healthcare'}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f44336 0%, #d32f2f 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>❌ Appointment Cancelled</h1>
            <p>Your appointment has been cancelled</p>
          </div>
          
          <div class="content">
            <h2>Hello ${patientName},</h2>
            <p>We regret to inform you that your appointment has been cancelled.</p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f44336;">
              <h3>📋 Cancelled Appointment Details</h3>
              <p><strong>Healthcare Provider:</strong> ${doctorName}</p>
              <p><strong>Specialization:</strong> ${doctorSpecialization}</p>
              <p><strong>Date:</strong> ${new Date(appointmentDate).toLocaleDateString()}</p>
              <p><strong>Time:</strong> ${appointmentTime}</p>
              <p><strong>Hospital:</strong> ${hospitalName}</p>
              <p><strong>Appointment ID:</strong> ${appointmentId}</p>
              <p><strong>Reason:</strong> ${reason}</p>
            </div>
            
            <p>If you would like to reschedule, please contact us at +27 21 123 4567.</p>
            <p>We apologize for any inconvenience this may cause.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

// Send appointment confirmation email
const sendAppointmentConfirmation = async (appointmentData) => {
  try {
    const transporter = createTransporter();
    const template = getAppointmentConfirmationTemplate(appointmentData);
    
    const mailOptions = {
      from: `"MediConnect Healthcare" <${process.env.EMAIL_USER}>`,
      to: appointmentData.patientEmail,
      subject: template.subject,
      html: template.html
    };
    
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending appointment confirmation email:', error);
    return { success: false, error: error.message };
  }
};

// Send appointment reschedule email
const sendAppointmentReschedule = async (appointmentData) => {
  try {
    const transporter = createTransporter();
    const template = getAppointmentRescheduleTemplate(appointmentData);
    
    const mailOptions = {
      from: `"MediConnect Healthcare" <${process.env.EMAIL_USER}>`,
      to: appointmentData.patientEmail,
      subject: template.subject,
      html: template.html
    };
    
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending appointment reschedule email:', error);
    return { success: false, error: error.message };
  }
};

// Send appointment cancellation email
const sendAppointmentCancellation = async (appointmentData) => {
  try {
    const transporter = createTransporter();
    const template = getAppointmentCancellationTemplate(appointmentData);
    
    const mailOptions = {
      from: `"MediConnect Healthcare" <${process.env.EMAIL_USER}>`,
      to: appointmentData.patientEmail,
      subject: template.subject,
      html: template.html
    };
    
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending appointment cancellation email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendAppointmentConfirmation,
  sendAppointmentReschedule,
  sendAppointmentCancellation
};
