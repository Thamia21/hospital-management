const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Bill = require('../models/Bill');
const Notification = require('../models/Notification');
const User = require('../models/User');
const auth = require('../middleware/auth');

// GET /api/patients/stats - Get patient statistics for admin dashboard
router.get('/stats', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }

    const { facilityId } = req.query;
    
    // Build query filter
    const filter = {};
    if (facilityId) {
      filter.facilityId = facilityId;
    }

    // Get total patients count
    const totalPatients = await User.countDocuments({
      role: 'PATIENT',
      ...filter
    });

    // Get recent appointments to determine active patients
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentAppointments = await Appointment.find({
      date: { $gte: thirtyDaysAgo },
      ...filter
    }).populate('patientId');

    // Count unique active patients (patients with appointments in last 30 days)
    const activePatientIds = new Set(
      recentAppointments
        .filter(apt => apt.patientId && apt.patientId.role === 'PATIENT')
        .map(apt => apt.patientId._id.toString())
    );
    const activePatients = activePatientIds.size;

    // For inpatients/outpatients, we'll use a simple calculation
    // In a real system, this would be based on admission status
    const inpatients = Math.floor(totalPatients * 0.15); // Assume 15% are inpatients
    const outpatients = totalPatients - inpatients;

    // Get patient registrations this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const newPatientsThisMonth = await User.countDocuments({
      role: 'PATIENT',
      createdAt: { $gte: startOfMonth },
      ...filter
    });

    res.json({
      total: totalPatients,
      active: activePatients,
      inpatients: inpatients,
      outpatients: outpatients,
      newThisMonth: newPatientsThisMonth,
      // Additional stats for dashboard
      averageAge: 45, // Mock data - would calculate from patient birthdates
      genderDistribution: {
        male: Math.floor(totalPatients * 0.48),
        female: Math.floor(totalPatients * 0.52)
      }
    });
  } catch (error) {
    console.error('Error fetching patient stats:', error);
    res.status(500).json({ 
      message: 'Failed to fetch patient statistics', 
      error: error.message 
    });
  }
});

// Middleware to verify patient access
const verifyPatientAccess = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    
    // In a real app, you'd verify JWT token and check if user can access this patient's data
    // For now, we'll just check if the patient exists
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }
    
    req.patient = patient;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// GET /api/patients/:patientId/appointments
router.get('/:patientId/appointments', verifyPatientAccess, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    const appointments = await Appointment.find({ patientId })
      .sort({ date: 1 })
      .lean();
    
    // Add mock doctor names if not present
    const appointmentsWithDoctors = appointments.map(appointment => ({
      ...appointment,
      doctorName: appointment.doctorName || 'Dr. Smith',
      doctorSpecialty: appointment.doctorSpecialty || 'General Medicine',
      status: appointment.status || 'scheduled'
    }));
    
    res.json(appointmentsWithDoctors);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ message: 'Failed to fetch appointments', error: error.message });
  }
});

// GET /api/patients/:patientId/prescriptions
router.get('/:patientId/prescriptions', verifyPatientAccess, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Return mock data for now
    const mockPrescriptions = [
        {
          _id: '507f1f77bcf86cd799439014',
          patientId,
          doctorId: 'doc123',
          doctorName: 'Dr. Sarah Johnson',
          medication: 'Amoxicillin',
          dosage: '500mg',
          frequency: 'Twice daily',
          duration: '7 days',
          instructions: 'Take with food',
          status: 'active',
          prescribedDate: new Date(),
          startDate: new Date(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          refillsRemaining: 2,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: '507f1f77bcf86cd799439013',
          patientId,
          doctorId: 'doc456',
          doctorName: 'Dr. Michael Chen',
          medication: 'Lisinopril',
          dosage: '10mg',
          frequency: 'Once daily',
          duration: '30 days',
          instructions: 'Take in the morning',
          status: 'active',
          prescribedDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          startDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          endDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
          refillsRemaining: 1,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        }
      ];
    
    res.json(mockPrescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ message: 'Failed to fetch prescriptions', error: error.message });
  }
});

