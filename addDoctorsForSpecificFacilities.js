// Add doctors for Rob Ferreira and Themba hospitals
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function addDoctorsForSpecificFacilities() {
  try {
    console.log('🔐 Logging in as admin...');
    
    // Login
    const loginResponse = await axios.post(`${API_URL}/auth/login`, {
      email: 'admin@hospital.com',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful!\n');
    
    // Get all facilities
    console.log('📍 Fetching facilities...');
    const facilitiesResponse = await axios.get(`${API_URL}/facilities`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    const facilities = facilitiesResponse.data;
    console.log(`✅ Found ${facilities.length} facilities\n`);
    
    // Find Rob Ferreira and Themba hospitals
    const robFerreira = facilities.find(f => 
      f.name.toLowerCase().includes('rob ferreira') || 
      f.name.toLowerCase().includes('rob-ferreira')
    );
    
    const themba = facilities.find(f => 
      f.name.toLowerCase().includes('themba')
    );
    
    console.log('🏥 Target Facilities:');
    if (robFerreira) {
      console.log(`   ✅ Rob Ferreira: ${robFerreira.name} (${robFerreira._id})`);
    } else {
      console.log('   ❌ Rob Ferreira Hospital not found');
    }
    
    if (themba) {
      console.log(`   ✅ Themba: ${themba.name} (${themba._id})`);
    } else {
      console.log('   ❌ Themba Hospital not found');
    }
    
    if (!robFerreira && !themba) {
      console.log('\n❌ Neither hospital found. Available facilities:');
      facilities.slice(0, 10).forEach(f => {
        console.log(`   - ${f.name}`);
      });
      return;
    }
    
    // Prepare facility IDs
    const targetFacilityIds = [];
    if (robFerreira) targetFacilityIds.push(robFerreira._id);
    if (themba) targetFacilityIds.push(themba._id);
    
    // Define doctors for these facilities
    const doctors = [
      {
        name: "Dr. Sipho Mthembu",
        email: "sipho.mthembu@hospital.com",
        role: "DOCTOR",
        department: "Emergency Medicine",
        specialization: "Emergency Medicine",
        licenseNumber: "MP100001",
        facilityIds: targetFacilityIds,
        experience: "15 years",
        qualifications: "MBChB, FCS(SA) Emergency Medicine"
      },
      {
        name: "Dr. Thandiwe Nkosi",
        email: "thandiwe.nkosi@hospital.com",
        role: "DOCTOR",
        department: "Pediatrics",
        specialization: "Pediatrics",
        licenseNumber: "MP100002",
        facilityIds: targetFacilityIds,
        experience: "10 years",
        qualifications: "MBChB, FCPaed(SA)"
      },
      {
        name: "Dr. Mandla Dlamini",
        email: "mandla.dlamini@hospital.com",
        role: "DOCTOR",
        department: "Surgery",
        specialization: "General Surgery",
        licenseNumber: "MP100003",
        facilityIds: targetFacilityIds,
        experience: "18 years",
        qualifications: "MBChB, FCS(SA)"
      },
      {
        name: "Dr. Nomsa Khumalo",
        email: "nomsa.khumalo@hospital.com",
        role: "DOCTOR",
        department: "Obstetrics and Gynecology",
        specialization: "Obstetrics and Gynecology",
        licenseNumber: "MP100004",
        facilityIds: targetFacilityIds,
        experience: "12 years",
        qualifications: "MBChB, FCOG(SA)"
      },
      {
        name: "Dr. Thabo Mokoena",
        email: "thabo.mokoena@hospital.com",
        role: "DOCTOR",
        department: "Internal Medicine",
        specialization: "Internal Medicine",
        licenseNumber: "MP100005",
        facilityIds: targetFacilityIds,
        experience: "14 years",
        qualifications: "MBChB, FCP(SA)"
      },
      {
        name: "Dr. Zanele Sithole",
        email: "zanele.sithole@hospital.com",
        role: "DOCTOR",
        department: "Cardiology",
        specialization: "Cardiology",
        licenseNumber: "MP100006",
        facilityIds: targetFacilityIds,
        experience: "16 years",
        qualifications: "MBChB, FCP(SA), Cert Cardiology"
      },
      {
        name: "Dr. Bongani Ndlovu",
        email: "bongani.ndlovu@hospital.com",
        role: "DOCTOR",
        department: "Orthopedics",
        specialization: "Orthopedics",
        licenseNumber: "MP100007",
        facilityIds: targetFacilityIds,
        experience: "13 years",
        qualifications: "MBChB, FCS(SA) Ortho"
      },
      {
        name: "Dr. Lindiwe Zulu",
        email: "lindiwe.zulu@hospital.com",
        role: "DOCTOR",
        department: "Psychiatry",
        specialization: "Psychiatry",
        licenseNumber: "MP100008",
        facilityIds: targetFacilityIds,
        experience: "11 years",
        qualifications: "MBChB, FCPsych(SA)"
      },
      {
        name: "Dr. Siyabonga Cele",
        email: "siyabonga.cele@hospital.com",
        role: "DOCTOR",
        department: "Radiology",
        specialization: "Radiology",
        licenseNumber: "MP100009",
        facilityIds: targetFacilityIds,
        experience: "9 years",
        qualifications: "MBChB, MMed Radiology"
      },
      {
        name: "Dr. Nokuthula Mkhize",
        email: "nokuthula.mkhize@hospital.com",
        role: "DOCTOR",
        department: "Anesthesiology",
        specialization: "Anesthesiology",
        licenseNumber: "MP100010",
        facilityIds: targetFacilityIds,
        experience: "10 years",
        qualifications: "MBChB, FCA(SA)"
      }
    ];
    
    // Add each doctor
    console.log('\n👨‍⚕️ Adding doctors...\n');
    let successCount = 0;
    let existCount = 0;
    let errorCount = 0;
    
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
          errorCount++;
        }
      }
    }
    
    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`🏥 Target Facilities:`);
    if (robFerreira) console.log(`   - ${robFerreira.name}`);
    if (themba) console.log(`   - ${themba.name}`);
    console.log(`\n✅ Successfully added: ${successCount} doctors`);
    console.log(`⚠️  Already existed: ${existCount} doctors`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log(`📊 Total doctors processed: ${doctors.length}`);
    
    console.log('\n🎉 Done! Doctors are assigned to:');
    if (robFerreira) console.log(`   ✅ ${robFerreira.name}`);
    if (themba) console.log(`   ✅ ${themba.name}`);
    
    console.log('\n💡 Next: Patients at these facilities can now book appointments!');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run it
addDoctorsForSpecificFacilities();
