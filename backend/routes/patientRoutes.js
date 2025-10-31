const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Bill = require('../models/Bill');
const Notification = require('../models/Notification');
const Payment = require('../models/Payment');
const User = require('../models/User');
const MedicalRecord = require('../models/MedicalRecord');
const TestResult = require('../models/TestResult');
const Vital = require('../models/Vital');
const Condition = require('../models/Condition');
const Allergy = require('../models/Allergy');
const auth = require('../middleware/auth');

// GET /api/patients/list - Get patients list with optional facility filtering
router.get('/list', auth, async (req, res) => {
  try {
    console.log('🔍 /api/patients/list route hit!');
    console.log('Query params:', req.query);
    console.log('User:', req.user);
    
    const { facilityId, myPatientsOnly } = req.query;
    
    // Build query filter
    const filter = { role: 'PATIENT' };
    
    // If myPatientsOnly is true and user has facilityId, filter by facility
    if (myPatientsOnly === 'true' && req.user.facilityId) {
      filter.facilityId = req.user.facilityId;
    } else if (facilityId) {
      // Allow explicit facility filtering
      filter.facilityId = facilityId;
    }

    // Get patients
    const patients = await User.find(filter)
      .select('name email phone phoneNumber facilityId lastVisit nextAppointment status')
      .populate('facilityId', 'name')
      .sort({ name: 1 });

    // Transform data for frontend
    const patientsData = patients.map(patient => ({
      id: patient._id,
      name: patient.name || patient.email,
      email: patient.email || 'No email',
      phone: patient.phone || patient.phoneNumber || 'No phone',
      facilityId: patient.facilityId?._id || patient.facilityId,
      facilityName: patient.facilityId?.name || 'No facility',
      lastVisit: patient.lastVisit || 'No previous visits',
      nextAppointment: patient.nextAppointment || null,
      status: patient.status || 'Active',
    }));

    console.log(`✅ Returning ${patientsData.length} patients`);
    res.json(patientsData);
  } catch (error) {
    console.error('❌ Error fetching patients list:', error);
    res.status(500).json({ 
      message: 'Failed to fetch patients list', 
      error: error.message 
    });
  }
});

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

    // Ideally verify JWT and ownership/permissions here.
    // Try to find patient in Mongo; if not found, proceed with a stub to support Firebase UID flows during development.
    let patient = null;
    try {
      patient = await User.findById(patientId);
    } catch (_) {
      // Ignore cast errors for non-ObjectId values
    }

    req.patient = patient || { _id: patientId, role: 'PATIENT' };
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
    
    // Try to get real data from database first
    const mongoose = require('mongoose');
    try {
      console.log('Fetching bills for patientId:', patientId, 'Type:', typeof patientId);
      let dbBills = [];
      if (mongoose.Types.ObjectId.isValid(patientId)) {
        dbBills = await Bill.find({ patientId: new mongoose.Types.ObjectId(patientId) }).sort({ createdAt: -1 }).lean();
      } else {
        dbBills = await Bill.find({ patientId: patientId }).sort({ createdAt: -1 }).lean();
      }
      if (dbBills && dbBills.length) {
        return res.json(dbBills);
      }
    } catch (castErr) {
      console.error('Error fetching bills for patient:', patientId, castErr);
      return res.status(500).json({ message: 'Error fetching bills', error: castErr.message });
    }

    // Fallback to mock data
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

// GET /api/patients/:patientId/payments
router.get('/:patientId/payments', verifyPatientAccess, async (req, res) => {
  try {
    const { patientId } = req.params;

    // Try to get real data from database first
    const payments = await Payment.find({ patientId }).sort({ createdAt: -1 }).lean();

    res.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ message: 'Failed to fetch payments', error: error.message });
  }
});

