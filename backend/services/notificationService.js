// Notification service for real-time updates
const Notification = require('../models/Notification');
const User = require('../models/User');

const notificationService = {
  // Send notification to patient via SSE
  async sendNotificationToPatient(patientId, notification, sseManager = null) {
    try {
      // Save notification to database first
      const newNotification = await Notification.create({
        userId: patientId,
        title: notification.title,
        message: notification.message,
        type: notification.type || 'appointment',
        priority: notification.priority || 'medium',
        read: false,
        actionUrl: notification.actionUrl,
        relatedId: notification.relatedId,
        expiresAt: notification.expiresAt
      });

      // Broadcast notification to all connected clients for this patient if SSE manager is provided
      if (sseManager) {
        const eventData = {
          type: 'notification',
          data: newNotification
        };

        // Send SSE to all clients listening for this patient's notifications
        sseManager.broadcastToPatient(patientId, eventData);
      }

      return newNotification;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  },

  // Send appointment notification when appointment is created
  async sendAppointmentNotification(appointment, type = 'created', sseManager = null) {
    try {
      const patient = await User.findById(appointment.patientId);
      if (!patient) return;

      let title, message, priority = 'medium';

      switch (type) {
        case 'created':
          title = 'New Appointment Scheduled';
          message = `You have a new appointment with ${appointment.doctorId?.name || 'your doctor'} on ${new Date(appointment.date).toLocaleDateString()} at ${appointment.time || 'TBD'}`;
          priority = 'high';
          break;
        case 'updated':
          title = 'Appointment Updated';
          message = `Your appointment on ${new Date(appointment.date).toLocaleDateString()} has been updated`;
          priority = 'medium';
          break;
        case 'cancelled':
          title = 'Appointment Cancelled';
          message = `Your appointment on ${new Date(appointment.date).toLocaleDateString()} has been cancelled`;
          priority = 'high';
          break;
        case 'reminder':
          title = 'Appointment Reminder';
          message = `You have an upcoming appointment tomorrow at ${appointment.time || 'TBD'}`;
          priority = 'high';
          break;
        default:
          title = 'Appointment Notification';
          message = 'You have a new appointment notification';
      }

      await this.sendNotificationToPatient(appointment.patientId, {
        title,
        message,
        type: 'appointment',
        priority,
        actionUrl: '/appointments',
        relatedId: appointment._id.toString()
      }, sseManager);

      console.log(`Notification sent to patient ${patient.name}: ${title}`);
    } catch (error) {
      console.error('Error sending appointment notification:', error);
    }
  }
};
