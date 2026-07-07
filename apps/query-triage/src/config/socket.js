import { Server } from 'socket.io';
import { env } from './env.js';
import { logger } from './logger.js';

let io;

export const initSocketServer = (server) => {
  io = new Server(server, {
    cors: {
      origin: env.clientUrl,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    logger.info(`🔌 Client connected: ${socket.id}`);

    // Join program-specific rooms for targeted notifications
    socket.on('join:program', (programId) => {
      socket.join(`program:${programId}`);
      logger.debug(`Socket ${socket.id} joined program room: ${programId}`);
    });

    // Join user-specific room for personal notifications
    socket.on('join:user', (userId) => {
      socket.join(`user:${userId}`);
      logger.debug(`Socket ${socket.id} joined user room: ${userId}`);
    });

    // Admin resolver room
    socket.on('join:resolver', (resolverId) => {
      socket.join(`resolver:${resolverId}`);
      logger.debug(`Socket ${socket.id} joined resolver room: ${resolverId}`);
    });

    socket.on('disconnect', () => {
      logger.info(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

export const emitToProgram = (programId, event, data) => {
  if (io) {
    io.to(`program:${programId}`).emit(event, data);
  }
};

export const emitToResolver = (resolverId, event, data) => {
  if (io) {
    io.to(`resolver:${resolverId}`).emit(event, data);
  }
};

export const emitToAllResolvers = (event, data) => {
  if (io) {
    io.to('resolver:all').emit(event, data);
  }
};

export default { initSocketServer, getIO, emitToUser, emitToProgram, emitToResolver, emitToAllResolvers };
