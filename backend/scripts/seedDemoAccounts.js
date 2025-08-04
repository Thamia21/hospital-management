const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import User model
const User = require('../models/User');

// Demo accounts data matching the frontend
const demoAccounts = [
  {
    userId: 'PAT001',
    name: 'John Doe',
    email: 'john.doe@example.com',
    password: 'patient123',
    role: 'PATIENT',
    phone: '+27123456789',
    idNumber: '9001011234567',
    dateOfBirth: new Date('1990-01-01'),
    gender: 'male',
    address: '123 Main Street, Cape Town, 8001',
    emergencyContact: 'Jane Doe',
    emergencyPhone: '+27987654321',
    isVerified: true
  },
  {
    userId: 'NUR001',
    name: 'Sister Mary Johnson',
    email: 'mary.johnson@hospital.com',
    password: 'nurse123',
    role: 'NURSE',
    phone: '+27234567890',
    licenseNumber: 'NUR2023001',
    specialization: 'General Nursing',
    department: 'General Ward',
    qualifications: 'BSc Nursing, University of Cape Town',
    experience: '8 years',
    isVerified: true
  },
  {
    userId: 'DOC001',
    name: 'Dr. Michael Smith',
    email: 'michael.smith@hospital.com',
    password: 'doctor123',
    role: 'DOCTOR',
    phone: '+27345678901',
    licenseNumber: 'DOC2023001',
    specialization: 'General Practice',
    department: 'General Medicine',
    qualifications: 'MBChB, University of the Witwatersrand',
    experience: '12 years',
    isVerified: true
  },
  {
    userId: 'ADM001',
    name: 'Admin User',
    email: 'admin@hospital.com',
    password: 'admin123',
    role: 'ADMIN',
    phone: '+27456789012',
    department: 'Administration',
    qualifications: 'MBA Healthcare Management',
    experience: '15 years',
    isVerified: true
  }
];

async function seedDemoAccounts() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_management';
    await mongoose.connect(mongoURI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('✅ Connected to MongoDB');

    // Check if demo accounts already exist
    const existingAccounts = await User.find({ 
      userId: { $in: ['PAT001', 'NUR001', 'DOC001', 'ADM001'] } 
    });

    if (existingAccounts.length > 0) {
      console.log('⚠️  Demo accounts already exist. Removing existing accounts first...');
      await User.deleteMany({ 
        userId: { $in: ['PAT001', 'NUR001', 'DOC001', 'ADM001'] } 
      });
      console.log('🗑️  Existing demo accounts removed');
    }

    // Hash passwords and create accounts
    console.log('🔐 Creating demo accounts...');
    
    for (const account of demoAccounts) {
      try {
        // Hash the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(account.password, saltRounds);
        
        // Create user with hashed password
        const userData = {
          ...account,
          password: hashedPassword
        };
        
        const user = new User(userData);
        await user.save();
        
        console.log(`✅ Created ${account.role}: ${account.userId} (${account.name})`);
      } catch (error) {
        console.error(`❌ Error creating ${account.userId}:`, error.message);
      }
    }

    console.log('\n🎉 Demo accounts seeding completed!');
    console.log('\n📋 Available Demo Accounts:');
    console.log('┌─────────┬──────────────────┬─────────────┬──────────┐');
    console.log('│ User ID │ Name             │ Password    │ Role     │');
    console.log('├─────────┼──────────────────┼─────────────┼──────────┤');
    console.log('│ PAT001  │ John Doe         │ patient123  │ PATIENT  │');
    console.log('│ NUR001  │ Sister Mary      │ nurse123    │ NURSE    │');
    console.log('│ DOC001  │ Dr. Michael Smith│ doctor123   │ DOCTOR   │');
    console.log('│ ADM001  │ Admin User       │ admin123    │ ADMIN    │');
    console.log('└─────────┴──────────────────┴─────────────┴──────────┘');
    console.log('\n🚀 You can now use these accounts to login to the system!');

  } catch (error) {
    console.error('❌ Error seeding demo accounts:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the seeding function
if (require.main === module) {
  seedDemoAccounts();
}

module.exports = seedDemoAccounts;
