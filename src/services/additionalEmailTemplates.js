export const additionalTemplates = {
  testResults: {
    subject: 'Test Results Available - Hospital Management System',
    html: (patientName, testType, doctorName) => `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #3F51B5; color: white; padding: 20px; text-align: center; }
            .details { background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .footer { margin-top: 20px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Test Results Available</h1>
            </div>
            <h2>Hello ${patientName},</h2>
            <p>Your test results are now available for review:</p>
            <div class="details">
              <p><strong>Test Type:</strong> ${testType}</p>
              <p><strong>Doctor:</strong> ${doctorName}</p>
            </div>
            <p>Please log in to your patient portal to view your results. Your doctor will discuss these results with you during your next appointment.</p>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Hospital Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  },

  prescription: {
    subject: 'New Prescription - Hospital Management System',
    html: (patientName, doctorName, medications) => `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #009688; color: white; padding: 20px; text-align: center; }
            .details { background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .medication { border-bottom: 1px solid #ddd; padding: 10px 0; }
            .footer { margin-top: 20px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New Prescription</h1>
            </div>
            <h2>Hello ${patientName},</h2>
            <p>Dr. ${doctorName} has prescribed the following medications:</p>
            <div class="details">
              ${medications.map(med => `
                <div class="medication">
                  <p><strong>Medication:</strong> ${med.name}</p>
                  <p><strong>Dosage:</strong> ${med.dosage}</p>
                  <p><strong>Instructions:</strong> ${med.instructions}</p>
                </div>
              `).join('')}
            </div>
            <p>Please pick up your prescription from your preferred pharmacy. Contact us if you have any questions.</p>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Hospital Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  },

  emergencyAlert: {
    subject: 'EMERGENCY ALERT - Hospital Management System',
    html: (staffName, emergency) => `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f44336; color: white; padding: 20px; text-align: center; }
            .details { background-color: #ffebee; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .urgent { color: #f44336; font-weight: bold; }
            .footer { margin-top: 20px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>EMERGENCY ALERT</h1>
            </div>
            <h2>Attention ${staffName},</h2>
            <p class="urgent">IMMEDIATE ACTION REQUIRED</p>
            <div class="details">
              <p><strong>Type:</strong> ${emergency.type}</p>
              <p><strong>Location:</strong> ${emergency.location}</p>
              <p><strong>Description:</strong> ${emergency.description}</p>
            </div>
            <p>Please respond immediately according to emergency protocols.</p>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Hospital Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  },

  appointmentCancellation: {
    subject: 'Appointment Cancellation - Hospital Management System',
    html: (name, appointment) => `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #607D8B; color: white; padding: 20px; text-align: center; }
            .details { background-color: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 4px; }
            .footer { margin-top: 20px; text-align: center; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Appointment Cancellation</h1>
            </div>
            <h2>Hello ${name},</h2>
            <p>Your appointment has been cancelled:</p>
            <div class="details">
              <p><strong>Date:</strong> ${appointment.date}</p>
              <p><strong>Time:</strong> ${appointment.time}</p>
              <p><strong>Doctor:</strong> ${appointment.doctorName}</p>
              ${appointment.reason ? `<p><strong>Reason:</strong> ${appointment.reason}</p>` : ''}
            </div>
            <p>Please reschedule your appointment at your earliest convenience.</p>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Hospital Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  },
};
