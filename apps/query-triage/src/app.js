import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import { env } from './config/env.js';
import { logStream } from './config/logger.js';
import { errorHandler } from './middlewares/error.middleware.js';
import { notFound } from './middlewares/notFound.middleware.js';
import { globalLimiter } from './middlewares/rateLimiter.middleware.js';
import routes from './routes/index.js';

const app = express();

// Security Middlewares
app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  })
);
app.use(globalLimiter);

// Core Middlewares
app.use(express.json({ limit: env.uploadLimit }));
app.use(express.urlencoded({ extended: true, limit: env.uploadLimit }));
app.use(cookieParser());
app.use(compression());
app.use(morgan('combined', { stream: logStream }));

// Routes
app.use('/api/v1', routes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;