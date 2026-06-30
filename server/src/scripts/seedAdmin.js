import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Role from '../models/Role.js';
import mongoose from 'mongoose';

const seedAdmin = async () => {
  try {
    console.log('🌱 Starting Admin Seeding Process...');
    await connectDB();
    
    // Check if Super Admin role exists
    let superAdminRole = await Role.findOne({ name: 'Super Admin' });
    if (!superAdminRole) {
      superAdminRole = await Role.create({
        name: 'Super Admin',
        description: 'Highest level of administrative access',
        isSystem: true,
        isActive: true,
      });
      console.log('✅ Super Admin role created');
    } else {
      console.log('✅ Super Admin role already exists');
    }

    // Check if admin user exists
    const adminEmail = 'admin@example.com';
    let adminUser = await User.findOne({ email: adminEmail });
    if (!adminUser) {
      adminUser = await User.create({
        fullName: 'System Administrator',
        username: 'admin',
        email: adminEmail,
        password: 'AdminPassword123!', // This will be automatically hashed by the pre-save hook in User model
        role: superAdminRole._id,
        accountStatus: 'active',
        emailVerified: true
      });
      console.log(`✅ Admin user created successfully!`);
      console.log(`   Email: ${adminEmail}`);
      console.log(`   Password: AdminPassword123!`);
    } else {
      console.log('✅ Admin user already exists');
      // Just to be sure, update role to Super Admin if it's not
      if (adminUser.role.toString() !== superAdminRole._id.toString()) {
         adminUser.role = superAdminRole._id;
         await adminUser.save();
         console.log('✅ Admin user role updated to Super Admin');
      }
    }

  } catch (error) {
    console.error('❌ Error seeding admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
};

seedAdmin();
