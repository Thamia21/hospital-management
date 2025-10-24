const mongoose = require('mongoose');
const Facility = require('../models/Facility');
const southAfricanFacilities = require('../data/southAfricanFacilities');

async function seedSouthAfricanFacilities() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital-management');
    console.log('Connected to MongoDB');

    // Clear existing facilities (optional - remove this if you want to keep existing data)
    console.log('Clearing existing facilities...');
    await Facility.deleteMany({});
    console.log('Existing facilities cleared');

    // Insert South African facilities
    console.log('Seeding South African facilities...');
    const insertedFacilities = await Facility.insertMany(southAfricanFacilities);
    console.log(`✅ Successfully seeded ${insertedFacilities.length} South African facilities`);

    // Display summary by province
    const provinceStats = {};
    insertedFacilities.forEach(facility => {
      provinceStats[facility.province] = (provinceStats[facility.province] || 0) + 1;
    });

    console.log('\n📊 Facilities by Province:');
    Object.entries(provinceStats).forEach(([province, count]) => {
      console.log(`   ${province}: ${count} facilities`);
    });

    // Display summary by type
    const typeStats = {};
    insertedFacilities.forEach(facility => {
      typeStats[facility.type] = (typeStats[facility.type] || 0) + 1;
    });

    console.log('\n🏥 Facilities by Type:');
    Object.entries(typeStats).forEach(([type, count]) => {
      console.log(`   ${type}: ${count} facilities`);
    });

    console.log('\n🎉 South African facilities seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding facilities:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seeding function
if (require.main === module) {
  seedSouthAfricanFacilities();
}

module.exports = seedSouthAfricanFacilities;
