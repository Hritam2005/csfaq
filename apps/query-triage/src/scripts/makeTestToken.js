// Generate a JWT for testing the query-triage microservice from the CLI.
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../../.env') });

(async () => {
  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      console.error('NO_MONGO_URI');
      process.exit(1);
    }

    await mongoose.connect(uri, { serverSelectionTimeoutMS: 8000 });

    const admin = await mongoose.connection.db.collection('users').findOne({
      role: 'admin',
      demo: true,
    });

    if (!admin) {
      console.error('NO_ADMIN_FOUND');
      await mongoose.disconnect();
      process.exit(2);
    }

    const token = jwt.sign(
      {
        userId: String(admin._id),
        role: 'Admin',
        name: admin.name,
        email: admin.email,
      },
      process.env.JWT_ACCESS_SECRET || 'ytest_secret',
      { expiresIn: '4h' }
    );

    console.log('ADMIN_ID=' + String(admin._id));
    console.log('ADMIN_NAME=' + admin.name);
    console.log('TOKEN=' + token);

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('ERROR:', err && err.message ? err.message : err);
    try { await mongoose.disconnect(); } catch {}
    process.exit(99);
  }
})();