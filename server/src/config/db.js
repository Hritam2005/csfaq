import mongoose from 'mongoose';
import { logger } from './logger.js';
import { env } from './env.js';

let mongoMemoryServer = null;

export const connectDB = async () => {
  try {
    logger.info(`Attempting to connect to MongoDB Atlas...`);
    // Set a fast timeout so we don't hang indefinitely on whitelisting issues
    const conn = await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 });
    logger.info(`✅ MongoDB Connected to Atlas: ${conn.connection.host}`);
  } catch (error) {
    logger.warn(`⚠️ Failed to connect to MongoDB Atlas: ${error.message}`);
    logger.info(`ℹ️ Spinning up local in-memory MongoDB fallback...`);
    
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongoMemoryServer = await MongoMemoryServer.create();
      const localUri = mongoMemoryServer.getUri();
      
      const conn = await mongoose.connect(localUri);
      logger.info(`✅ MongoDB Connected to Local In-Memory: ${conn.connection.host}`);
      
      logger.info(`ℹ️ Auto-seeding local in-memory database...`);
      const { seedFaqsInternal } = await import('../scripts/seedFaqsInternal.js');
      await seedFaqsInternal();
    } catch (fallbackError) {
      logger.error(`❌ Failed to start local in-memory MongoDB: ${fallbackError.message}`);
      process.exit(1);
    }
  }

  // Connection events
  mongoose.connection.on('disconnected', () => {
    logger.warn('⚠️ MongoDB Disconnected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error(`❌ MongoDB Error: ${err.message}`);
  });
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

