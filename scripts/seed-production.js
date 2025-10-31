#!/usr/bin/env node

/**
 * Production Seed Script
 * 
 * This script seeds the production database with initial demo users.
 * Run this ONCE after your first deployment to Vercel.
 * 
 * Usage:
 *   node scripts/seed-production.js
 * 
 * Or with environment variable:
 *   MONGODB_URI="your-prod-uri" node scripts/seed-production.js
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Allow MongoDB URI to be passed via environment variable
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ ERROR: MONGODB_URI environment variable is not set!');
  console.error('');
  console.error('Please set your production MongoDB URI:');
  console.error('  Windows (PowerShell): $env:MONGODB_URI="your-uri-here"');
  console.error('  Linux/Mac: export MONGODB_URI="your-uri-here"');
  console.error('');
  console.error('Then run: node scripts/seed-production.js');
  process.exit(1);
}

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  passwordHash: String,
  role: String,
  portfolios: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Portfolio' }],
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function seedProduction() {
  console.log('🚀 Starting production database seed...');
  console.log('');

  try {
    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log('');

    // Check if users already exist
    const existingUsers = await User.countDocuments();
    if (existingUsers > 0) {
      console.log('ℹ️  Users already exist in the database!');
      console.log(`   Found ${existingUsers} existing user(s)`);
      console.log('');
      console.log('⚠️  Skipping seed to prevent duplicates.');
      console.log('   If you want to re-seed, please manually delete existing users first.');
      await mongoose.connection.close();
      process.exit(0);
    }

    // Create demo users
    console.log('👥 Creating demo users...');
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
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      await User.create({
        name: userData.name,
        email: userData.email,
        passwordHash: hashedPassword,
        role: userData.role,
      });
      console.log(`   ✓ Created ${userData.role}: ${userData.email}`);
    }

    console.log('');
    console.log('✅ Production database seeded successfully!');
    console.log('');
    console.log('📝 Demo User Credentials:');
    console.log('   Admin:   admin@propman.com   / admin123');
    console.log('   Manager: manager@propman.com / manager123');
    console.log('   Viewer:  viewer@propman.com  / viewer123');
    console.log('');
    console.log('⚠️  IMPORTANT: Change these passwords in production!');
    console.log('');

    await mongoose.connection.close();
    console.log('🔒 Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('');
    console.error('❌ ERROR during seeding:');
    console.error(error);
    console.error('');
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
    }
    
    process.exit(1);
  }
}

// Run the seed
seedProduction();
