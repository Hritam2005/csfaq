import { connectDB } from './src/config/db.js';
import { seedAdmin } from './src/utils/seedAdmin.js';

connectDB().then(async () => {
  try {
    await seedAdmin();
    console.log('Seeding completed. You can safely exit.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
});
