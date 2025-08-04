const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const User = require('../models/User');
const auth = require('../middleware/auth');

// Get all leave requests (Admin only)
router.get('/', auth, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const { status, staffType, startDate, endDate } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (staffType) filter.staffType = staffType;
    
    if (startDate || endDate) {
      filter.$or = [
        {
          startDate: { 
            $lte: endDate ? new Date(endDate) : new Date(),
            $gte: startDate ? new Date(startDate) : new Date(0)
          }
        }
      ];
    }

    const leaves = await Leave.find(filter)
      .populate('staffId', 'name email specialization department')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name')
      .sort({ createdAt: -1 });

    res.json(leaves);
  } catch (err) {
    console.error('Error fetching leave requests:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get leave requests for specific staff member
router.get('/staff/:staffId', auth, async (req, res) => {
  try {
    const { staffId } = req.params;
    
    // Check if user can access this data (admin or own data)
    if (req.user.role !== 'ADMIN' && req.user.id !== staffId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const leaves = await Leave.find({ staffId })
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name')
      .sort({ startDate: -1 });

    res.json(leaves);
  } catch (err) {
    console.error('Error fetching staff leave requests:', err);
    res.status(500).json({ error: err.message });
  }
});

// Create new leave request
router.post('/', auth, async (req, res) => {
  try {
    console.log('=== LEAVE CREATION DEBUG ===');
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('User from auth:', req.user);
    
    const {
      staffId,
      staffType,
      leaveType,
      startDate,
      endDate,
      reason,
      notes,
      emergencyContact
    } = req.body;
    
    console.log('Extracted fields:', {
      staffId,
      staffType,
      leaveType,
      startDate,
      endDate,
      reason,
      notes,
      emergencyContact
    });

    // Validate staff exists and is correct type
    console.log('Looking for staff with ID:', staffId);
    const staff = await User.findById(staffId);
    console.log('Found staff:', staff ? { id: staff._id, name: staff.name, role: staff.role } : 'null');
    
    if (!staff) {
      console.log('ERROR: Staff member not found');
      return res.status(404).json({ error: 'Staff member not found' });
    }

    console.log('Comparing staff role:', staff.role, 'with staffType:', staffType);
    if (staff.role !== staffType) {
      console.log('ERROR: Staff type mismatch');
      return res.status(400).json({ error: 'Staff type does not match user role' });
    }

    // Create leave request
    console.log('Creating leave with data:');
    const leaveData = {
      staffId,
      staffType,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      notes,
      emergencyContact,
      createdBy: req.user._id,
      status: req.user.role === 'ADMIN' ? 'APPROVED' : 'PENDING'
    };
    console.log('Leave data:', JSON.stringify(leaveData, null, 2));
    
    const leave = new Leave(leaveData);
    console.log('Leave object created successfully');

    // Check for overlapping leave
    console.log('Checking for overlapping leave...');
    const hasOverlap = await leave.hasOverlap();
    console.log('Has overlap:', hasOverlap);
    
    if (hasOverlap) {
      console.log('ERROR: Leave overlaps with existing leave');
      return res.status(400).json({ 
        error: 'Leave request overlaps with existing leave period' 
      });
    }

    console.log('Saving leave to database...');
    await leave.save();
    console.log('Leave saved successfully');
    
    // Populate the response
    await leave.populate('staffId', 'name email specialization department');
    await leave.populate('createdBy', 'name');

    res.status(201).json(leave);
  } catch (err) {
    console.error('=== ERROR CREATING LEAVE REQUEST ===');
    console.error('Error message:', err.message);
    console.error('Error stack:', err.stack);
    console.error('Error name:', err.name);
    
    // Check if it's a validation error
    if (err.name === 'ValidationError') {
      console.error('Validation errors:', err.errors);
      const validationErrors = Object.keys(err.errors).map(key => ({
        field: key,
        message: err.errors[key].message
      }));
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: validationErrors 
      });
    }
    
    res.status(400).json({ error: err.message });
  }
});

// Update leave request (Admin only)
router.put('/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const { id } = req.params;
    const updates = req.body;

    // If approving/rejecting, add approval info
    if (updates.status === 'APPROVED' || updates.status === 'REJECTED') {
      updates.approvedBy = req.user.id;
      updates.approvedAt = new Date();
    }

    const leave = await Leave.findByIdAndUpdate(id, updates, { new: true })
      .populate('staffId', 'name email specialization department')
      .populate('createdBy', 'name')
      .populate('approvedBy', 'name');

    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    res.json(leave);
  } catch (err) {
    console.error('Error updating leave request:', err);
    res.status(400).json({ error: err.message });
  }
});

// Delete leave request
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({ error: 'Leave request not found' });
    }

    // Check permissions
    if (req.user.role !== 'ADMIN' && req.user.id !== leave.createdBy.toString()) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Don't allow deletion of approved active leave
    if (leave.status === 'APPROVED' && leave.isActive) {
      return res.status(400).json({ 
        error: 'Cannot delete active approved leave' 
      });
    }

    await Leave.findByIdAndDelete(id);
    res.json({ message: 'Leave request deleted successfully' });
  } catch (err) {
    console.error('Error deleting leave request:', err);
    res.status(500).json({ error: err.message });
  }
});

// Check if staff is on leave for a specific date
router.get('/check/:staffId', auth, async (req, res) => {
  try {
    const { staffId } = req.params;
    const { date } = req.query;
    
    const checkDate = date ? new Date(date) : new Date();
    const leave = await Leave.isStaffOnLeave(staffId, checkDate);
    
    res.json({
      isOnLeave: !!leave,
      leave: leave || null
    });
  } catch (err) {
    console.error('Error checking staff leave status:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get available staff for a specific date (excluding those on leave)
router.get('/available-staff', auth, async (req, res) => {
  try {
    const { date, staffType, specialization } = req.query;
    const checkDate = date ? new Date(date) : new Date();

    // Get all staff on leave for the date
    const staffOnLeave = await Leave.getStaffOnLeave(checkDate, checkDate);
    const staffOnLeaveIds = staffOnLeave.map(leave => leave.staffId._id.toString());

    // Build filter for available staff
    let staffFilter = {
      role: staffType || { $in: ['DOCTOR', 'NURSE'] },
      _id: { $nin: staffOnLeaveIds }
    };

    if (specialization) {
      staffFilter.specialization = new RegExp(specialization, 'i');
    }

    const availableStaff = await User.find(staffFilter)
      .select('name email specialization department experience')
      .sort({ name: 1 });

    res.json({
      availableStaff,
      staffOnLeave: staffOnLeave.length,
      date: checkDate
    });
  } catch (err) {
    console.error('Error fetching available staff:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get leave calendar data
router.get('/calendar', auth, async (req, res) => {
  try {
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Access denied. Admin only.' });
    }

    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate) : new Date();
    const end = endDate ? new Date(endDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days from now

    const leaves = await Leave.find({
      status: 'APPROVED',
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    }).populate('staffId', 'name specialization department');

    // Format for calendar display
    const calendarEvents = leaves.map(leave => ({
      id: leave._id,
      title: `${leave.staffId.name} - ${leave.leaveType}`,
      start: leave.startDate,
      end: leave.endDate,
      staff: leave.staffId,
      leaveType: leave.leaveType,
      reason: leave.reason
    }));

    res.json(calendarEvents);
  } catch (err) {
    console.error('Error fetching leave calendar:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
