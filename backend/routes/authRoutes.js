const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Debug: Print email credentials to verify env loading
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS);
// Configure nodemailer transporter (update with your SMTP credentials)
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email provider
  auth: {
    user: process.env.EMAIL_USER, // set in your .env
    pass: process.env.EMAIL_PASS, // set in your .env
  },
  tls: {
    rejectUnauthorized: false, // allow self-signed certificates in development
  },
});

// Register
router.post('/register', async (req, res) => {
  try {
    const { 
      name, email, password, role, phone,
      // Patient-specific fields
      idNumber, dateOfBirth, gender, address, emergencyContact, emergencyPhone, facilityId,
      // Professional fields
      licenseNumber, specialization, department, qualifications, experience
    } = req.body;
    
    console.log('Registration request body:', req.body);
    
    let user = await User.findOne({ email });
    console.log('User found for email:', email, user);
    if (user) return res.status(400).json({ error: 'User already exists' });
    
    // Generate a userId based on role
    const rolePrefix = role.substring(0, 2).toUpperCase();
    const randomDigits = Math.floor(10000 + Math.random() * 90000); // 5-digit number
    const userId = `${rolePrefix}${randomDigits}`;
    
    // Check if userId already exists
    const existingUserWithId = await User.findOne({ userId });
    const finalUserId = existingUserWithId ? `${rolePrefix}${Math.floor(10000 + Math.random() * 90000)}` : userId;
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    // Create user object with all fields
    const userData = { 
      userId: finalUserId,
      name, 
      email, 
      password: hashedPassword, 
      role: role.toUpperCase(), // Ensure role is uppercase
      phone,
      isVerified: false, 
      verificationToken
    };
    
    // Add patient-specific fields if role is patient
    if (role.toLowerCase() === 'patient') {
      if (idNumber) userData.idNumber = idNumber;
      if (dateOfBirth) userData.dateOfBirth = new Date(dateOfBirth);
      if (gender) userData.gender = gender;
      if (address) userData.address = address;
      if (emergencyContact) userData.emergencyContact = emergencyContact;
      if (emergencyPhone) userData.emergencyPhone = emergencyPhone;
      if (facilityId) {
        userData.facilityId = facilityId; // Single facility assignment for patients
        userData.facilityIds = [facilityId]; // Also add to array for compatibility
      }
    }
    
    // Add professional fields if role is doctor or nurse
    if (['doctor', 'nurse'].includes(role.toLowerCase())) {
      if (licenseNumber) userData.licenseNumber = licenseNumber;
      if (specialization) userData.specialization = specialization;
      if (department) userData.department = department;
      if (qualifications) userData.qualifications = qualifications;
      if (experience) userData.experience = experience;
    }
    
    user = new User(userData);
    await user.save();
    
    console.log('User created successfully:', user.userId);

    // Send verification email with userId - using frontend verification page
    const verificationUrl = `http://localhost:5173/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      to: user.email,
      subject: 'Verify your email - Hospital Management System',
      html: `
        <h2>Welcome to Hospital Management System!</h2>
        <p>Thank you for registering. Please click <a href="${verificationUrl}">here</a> to verify your email address.</p>
        <p><strong>Your User ID:</strong> ${user.userId}</p>
        <p>You can use this ID or your email address to log in to your account after verification.</p>
        <p>Please keep this information secure.</p>
        <p>If the link above doesn't work, copy and paste this URL into your browser:</p>
        <p>${verificationUrl}</p>
      `
    });

    res.status(201).json({ 
      message: 'User registered successfully. Please check your email to verify your account.', 
      userId: user.userId 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Email verification route
router.get('/verify-email', async (req, res) => {
  // Add CORS headers for direct access
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  try {
    const { token } = req.query;
    
    // Log the token to help with debugging
    console.log('Verifying email with token:', token);
    
    if (!token) {
      console.log('No token provided in request');
      return res.status(400).json({ error: 'No verification token provided' });
    }
    
    const user = await User.findOne({ verificationToken: token });
    console.log('User lookup result:', user ? `Found user: ${user.email}` : 'No user found');
    
    // If no user is found with this token
    if (!user) {
      console.log('No user found with token:', token);
      return res.status(400).json({ error: 'Invalid or expired token' });
    }
    
    // If user is already verified
    if (user.isVerified && !user.verificationToken) {
      console.log('User already verified:', user.email);
      return res.status(200).json({ message: 'Email already verified. You can now log in.' });
    }
    
    // Mark user as verified and remove the token
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    
    console.log('User verified successfully:', user.email);
    return res.status(200).json({ message: 'Email verified! You can now log in.' });
  } catch (err) {
    console.error('Verification error:', err);
    return res.status(400).json({ error: 'Verification failed: ' + err.message });
  }
});

// Login (supports both userId and email)
router.post('/login', async (req, res) => {
  try {
    const { userId, email, password } = req.body;
    
    // Find user by userId or email
    let user;
    if (userId) {
      user = await User.findOne({ userId });
    } else if (email) {
      user = await User.findOne({ email });
    } else {
      return res.status(400).json({ error: 'User ID or email is required' });
    }
    
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });
    
    if (!user.isVerified) return res.status(401).json({ error: 'Please verify your email before logging in.' });
    
    const token = jwt.sign(
      { _id: user._id, role: user.role, email: user.email, userId: user.userId },
      process.env.JWT_SECRET || 'secretkey',
      { expiresIn: '12h' }
    );
    
    res.json({ 
      token, 
      user: { 
        _id: user._id, 
        userId: user.userId,
        name: user.name, 
        email: user.email, 
        role: user.role 
      } 
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: 'User not found' });
    if (user.isVerified) return res.status(400).json({ error: 'Email is already verified.' });
    // Generate a new token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();
    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${verificationToken}`;
    await transporter.sendMail({
      to: user.email,
      subject: 'Verify your email',
      html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email address.</p>`
    });
    res.json({ message: 'Verification email resent. Please check your inbox.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Forgot Password
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      // Always respond with 200 for security
      return res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    await transporter.sendMail({
      to: user.email,
      subject: 'Password Reset',
      html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password. If you did not request this, please ignore this email.</p>`
    });
    res.status(200).json({ message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Reset Password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token.' });
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    res.status(200).json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
