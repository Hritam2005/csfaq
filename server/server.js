import dns from "node:dns";

dns.setServers(["8.8.8.8", "8.8.4.4"]);

console.log("After override:", dns.getServers());
import app from './src/app.js';
import { env } from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import { logger } from './src/config/logger.js';
import { initializeDocumentJobs } from './src/modules/document-processing/Document.jobs.js';
import { initializeDocumentCronJobs } from './src/modules/document-processing/Document.cron.js';
import { initializeKnowledgeJobs } from './src/modules/knowledge-engine/Knowledge.jobs.js';
import { initializeSystemJobs } from './src/jobs/SystemJobs.js';

import http from 'http';
import { initSocketServer } from './src/config/socket.js';

let server;
let io;

// Application Bootstrap
const startServer = async () => {
  try {
    logger.info('🚀 Starting AI Knowledge Hub Backend...');
    
    // Connect to Database
    await connectDB();

    // Auto-seed admin user if it doesn't exist
    const { seedAdmin } = await import('./src/utils/seedAdmin.js');
    await seedAdmin();

    // Initialize Background Jobs
    initializeDocumentJobs();
    initializeDocumentCronJobs();
    initializeKnowledgeJobs();
    initializeSystemJobs();

    // Create HTTP Server
    server = http.createServer(app);

    // Initialize Socket.IO
    io = initSocketServer(server);

    // Start Express Server via HTTP Server
    server.listen(env.port, () => {
      logger.info(`✅ Server running in ${env.nodeEnv} mode on port ${env.port}`);
      logger.info(`📖 Swagger Docs available at http://localhost:${env.port}/api-docs`);
    });

  } catch (error) {
    logger.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// =============================================================================
// Graceful Shutdown Handlers
// =============================================================================
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('🛑 Server closed gracefully.');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error('💥 UNEXPECTED ERROR:', error);
  exitHandler();
};

// Catch unhandled rejections (e.g., failed database connection promises)
process.on('unhandledRejection', unexpectedErrorHandler);

// Catch uncaught exceptions (e.g., undefined variable access)
process.on('uncaughtException', unexpectedErrorHandler);

// Catch termination signals (Ctrl+C, Docker stop)
process.on('SIGTERM', () => {
  logger.info('⚠️ SIGTERM received');
  if (server) {
    server.close();
  }
});
