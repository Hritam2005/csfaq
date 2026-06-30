import mongoose from 'mongoose';
import ApiError from '../utils/ApiError.js';
import ApiResponse from '../utils/ApiResponse.js';
import { logger } from '../config/logger.js';
import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let error = err;

  // Convert non-ApiError instances into ApiError
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error ? 400 : 500;
    const message = error.message || 'Something went wrong';
    error = new ApiError(statusCode, message, [], false);
    // Preserve original stack
    if (err.stack) {
      error.stack = err.stack;
    }
  }

  // Mongoose duplicate key error (E11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = ApiError.conflict(`An account with that ${field} already exists.`);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((el) => el.message);
    error = ApiError.validationError(errors);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Invalid token. Please log in again.');
  }
  if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Your token has expired. Please log in again.');
  }

  // Logging based on operational status
  if (!error.isOperational) {
    logger.error('💥 PROGRAMMING OR UNKNOWN ERROR 💥');
    logger.error(error.stack);
  } else {
    // We don't need a full stack trace for operational errors (like bad password), just an info/warn log
    logger.warn(`Operational Error: [${error.statusCode}] ${error.message}`);
  }

  const response = {
    ...ApiResponse.error(error.message, error.statusCode, error.errors),
    ...(env.nodeEnv === 'development' && { stack: error.stack }), // Only show stack in dev
  };

  return res.status(error.statusCode).json(response);
};
