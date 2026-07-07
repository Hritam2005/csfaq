import express from 'express';
import path from 'path';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import { env } from './config/env.js';
import { logStream } from './config/logger.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { notFound } from './middlewares/notFound.middleware.js';
import { globalLimiter } from './middlewares/rateLimiter.middleware.js';
import { setupSwagger } from './config/swagger.js';
import routes from './routes/index.js';

const app = express();

// =============================================================================
// Security Middlewares
// =============================================================================
app.use(helmet()); // Set secure HTTP headers
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true, // Allow cookies to be sent
  })
);
app.use(globalLimiter); // Apply rate limiting
// app.use(mongoSanitize()); // Disabled due to Express compatibility bug with getters
// app.use(xss()); // Disabled due to Express compatibility bug with getters

// =============================================================================
// Core Middlewares
// =============================================================================
app.use(express.json({ limit: env.uploadLimit })); // Parse JSON payloads
app.use(express.urlencoded({ extended: true, limit: env.uploadLimit }));
app.use(cookieParser()); // Parse cookies
app.use(compression()); // Gzip compression
app.use(morgan('combined', { stream: logStream })); // HTTP request logging

// =============================================================================
// API Documentation
// =============================================================================
setupSwagger(app);

// =============================================================================
// Routes
// =============================================================================
import { bullBoardRouter } from './config/queue.js';

app.use('/admin/queues', bullBoardRouter);
app.use('/api/v1', routes);

// =============================================================================
// Error Handling
// =============================================================================
app.use(notFound); // Catch 404s
app.use(errorHandler); // Global error handler

export default app;
