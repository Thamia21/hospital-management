require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');

async function fixDemoAccountEmails() {
  console.log('🔧 Fixing Demo Account Email Addresses...\n');

  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Define demo accounts with proper email addresses
    const demoAccountUpdates = [
      {
        userId: 'PAT001',
        email: 'john.doe@example.com',
        emailVerified: true
      },
      {
        userId: 'DOC001', 
        email: 'michael.smith@hospital.com',
        emailVerified: true
      },
      {
        userId: 'NUR001',
        email: 'mary.johnson@hospital.com', 
        emailVerified: true
      },
      {
        userId: 'ADM001',
        email: 'admin@hospital.com',
        emailVerified: true
      }
    ];

    console.log('📧 Updating Demo Account Emails:');

    for (const update of demoAccountUpdates) {
      const result = await User.findOneAndUpdate(
        { userId: update.userId },
        { 
          email: update.email,
          emailVerified: update.emailVerified 
        },
        { new: true }
      );

      if (result) {
        console.log(`✅ ${update.userId} (${result.role}): ${update.email}`);
      } else {
        console.log(`❌ ${update.userId}: Account not found`);
      }
    }

    // Verify the updates
    console.log('\n📋 Verifying Updated Accounts:');
    const updatedAccounts = await User.find({
      userId: { $in: ['PAT001', 'DOC001', 'NUR001', 'ADM001'] }
    });

    updatedAccounts.forEach(account => {
      console.log(`${account.userId} (${account.role}):`);
      console.log(`  Name: ${account.name}`);
      console.log(`  Email: ${account.email}`);
      console.log(`  Email Verified: ${account.emailVerified}`);
      console.log('');
    });

    console.log('🎉 Demo account emails have been updated!');
    console.log('📧 Patients should now receive appointment confirmation emails.');

  } catch (error) {
    console.error('❌ Error fixing demo account emails:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
}

fixDemoAccountEmails();
