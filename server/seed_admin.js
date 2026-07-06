import mongoose from 'mongoose';
import { connectDB } from './src/config/db.js';
import { seedAdmin } from './src/utils/seedAdmin.js';

const run = async () => {
  try {
    await connectDB();
    await seedAdmin();
    console.log('Seeding completed. You can safely exit.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin user:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
};

run();
