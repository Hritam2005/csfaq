import { validationResult } from 'express-validator';
import ApiError from '../utils/ApiError.js';

/**
 * Middleware that executes express-validator rules and throws an ApiError if validation fails
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map((err) => err.msg);
    return next(ApiError.validationError(extractedErrors));
  }
  next();
};
