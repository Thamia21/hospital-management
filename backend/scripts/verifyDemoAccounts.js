const mongoose = require('mongoose');
require('dotenv').config();

// Import User model
const User = require('../models/User');

async function verifyDemoAccounts() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_management';
    await mongoose.connect(mongoURI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('✅ Connected to MongoDB');

    // Find demo accounts
    const demoAccounts = await User.find({ 
      userId: { $in: ['PAT001', 'NUR001', 'DOC001', 'ADM001'] } 
    }).select('userId name email role isVerified createdAt');

    console.log('\n📋 Demo Accounts in Database:');
    console.log('┌─────────┬──────────────────┬─────────────────────────┬──────────┬──────────┐');
    console.log('│ User ID │ Name             │ Email                   │ Role     │ Verified │');
    console.log('├─────────┼──────────────────┼─────────────────────────┼──────────┼──────────┤');
    
    if (demoAccounts.length === 0) {
      console.log('│         │                  │ No demo accounts found  │          │          │');
    } else {
      demoAccounts.forEach(account => {
        const name = account.name.padEnd(16);
        const email = account.email.padEnd(23);
        const role = account.role.padEnd(8);
        const verified = (account.isVerified ? '✅' : '❌').padEnd(8);
        console.log(`│ ${account.userId} │ ${name} │ ${email} │ ${role} │ ${verified} │`);
      });
    }
    
    console.log('└─────────┴──────────────────┴─────────────────────────┴──────────┴──────────┘');
    console.log(`\n📊 Total demo accounts found: ${demoAccounts.length}/4`);
    
    if (demoAccounts.length === 4) {
      console.log('🎉 All demo accounts are ready for use!');
      console.log('\n🔑 Login Credentials:');
      console.log('• Patient: PAT001 / patient123');
      console.log('• Nurse: NUR001 / nurse123');
      console.log('• Doctor: DOC001 / doctor123');
      console.log('• Admin: ADM001 / admin123');
    } else {
      console.log('⚠️  Some demo accounts are missing. Run the seed script again.');
    }

  } catch (error) {
    console.error('❌ Error verifying demo accounts:', error);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the verification function
if (require.main === module) {
  verifyDemoAccounts();
}

module.exports = verifyDemoAccounts;
