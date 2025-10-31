const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function (req, res, next) {
  // Allow OPTIONS requests to pass through (for CORS preflight)
  if (req.method === 'OPTIONS') {
    console.log('Auth Middleware: OPTIONS request, passing through');
    return next();
  }

  const token = req.header('Authorization')?.replace('Bearer ', '');
  console.log('Auth Middleware: Token received:', token);
  
  if (!token) {
    console.log('Auth Middleware: No token provided');
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkey123');
    
    // Fetch fresh user data from database to get latest facilityId
    const user = await User.findById(decoded._id);
    
    if (!user) {
      console.log('Auth Middleware: User not found in database');
      return res.status(401).json({ error: 'User not found.' });
    }
    
    console.log('🔍 User from DB:', {
      _id: user._id,
      facilityId: user.facilityId,
      facilityIdType: typeof user.facilityId
    });
    
    // Merge token data with fresh database data
    req.user = {
      _id: user._id,
      role: user.role,
      email: user.email,
      userId: user.userId,
      facilityId: user.facilityId, // Fresh from database
      name: user.name,
      iat: decoded.iat,
      exp: decoded.exp
    };
    
    console.log('Auth Middleware: Token valid, user with fresh data:', req.user);
    next();
  } catch (err) {
    console.log('Auth Middleware: Invalid token', err);
    res.status(400).json({ error: 'Invalid token.' });
  }
};
