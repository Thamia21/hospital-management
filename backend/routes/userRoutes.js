const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Create a new user
router.post('/', async (req, res) => {
  try {
    const user = new User(req.body);
    await user.save();
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all users or staff for dashboard
router.get('/', auth, async (req, res) => {
  try {
    console.log('GET /api/users called with query:', req.query);
    console.log('Request headers:', req.headers);
    console.log('User from token:', req.user);
    
    const { role } = req.query;
    let users;
    
    const facilityId = req.user.role === 'ADMIN' && req.query.facilityId
      ? req.query.facilityId
      : req.user.facilityId;
    
    let filter = {};
    
    // Only apply facility filtering if we have a valid facilityId
    if (facilityId) {
      // For patients, filter by facilityIds (array contains facilityId)
      if (role === 'PATIENT') {
        filter.facilityIds = facilityId;
      } else {
        filter.facilityId = facilityId;
      }
    } else if (role === 'PATIENT') {
      // If no facilityId is available for patients, return empty array
      // This prevents doctors from seeing all patients across all facilities
      console.log('No facilityId available for patient filtering, returning empty array');
      return res.json([]);
    }

    if (role === 'staff') {
      console.log('Fetching staff users (DOCTOR, NURSE)');
      users = await User.find({ ...filter, role: { $in: ['DOCTOR', 'NURSE'] } });
    } else {
      console.log('Fetching all users');
      users = await User.find(filter);
    }
    
    console.log(`Found ${users.length} users`);
    return res.json(users);
  } catch (err) {
    console.error('Get Users Error:', err);
    return res.status(500).json({ error: err.message || 'Unknown error in users route' });
  }
});

// Get user by ID (supports both _id and uid)
router.get('/:id', auth, async (req, res) => {
  try {
    console.log('GET /api/users/:id called with ID:', req.params.id);
    console.log('Request headers:', req.headers);

    let user;

    // Try to find by _id first (MongoDB ObjectId)
    try {
      user = await User.findById(req.params.id)
        .populate('facilityId', 'name')
        .populate('facilityIds', 'name');
    } catch (error) {
      // If _id lookup fails, try uid lookup
      console.log('MongoDB _id lookup failed, trying uid lookup');
    }

    // If _id lookup failed, try uid lookup
    if (!user) {
      user = await User.findOne({ uid: req.params.id })
        .populate('facilityId', 'name')
        .populate('facilityIds', 'name');
    }

    console.log('User found:', user ? 'Yes' : 'No');

    if (!user) {
      console.log('User not found with ID or UID:', req.params.id);
      return res.status(404).json({ error: 'User not found' });
    }

    // Transform the user object to include facility names
    const userObj = user.toObject();

    // If facilityIds is populated, extract facility names
    if (user.facilityIds && user.facilityIds.length > 0) {
      userObj.facilityNames = user.facilityIds.map(f => f.name);
    } else if (user.facilityId) {
      // For backward compatibility with single facility
      userObj.facilityNames = [user.facilityId.name];
    } else {
      userObj.facilityNames = [];
    }

    console.log('Returning user data for ID/UID:', req.params.id);
    res.json(userObj);
  } catch (err) {
    console.error('Error in GET /api/users/:id:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update user
router.put('/:id', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete user
router.delete('/:id', auth, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add staff (doctor/nurse) - only for admin
const bcrypt = require('bcryptjs');

router.post('/add-staff', auth, async (req, res) => {
  try {
    // Only admins can add staff
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const { name, email, role, department, specialization, licenseNumber } = req.body;
    if (!['DOCTOR', 'NURSE'].includes(role)) {
      return res.status(400).json({ error: 'Role must be DOCTOR or NURSE' });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });

    // Create user with no password (will be set by staff via email link)
    user = new User({
      name,
      email,
      role,
      department,
      specialization,
      licenseNumber,
      isVerified: true // Admin-created staff are auto-verified
    });
    await user.save();

    // Generate password reset token and send set-password email
    const generateResetToken = require('../utils/generateToken');
    const sendEmail = require('../utils/sendEmail');
    const token = generateResetToken(user._id);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/set-password?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: 'Set up your password',
      html: `
        <h2>Welcome to Hospital Management System!</h2>
        <p>Hello ${user.name},</p>
        <p>Your staff account has been created. Please <a href="${resetLink}">click here</a> to set your password. This link is valid for 1 hour.</p>
        <p><strong>Your User ID:</strong> ${user.userId}</p>
        <p>You can use this User ID <strong>or</strong> your email address to log in after setting your password.</p>
        <p>If you have any issues, contact the IT department.</p>
      `
    });

    res.status(201).json({ message: `${role} added successfully. An email has been sent for them to set their password.` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
// Add patient - only for admin
router.post('/add-patient', auth, async (req, res) => {
  try {
    // Only admins can add patients
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const {
      name, email, phone, idNumber, dateOfBirth, gender, address, emergencyContact, emergencyPhone, facilityId
    } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'Patient already exists' });

    // Create patient with no password (will be set by patient via email link)
    user = new User({
      name,
      email,
      phone,
      role: 'PATIENT',
      idNumber,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      gender,
      address,
      emergencyContact,
      emergencyPhone,
      facilityId, // Single facility assignment
      facilityIds: facilityId ? [facilityId] : [], // Also add to array for compatibility
      isVerified: true // Admin-created patients are auto-verified
    });
    await user.save();

    // Generate password reset token and send set-password email
    const generateResetToken = require('../utils/generateToken');
    const sendEmail = require('../utils/sendEmail');
    const token = generateResetToken(user._id);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const resetLink = `${frontendUrl}/set-password?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: 'Welcome to Hospital Management System - Set Your Password',
      html: `
        <h2>Welcome to Hospital Management System!</h2>
        <p>Hello ${user.name},</p>
        <p>Your patient account has been created by an administrator. Please <a href="${resetLink}">click here</a> to set your password and access your account. This link is valid for 1 hour.</p>
        <p><strong>Your Patient ID:</strong> ${user.userId}</p>
        <p>You can use this Patient ID <strong>or</strong> your email address to log in after setting your password.</p>
        <p>If you have any issues, please contact the hospital administration.</p>
      `
    });

    res.status(201).json({
      message: `Patient added successfully. An email has been sent for them to set their password.`,
      patientId: user.userId
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
