const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const MedicalRecord = require('../models/MedicalRecord');
const TestResult = require('../models/TestResult');
const Prescription = require('../models/Prescription');
const User = require('../models/User');
const Leave = require('../models/Leave');
const auth = require('../middleware/auth');
const { sendAppointmentConfirmation, sendAppointmentReschedule, sendAppointmentCancellation } = require('../services/appointmentEmailService');
const { notificationService } = require('../services/notificationService');
const { sseManager } = require('../services/sseManager');

// Create a new appointment
router.post('/', auth, async (req, res) => {
  try {
    // Check if assigned staff is on leave
    const staffId = req.body.doctorId || req.body.nurseId;
    if (staffId) {
      const appointmentDate = new Date(req.body.date);
      const staffOnLeave = await Leave.isStaffOnLeave(staffId, appointmentDate);

      if (staffOnLeave) {
        return res.status(400).json({
          error: 'Selected staff member is on leave during this period',
          leaveInfo: {
            staffName: staffOnLeave.staffId.name,
            leaveType: staffOnLeave.leaveType,
            startDate: staffOnLeave.startDate,
            endDate: staffOnLeave.endDate
          }
        });
      }
    }

    const appointment = new Appointment(req.body);
    await appointment.save();

    // Auto-generate outstanding bill if payment is not completed
    if (appointment.paymentStatus !== 'PAID') {
      const Bill = require('../models/Bill');
      const mongoose = require('mongoose');
      const dueDate = new Date(appointment.date);
      dueDate.setDate(dueDate.getDate() + 30); // 30 days after appointment
      try {
        const count = await Bill.countDocuments();
        const billNumber = `BILL-${Date.now()}-${count + 1}`;
        const billData = {
          patientId: new mongoose.Types.ObjectId(appointment.patientId),
          billNumber,
          description: 'Doctor Consultation Fee',
          amount: appointment.paymentAmount || 50,
          dueDate,
          status: 'pending',
          serviceDate: appointment.date,
          services: [
            { name: 'Consultation', cost: appointment.paymentAmount || 50, quantity: 1 }
          ],
          paymentMethod: appointment.paymentMethod ? appointment.paymentMethod.toLowerCase() : undefined
        };
        console.log('Creating Bill:', billData);
        const createdBill = await Bill.create(billData);
        console.log('Bill created successfully:', createdBill._id);
      } catch (err) {
        console.error('Error creating Bill after appointment:', err);
      }
    }

    // Send real-time notification to patient
    try {
      await notificationService.sendAppointmentNotification(appointment, 'created', sseManager);
    } catch (notificationError) {
      console.error('Error sending appointment notification:', notificationError);
      // Don't fail the appointment creation if notification fails
    }

    // Send confirmation email
    try {
      console.log('🔍 Starting email confirmation process...');

      // Get patient and doctor details for email
      const patient = await User.findById(appointment.patientId);
      const doctor = appointment.doctorId ? await User.findById(appointment.doctorId) : null;
      const nurse = appointment.nurseId ? await User.findById(appointment.nurseId) : null;
      const staff = doctor || nurse;

      console.log('📋 Email data check:');
      console.log('  Patient found:', !!patient);
      console.log('  Patient email:', patient?.email || 'NO EMAIL');
      console.log('  Staff found:', !!staff);
      console.log('  Staff name:', staff?.name || 'NO STAFF');

      if (patient && patient.email && staff) {
        const emailData = {
          patientName: patient.name,
          patientEmail: patient.email,
          doctorName: staff.name,
          doctorSpecialization: staff.specialization || staff.department || 'Healthcare Professional',
          appointmentDate: appointment.date,
          appointmentTime: appointment.time || 'TBD',
          hospitalName: 'MediConnect Healthcare',
          hospitalLocation: 'Please contact us for location details',
          appointmentId: appointment._id.toString().slice(-8),
          reason: appointment.reason
        };

        console.log('📧 Sending confirmation email to:', patient.email);
        const emailResult = await sendAppointmentConfirmation(emailData);
        console.log('✅ Email confirmation result:', emailResult);
      } else {
        console.log('❌ Email not sent - missing required data:');
        console.log('  Patient exists:', !!patient);
        console.log('  Patient has email:', !!patient?.email);
        console.log('  Staff exists:', !!staff);
      }
    } catch (emailError) {
      console.error('❌ Error sending confirmation email:', emailError);
      // Don't fail the appointment creation if email fails
    }

    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Create a new medical record
router.post('/medical-records', auth, async (req, res) => {
  try {
    console.log('Creating medical record:', req.body);
    const medicalRecord = new MedicalRecord(req.body);
    await medicalRecord.save();
    res.status(201).json(medicalRecord);
  } catch (err) {
    console.error('Error creating medical record:', err);
    res.status(400).json({ error: err.message });
  }
});

// Create a new test result
router.post('/test-results', auth, async (req, res) => {
  try {
    console.log('Creating test result:', req.body);
    const testResult = new TestResult(req.body);
    await testResult.save();
    res.status(201).json(testResult);
  } catch (err) {
    console.error('Error creating test result:', err);
    res.status(400).json({ error: err.message });
  }
});

// Create a new prescription
router.post('/prescriptions', auth, async (req, res) => {
  try {
    console.log('Creating prescription:', req.body);
    const prescription = new Prescription(req.body);
    await prescription.save();
    res.status(201).json(prescription);
  } catch (err) {
    console.error('Error creating prescription:', err);
    res.status(400).json({ error: err.message });
  }
});

// Get medical records
router.get('/medical-records', auth, async (req, res) => {
  try {
    const filter = {};

    // Add patient filter if provided
    if (req.query.patientId) {
      filter.patientId = req.query.patientId;
    }

    // Add doctor filter if provided (for doctors to see their own records)
    if (req.query.doctorId) {
      filter.doctorId = req.query.doctorId;
    }

    const medicalRecords = await MedicalRecord.find(filter)
      .populate('patientId doctorId', 'name email')
      .sort({ recordDate: -1 });

    res.json(medicalRecords);
  } catch (err) {
    console.error('Error fetching medical records:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get test results
router.get('/test-results', auth, async (req, res) => {
  try {
    const filter = {};

    // Add patient filter if provided
    if (req.query.patientId) {
      filter.patientId = req.query.patientId;
    }

    // Add doctor filter if provided (for doctors to see their own records)
    if (req.query.doctorId) {
      filter.doctorId = req.query.doctorId;
    }

    const testResults = await TestResult.find(filter)
      .populate('patientId', 'name email')
      .sort({ testDate: -1 });

    res.json(testResults);
  } catch (err) {
    console.error('Error fetching test results:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get prescriptions
router.get('/prescriptions', auth, async (req, res) => {
  try {
    const filter = {};

    // Add patient filter if provided
    if (req.query.patientId) {
      filter.patientId = req.query.patientId;
    }

    // Add doctor filter if provided (for doctors to see their own records)
    if (req.query.doctorId) {
      filter.doctorId = req.query.doctorId;
    }

    const prescriptions = await Prescription.find(filter)
      .populate('patientId doctorId', 'name email')
      .sort({ prescribedDate: -1 });

    res.json(prescriptions);
  } catch (err) {
    console.error('Error fetching prescriptions:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all appointments (filtered by facility, doctor, date)
router.get('/', auth, async (req, res) => {
  try {
    // Build filter object
    const filter = {};

    // Add facility filter
    const facilityId = req.user.role === 'ADMIN' && req.query.facilityId
      ? req.query.facilityId
      : req.user.facilityId;
    if (facilityId) {
      filter.facilityId = facilityId;
    }

    // Add doctor filter if provided
    if (req.query.doctorId) {
      filter.doctorId = req.query.doctorId;
    }

    // Add nurse filter if provided
    if (req.query.nurseId) {
      filter.nurseId = req.query.nurseId;
    }

    // Add date filter if provided
    if (req.query.date) {
      const queryDate = new Date(req.query.date);
      const startOfDay = new Date(queryDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(queryDate);
      endOfDay.setHours(23, 59, 59, 999);

      filter.date = {
        $gte: startOfDay,
        $lte: endOfDay
      };
    }

    console.log('Appointment filter:', filter);

    const appointments = await Appointment.find(filter)
      .populate('patientId doctorId nurseId', 'name email')
      .sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get appointments by patient ID
router.get('/patient/:patientId', auth, async (req, res) => {
  try {
    console.log('GET /api/appointments/patient/:patientId called with ID:', req.params.patientId);
    const appointments = await Appointment.find({ patientId: req.params.patientId })
      .populate('patientId doctorId nurseId', 'name email')
      .sort({ date: -1 });
    res.json(appointments);
  } catch (err) {
    console.error('Error in GET /api/appointments/patient/:patientId:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update appointment
router.put('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('patientId doctorId nurseId', 'name email');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Send real-time notification for updates
    try {
      await notificationService.sendAppointmentNotification(appointment, 'updated', sseManager);
    } catch (notificationError) {
      console.error('Error sending appointment notification:', notificationError);
    }

    res.json(appointment);
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(400).json({ error: err.message });
  }
});

// Update appointment status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('patientId doctorId nurseId', 'name email');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Send real-time notification for status changes
    try {
      await notificationService.sendAppointmentNotification(appointment, 'cancelled', sseManager);
    } catch (notificationError) {
      console.error('Error sending appointment notification:', notificationError);
    }

    // Send email notification for status changes
    try {
      const patient = await User.findById(appointment.patientId);
      const staff = appointment.doctorId || appointment.nurseId;
      const staffUser = await User.findById(staff);

      if (patient && patient.email && staffUser) {
        let emailData = {};

        if (status === 'CANCELLED') {
          emailData = {
            patientName: patient.name,
            patientEmail: patient.email,
            doctorName: staffUser.name,
            doctorSpecialization: staffUser.specialization || staffUser.department || 'Healthcare Professional',
            appointmentDate: appointment.date,
            appointmentTime: appointment.time || 'TBD',
            hospitalName: 'MediConnect Healthcare',
            appointmentId: appointment._id.toString().slice(-8),
            reason: appointment.reason,
            statusChange: 'cancelled'
          };
          await sendAppointmentCancellation(emailData);
        }
      }
    } catch (emailError) {
      console.error('Error sending status change email:', emailError);
    }

    res.json(appointment);
  } catch (err) {
    console.error('Error updating appointment status:', err);
    res.status(400).json({ error: err.message });
  }
});

// Cancel appointment (alias for status update)
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status: 'CANCELLED', updatedAt: new Date() },
      { new: true, runValidators: true }
    ).populate('patientId doctorId nurseId', 'name email');

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Send real-time notification
    try {
      await notificationService.sendAppointmentNotification(appointment, 'cancelled', sseManager);
    } catch (notificationError) {
      console.error('Error sending appointment notification:', notificationError);
    }

    // Send cancellation email
    try {
      const patient = await User.findById(appointment.patientId);
      const staff = appointment.doctorId || appointment.nurseId;
      const staffUser = await User.findById(staff);

      if (patient && patient.email && staffUser) {
        const emailData = {
          patientName: patient.name,
          patientEmail: patient.email,
          doctorName: staffUser.name,
          doctorSpecialization: staffUser.specialization || staffUser.department || 'Healthcare Professional',
          appointmentDate: appointment.date,
          appointmentTime: appointment.time || 'TBD',
          hospitalName: 'MediConnect Healthcare',
          appointmentId: appointment._id.toString().slice(-8),
          reason: appointment.reason
        };
        await sendAppointmentCancellation(emailData);
      }
    } catch (emailError) {
      console.error('Error sending cancellation email:', emailError);
    }

    res.json(appointment);
  } catch (err) {
    console.error('Error cancelling appointment:', err);
    res.status(400).json({ error: err.message });
  }
});
// Dashboard appointment stats
router.get('/stats', auth, async (req, res) => {
  try {
    console.log('GET /api/appointments/stats called');

    // Simple stats response for now
    const statsData = {
      total: 42,
      upcoming: 10,
      completed: 32,
      cancelled: 3,
      pending: 7,
      trends: [
        { month: 'Jan', count: 4 },
        { month: 'Feb', count: 7 },
        { month: 'Mar', count: 10 },
        { month: 'Apr', count: 21 },
        { month: 'May', count: 15 },
        { month: 'Jun', count: 12 }
      ]
    };

    console.log('Sending stats data:', statsData);
    return res.json(statsData);
  } catch (err) {
    console.error('Appointment Stats Error:', err);
    return res.status(500).json({ error: err.message || 'Unknown error in stats route' });
  }
});

module.exports = router;
