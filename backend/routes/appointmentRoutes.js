const express = require('express');
const router = express.Router();
const Appointment = require('../models/Appointment');
const auth = require('../middleware/auth');

// Create a new appointment
router.post('/', auth, async (req, res) => {
  try {
    const appointment = new Appointment(req.body);
    await appointment.save();
    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get all appointments
router.get('/', auth, async (req, res) => {
  try {
    const appointments = await Appointment.find().populate('patientId doctorId');
    res.json(appointments);
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
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
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
