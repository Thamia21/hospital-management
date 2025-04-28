export const emailTemplates = {
  verifyEmail: {
    subject: 'Verify Your Email - Hospital Management System',
    html: (name, verificationLink) => `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .button { background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; }
            .footer { margin-top: 20px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Hospital Management System</h1>
            </div>
            <h2>Hello ${name},</h2>
            <p>Thank you for registering with our Hospital Management System. To complete your registration, please verify your email address by clicking the button below:</p>
            <p style="text-align: center;">
              <a href="${verificationLink}" class="button">Verify Email Address</a>
            </p>
            <p>If you did not create an account, please ignore this email.</p>
            <p>This link will expire in 24 hours.</p>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Hospital Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  },

  resetPassword: {
    subject: 'Reset Your Password - Hospital Management System',
    html: (name, resetLink) => `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
            .button { background-color: #2196F3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; }
            .footer { margin-top: 20px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <h2>Hello ${name},</h2>
            <p>We received a request to reset your password. Click the button below to create a new password:</p>
            <p style="text-align: center;">
              <a href="${resetLink}" class="button">Reset Password</a>
            </p>
            <p>If you didn't request a password reset, please ignore this email or contact support if you have concerns.</p>
            <p>This link will expire in 1 hour.</p>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Hospital Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  },

  appointmentConfirmation: {
    subject: 'Appointment Confirmation - Hospital Management System',
    html: (patientName, doctorName, date, time) => `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #673AB7; color: white; padding: 20px; text-align: center; }
            .details { background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .footer { margin-top: 20px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Confirmation</h1>
            </div>
            <h2>Hello ${patientName},</h2>
            <p>Your appointment has been confirmed with the following details:</p>
            <div class="details">
              <p><strong>Doctor:</strong> ${doctorName}</p>
              <p><strong>Date:</strong> ${date}</p>
              <p><strong>Time:</strong> ${time}</p>
            </div>
            <p>Please arrive 15 minutes before your scheduled appointment time.</p>
            <p>If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Hospital Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  },

  appointmentReminder: {
    subject: 'Appointment Reminder - Hospital Management System',
    html: (patientName, doctorName, date, time) => `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #FF9800; color: white; padding: 20px; text-align: center; }
            .details { background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .footer { margin-top: 20px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Reminder</h1>
            </div>
            <h2>Hello ${patientName},</h2>
            <p>This is a reminder of your upcoming appointment:</p>
            <div class="details">
              <p><strong>Doctor:</strong> ${doctorName}</p>
              <p><strong>Date:</strong> ${date}</p>
              <p><strong>Time:</strong> ${time}</p>
            </div>
            <p>Please arrive 15 minutes before your scheduled appointment time.</p>
            <p>If you need to reschedule or cancel, please do so at least 24 hours in advance.</p>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Hospital Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  },
};
