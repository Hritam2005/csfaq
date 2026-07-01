import { connectDB } from './src/config/db.js';
import User from './src/models/User.js';
import Role from './src/models/Role.js';

connectDB().then(async () => {
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
    
    let adminUser = await User.findOne({ username });
    if (adminUser) {
      adminUser.password = password; 
      adminUser.role = adminRole._id;
      adminUser.accountStatus = 'active';
      adminUser.email = 'admin@example.com';
      await adminUser.save();
      console.log('Admin user updated.');
    } else {
      adminUser = await User.create({
        fullName: 'System Admin',
        username,
        email: 'admin@example.com',
        password,
        role: adminRole._id,
        accountStatus: 'active',
      });
      console.log('Admin user created.');
    }
    
    console.log(`Email: ${adminUser.email}`);
    console.log(`Password: ${password}`);
    
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
