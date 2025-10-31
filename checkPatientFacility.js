// Check if patient has facilityIds set
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function checkPatient() {
  try {
    console.log('🔍 Checking patient facility assignment...\n');
    
    // Try to login as the patient
    console.log('Attempting to login as patient...');
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'john.doe@example.com',
      password: 'patient123'
    });
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    
    console.log('✅ Patient logged in successfully!');
    console.log(`   Name: ${user.name}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   User ID: ${user.userId}`);
    console.log(`   Facility IDs: ${user.facilityIds ? JSON.stringify(user.facilityIds) : 'NOT SET ❌'}`);
    
    if (!user.facilityIds || user.facilityIds.length === 0) {
      console.log('\n❌ PROBLEM FOUND: Patient has no facilityIds!');
      console.log('This is why you can\'t see doctors.\n');
      console.log('Let me fix this by assigning Rob Ferreira Hospital...');
      
      // Get Rob Ferreira facility
      const facilitiesResponse = await axios.get(`${API_URL}/facilities`);
      const facilities = facilitiesResponse.data;
      const robFerreira = facilities.find(f => f.name.toLowerCase().includes('rob') && f.name.toLowerCase().includes('ferreira'));
      
      if (robFerreira) {
        console.log(`Found: ${robFerreira.name} (${robFerreira._id})`);
        
        // Update patient with facility
        try {
          await axios.put(
            `${API_URL}/users/${user.id || user._id}`,
            { facilityIds: [robFerreira._id] },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log('✅ Patient updated with Rob Ferreira facility!');
          console.log('\n🎉 Try booking an appointment now - you should see the doctors!');
        } catch (error) {
          console.log('❌ Could not update patient:', error.response?.data?.error || error.message);
          console.log('\nManual fix needed - see instructions below.');
        }
      }
    } else {
      console.log('\n✅ Patient has facility assignment!');
      console.log('Checking if doctors are available...\n');
      
      // Try to fetch doctors for this patient's facilities
      const facilityIdsParam = user.facilityIds.map(id => `facilityIds=${id}`).join('&');
      const doctorsResponse = await axios.get(
        `${API_URL}/users?role=staff&${facilityIdsParam}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const doctors = doctorsResponse.data.filter(u => u.role === 'DOCTOR');
      console.log(`Found ${doctors.length} doctors for this patient's facilities:`);
      doctors.forEach(doc => {
        console.log(`   - ${doc.name} (${doc.specialization})`);
      });
      
      if (doctors.length === 0) {
        console.log('\n❌ No doctors found! The facility IDs might not match.');
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

checkPatient();
