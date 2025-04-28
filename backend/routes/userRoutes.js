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
    
    if (role === 'staff') {
      console.log('Fetching staff users (DOCTOR, NURSE)');
      users = await User.find({ role: { $in: ['DOCTOR', 'NURSE'] } });
    } else {
      console.log('Fetching all users');
      users = await User.find();
    }
    
    console.log(`Found ${users.length} users`);
    return res.json(users);
  } catch (err) {
    console.error('Get Users Error:', err);
    return res.status(500).json({ error: err.message || 'Unknown error in users route' });
  }
});

// Get user by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
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

    const { name, email, password, role, department, specialization, licenseNumber } = req.body;
    if (!['DOCTOR', 'NURSE'].includes(role)) {
      return res.status(400).json({ error: 'Role must be DOCTOR or NURSE' });
    }

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      department,
      specialization,
      licenseNumber,
      isVerified: true // Admin-created staff are auto-verified
    });
    await user.save();

    // Optionally: send welcome email here

    res.status(201).json({ message: `${role} added successfully.` });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
