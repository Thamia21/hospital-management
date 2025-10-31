// Direct MongoDB script to add doctors for Rob Ferreira and Themba hospitals
const mongoose = require('mongoose');
const User = require('../models/User');
const Facility = require('../models/Facility');

async function addDoctors() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_management';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Find Rob Ferreira and Themba hospitals
    console.log('🔍 Searching for facilities...');
    const robFerreira = await Facility.findOne({ 
      name: { $regex: /rob.*ferreira/i } 
    });
    
    const themba = await Facility.findOne({ 
      name: { $regex: /themba/i } 
    });
    
    console.log('🏥 Target Facilities:');
    if (robFerreira) {
      console.log(`   ✅ Found: ${robFerreira.name} (${robFerreira._id})`);
    } else {
      console.log('   ❌ Rob Ferreira Hospital not found');
    }
    
    if (themba) {
      console.log(`   ✅ Found: ${themba.name} (${themba._id})`);
    } else {
      console.log('   ❌ Themba Hospital not found');
    }
    
    if (!robFerreira && !themba) {
      console.log('\n❌ Neither hospital found. Showing available facilities:');
      const allFacilities = await Facility.find().limit(10);
      allFacilities.forEach(f => console.log(`   - ${f.name}`));
      process.exit(1);
    }
    
    // Prepare facility IDs
    const targetFacilityIds = [];
    if (robFerreira) targetFacilityIds.push(robFerreira._id);
    if (themba) targetFacilityIds.push(themba._id);
    
    // Define doctors
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
        qualifications: "MBChB, FCS(SA) Emergency Medicine",
        phone: "+27 13 759 0111",
        isVerified: true
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
        qualifications: "MBChB, FCPaed(SA)",
        phone: "+27 13 759 0112",
        isVerified: true
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
        qualifications: "MBChB, FCS(SA)",
        phone: "+27 13 759 0113",
        isVerified: true
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
        qualifications: "MBChB, FCOG(SA)",
        phone: "+27 13 759 0114",
        isVerified: true
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
        qualifications: "MBChB, FCP(SA)",
        phone: "+27 13 759 0115",
        isVerified: true
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
        qualifications: "MBChB, FCP(SA), Cert Cardiology",
        phone: "+27 13 759 0116",
        isVerified: true
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
        qualifications: "MBChB, FCS(SA) Ortho",
        phone: "+27 13 759 0117",
        isVerified: true
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
        qualifications: "MBChB, FCPsych(SA)",
        phone: "+27 13 759 0118",
        isVerified: true
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
        qualifications: "MBChB, MMed Radiology",
        phone: "+27 13 759 0119",
        isVerified: true
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
        qualifications: "MBChB, FCA(SA)",
        phone: "+27 13 759 0120",
        isVerified: true
      }
    ];
    
    // Add each doctor
    console.log('\n👨‍⚕️ Adding doctors...\n');
    let successCount = 0;
    let existCount = 0;
    
    for (const doctorData of doctors) {
      // Check if doctor already exists
      const existingDoctor = await User.findOne({ email: doctorData.email });
      
      if (existingDoctor) {
        console.log(`⚠️  ${doctorData.name} - Already exists`);
        existCount++;
        continue;
      }
      
      // Create doctor
      const doctor = new User(doctorData);
      await doctor.save();
      
      console.log(`✅ ${doctorData.name}`);
      console.log(`   Email: ${doctorData.email}`);
      console.log(`   Specialization: ${doctorData.specialization}`);
      console.log(`   User ID: ${doctor.userId}`);
      console.log(`   Facilities: ${doctorData.facilityIds.length}`);
      console.log('');
      successCount++;
    }
    
    // Summary
    console.log('='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`🏥 Target Facilities:`);
    if (robFerreira) console.log(`   - ${robFerreira.name}`);
    if (themba) console.log(`   - ${themba.name}`);
    console.log(`\n✅ Successfully added: ${successCount} doctors`);
    console.log(`⚠️  Already existed: ${existCount} doctors`);
    console.log(`📊 Total doctors processed: ${doctors.length}`);
    
    const totalDoctors = await User.countDocuments({ role: 'DOCTOR' });
    console.log(`\n📈 Total doctors in database: ${totalDoctors}`);
    
    console.log('\n🎉 Done! Patients at these facilities can now book appointments!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run it
addDoctors();
