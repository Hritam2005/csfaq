import User from '../models/User.js';
import Role from '../models/Role.js';
import { logger } from '../config/logger.js';

export const seedAdmin = async () => {
  try {
    let adminRole = await Role.findOne({ name: 'System Administrator' });
    if (!adminRole) {
      adminRole = await Role.create({
        name: 'System Administrator',
        description: 'Full system access',
        isSystem: true,
        isActive: true,
      });
    }

    const username = 'admin';
    const password = 'AdminPassword123!';
    const email = 'admin@example.com'; // Note: matching the placeholder in UI

    let adminUser = await User.findOne({ email });
    if (!adminUser) {
      // Also check by username just in case
      adminUser = await User.findOne({ username });
    }

    if (!adminUser) {
      adminUser = await User.create({
        fullName: 'System Admin',
        username,
        email,
        password,
        role: adminRole._id,
        accountStatus: 'active',
      });
      logger.info('✅ Default Admin user created.');
    } else {
      // If admin exists but lacks proper role (e.g. from an old seed or manual tweak)
      if (adminUser.role?.toString() !== adminRole._id.toString()) {
        adminUser.role = adminRole._id;
        await adminUser.save();
        logger.info('✅ Admin user role fixed/updated.');
      }
    }
  } catch (error) {
    logger.error('❌ Error seeding admin user:', error);
  }
};
