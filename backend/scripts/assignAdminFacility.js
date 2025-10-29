const mongoose = require('mongoose');
const User = require('../models/User');
const Facility = require('../models/Facility');
require('dotenv').config();

async function assignAdminFacility() {
  try {
    // Connect to MongoDB - using IPv4 address to avoid connection issues
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/hospital_management';
    console.log(`🔌 Connecting to: ${mongoURI}`);
    
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      family: 4 // Force IPv4
    });
    console.log('✅ Connected to MongoDB');

    // Find all facilities
    const facilities = await Facility.find();
    console.log('\n📋 Available Facilities:');
    facilities.forEach((facility, index) => {
      console.log(`${index + 1}. ${facility.name} (ID: ${facility._id})`);
    });

    // Find admin user
    const admin = await User.findOne({ role: 'ADMIN' });
    
    if (!admin) {
      console.log('\n❌ No admin user found!');
      console.log('Please create an admin user first.');
      process.exit(1);
    }

    console.log(`\n👤 Found Admin User: ${admin.name} (${admin.email})`);
    console.log(`Current facilityId: ${admin.facilityId || 'NOT ASSIGNED'}`);

    // If no facilities exist, create a default one
    if (facilities.length === 0) {
      console.log('\n⚠️ No facilities found. Creating default facility...');
      
      const defaultFacility = new Facility({
        name: 'Main Hospital',
        type: 'HOSPITAL',
        address: '123 Main Street, Johannesburg, South Africa',
        phone: '+27 11 123 4567',
        email: 'info@mainhospital.co.za',
        capacity: 500,
        departments: ['Emergency', 'General Medicine', 'Surgery', 'Pediatrics', 'Cardiology'],
        services: ['Emergency Care', 'Outpatient Services', 'Inpatient Care', 'Laboratory', 'Radiology'],
        operatingHours: {
          monday: { open: '00:00', close: '23:59' },
          tuesday: { open: '00:00', close: '23:59' },
          wednesday: { open: '00:00', close: '23:59' },
          thursday: { open: '00:00', close: '23:59' },
          friday: { open: '00:00', close: '23:59' },
          saturday: { open: '00:00', close: '23:59' },
          sunday: { open: '00:00', close: '23:59' }
        },
        status: 'ACTIVE'
      });

      await defaultFacility.save();
      console.log(`✅ Created default facility: ${defaultFacility.name}`);
      
      // Assign admin to this facility
      admin.facilityId = defaultFacility._id;
      await admin.save();
      
      console.log(`\n✅ Admin assigned to facility: ${defaultFacility.name}`);
      console.log(`Admin facilityId: ${admin.facilityId}`);
    } else {
      // Assign admin to the first facility (or you can modify this logic)
      const selectedFacility = facilities[0];
      
      admin.facilityId = selectedFacility._id;
      await admin.save();
      
      console.log(`\n✅ Admin assigned to facility: ${selectedFacility.name}`);
      console.log(`Admin facilityId: ${admin.facilityId}`);
    }

    console.log('\n🎉 Admin facility assignment complete!');
    console.log('\nAdmin can now view patients from their assigned facility.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

// Run the script
assignAdminFacility();
