import ApiResponse from '../utils/ApiResponse.js';
import mongoose from 'mongoose';
import asyncHandler from '../utils/asyncHandler.js';

/**
 * Basic health check for load balancers.
 */
export const checkHealth = asyncHandler(async (req, res) => {
  return res.status(200).json(ApiResponse.success({ status: 'OK' }, 'Server is healthy'));
});

/**
 * Liveness check (checks if the container/process is running).
 */
export const checkLive = asyncHandler(async (req, res) => {
  return res.status(200).json(ApiResponse.success({
    uptime: process.uptime(),
    timestamp: Date.now(),
  }, 'Server is alive'));
});

/**
 * Readiness check (checks if dependencies like DB are connected).
 */
export const checkReady = asyncHandler(async (req, res) => {
  const isDbConnected = mongoose.connection.readyState === 1;
  
  if (isDbConnected) {
    return res.status(200).json(ApiResponse.success({ db: 'connected' }, 'Server is ready to accept traffic'));
  } else {
    return res.status(503).json(ApiResponse.error('Service Unavailable', 503, ['Database not connected']));
  }
});
