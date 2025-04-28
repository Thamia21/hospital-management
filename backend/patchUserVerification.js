const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function patchVerification() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_management');

  const result = await User.updateMany(
    { role: { $in: ['ADMIN', 'DOCTOR', 'NURSE', 'PATIENT'] }, isVerified: { $ne: true } },
    { $set: { isVerified: true } }
  );

  console.log(`Patched ${result.modifiedCount} users to isVerified: true.`);
  await mongoose.disconnect();
}

patchVerification().catch(console.error);
