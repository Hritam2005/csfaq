import mongoose from 'mongoose';
import { connectDB } from './src/config/db.js';
import User from './src/models/User.js';
import Role from './src/models/Role.js';

const ADMIN_CREDENTIALS = {
  fullName: 'System Administrator',
  username: 'admin',
  email: 'admin@example.com',
  password: 'AdminPassword123!',
};

const seedAdmin = async () => {
  try {
    await connectDB();

    let superAdminRole = await Role.findOne({ name: 'Super Admin' });
    if (!superAdminRole) {
      superAdminRole = await Role.create({
        name: 'Super Admin',
        description: 'Highest level of administrative access',
        isSystem: true,
        isActive: true,
      });
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
      console.log('Admin user updated.');
    } else {
      await User.create({
        ...ADMIN_CREDENTIALS,
        role: superAdminRole._id,
        accountStatus: 'active',
        emailVerified: true,
      });
      console.log('Admin user created.');
    }

    console.log(`Email: ${ADMIN_CREDENTIALS.email}`);
    console.log(`Password: ${ADMIN_CREDENTIALS.password}`);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

seedAdmin();
