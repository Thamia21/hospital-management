const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const defaultUsers = [
  {
    name: 'Admin',
    email: 'admin@hospital.com',
    password: 'Admin@123',
    role: 'ADMIN',
    isVerified: true,
  },
  {
    name: 'Doctor',
    email: 'doctor@hospital.com',
    password: 'Doctor@123',
    role: 'DOCTOR',
    isVerified: true,
  },
  {
    name: 'Nurse',
    email: 'nurse@hospital.com',
    password: 'Nurse@123',
    role: 'NURSE',
    isVerified: true,
  },
  {
    name: 'Patient',
    email: 'patient@hospital.com',
    password: 'Patient@123',
    role: 'PATIENT',
    isVerified: true,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_management');
  for (const userData of defaultUsers) {
    const existing = await User.findOne({ email: userData.email });
    if (!existing) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = new User({ ...userData, password: hashedPassword });
      await user.save();
      console.log(`Created user: ${user.email}`);
    } else {
      console.log(`User already exists: ${userData.email}`);
    }
  }
  await mongoose.disconnect();
  console.log('Default users seeded.');
}

seed().catch(console.error);
