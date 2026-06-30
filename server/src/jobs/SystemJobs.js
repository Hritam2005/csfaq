import { createQueue, createWorker } from '../config/queue.js';
import { logger } from '../config/logger.js';

// Define Queues
export const emailQueue = createQueue('email-notifications');
export const cleanupQueue = createQueue('system-cleanup');
export const backupQueue = createQueue('system-backup');
export const analyticsQueue = createQueue('system-analytics');

export const initializeSystemJobs = () => {
  // 1. Email Notifications Worker
  createWorker('email-notifications', async (job) => {
    logger.info(`📧 Processing email job ${job.id} for ${job.data.to}`);
    // Simulated Email Sending
    await new Promise((resolve) => setTimeout(resolve, 1000));
    logger.info(`✅ Email sent to ${job.data.to}`);
  }, 2); // concurrency 2

  // 2. System Cleanup Worker
  createWorker('system-cleanup', async (job) => {
    logger.info(`🧹 Running system cleanup: ${job.data.type}`);
    // Simulate cleanup logic (e.g. deleting old tmp files, orphaned documents)
    await new Promise((resolve) => setTimeout(resolve, 2000));
    logger.info(`✅ Cleanup completed`);
  });

  // 3. System Backup Worker
  createWorker('system-backup', async (job) => {
    logger.info(`💾 Starting database backup for environment: ${job.data.env}`);
    // Simulate backup dump to cloud storage
    await new Promise((resolve) => setTimeout(resolve, 5000));
    logger.info(`✅ Backup completed successfully`);
  });

  // 4. Analytics Aggregation Worker
  createWorker('system-analytics', async (job) => {
    logger.info(`📊 Aggregating analytics data for period: ${job.data.period}`);
    // Simulate aggregation logic (crunching queries)
    await new Promise((resolve) => setTimeout(resolve, 3000));
    logger.info(`✅ Analytics aggregation completed`);
  });

  logger.info('✅ System background job handlers registered');
};