// GET /api/patients/:patientId/bills
router.get('/:patientId/bills', verifyPatientAccess, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // For now, return mock data to avoid database issues
    const mockBills = [
      {
        _id: '507f1f77bcf86cd799439011',
        patientId,
        billNumber: `BILL-${Date.now()}-1`,
        description: 'General Consultation',
        amount: 150.00,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'pending',
        serviceDate: new Date(),
        services: [
          { name: 'Consultation Fee', cost: 100.00, quantity: 1 },
          { name: 'Basic Tests', cost: 50.00, quantity: 1 }
        ],
        paidAmount: 0,
        balance: 150.00,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        _id: '507f1f77bcf86cd799439012',
        patientId,
        billNumber: `BILL-${Date.now()}-2`,
        description: 'Blood Test Results',
        amount: 75.00,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'paid',
        serviceDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        services: [
          { name: 'Blood Work', cost: 75.00, quantity: 1 }
        ],
        paidAmount: 75.00,
        paidDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        paymentMethod: 'card',
        balance: 0,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ];
    
    res.json(mockBills);
  } catch (error) {
    console.error('Error fetching bills:', error);
    res.status(500).json({ message: 'Failed to fetch bills', error: error.message });
  }
});

// GET /api/patients/:patientId/notifications
router.get('/:patientId/notifications', verifyPatientAccess, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Return mock data for now
    const mockNotifications = [
        {
          _id: '507f1f77bcf86cd799439015',
          userId: patientId,
          title: 'Appointment Reminder',
          message: 'You have an upcoming appointment tomorrow at 2:00 PM',
          type: 'appointment',
          priority: 'medium',
          read: false,
          actionUrl: '/appointments',
          relatedId: 'apt123',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          _id: '507f1f77bcf86cd799439016',
          userId: patientId,
          title: 'Prescription Ready',
          message: 'Your prescription for Amoxicillin is ready for pickup',
          type: 'prescription',
          priority: 'low',
          read: false,
          actionUrl: '/prescriptions',
          relatedId: 'presc456',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          _id: '507f1f77bcf86cd799439017',
          userId: patientId,
          title: 'Bill Payment Due',
          message: 'Your bill of $150.00 is due in 5 days',
          type: 'bill',
          priority: 'high',
          read: true,
          actionUrl: '/billing',
          relatedId: 'bill789',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000)
        }
      ];
    
    res.json(mockNotifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
});

// PUT /api/patients/:patientId/notifications/:notificationId/read
router.put('/:patientId/notifications/:notificationId/read', verifyPatientAccess, async (req, res) => {
  try {
    const { patientId, notificationId } = req.params;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: patientId },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    res.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ message: 'Failed to update notification', error: error.message });
  }
});

// GET /api/patients/:patientId/dashboard-summary
router.get('/:patientId/dashboard-summary', verifyPatientAccess, async (req, res) => {
  try {
    const { patientId } = req.params;
    
    // Get counts for dashboard summary
    const [appointmentCount, prescriptionCount, billCount, notificationCount] = await Promise.all([
      Appointment.countDocuments({ patientId, date: { $gte: new Date() } }),
      Prescription.countDocuments({ patientId, status: 'active' }),
      Bill.countDocuments({ patientId, status: { $in: ['pending', 'overdue'] } }),
      Notification.countDocuments({ userId: patientId, read: false })
    ]);
    
    // Calculate total outstanding balance
    const bills = await Bill.find({ patientId, status: { $in: ['pending', 'overdue'] } });
    const outstandingBalance = bills.reduce((total, bill) => total + bill.balance, 0);
    
    res.json({
      upcomingAppointments: appointmentCount,
      activePrescriptions: prescriptionCount,
      pendingBills: billCount,
      unreadNotifications: notificationCount,
      outstandingBalance: outstandingBalance
    });
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard summary', error: error.message });
  }
});

module.exports = router;
