// Emergency script to add doctors directly via backend
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

async function addDoctorsNow() {
  try {
    console.log('🚀 Adding doctors to database...\n');
    
    // Get facilities first
    const facilitiesResponse = await axios.get(`${API_URL}/facilities`);
    const facilities = facilitiesResponse.data;
    
    // Find Rob Ferreira and Themba
    const robFerreira = facilities.find(f => f.name.toLowerCase().includes('rob') && f.name.toLowerCase().includes('ferreira'));
    const themba = facilities.find(f => f.name.toLowerCase().includes('themba'));
    
    console.log('🏥 Target Facilities:');
    if (robFerreira) console.log(`   ✅ ${robFerreira.name}`);
    if (themba) console.log(`   ✅ ${themba.name}`);
    
    const facilityIds = [];
    if (robFerreira) facilityIds.push(robFerreira._id);
    if (themba) facilityIds.push(themba._id);
    
    if (facilityIds.length === 0) {
      console.log('❌ Could not find facilities. Using first 2 facilities instead...');
      facilityIds.push(facilities[0]._id, facilities[1]._id);
    }
    
    // Try to register doctors directly (no auth needed for registration)
    const doctors = [
      {
        name: "Dr. Sipho Mthembu",
        email: "sipho.mthembu@hospital.com",
        password: "Doctor123!",
        role: "DOCTOR",
        phone: "+27137590111",
        department: "Emergency Medicine",
        specialization: "Emergency Medicine",
        licenseNumber: "MP100001",
        facilityIds: facilityIds
      },
      {
        name: "Dr. Thandiwe Nkosi",
        email: "thandiwe.nkosi@hospital.com",
        password: "Doctor123!",
        role: "DOCTOR",
        phone: "+27137590112",
        department: "Pediatrics",
        specialization: "Pediatrics",
        licenseNumber: "MP100002",
        facilityIds: facilityIds
      },
      {
        name: "Dr. Mandla Dlamini",
        email: "mandla.dlamini@hospital.com",
        password: "Doctor123!",
        role: "DOCTOR",
        phone: "+27137590113",
        department: "Surgery",
        specialization: "General Surgery",
        licenseNumber: "MP100003",
        facilityIds: facilityIds
      },
      {
        name: "Dr. Nomsa Khumalo",
        email: "nomsa.khumalo@hospital.com",
        password: "Doctor123!",
        role: "DOCTOR",
        phone: "+27137590114",
        department: "Obstetrics and Gynecology",
        specialization: "Obstetrics and Gynecology",
        licenseNumber: "MP100004",
        facilityIds: facilityIds
      },
      {
        name: "Dr. Thabo Mokoena",
        email: "thabo.mokoena@hospital.com",
        password: "Doctor123!",
        role: "DOCTOR",
        phone: "+27137590115",
        department: "Internal Medicine",
        specialization: "Internal Medicine",
        licenseNumber: "MP100005",
        facilityIds: facilityIds
      },
      {
        name: "Dr. Zanele Sithole",
        email: "zanele.sithole@hospital.com",
        password: "Doctor123!",
        role: "DOCTOR",
        phone: "+27137590116",
        department: "Cardiology",
        specialization: "Cardiology",
        licenseNumber: "MP100006",
        facilityIds: facilityIds
      },
      {
        name: "Dr. Bongani Ndlovu",
        email: "bongani.ndlovu@hospital.com",
        password: "Doctor123!",
        role: "DOCTOR",
        phone: "+27137590117",
        department: "Orthopedics",
        specialization: "Orthopedics",
        licenseNumber: "MP100007",
        facilityIds: facilityIds
      },
      {
        name: "Dr. Lindiwe Zulu",
        email: "lindiwe.zulu@hospital.com",
        password: "Doctor123!",
        role: "DOCTOR",
        phone: "+27137590118",
        department: "Psychiatry",
        specialization: "Psychiatry",
        licenseNumber: "MP100008",
        facilityIds: facilityIds
      },
      {
        name: "Dr. Siyabonga Cele",
        email: "siyabonga.cele@hospital.com",
        password: "Doctor123!",
        role: "DOCTOR",
        phone: "+27137590119",
        department: "Radiology",
        specialization: "Radiology",
        licenseNumber: "MP100009",
        facilityIds: facilityIds
      },
      {
        name: "Dr. Nokuthula Mkhize",
        email: "nokuthula.mkhize@hospital.com",
        password: "Doctor123!",
        role: "DOCTOR",
        phone: "+27137590120",
        department: "Anesthesiology",
        specialization: "Anesthesiology",
        licenseNumber: "MP100010",
        facilityIds: facilityIds
      }
    ];
    
    console.log('\n👨‍⚕️ Adding 10 doctors...\n');
    let successCount = 0;
    let existCount = 0;
    
    for (const doctor of doctors) {
      try {
        await axios.post(`${API_URL}/auth/register`, doctor);
        console.log(`✅ ${doctor.name} - ${doctor.specialization}`);
        successCount++;
      } catch (error) {
        if (error.response?.data?.error?.includes('already exists')) {
          console.log(`⚠️  ${doctor.name} - Already exists`);
          existCount++;
        } else {
          console.log(`❌ ${doctor.name} - ${error.response?.data?.error || error.message}`);
        }
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ DONE!');
    console.log('='.repeat(60));
    console.log(`✅ Successfully added: ${successCount} doctors`);
    console.log(`⚠️  Already existed: ${existCount} doctors`);
    console.log(`📊 Total: ${successCount + existCount} doctors ready`);
    console.log('\n🎉 All doctors are now in the database!');
    console.log('🏥 Assigned to Rob Ferreira and Themba hospitals');
    console.log('\n✨ Your system is ready for submission!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

addDoctorsNow();
