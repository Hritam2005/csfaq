"/**
 * Seed Script: Create Triage Admin Resolver
 * 
 * Run: node src/scripts/seedTriageAdmin.js
 * 
 * This creates a resolver user that can be used for testing
 * or integrated with your existing admin system.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Resolver schema (simplified for standalone use)
const resolverSchema = new mongoose.Schema({
  resolverId: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, default: 'Resolver' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

const Resolver = mongoose.models.Resolver || mongoose.model('Resolver', resolverSchema);

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/query_triage');
    console.log('✅ Connected to MongoDB');

    // Clear existing resolvers
    await Resolver.deleteMany({});
    console.log('🗑️  Cleared existing resolvers');

    // Create default resolver
    const hashedPassword = await bcrypt.hash('triage-admin-123', 12);
    
    const resolver = await Resolver.create({
      resolverId: 'resolver_default_001',
      email: 'triage-admin@csfaq.local',
      password: hashedPassword,
      name: 'Triage Admin',
      role: 'Admin',
    });

    console.log('✅ Created default resolver:');
    console.log('   Email: triage-admin@csfaq.local');
    console.log('   Password: triage-admin-123');
    console.log('   (Change this password in production!)');

    // Create test resolver
    const testPassword = await bcrypt.hash('test-resolver-123', 12);
    
    await Resolver.create({
      resolverId: 'resolver_test_001',
      email: 'test-resolver@csfaq.local',
      password: testPassword,
      name: 'Test Resolver',
      role: 'Resolver',
    });

    console.log('✅ Created test resolver:');
    console.log('   Email: test-resolver@csfaq.local');
    console.log('   Password: test-resolver-123');

    console.log('\n📝 Note: For production, integrate with CSFAQ user management');
    console.log('   or use JWT tokens from your main auth system.');

    await mongoose.disconnect();
    console.log('\n✅ Seeding complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
