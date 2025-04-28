const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
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
    req.user = decoded;
    console.log('Auth Middleware: Token valid, user:', decoded);
    next();
  } catch (err) {
    console.log('Auth Middleware: Invalid token', err);
    res.status(400).json({ error: 'Invalid token.' });
  }
};
