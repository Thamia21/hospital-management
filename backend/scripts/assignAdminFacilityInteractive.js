const mongoose = require('mongoose');
const readline = require('readline');
const User = require('../models/User');
const Facility = require('../models/Facility');
require('dotenv').config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function assignAdminFacilityInteractive() {
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
    console.log('✅ Connected to MongoDB\n');

    // Find all facilities
    const facilities = await Facility.find();
    
    if (facilities.length === 0) {
      console.log('⚠️ No facilities found in the database.');
      const createNew = await question('Would you like to create a new facility? (yes/no): ');
      
      if (createNew.toLowerCase() === 'yes' || createNew.toLowerCase() === 'y') {
        const name = await question('Enter facility name: ');
        const type = await question('Enter facility type (HOSPITAL/CLINIC/PHARMACY): ');
        const address = await question('Enter address: ');
        const phone = await question('Enter phone number: ');
        const email = await question('Enter email: ');
        
        const newFacility = new Facility({
          name: name || 'Main Hospital',
          type: type.toUpperCase() || 'HOSPITAL',
          address: address || 'Johannesburg, South Africa',
          phone: phone || '+27 11 123 4567',
          email: email || 'info@hospital.co.za',
          capacity: 500,
          departments: ['Emergency', 'General Medicine', 'Surgery'],
          services: ['Emergency Care', 'Outpatient Services', 'Inpatient Care'],
          status: 'ACTIVE'
        });

        await newFacility.save();
        console.log(`\n✅ Created facility: ${newFacility.name}`);
        facilities.push(newFacility);
      } else {
        console.log('❌ Cannot proceed without a facility. Exiting...');
        rl.close();
        await mongoose.connection.close();
        return;
      }
    }

    // Display facilities
    console.log('\n📋 Available Facilities:');
    facilities.forEach((facility, index) => {
      console.log(`${index + 1}. ${facility.name} - ${facility.type} (ID: ${facility._id})`);
      console.log(`   Address: ${facility.address}`);
      console.log(`   Status: ${facility.status}\n`);
    });

    // Find all admin users
    const admins = await User.find({ role: 'ADMIN' });
    
    if (admins.length === 0) {
      console.log('❌ No admin users found!');
      console.log('Please create an admin user first.');
      rl.close();
      await mongoose.connection.close();
      return;
    }

    // Display admin users
    console.log('👥 Admin Users:');
    admins.forEach((admin, index) => {
      console.log(`${index + 1}. ${admin.name} (${admin.email})`);
      console.log(`   Current Facility: ${admin.facilityId || 'NOT ASSIGNED'}\n`);
    });

    // Select admin
    const adminChoice = await question(`Select admin user (1-${admins.length}): `);
    const selectedAdmin = admins[parseInt(adminChoice) - 1];

    if (!selectedAdmin) {
      console.log('❌ Invalid admin selection!');
      rl.close();
      await mongoose.connection.close();
      return;
    }

    // Select facility
    const facilityChoice = await question(`\nSelect facility to assign (1-${facilities.length}): `);
    const selectedFacility = facilities[parseInt(facilityChoice) - 1];

    if (!selectedFacility) {
      console.log('❌ Invalid facility selection!');
      rl.close();
      await mongoose.connection.close();
      return;
    }

    // Confirm assignment
    console.log(`\n📝 Assignment Summary:`);
    console.log(`Admin: ${selectedAdmin.name} (${selectedAdmin.email})`);
    console.log(`Facility: ${selectedFacility.name} (${selectedFacility.type})`);
    
    const confirm = await question('\nConfirm assignment? (yes/no): ');

    if (confirm.toLowerCase() === 'yes' || confirm.toLowerCase() === 'y') {
      // Assign facility to admin
      selectedAdmin.facilityId = selectedFacility._id;
      await selectedAdmin.save();

      console.log('\n✅ SUCCESS! Admin assigned to facility.');
      console.log(`\n👤 Admin: ${selectedAdmin.name}`);
      console.log(`🏥 Facility: ${selectedFacility.name}`);
      console.log(`🆔 Facility ID: ${selectedAdmin.facilityId}`);
      console.log('\n🎉 Admin can now view patients from this facility!');
    } else {
      console.log('\n❌ Assignment cancelled.');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    rl.close();
    await mongoose.connection.close();
    console.log('\n✅ Database connection closed');
  }
}

// Run the script
assignAdminFacilityInteractive();
