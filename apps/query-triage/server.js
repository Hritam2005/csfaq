import http from 'http';
import app from './src/app.js';
import { env } from './src/config/env.js';
import { connectDB } from './src/config/db.js';
import { logger } from './src/config/logger.js';
import { initSocketServer } from './src/config/socket.js';

let server;
let io;

// Application Bootstrap
const startServer = async () => {
  try {
    logger.info('Starting Query Triage Microservice...');
    
    // Connect to Database
    await connectDB();

    // Create HTTP Server
    server = http.createServer(app);

    // Initialize Socket.IO
    io = initSocketServer(server);

    // Start Express Server via HTTP Server
    server.listen(env.port, () => {
      logger.info(`Query Triage running in ${env.nodeEnv} mode on port ${env.port}`);
      logger.info(`Swagger Docs available at http://localhost:${env.port}/api-docs`);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful Shutdown Handlers
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed gracefully.');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error('UNEXPECTED ERROR:', error);
  exitHandler();
};

process.on('unhandledRejection', unexpectedErrorHandler);
process.on('uncaughtException', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (server) {
    server.close();
  }
});