// Seed script to create demo users
// Run with: node scripts/seed.js

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: '.env.local' });

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  passwordHash: String,
  role: String,
  portfolios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio' }],
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('Users already exist. Skipping seed.');
      process.exit(0);
    }

    // Create demo users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@propman.com',
        password: 'admin123',
        role: 'admin',
      },
      {
        name: 'Manager User',
        email: 'manager@propman.com',
        password: 'manager123',
        role: 'manager',
      },
      {
        name: 'Viewer User',
        email: 'viewer@propman.com',
        password: 'viewer123',
        role: 'viewer',
      },
    ];

    for (const userData of users) {
      const passwordHash = await bcrypt.hash(userData.password, 12);
      await User.create({
        name: userData.name,
        email: userData.email,
        passwordHash,
        role: userData.role,
        portfolios: [],
      });
      console.log(`Created user: ${userData.email}`);
    }

    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seed();