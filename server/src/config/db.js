import mongoose from 'mongoose';
import { logger } from './logger.js';
import { env } from './env.js';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(env.mongoUri);
    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Connection events
    mongoose.connection.on('disconnected', () => {
      logger.warn('⚠️ MongoDB Disconnected');
    });

    mongoose.connection.on('error', (err) => {
      logger.error(`❌ MongoDB Error: ${err.message}`);
    });

  } catch (error) {
    logger.error(`❌ Error Connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};
