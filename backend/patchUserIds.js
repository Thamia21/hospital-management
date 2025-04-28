const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function patchUserIds() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hospital_management');

  const users = await User.find({ $or: [ { userId: { $exists: false } }, { userId: null } ] });
  if (users.length === 0) {
    console.log('All users already have a userId.');
    await mongoose.disconnect();
    return;
  }

  for (const user of users) {
    // Trigger the pre-save hook to generate userId
    await user.save();
    console.log(`Patched user: ${user.email} with userId: ${user.userId}`);
  }

  await mongoose.disconnect();
  console.log('Patched all users missing userId.');
}

patchUserIds().catch(console.error);
