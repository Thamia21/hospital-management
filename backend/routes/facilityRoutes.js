const express = require('express');
const router = express.Router();
const Facility = require('../models/Facility');
const auth = require('../middleware/auth');
const southAfricanFacilities = require('../data/southAfricanFacilities');

// Create a new facility (admin only)
router.post('/', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const facility = new Facility(req.body);
    await facility.save();
    res.status(201).json(facility);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Seed South African facilities (admin only)
router.post('/seed-sa', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    // Clear existing facilities first
    await Facility.deleteMany({});

    // Insert South African facilities
    const insertedFacilities = await Facility.insertMany(southAfricanFacilities);

    // Get stats
    const provinceStats = {};
    const typeStats = {};

    insertedFacilities.forEach(facility => {
      provinceStats[facility.province] = (provinceStats[facility.province] || 0) + 1;
      typeStats[facility.type] = (typeStats[facility.type] || 0) + 1;
    });

    res.json({
      message: 'South African facilities seeded successfully',
      totalFacilities: insertedFacilities.length,
      provinceBreakdown: provinceStats,
      typeBreakdown: typeStats
    });
  } catch (err) {
    console.error('Error seeding facilities:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all facilities (public access for registration)
router.get('/', async (req, res) => {
  try {
    const facilities = await Facility.find();
    res.json(facilities);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get a facility by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });
    res.json(facility);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update a facility
router.put('/:id', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const facility = await Facility.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!facility) return res.status(404).json({ error: 'Facility not found' });
    res.json(facility);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete a facility
router.delete('/:id', auth, async (req, res) => {
  try {
    if (!req.user || req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    const facility = await Facility.findByIdAndDelete(req.params.id);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });
    res.json({ message: 'Facility deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
