import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import crypto from 'crypto';

/**
 * Generate a short-lived access token
 */
export const generateAccessToken = (userId, roleId, extra = {}) => {
  const payload = typeof userId === 'object' ? userId : { userId, roleId, ...extra };
  return jwt.sign(
    payload,
    env.jwt.secret,
    { expiresIn: '30d' }
  );
};

/**
 * Generate a cryptographically secure opaque refresh token string
 */
export const generateRefreshTokenString = () => {
  return crypto.randomBytes(40).toString('hex');
};

/**
 * Verify access token
 */
export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.jwt.secret);
};

export default { generateAccessToken, generateRefreshTokenString, verifyAccessToken };