// POST /api/patients/:patientId/payments
router.post('/:patientId/payments', verifyPatientAccess, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { amount, paymentMethod, billId, currency = 'USD', description, status, transactionId, processedAt, metadata } = req.body;

    if (!amount || !paymentMethod) {
      return res.status(400).json({ message: 'Amount and payment method are required' });
    }
    if (Number(amount) <= 0) {
      return res.status(400).json({ message: 'Amount must be greater than 0' });
    }

    const newPayment = await Payment.create({
      patientId,
      billId: billId || null,
      amount: Number(amount),
      currency,
      paymentMethod,
      status: status || 'completed',
      transactionId: transactionId || `TXN-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      paymentProvider: 'MANUAL',
      description: description || 'Payment via billing interface',
      processedAt: processedAt ? new Date(processedAt) : new Date(),
      metadata: metadata || {},
    });

    // If linked to a bill, update its paid/balance fields
    if (billId) {
      try {
        const completedForBill = await Payment.aggregate([
          { $match: { billId: newPayment.billId, status: 'completed' } },
          { $group: { _id: null, total: { $sum: '$amount' } } }
        ]);
        const paidAmount = completedForBill.length ? completedForBill[0].total : 0;

        const bill = await Bill.findById(billId);
        if (bill) {
          const remaining = Math.max((bill.amount || 0) - paidAmount, 0);
          const update = remaining <= 0
            ? { status: 'paid', paidAmount: bill.amount, balance: 0, paidAt: new Date() }
            : { paidAmount, balance: remaining };
          await Bill.findByIdAndUpdate(billId, { ...update, updatedAt: new Date() });
        }
      } catch (billUpdateErr) {
        console.error('Error updating bill after payment:', billUpdateErr);
      }
    }

    res.status(201).json({ message: 'Payment processed successfully', payment: newPayment });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Failed to process payment', error: error.message });
  }
});

// PUT /api/bills/:billId
router.put('/bills/:billId', async (req, res) => {
  try {
    const { billId } = req.params;
    const updateData = req.body || {};

    const bill = await Bill.findByIdAndUpdate(
      billId,
      { ...updateData, updatedAt: new Date() },
      { new: true }
    );

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    res.json({ message: 'Bill updated successfully', bill });
  } catch (error) {
    console.error('Error updating bill:', error);
    res.status(500).json({ message: 'Failed to update bill', error: error.message });
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

// PUT /api/patients/:patientId/notifications/read-all
router.put('/:patientId/notifications/read-all', verifyPatientAccess, async (req, res) => {
  try {
    const { patientId } = req.params;

    const result = await Notification.updateMany(
      { userId: patientId, read: false },
      { read: true }
    );

    res.json({
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ message: 'Failed to mark notifications as read', error: error.message });
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

// GET /api/patients/:patientId/medical-records - Patient access to their own medical records
router.get('/:patientId/medical-records', verifyPatientAccess, async (req, res) => {
  try {
    const { patientId } = req.params;
    console.log('Fetching medical records for patient:', patientId);

    let records = await MedicalRecord.find({ patientId })
      .populate('facilityId', 'name address phone')
      .populate('doctorId', 'name email')
      .sort({ recordDate: -1 });
    console.log('Found existing records:', records.length);

    if (records.length === 0) {
      console.log('No records found, creating sample records...');
      // Create sample records if none exist for this patient
      const sampleRecords = [
        {
          patientId,
          recordType: 'diagnosis',
          recordDate: new Date('2023-01-15T10:00:00Z'),
          diagnosis: 'Hypertension',
          description: 'Patient presented with consistently high blood pressure readings. Advised on lifestyle changes and monitoring.',
          doctorName: 'Dr. Emily Carter',
          facility: 'General Hospital',
        },
        {
          patientId,
          recordType: 'lab_result',
          recordDate: new Date('2023-02-20T14:30:00Z'),
          diagnosis: 'Lipid Panel',
          description: 'Total Cholesterol: 240 mg/dL (High), LDL: 160 mg/dL (High). Results indicate hyperlipidemia.',
          doctorName: 'Dr. John Doe',
          facility: 'City Clinic Labs',
        },
        {
          patientId,
          recordType: 'treatment',
          recordDate: new Date('2023-03-10T11:00:00Z'),
          diagnosis: 'Hypertension Management',
          description: 'Initiated treatment for hypertension based on recent diagnosis and lab results.',
          treatment: 'Prescribed Lisinopril 10mg once daily. Follow-up in 3 months.',
          doctorName: 'Dr. Emily Carter',
          facility: 'General Hospital',
        },
        {
          patientId,
          recordType: 'consultation',
          recordDate: new Date('2023-05-25T09:00:00Z'),
          diagnosis: 'Annual Physical Exam',
          description: 'Routine check-up. Patient reports feeling well. Discussed diet and exercise.',
          notes: 'All vitals are stable. Continue current treatment plan.',
          doctorName: 'Dr. Emily Carter',
          facility: 'General Hospital',
        },
      ];

      try {
        await MedicalRecord.insertMany(sampleRecords);
        console.log('Sample records created successfully');
        records = await MedicalRecord.find({ patientId }).sort({ recordDate: -1 });
        console.log('Records after creation:', records.length);
      } catch (insertError) {
        console.error('Error creating sample records:', insertError);
        // Return empty array if sample creation fails
        records = [];
      }
    }

    res.json(records);
  } catch (error) {
    console.error('Error fetching medical records:', error);
    res.status(500).json({ message: 'Failed to fetch medical records', error: error.message });
  }
});

// GET /api/patients/:patientId/prescriptions
router.get('/:patientId/prescriptions', verifyPatientAccess, async (req, res) => {
  try {
    const { patientId } = req.params;
    let prescriptions = await Prescription.find({ patientId }).sort({ createdAt: -1 });

    if (prescriptions.length === 0) {
      // Create a sample prescription if none exist
      const samplePrescription = {
        patientId,
        medication: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '3 months',
        notes: 'Take with food. Monitor blood pressure regularly.',
        doctorName: 'Dr. Emily Carter',
        createdAt: new Date('2023-03-10T11:00:00Z'),
      };
      await Prescription.create(samplePrescription);
      prescriptions = await Prescription.find({ patientId }).sort({ createdAt: -1 });
    }

    res.json(prescriptions);
  } catch (error) {
    console.error('Error fetching prescriptions:', error);
    res.status(500).json({ message: 'Failed to fetch prescriptions', error: error.message });
  }
});

// GET /api/patients/:patientId/test-results
router.get('/:patientId/test-results', verifyPatientAccess, async (req, res) => {
  try {
    const { patientId } = req.params;
    let testResults = await TestResult.find({ patientId }).sort({ testDate: -1 });

    if (testResults.length === 0) {
      // Create sample test results if none exist
      const sampleTestResults = [
        {
          patientId,
          testName: 'Complete Blood Count (CBC)',
          testDate: new Date('2023-02-20T14:00:00Z'),
          status: 'Reviewed',
          orderedBy: 'Dr. John Doe',
          facility: 'City Clinic Labs',
          results: [
            { parameter: 'Hemoglobin', value: '14.5', unit: 'g/dL', referenceRange: '13.5-17.5' },
            { parameter: 'White Blood Cell Count', value: '7.2', unit: 'x10^9/L', referenceRange: '4.5-11.0' },
          ],
          interpretation: 'All values within normal range.',
        },
        {
          patientId,
          testName: 'Lipid Panel',
          testDate: new Date('2023-02-20T14:30:00Z'),
          status: 'Completed',
          orderedBy: 'Dr. Emily Carter',
          facility: 'General Hospital Labs',
          results: [
            { parameter: 'Total Cholesterol', value: '240', unit: 'mg/dL', referenceRange: '<200' },
            { parameter: 'LDL Cholesterol', value: '160', unit: 'mg/dL', referenceRange: '<100' },
            { parameter: 'HDL Cholesterol', value: '50', unit: 'mg/dL', referenceRange: '>40' },
          ],
          interpretation: 'High total and LDL cholesterol. Indicates hyperlipidemia.',
        },
      ];
      await TestResult.insertMany(sampleTestResults);
      testResults = await TestResult.find({ patientId }).sort({ testDate: -1 });
    }

    res.json(testResults);
  } catch (error) {
    console.error('Error fetching test results:', error);
    res.status(500).json({ message: 'Failed to fetch test results', error: error.message });
  }
});

// GET /api/patients/:patientId/vitals
router.get('/:patientId/vitals', verifyPatientAccess, async (req, res) => {
  try {
    const { patientId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 10;
    let vitals = await Vital.find({ patientId }).sort({ measurementDate: -1 }).limit(limit);

    if (vitals.length === 0) {
      // Create sample vitals if none exist
      const sampleVitals = [
        {
          patientId,
          measurementDate: new Date('2023-01-15T09:00:00Z'),
          bloodPressure: { systolic: 120, diastolic: 80 },
          heartRate: 72,
          temperature: 36.8,
          oxygenSaturation: 98,
          recordedBy: 'Nurse Jane Doe',
        },
        {
          patientId,
          measurementDate: new Date('2023-02-20T10:00:00Z'),
          bloodPressure: { systolic: 125, diastolic: 82 },
          heartRate: 75,
          temperature: 37.0,
          oxygenSaturation: 97,
          recordedBy: 'Nurse Jane Doe',
        },
      ];
      await Vital.insertMany(sampleVitals);
      vitals = await Vital.find({ patientId }).sort({ measurementDate: -1 }).limit(limit);
    }

    res.json(vitals);
  } catch (error) {
    console.error('Error fetching vitals:', error);
    res.status(500).json({ message: 'Failed to fetch vitals', error: error.message });
  }
});

// GET /api/patients/:patientId/conditions
router.get('/:patientId/conditions', verifyPatientAccess, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status } = req.query;
    const query = { patientId };
    if (status) {
      query.status = status;
    }

    let conditions = await Condition.find(query).sort({ onsetDate: -1 });

    if (conditions.length === 0 && !status) {
      // Create sample conditions if none exist
      const sampleConditions = [
        {
          patientId,
          conditionName: 'Hypertension',
          status: 'active',
          onsetDate: new Date('2023-01-15T00:00:00Z'),
          recordedBy: 'Dr. Emily Carter',
        },
        {
          patientId,
          conditionName: 'Type 2 Diabetes',
          status: 'chronic',
          onsetDate: new Date('2022-05-20T00:00:00Z'),
          recordedBy: 'Dr. John Doe',
        },
      ];
      await Condition.insertMany(sampleConditions);
      conditions = await Condition.find(query).sort({ onsetDate: -1 });
    }

    res.json(conditions);
  } catch (error) {
    console.error('Error fetching conditions:', error);
    res.status(500).json({ message: 'Failed to fetch conditions', error: error.message });
  }
});

// GET /api/patients/:patientId/allergies
router.get('/:patientId/allergies', verifyPatientAccess, async (req, res) => {
  try {
    const { patientId } = req.params;
    let allergies = await Allergy.find({ patientId });

    if (allergies.length === 0) {
      // Create a sample allergy if none exist
      const sampleAllergy = {
        patientId,
        allergen: 'Peanuts',
        reaction: 'Anaphylaxis',
        severity: 'severe',
        recordedBy: 'Dr. Emily Carter',
      };
      await Allergy.create(sampleAllergy);
      allergies = await Allergy.find({ patientId });
    }

    res.json(allergies);
  } catch (error) {
    console.error('Error fetching allergies:', error);
    res.status(500).json({ message: 'Failed to fetch allergies', error: error.message });
  }
});

// GET health summary
router.get('/:patientId/health-summary', auth, async (req, res) => {
  const { patientId } = req.params;
  const user = await User.findById(patientId);
  res.json({ summary: user?.healthSummary || '' });
});

// PUT health summary
router.put('/:patientId/health-summary', auth, async (req, res) => {
  const { patientId } = req.params;
  const { summary } = req.body;
  await User.findByIdAndUpdate(patientId, { healthSummary: summary });
  res.json({ message: 'Health summary updated' });
});

// GET /api/doctors/:doctorId/patients/:patientId/medical-records
router.get('/doctors/:doctorId/patients/:patientId/medical-records', auth, async (req, res) => {
  try {
    const { patientId } = req.params;
    // Optionally, check doctorId permissions here
    const records = await MedicalRecord.find({ patientId })
      .populate('facilityId', 'name address phone')
      .populate('doctorId', 'name email')
      .sort({ recordDate: -1 });
    res.json(records);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch medical records', error: error.message });
  }
});

module.exports = router;

