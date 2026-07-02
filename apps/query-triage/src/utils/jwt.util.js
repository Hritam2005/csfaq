import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import crypto from 'crypto';

/**
 * Generate a short-lived access token
 */
export const generateAccessToken = (userId, roleId) => {
  return jwt.sign(
    { userId, roleId },
    env.jwt.secret,
    { expiresIn: '15m' }
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
