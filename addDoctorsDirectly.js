// Simple script to add doctors directly using the API
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function addDoctors() {
  try {
    console.log('🔐 Logging in as admin...');
    
    // Try different admin credentials
    let token;
    const adminCredentials = [
      { email: 'admin@hospital.com', password: 'admin123' },
      { email: 'admin@example.com', password: 'admin123' },
      { email: 'admin@test.com', password: 'password' }
    ];
    
    for (const creds of adminCredentials) {
      try {
        const loginResponse = await axios.post(`${API_URL}/auth/login`, creds);
        token = loginResponse.data.token;
        console.log(`✅ Logged in with ${creds.email}`);
        break;
      } catch (err) {
        console.log(`❌ Failed with ${creds.email}`);
      }
    }
    
    if (!token) {
      console.log('\n❌ Could not login with any admin credentials.');
      console.log('Please create an admin account first or check credentials.');
      return;
    }
    
    // Get facilities
    console.log('\n📍 Fetching facilities...');
    const facilitiesResponse = await axios.get(`${API_URL}/facilities`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const facilities = facilitiesResponse.data;
    console.log(`✅ Found ${facilities.length} facilities`);
    
    if (facilities.length === 0) {
      console.log('❌ No facilities found. Please add facilities first.');
      return;
    }
    
    // Show first 5 facilities
    console.log('\nFirst 5 facilities:');
    facilities.slice(0, 5).forEach((f, i) => {
      console.log(`  ${i + 1}. ${f.name} (${f._id})`);
    });
    
    // Define doctors
    const doctors = [
      {
        name: "Dr. Sarah Johnson",
        email: "sarah.johnson@hospital.com",
        role: "DOCTOR",
        department: "Cardiology",
        specialization: "Cardiology",
        licenseNumber: "MP123456",
        facilityIds: [facilities[0]._id, facilities[1]._id]
      },
      {
        name: "Dr. Michael Chen",
        email: "michael.chen@hospital.com",
        role: "DOCTOR",
        department: "Pediatrics",
        specialization: "Pediatrics",
        licenseNumber: "MP234567",
        facilityIds: [facilities[0]._id]
      },
      {
        name: "Dr. Lisa Anderson",
        email: "lisa.anderson@hospital.com",
        role: "DOCTOR",
        department: "Neurology",
        specialization: "Neurology",
        licenseNumber: "MP345678",
        facilityIds: facilities.length > 2 ? [facilities[1]._id, facilities[2]._id] : [facilities[0]._id]
      },
      {
        name: "Dr. James Williams",
        email: "james.williams@hospital.com",
        role: "DOCTOR",
        department: "Orthopedics",
        specialization: "Orthopedics",
        licenseNumber: "MP456789",
        facilityIds: facilities.length > 2 ? [facilities[0]._id, facilities[2]._id] : [facilities[0]._id]
      },
      {
        name: "Dr. Emily Brown",
        email: "emily.brown@hospital.com",
        role: "DOCTOR",
        department: "General Practice",
        specialization: "General Practice",
        licenseNumber: "MP567890",
        facilityIds: [facilities[1]._id]
      }
    ];
    
    // Add each doctor
    console.log('\n👨‍⚕️ Adding doctors...\n');
    let successCount = 0;
    let existCount = 0;
    
    for (const doctor of doctors) {
      try {
        const response = await axios.post(
          `${API_URL}/users/add-staff`,
          doctor,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        
        console.log(`✅ ${doctor.name}`);
        console.log(`   Email: ${doctor.email}`);
        console.log(`   Specialization: ${doctor.specialization}`);
        console.log(`   Facilities: ${doctor.facilityIds.length}`);
        console.log('');
        successCount++;
      } catch (error) {
        if (error.response?.status === 400 && error.response?.data?.error?.includes('already exists')) {
          console.log(`⚠️  ${doctor.name} - Already exists`);
          existCount++;
        } else {
          console.log(`❌ ${doctor.name} - Error: ${error.response?.data?.error || error.message}`);
        }
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(50));
    console.log('📊 SUMMARY');
    console.log('='.repeat(50));
    console.log(`✅ Successfully added: ${successCount} doctors`);
    console.log(`⚠️  Already existed: ${existCount} doctors`);
    console.log(`📍 Total facilities: ${facilities.length}`);
    console.log('\n🎉 Done! Doctors are ready to see patients!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run it
addDoctors();
