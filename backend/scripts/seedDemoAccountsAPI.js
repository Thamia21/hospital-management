const axios = require('axios');

// Demo accounts data
const demoAccounts = [
  {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    password: 'patient123',
    phone: '+27123456789',
    role: 'PATIENT',
    idNumber: '9001011234567',
    dateOfBirth: '1990-01-01',
    gender: 'male',
    address: '123 Main Street, Cape Town, 8001',
    emergencyContact: 'Jane Doe',
    emergencyPhone: '+27987654321'
  },
  {
    firstName: 'Sister Mary',
    lastName: 'Johnson',
    email: 'mary.johnson@hospital.com',
    password: 'nurse123',
    phone: '+27234567890',
    role: 'NURSE',
    licenseNumber: 'NUR2023001',
    specialization: 'General Nursing',
    department: 'General Ward',
    qualifications: 'BSc Nursing, University of Cape Town',
    experience: '8'
  },
  {
    firstName: 'Dr. Michael',
    lastName: 'Smith',
    email: 'michael.smith@hospital.com',
    password: 'doctor123',
    phone: '+27345678901',
    role: 'DOCTOR',
    licenseNumber: 'DOC2023001',
    specialization: 'General Practice',
    department: 'General Medicine',
    qualifications: 'MBChB, University of the Witwatersrand',
    experience: '12'
  },
  {
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@hospital.com',
    password: 'admin123',
    phone: '+27456789012',
    role: 'ADMIN',
    department: 'Administration',
    qualifications: 'MBA Healthcare Management',
    experience: '15'
  }
];

async function seedDemoAccountsViaAPI() {
  const baseURL = 'http://localhost:5000';
  
  console.log('🚀 Starting demo accounts creation via API...');
  console.log('📡 Using backend server at:', baseURL);
  
  for (const account of demoAccounts) {
    try {
      console.log(`\n🔄 Creating ${account.role}: ${account.firstName} ${account.lastName}`);
      
      const response = await axios.post(`${baseURL}/api/auth/register`, account, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 second timeout
      });
      
      if (response.status === 201 || response.status === 200) {
        console.log(`✅ Successfully created: ${account.firstName} ${account.lastName}`);
        console.log(`   User ID: ${response.data.user?.userId || 'Generated automatically'}`);
        console.log(`   Email: ${account.email}`);
      }
      
    } catch (error) {
      if (error.response) {
        // Server responded with error status
        console.log(`❌ Failed to create ${account.firstName} ${account.lastName}:`);
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${error.response.data.message || error.response.data.error || 'Unknown error'}`);
        
        // If user already exists, that's okay
        if (error.response.status === 400 && 
            (error.response.data.message?.includes('already exists') || 
             error.response.data.error?.includes('already exists'))) {
          console.log(`   ℹ️  Account already exists - this is okay for demo purposes`);
        }
      } else if (error.request) {
        // Request was made but no response received
        console.log(`❌ No response from server for ${account.firstName} ${account.lastName}`);
        console.log('   Make sure the backend server is running on port 5000');
      } else {
        // Something else happened
        console.log(`❌ Error creating ${account.firstName} ${account.lastName}:`, error.message);
      }
    }
    
    // Add a small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🎉 Demo accounts creation process completed!');
  console.log('\n📋 Demo Account Credentials:');
  console.log('┌─────────────────────┬─────────────┬──────────┐');
  console.log('│ Email               │ Password    │ Role     │');
  console.log('├─────────────────────┼─────────────┼──────────┤');
  console.log('│ john.doe@example.com│ patient123  │ PATIENT  │');
  console.log('│ mary.johnson@...    │ nurse123    │ NURSE    │');
  console.log('│ michael.smith@...   │ doctor123   │ DOCTOR   │');
  console.log('│ admin@hospital.com  │ admin123    │ ADMIN    │');
  console.log('└─────────────────────┴─────────────┴──────────┘');
  console.log('\n🔑 You can now login using either:');
  console.log('• Email address and password');
  console.log('• User ID (will be generated automatically) and password');
  console.log('\n💡 Tip: Check the backend server logs to see the generated User IDs');
}

// Run the seeding function
if (require.main === module) {
  seedDemoAccountsViaAPI()
    .then(() => {
      console.log('\n✨ Process completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Process failed:', error.message);
      process.exit(1);
    });
}

module.exports = seedDemoAccountsViaAPI;
