const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const User = require('../models/User');
const Leave = require('../models/Leave');
const auth = require('../middleware/auth');
const { sendAppointmentConfirmation, sendAppointmentReschedule, sendAppointmentCancellation } = require('../services/appointmentEmailService');

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

// Get appointments by doctor ID
router.get('/doctor/:doctorId', auth, async (req, res) => {
  try {
    console.log('GET /api/appointments/doctor/:doctorId called with ID:', req.params.doctorId);
    const appointments = await Appointment.find({ doctorId: req.params.doctorId })
      .populate('patientId doctorId', 'name email phone')
      .sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    console.error('Error in GET /api/appointments/doctor/:doctorId:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get appointments by nurse ID
router.get('/nurse/:nurseId', auth, async (req, res) => {
  try {
    console.log('GET /api/appointments/nurse/:nurseId called with ID:', req.params.nurseId);
    const appointments = await Appointment.find({ nurseId: req.params.nurseId })
      .populate('patientId nurseId', 'name email phone')
      .sort({ date: 1 });
    res.json(appointments);
  } catch (err) {
    console.error('Error in GET /api/appointments/nurse/:nurseId:', err);
    res.status(500).json({ error: err.message });
  }
});

// Dashboard appointment stats (mock data)
router.get('/stats', auth, async (req, res) => {
  try {
    // Add detailed logging
    console.log('GET /api/appointments/stats called');
    console.log('Request headers:', req.headers);
    console.log('User from token:', req.user);
    
    // Send a simple response first to test
    const statsData = {
      total: 42,
      upcoming: 10,
      completed: 32,
      trends: [
        { month: 'Jan', count: 4 },
        { month: 'Feb', count: 7 },
        { month: 'Mar', count: 10 },
        { month: 'Apr', count: 21 }
      ]
    };
    
    console.log('Sending stats data:', statsData);
    return res.json(statsData);
  } catch (err) {
    console.error('Appointment Stats Error:', err);
    return res.status(500).json({ error: err.message || 'Unknown error in stats route' });
  }
});

// Get appointment by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('patientId doctorId');
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update appointment
router.put('/:id', auth, async (req, res) => {
  try {
    const oldAppointment = await Appointment.findById(req.params.id)
      .populate('patientId doctorId nurseId', 'name email');
    
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('patientId doctorId nurseId', 'name email');
    
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    
    // Send reschedule email if date or time changed
    const dateChanged = oldAppointment && new Date(oldAppointment.date).getTime() !== new Date(appointment.date).getTime();
    const timeChanged = oldAppointment && oldAppointment.time !== appointment.time;
    
    if ((dateChanged || timeChanged) && appointment.status !== 'CANCELLED') {
      try {
        const patient = appointment.patientId;
        const staff = appointment.doctorId || appointment.nurseId;
        
        if (patient && patient.email && staff) {
          const emailData = {
            patientName: patient.name,
            patientEmail: patient.email,
            doctorName: staff.name,
            doctorSpecialization: staff.specialization || staff.department || 'Healthcare Professional',
            oldAppointmentDate: oldAppointment.date,
            oldAppointmentTime: oldAppointment.time || 'TBD',
            newAppointmentDate: appointment.date,
            newAppointmentTime: appointment.time || 'TBD',
            hospitalName: 'MediConnect Healthcare',
            hospitalLocation: 'Please contact us for location details',
            appointmentId: appointment._id.toString().slice(-8),
            reason: appointment.reason
          };
          
          const emailResult = await sendAppointmentReschedule(emailData);
          console.log('Reschedule email result:', emailResult);
        }
      } catch (emailError) {
        console.error('Error sending reschedule email:', emailError);
      }
    }
    
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update appointment status
router.put('/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const oldAppointment = await Appointment.findById(req.params.id)
      .populate('patientId doctorId nurseId', 'name email');
    
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id, 
      { status }, 
      { new: true }
    ).populate('patientId doctorId nurseId', 'name email');
    
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }
    
    // Send email notification if status changed to CANCELLED
    if (status === 'CANCELLED' && oldAppointment.status !== 'CANCELLED') {
      try {
        const patient = appointment.patientId;
        const staff = appointment.doctorId || appointment.nurseId;
        
        if (patient && patient.email && staff) {
          const emailData = {
            patientName: patient.name,
            patientEmail: patient.email,
            doctorName: staff.name,
            doctorSpecialization: staff.specialization || staff.department || 'Healthcare Professional',
            appointmentDate: appointment.date,
            appointmentTime: appointment.time || 'TBD',
            hospitalName: 'MediConnect Healthcare',
            appointmentId: appointment._id.toString().slice(-8),
            reason: appointment.reason
          };
          
          const emailResult = await sendAppointmentCancellation(emailData);
          console.log('Cancellation email result:', emailResult);
        }
      } catch (emailError) {
        console.error('Error sending cancellation email:', emailError);
      }
    }
    
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete appointment
router.delete('/:id', auth, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
    res.json({ message: 'Appointment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Dashboard appointment stats (mock data)
router.get('/stats', auth, async (req, res) => {
  try {
    // Add detailed logging
    console.log('GET /api/appointments/stats called');
    console.log('Request headers:', req.headers);
    console.log('User from token:', req.user);
    
    // Send a simple response first to test
    const statsData = {
      total: 42,
      upcoming: 10,
      completed: 32,
      trends: [
        { month: 'Jan', count: 4 },
        { month: 'Feb', count: 7 },
        { month: 'Mar', count: 10 },
        { month: 'Apr', count: 21 }
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
