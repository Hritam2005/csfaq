import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // limit each IP to 500 requests per windowMs
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const querySubmissionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 query submissions per minute
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many queries submitted, please slow down.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export default globalLimiter;
