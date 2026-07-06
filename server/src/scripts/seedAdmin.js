import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import User from '../models/User.js';
import Role from '../models/Role.js';

const ADMIN_CREDENTIALS = {
  fullName: 'System Administrator',
  username: 'admin',
  email: 'admin@example.com',
  password: 'AdminPassword123!',
};

const seedAdmin = async () => {
  try {
    console.log('Starting admin seeding process...');
    await connectDB();

    let superAdminRole = await Role.findOne({ name: 'Super Admin' });
    if (!superAdminRole) {
      superAdminRole = await Role.create({
        name: 'Super Admin',
        description: 'Highest level of administrative access',
        isSystem: true,
        isActive: true,
      });
      console.log('Super Admin role created.');
    } else {
      console.log('Super Admin role already exists.');
    }

    let adminUser = await User.findOne({ email: ADMIN_CREDENTIALS.email });
    if (adminUser) {
      adminUser.fullName = ADMIN_CREDENTIALS.fullName;
      adminUser.username = ADMIN_CREDENTIALS.username;
      adminUser.password = ADMIN_CREDENTIALS.password;
      adminUser.role = superAdminRole._id;
      adminUser.accountStatus = 'active';
      adminUser.emailVerified = true;
      await adminUser.save();
      console.log('Admin user updated successfully.');
    } else {
      await User.create({
        ...ADMIN_CREDENTIALS,
        role: superAdminRole._id,
        accountStatus: 'active',
        emailVerified: true,
      });
      console.log('Admin user created successfully.');
    }

    console.log(`Email: ${ADMIN_CREDENTIALS.email}`);
    console.log(`Password: ${ADMIN_CREDENTIALS.password}`);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed.');
  }
};

seedAdmin();
