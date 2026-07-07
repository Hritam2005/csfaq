import { Router } from 'express';
import asyncHandler from '../utils/asyncHandler.js';
import ApiResponse from '../utils/ApiResponse.js';
import mongoose from 'mongoose';
import { env } from '../config/env.js';

const router = Router();

// Basic health check
router.get('/', asyncHandler(async (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(200).json(
    ApiResponse.success({
      service: 'query-triage',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      mongodb: mongoStatus,
    }, 'Service is healthy')
  );
}));

// Detailed health check
router.get('/detailed', asyncHandler(async (req, res) => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  const details = {
    service: 'query-triage',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    mongodb: {
      status: mongoStatus,
      host: mongoose.connection.host,
    },
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      unit: 'MB',
    },
    environment: env.nodeEnv,
  };

  const isHealthy = mongoStatus === 'connected';
  
  res.status(isHealthy ? 200 : 503).json(
    ApiResponse.success(details, isHealthy ? 'All systems operational' : 'Service degraded')
  );
}));

// Readiness check
router.get('/ready', asyncHandler(async (req, res) => {
  const mongoReady = mongoose.connection.readyState === 1;
  
  if (mongoReady) {
    res.status(200).json(ApiResponse.success({ ready: true }, 'Service ready'));
  } else {
    res.status(503).json(ApiResponse.error('Service not ready', 503));
  }
}));

// Liveness check
router.get('/live', (req, res) => {
  res.status(200).json(ApiResponse.success({ alive: true }, 'Service alive'));
});

export default router;
