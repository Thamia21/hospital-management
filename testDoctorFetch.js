// Test if doctors can be fetched for Rob Ferreira
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function testDoctorFetch() {
  try {
    console.log('🧪 Testing doctor fetch for Rob Ferreira...\n');
    
    // Login as patient
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'mashigobohlale30@gmail.com',
      password: 'Bohlale@2006'
    });
    
    const token = loginResponse.data.token;
    const user = loginResponse.data.user;
    
    console.log('✅ Patient logged in:');
    console.log(`   Name: ${user.name}`);
    console.log(`   Facility IDs: ${JSON.stringify(user.facilityIds)}`);
    console.log(`   Facility count: ${user.facilityIds?.length || 0}\n`);
    
    if (!user.facilityIds || user.facilityIds.length === 0) {
      console.log('❌ PROBLEM: User object still has no facilityIds!');
      console.log('This means the token was generated BEFORE we updated the facility.');
      console.log('\n🔧 SOLUTION: Logout and login again in the browser!\n');
      return;
    }
    
    // Try to fetch doctors
    console.log('📡 Fetching doctors for these facilities...');
    const facilityIdsParam = user.facilityIds.map(id => `facilityIds=${id}`).join('&');
    const url = `${API_URL}/users?role=staff&${facilityIdsParam}`;
    console.log(`   URL: ${url}\n`);
    
    const doctorsResponse = await axios.get(url, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const allStaff = doctorsResponse.data;
    const doctors = allStaff.filter(u => u.role === 'DOCTOR');
    
    console.log(`✅ Found ${doctors.length} doctors:\n`);
    doctors.forEach((doc, index) => {
      console.log(`${index + 1}. ${doc.name}`);
      console.log(`   Specialization: ${doc.specialization}`);
      console.log(`   Facilities: ${doc.facilityIds?.length || 0}`);
      console.log('');
    });
    
    if (doctors.length === 0) {
      console.log('❌ No doctors found!');
      console.log('Checking if doctors exist at all...\n');
      
      const allDoctorsResponse = await axios.get(`${API_URL}/users?role=staff`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const allDoctors = allDoctorsResponse.data.filter(u => u.role === 'DOCTOR');
      console.log(`Total doctors in database: ${allDoctors.length}`);
      
      if (allDoctors.length > 0) {
        console.log('\nDoctors exist but facility IDs don\'t match!');
        console.log('First doctor facility IDs:', allDoctors[0].facilityIds);
        console.log('Patient facility IDs:', user.facilityIds);
      }
    } else {
      console.log('🎉 SUCCESS! Doctors are available!');
      console.log('\n💡 If you still don\'t see them in the browser:');
      console.log('   1. LOGOUT from the patient portal');
      console.log('   2. LOGIN again');
      console.log('   3. Try booking an appointment');
      console.log('\nThis will refresh the user object with the new facilityIds!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testDoctorFetch();
