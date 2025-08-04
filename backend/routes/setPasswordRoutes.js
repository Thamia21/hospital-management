const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// POST /api/auth/set-password
router.post('/', async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) {
      return res.status(400).json({ error: 'Token and password are required.' });
    }
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ error: 'Invalid or expired token.' });
    }
    const user = await User.findById(payload.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.json({ message: 'Password set successfully. You can now log in.', userId: user.userId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
