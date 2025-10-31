// Assign Rob Ferreira to any patient
import axios from 'axios';
import readline from 'readline';

const API_URL = 'http://localhost:5000/api';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function assignFacility() {
  try {
    console.log('🏥 Assign Rob Ferreira Hospital to a Patient\n');
    
    const email = await question('Enter patient email: ');
    const password = await question('Enter patient password: ');
    
    console.log('\n🔐 Logging in...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: email.trim(),
      password: password.trim()
    });
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    
    console.log('✅ Logged in successfully!');
    console.log(`   Name: ${user.name}`);
    console.log(`   Current facilities: ${user.facilityIds?.length || 0}`);
    
    // Get Rob Ferreira
    const facilitiesResponse = await axios.get(`${API_URL}/facilities`);
    const robFerreira = facilitiesResponse.data.find(f => 
      f.name.toLowerCase().includes('rob') && f.name.toLowerCase().includes('ferreira')
    );
    
    if (!robFerreira) {
      console.log('❌ Rob Ferreira Hospital not found!');
      rl.close();
      return;
    }
    
    console.log(`\n🏥 Assigning: ${robFerreira.name}`);
    
    // Update patient
    await axios.put(
      `${API_URL}/users/${user.id || user._id}`,
      { facilityIds: [robFerreira._id] },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('✅ Facility assigned successfully!');
    console.log('\n🎉 You can now see doctors when booking appointments!');
    
    rl.close();
  } catch (error) {
    console.error('❌ Error:', error.response?.data?.error || error.message);
    rl.close();
  }
}

assignFacility();
