import rateLimit from 'express-rate-limit';
import ApiError from '../utils/ApiError.js';

/**
 * Global API rate limiter
 * Limits each IP to 100 requests per 15 minutes
 */
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  handler: (req, res, next) => {
    next(ApiError.tooManyRequests('Too many requests from this IP, please try again after 15 minutes.'));
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * Stricter rate limiter for sensitive routes (e.g., login, register, forgot password)
 * Limits each IP to 10 requests per 10 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 10,
  handler: (req, res, next) => {
    next(ApiError.tooManyRequests('Too many authentication attempts, please try again after 10 minutes.'));
  },
  standardHeaders: true,
  legacyHeaders: false,
});
