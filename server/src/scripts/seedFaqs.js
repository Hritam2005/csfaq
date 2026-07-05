import dns from 'node:dns';
dns.setServers(['8.8.8.8', '8.8.4.4']);

import { connectDB } from '../config/db.js';
import { seedFaqsInternal } from './seedFaqsInternal.js';

async function run() {
  try {
    await connectDB();
    await seedFaqsInternal();
    console.log('Seeding process complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding process failed:', error);
    process.exit(1);
  }
}

run();
