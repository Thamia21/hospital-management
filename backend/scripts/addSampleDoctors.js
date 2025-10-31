/**
 * Script to add sample doctors with facility assignments
 * Run with: node backend/scripts/addSampleDoctors.js
 */

const mongoose = require('mongoose');
const User = require('../models/User');
const Facility = require('../models/Facility');

// Sample doctors data
const sampleDoctors = [
  {
    name: "Dr. Sarah Johnson",
    email: "sarah.johnson@hospital.com",
    role: "DOCTOR",
    specialization: "Cardiology",
    department: "Cardiology",
    licenseNumber: "MP123456",
    experience: "15 years",
    qualifications: "MBChB, FCP(SA), PhD",
    phone: "+27 11 123 4567"
  },
  {
    name: "Dr. Michael Chen",
    email: "michael.chen@hospital.com",
    role: "DOCTOR",
    specialization: "Pediatrics",
    department: "Pediatrics",
    licenseNumber: "MP234567",
    experience: "10 years",
    qualifications: "MBChB, FCPaed(SA)",
    phone: "+27 11 234 5678"
  },
  {
    name: "Dr. Lisa Anderson",
    email: "lisa.anderson@hospital.com",
    role: "DOCTOR",
    specialization: "Neurology",
    department: "Neurology",
    licenseNumber: "MP345678",
    experience: "12 years",
    qualifications: "MBChB, FCP(SA) Neurology",
    phone: "+27 11 345 6789"
  },
  {
    name: "Dr. James Williams",
    email: "james.williams@hospital.com",
    role: "DOCTOR",
    specialization: "Orthopedics",
    department: "Orthopedics",
    licenseNumber: "MP456789",
    experience: "18 years",
    qualifications: "MBChB, FCS(SA) Ortho",
    phone: "+27 11 456 7890"
  },
  {
    name: "Dr. Emily Brown",
    email: "emily.brown@hospital.com",
    role: "DOCTOR",
    specialization: "General Practice",
    department: "General Medicine",
    licenseNumber: "MP567890",
    experience: "8 years",
    qualifications: "MBChB, Dip PEC(SA)",
    phone: "+27 11 567 8901"
  }
];

async function addSampleDoctors() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital_management';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB\n');

    // Get all facilities
    const facilities = await Facility.find();
    
    if (facilities.length === 0) {
      console.log('❌ No facilities found in database!');
      console.log('Please add facilities first before adding doctors.');
      process.exit(1);
    }

    console.log(`📍 Found ${facilities.length} facilities:`);
    facilities.forEach((facility, index) => {
      console.log(`   ${index + 1}. ${facility.name} (${facility._id})`);
    });
    console.log('');

    // Add each doctor
    for (const doctorData of sampleDoctors) {
      // Check if doctor already exists
      const existingDoctor = await User.findOne({ email: doctorData.email });
      
      if (existingDoctor) {
        console.log(`⚠️  Doctor already exists: ${doctorData.name} (${doctorData.email})`);
        continue;
      }

      // Assign random facilities (1-3 facilities per doctor)
      const numFacilities = Math.floor(Math.random() * 3) + 1; // 1 to 3 facilities
      const shuffledFacilities = [...facilities].sort(() => 0.5 - Math.random());
      const assignedFacilities = shuffledFacilities.slice(0, numFacilities);
      const facilityIds = assignedFacilities.map(f => f._id);

      // Create doctor
      const doctor = new User({
        ...doctorData,
        facilityIds: facilityIds,
        isVerified: true // Auto-verified for sample data
      });

      await doctor.save();

      console.log(`✅ Added: ${doctorData.name}`);
      console.log(`   Email: ${doctorData.email}`);
      console.log(`   Specialization: ${doctorData.specialization}`);
      console.log(`   Facilities (${facilityIds.length}):`);
      assignedFacilities.forEach(f => {
        console.log(`      - ${f.name}`);
      });
      console.log('');
    }

    console.log('🎉 All sample doctors added successfully!');
    console.log('\n📊 Summary:');
    
    const totalDoctors = await User.countDocuments({ role: 'DOCTOR' });
    console.log(`   Total doctors in database: ${totalDoctors}`);
    
    console.log('\n💡 Next steps:');
    console.log('   1. Doctors can set their passwords via email links');
    console.log('   2. Patients at assigned facilities will see these doctors');
    console.log('   3. Test appointment booking to verify facility filtering');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

// Run the script
addSampleDoctors();
