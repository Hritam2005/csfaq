/**
 * Cross-database authentication helper.
 *
 * Why this file exists
 * --------------------
 * The `csfaq` platform is being split into multiple microservices, one of
 * which is the `query-triage` app (`apps/query-triage`). For now each app
 * uses its own MongoDB database:
 *   - main server → `csfaq_main`     (collection: users)
 *   - triage app  → `csfaq_triage`   (collection: users)
 *
 * The frontend login form POSTs to `/api/auth/login` on the main server,
 * which only looks at `csfaq_main.users`. This means users created by the
 * triage seed script (Diana, Evan, Alice, Bryan, Carla, …) cannot log in
 * via the main app.
 *
 * To bridge the two worlds without doing a destructive schema merge, this
 * helper:
 *   1. Opens a small, lazy, cached connection to the triage database.
 *   2. Looks up a user by email in `csfaq_triage.users` (returning the raw
 *      document including the bcrypt-hashed password).
 *   3. Lets the caller compare the password with `bcrypt.compare`.
 *
 * The actual login flow (creating a local mirror user, issuing the JWT, …)
 * lives in `auth.service.js`.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';

let triageConnection = null;
let lastConnectAttempt = 0;
const RETRY_INTERVAL_MS = 30 * 1000; // retry at most once per 30s on failure

/**
 * Lazily connect to the triage MongoDB database. Returns the cached
 * connection if it is already alive, otherwise opens a new one.
 *
 * We never throw on failure – callers must treat a null return value as
 * "triage DB not reachable" and continue without it (the main user lookup
 * will still work).
 */
async function getTriageConnection() {
  if (!env.triageMongoUri) return null;

  // Healthy cached connection
  if (triageConnection && triageConnection.readyState === 1) {
    return triageConnection;
  }

  // Don't hammer Mongo with reconnect attempts if it just failed
  if (
    triageConnection &&
    [2, 3].includes(triageConnection.readyState) &&
    Date.now() - lastConnectAttempt < RETRY_INTERVAL_MS
  ) {
    return null;
  }

  try {
    lastConnectAttempt = Date.now();
    // Use the existing mongoose connection as the "main" conn and add a
    // secondary connection just for the triage DB.
    triageConnection = mongoose.createConnection(env.triageMongoUri, {
      dbName: env.triageDbName,
      serverSelectionTimeoutMS: 3000,
    });

    triageConnection.on('connected', () => {
      // eslint-disable-next-line no-console
      console.log(`✅ [auth] Connected to triage DB (${env.triageDbName}) for cross-DB login`);
    });
    triageConnection.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.warn(`⚠️  [auth] Triage DB connection error: ${err.message}`);
    });
    triageConnection.on('disconnected', () => {
      // eslint-disable-next-line no-console
      console.warn('⚠️  [auth] Triage DB disconnected');
    });

    // Wait briefly for the initial handshake so the first lookup doesn't
    // race against the connection.
    await new Promise((resolve, reject) => {
      const onReady = () => {
        cleanup();
        resolve();
      };
      const onError = (err) => {
        cleanup();
        reject(err);
      };
      const cleanup = () => {
        triageConnection.off('connected', onReady);
        triageConnection.off('error', onError);
      };
      triageConnection.once('connected', onReady);
      triageConnection.once('error', onError);
    });

    return triageConnection;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`⚠️  [auth] Could not connect to triage DB: ${err.message}`);
    triageConnection = null;
    return null;
  }
}

/**
 * Look up a user in the triage database by email. Returns the raw
 * document (including the bcrypt-hashed `password` field) or null if the
 * user does not exist there or the DB is unreachable.
 */
export async function findTriageUserByEmail(email) {
  if (!email) return null;
  const conn = await getTriageConnection();
  if (!conn) return null;
  try {
    const user = await conn
      .db.collection('users')
      .findOne({ email: String(email).toLowerCase() });
    return user;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn(`⚠️  [auth] Triage user lookup failed: ${err.message}`);
    return null;
  }
}

/**
 * Verify a candidate password against the triage user's bcrypt hash.
 */
export async function verifyTriagePassword(triageUser, candidatePassword) {
  if (!triageUser || !triageUser.password) return false;
  try {
    return await bcrypt.compare(candidatePassword, triageUser.password);
  } catch {
    return false;
  }
}

/**
 * Translate a triage role string ("admin" / "user") into the role *name*
 * expected by the main server's Role collection.
 */
export function triageRoleToMainRoleName(role) {
  const r = String(role || '').toLowerCase();
  if (r === 'admin' || r === 'resolver') return 'System Administrator';
  return 'Registered User';
}