// Basic Express server setup for MongoDB integration
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Auth routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/auth/set-password', require('./routes/setPasswordRoutes'));

// Facility routes
app.use('/api/facilities', require('./routes/facilityRoutes'));

// Chat and message routes
app.use('/api/chats', require('./routes/chatRoutes'));

// Patient routes
app.use('/api/patients', require('./routes/patientRoutes'));

// MongoDB connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_management';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Basic route
db = mongoose.connection;
app.get('/', (req, res) => {
  res.send('Hospital Management System API running');
});

// Direct email verification route
app.get('/verify-email', async (req, res) => {
  // Enable CORS for this route
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  
  try {
    const { token } = req.query;
    console.log('Direct verification route called with token:', token);
    
    if (!token) {
      return res.status(400).send('<h1>Verification Failed</h1><p>No verification token provided.</p><a href="http://localhost:5173/login">Go to Login</a>');
    }
    
    const User = require('./models/User');
    const user = await User.findOne({ verificationToken: token });
    
    if (!user) {
      return res.status(400).send('<h1>Verification Failed</h1><p>Invalid or expired token.</p><a href="http://localhost:5173/login">Go to Login</a>');
    }
    
    if (user.isVerified) {
      return res.send('<h1>Already Verified</h1><p>Your email has already been verified.</p><a href="http://localhost:5173/login">Go to Login</a>');
    }
    
    // Mark as verified
    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();
    
    console.log('User verified successfully:', user.email);
    // Redirect to frontend with success message
    return res.redirect(`http://localhost:5173/verify-email?token=${token}&verified=true`);
  } catch (err) {
    console.error('Verification error:', err);
    return res.status(500).send('<h1>Verification Error</h1><p>An error occurred during verification.</p><a href="http://localhost:5173/login">Go to Login</a>');
  }
});

// API routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/patients', require('./routes/patientRoutes'));
app.use('/api/leave', require('./routes/leaveRoutes'));

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
