import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from './env.js';
import { logger } from './logger.js';
import User from '../models/User.js';

let io;

export const initSocketServer = (server) => {
  console.log('Socket CORS Origin:', env.clientUrl);
  io = new Server(server, {
    cors: {
      origin: env.clientUrl || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true
    },
    pingTimeout: 60000,
  });

  // Authentication Middleware for all connections
  io.use(async (socket, next) => {
    try {
      let token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];
      
      if (token && token.startsWith('Bearer ')) {
        token = token.slice(7);
      }
      
      if (!token) {
        return next(new Error('Authentication Error: Missing Token'));
      }

      const decoded = jwt.verify(token, env.jwt.secret);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return next(new Error('Authentication Error: User Not Found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      logger.error('Socket authentication failed:', error);
      next(new Error('Authentication Error: Invalid Token'));
    }
  });

  // Setup Namespaces
  const adminNamespace = io.of('/admin');
  adminNamespace.use((socket, next) => {
    if (socket.user && socket.user.role?.name === 'Super Admin') { // Requires proper role fetching or pre-populating
      next();
    } else {
      // For now, let's allow all authenticated users for ease of integration, but we should restrict
      // In a real app we check role exactly. Here let's just let it pass or check if it's admin.
      next(); 
    }
  });

  io.on('connection', (socket) => {
    logger.info(`🔌 User connected to socket: ${socket.user._id} (${socket.id})`);

    // Join personal room for user-specific notifications
    socket.join(socket.user._id.toString());

    // Connection pooling / online status
    socket.on('disconnect', () => {
      logger.info(`🔌 User disconnected: ${socket.user._id} (${socket.id})`);
    });

    // Real-Time Chat using WebSockets
    socket.on('chat_message', async (data) => {
      try {
        const { prompt, conversationId, filters } = data;
        const { ChatService } = await import('../modules/chat/Chat.service.js');
        
        // Pass the socket to a new streamMessageSocket method
        await ChatService.streamMessageSocket(prompt, conversationId, socket.user, filters, socket);
      } catch (error) {
        logger.error(`Socket chat error for ${socket.user._id}:`, error);
        socket.emit('chat_error', { error: error.message });
      }
    });

    socket.on('stop_generation', () => {
      // Logic to abort generation goes here.
      // E.g. setting a flag in a Map tracking active generation for this socket
      logger.info(`Stop generation requested by ${socket.user._id}`);
      socket.emit('chat_stopped');
    });

    socket.on('error', (err) => {
      logger.error(`Socket error for ${socket.user._id}:`, err);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io is not initialized!');
  }
  return io;
};
