import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import crypto from 'crypto';

/**
 * Generate a short-lived access token.
 *
 * Embeds everything the downstream microservices (notably the query-triage
 * microservice) need to authorise the request without re-querying the main
 * DB:
 *   - userId     : Mongo ObjectId of the user
 *   - roleId     : Mongo ObjectId of the user's role (kept for backward-compat)
 *   - roleName   : human-readable role name (e.g. "System Administrator")
 *   - fullName   : user's display name
 *   - email      : user's email address
 */
export const generateAccessToken = (user, roleId = null) => {
  // Accept either a full user document or just (userId, roleId) for safety
  const userId = user?._id ?? user;
  const resolvedRoleId = user?.role?._id ?? user?.role ?? roleId;
  const roleName = user?.role?.name || user?.roleName || 'Registered User';
  const fullName = user?.fullName || user?.name || null;
  const email = user?.email || null;

  return jwt.sign(
    { userId, roleId: resolvedRoleId, roleName, fullName, email },
    env.jwt.secret,
    { expiresIn: '7d' } // Extended for development
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