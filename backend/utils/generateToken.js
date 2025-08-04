const jwt = require('jsonwebtoken');

function generateResetToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
}

module.exports = generateResetToken;
