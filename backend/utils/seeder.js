const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
require('dotenv').config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ role: 'admin' });

  if (existing) {
    console.log('✅ Admin already exists:', existing.email);
    process.exit(0);
  }

  const hashedPassword = await bcrypt.hash(
    process.env.ADMIN_PASSWORD,
    10
  );

  await User.create({
    name: 'System Administrator',
    email: process.env.ADMIN_EMAIL,
    password: hashedPassword,
    role: 'admin',
    subscriptionPlan: 'pro',
    isActive: true,
  });

  console.log('✅ Admin account created!');
  console.log('Email:', process.env.ADMIN_EMAIL);

  process.exit(0);
};

seed().catch(err => {
  console.error(err);
  process.exit(1);
});