const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Sample doctors data
const sampleDoctors = [
  {
    name: 'Dr. John Smith',
    email: 'john.smith@hospital.com',
    phone: '+27123456789',
    role: 'DOCTOR',
    specialization: 'Cardiology',
    department: 'Cardiology Department',
    qualifications: 'MBChB, FCP(SA), PhD',
    experience: '15',
    licenseNumber: 'MP123456',
    isVerified: true,
    password: 'doctor123'
  },
  {
    name: 'Dr. Sarah Johnson',
    email: 'sarah.johnson@hospital.com',
    phone: '+27123456790',
    role: 'DOCTOR',
    specialization: 'Pediatrics',
    department: 'Pediatrics Department',
    qualifications: 'MBChB, DCH, FCPaed(SA)',
    experience: '12',
    licenseNumber: 'MP123457',
    isVerified: true,
    password: 'doctor123'
  },
  {
    name: 'Dr. Michael Brown',
    email: 'michael.brown@hospital.com',
    phone: '+27123456791',
    role: 'DOCTOR',
    specialization: 'Orthopedics',
    department: 'Orthopedics Department',
    qualifications: 'MBChB, FCS(SA)Orth',
    experience: '18',
    licenseNumber: 'MP123458',
    isVerified: true,
    password: 'doctor123'
  },
  {
    name: 'Dr. Emily Davis',
    email: 'emily.davis@hospital.com',
    phone: '+27123456792',
    role: 'DOCTOR',
    specialization: 'Dermatology',
    department: 'Dermatology Department',
    qualifications: 'MBChB, FC Derm(SA)',
    experience: '10',
    licenseNumber: 'MP123459',
    isVerified: true,
    password: 'doctor123'
  },
  {
    name: 'Dr. David Wilson',
    email: 'david.wilson@hospital.com',
    phone: '+27123456793',
    role: 'DOCTOR',
    specialization: 'Neurology',
    department: 'Neurology Department',
    qualifications: 'MBChB, FCP(SA), MMed Neurol',
    experience: '20',
    licenseNumber: 'MP123460',
    isVerified: true,
    password: 'doctor123'
  },
  {
    name: 'Dr. Lisa Anderson',
    email: 'lisa.anderson@hospital.com',
    phone: '+27123456794',
    role: 'DOCTOR',
    specialization: 'Optometry',
    department: 'Eye Care Department',
    qualifications: 'BOptom, MOptom',
    experience: '8',
    licenseNumber: 'OP123461',
    isVerified: true,
    password: 'doctor123'
  },
  {
    name: 'Dr. Robert Taylor',
    email: 'robert.taylor@hospital.com',
    phone: '+27123456795',
    role: 'DOCTOR',
    specialization: 'General Practice',
    department: 'General Medicine',
    qualifications: 'MBChB, Dip PEC(SA)',
    experience: '25',
    licenseNumber: 'MP123462',
    isVerified: true,
    password: 'doctor123'
  }
];

// Sample nurses data
const sampleNurses = [
  {
    name: 'Sister Mary Johnson',
    email: 'mary.johnson@hospital.com',
    phone: '+27123456796',
    role: 'NURSE',
    specialization: 'Critical Care',
    department: 'ICU',
    qualifications: 'BCur, ICU Specialty',
    experience: '12',
    licenseNumber: 'RN123456',
    isVerified: true,
    password: 'nurse123'
  },
  {
    name: 'Sister Grace Mbeki',
    email: 'grace.mbeki@hospital.com',
    phone: '+27123456797',
    role: 'NURSE',
    specialization: 'Pediatric Care',
    department: 'Pediatrics',
    qualifications: 'BCur, Pediatric Specialty',
    experience: '8',
    licenseNumber: 'RN123457',
    isVerified: true,
    password: 'nurse123'
  },
  {
    name: 'Sister Nomsa Dlamini',
    email: 'nomsa.dlamini@hospital.com',
    phone: '+27123456798',
    role: 'NURSE',
    specialization: 'Surgical Care',
    department: 'Surgery',
    qualifications: 'BCur, Theatre Specialty',
    experience: '15',
    licenseNumber: 'RN123458',
    isVerified: true,
    password: 'nurse123'
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect('mongodb://localhost:27017/hospital-management', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to MongoDB');
    
    // Check if doctors already exist
    const existingDoctors = await User.find({ role: 'DOCTOR' });
    console.log(`Found ${existingDoctors.length} existing doctors`);
    
    if (existingDoctors.length === 0) {
      console.log('Seeding doctors...');
      
      // Hash passwords and create doctors
      for (const doctorData of sampleDoctors) {
        const hashedPassword = await bcrypt.hash(doctorData.password, 10);
        const doctor = new User({
          ...doctorData,
          password: hashedPassword
        });
        await doctor.save();
        console.log(`Created doctor: ${doctor.name} (${doctor.specialization})`);
      }
      
      // Hash passwords and create nurses
      for (const nurseData of sampleNurses) {
        const hashedPassword = await bcrypt.hash(nurseData.password, 10);
        const nurse = new User({
          ...nurseData,
          password: hashedPassword
        });
        await nurse.save();
        console.log(`Created nurse: ${nurse.name} (${nurse.specialization})`);
      }
      
      console.log('Database seeded successfully!');
    } else {
      console.log('Doctors already exist, skipping seeding');
    }
    
    // Display all doctors
    const allDoctors = await User.find({ role: 'DOCTOR' });
    console.log('\nAll doctors in database:');
    allDoctors.forEach(doctor => {
      console.log(`- ${doctor.name} (${doctor.specialization}) - ID: ${doctor._id}`);
    });
    
    // Display all nurses
    const allNurses = await User.find({ role: 'NURSE' });
    console.log('\nAll nurses in database:');
    allNurses.forEach(nurse => {
      console.log(`- ${nurse.name} (${nurse.specialization}) - ID: ${nurse._id}`);
    });
    
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seeding
seedDatabase();
