// Script to reset admin password
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

async function resetAdminPassword() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_management';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Find admin user
    const admin = await User.findOne({ email: 'admin@hospital.com' });
    
    if (!admin) {
      console.log('❌ Admin user not found!');
      console.log('Creating new admin user...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      const newAdmin = new User({
        name: 'Admin User',
        email: 'admin@hospital.com',
        password: hashedPassword,
        role: 'ADMIN',
        phone: '+27456789012',
        isVerified: true
      });
      
      await newAdmin.save();
      console.log('✅ Admin user created successfully!');
      console.log(`   Email: admin@hospital.com`);
      console.log(`   Password: admin123`);
      console.log(`   User ID: ${newAdmin.userId}`);
    } else {
      console.log('✅ Admin user found!');
      console.log(`   Name: ${admin.name}`);
      console.log(`   Email: ${admin.email}`);
      console.log(`   User ID: ${admin.userId}`);
      console.log(`   Current password hash: ${admin.password ? 'EXISTS' : 'MISSING'}`);
      
      // Reset password
      console.log('\n🔄 Resetting password to: admin123');
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin.password = hashedPassword;
      await admin.save();
      
      console.log('✅ Password reset successfully!');
      console.log('\n📋 Admin Credentials:');
      console.log('   Email: admin@hospital.com');
      console.log('   Password: admin123');
    }
    
    console.log('\n🎉 You can now login with these credentials!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run it
resetAdminPassword();
