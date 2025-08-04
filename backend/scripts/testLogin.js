const axios = require('axios');

async function testDemoLogin() {
  const baseURL = 'http://localhost:5000';
  
  // Test accounts to try
  const testAccounts = [
    { email: 'john.doe@example.com', password: 'patient123', role: 'PATIENT' },
    { email: 'mary.johnson@hospital.com', password: 'nurse123', role: 'NURSE' },
    { email: 'michael.smith@hospital.com', password: 'doctor123', role: 'DOCTOR' },
    { email: 'admin@hospital.com', password: 'admin123', role: 'ADMIN' }
  ];
  
  console.log('🧪 Testing demo account logins...');
  console.log('📡 Using backend server at:', baseURL);
  
  for (const account of testAccounts) {
    try {
      console.log(`\n🔐 Testing login for ${account.role}: ${account.email}`);
      
      const response = await axios.post(`${baseURL}/api/auth/login`, {
        email: account.email,
        password: account.password
      }, {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 5000
      });
      
      if (response.status === 200) {
        console.log(`✅ Login successful!`);
        console.log(`   User ID: ${response.data.user?.userId || 'N/A'}`);
        console.log(`   Name: ${response.data.user?.name || 'N/A'}`);
        console.log(`   Role: ${response.data.user?.role || 'N/A'}`);
        console.log(`   Token: ${response.data.token ? 'Generated' : 'Missing'}`);
      }
      
    } catch (error) {
      if (error.response) {
        console.log(`❌ Login failed for ${account.email}:`);
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Error: ${error.response.data.message || error.response.data.error || 'Unknown error'}`);
      } else if (error.request) {
        console.log(`❌ No response from server for ${account.email}`);
        console.log('   Make sure the backend server is running on port 5000');
      } else {
        console.log(`❌ Error testing ${account.email}:`, error.message);
      }
    }
  }
  
  console.log('\n📊 Login test completed!');
  console.log('\n💡 If any logins failed, the accounts may not have been created properly.');
  console.log('   Try running: npm run seed-demo-api');
}

// Run the test function
if (require.main === module) {
  testDemoLogin()
    .then(() => {
      console.log('\n✨ Test completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Test failed:', error.message);
      process.exit(1);
    });
}

module.exports = testDemoLogin;
