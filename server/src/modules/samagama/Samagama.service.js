import ApiError from '../../utils/ApiError.js';
import { env } from '../../config/env.js';

const getNestedValue = (value, paths) => {
  for (const path of paths) {
    const result = path.split('.').reduce((current, key) => current?.[key], value);
    if (result !== undefined && result !== null) return result;
  }

  return null;
};

const parsePoints = (profile) => {
  const points = getNestedValue(profile, [
    'spurtiPoints',
    'spurti_points',
    'points',
    'data.spurtiPoints',
    'data.spurti_points',
    'data.points',
    'user.spurtiPoints',
    'user.spurti_points',
    'user.points',
    'participant.spurtiPoints',
    'participant.spurti_points',
    'participant.points',
  ]);

  const numericPoints = Number(points);
  if (!Number.isFinite(numericPoints)) {
    throw ApiError.internal('Samagama profile response did not include a Spurti points value.');
  }

  return numericPoints;
};

const parseToken = (loginResponse) => {
  return getNestedValue(loginResponse, [
    'token',
    'accessToken',
    'access_token',
    'data.token',
    'data.accessToken',
    'data.access_token',
  ]);
};

export class SamagamaService {
  static async getSpurtiPoints(email, password) {
    if (!env.samagama.loginUrl || !env.samagama.profileUrl) {
      // Generate a unique, deterministic points value based on the email address
      let hash = 0;
      for (let i = 0; i < email.length; i++) {
        hash = email.charCodeAt(i) + ((hash << 5) - hash);
      }
      const points = Math.abs(hash % 900) + 100; // Deterministic value between 100 and 1000

      return {
        email,
        points,
        source: 'samagama (simulated)',
        syncedAt: new Date().toISOString(),
      };
    }

    const loginRes = await fetch(env.samagama.loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const loginPayload = await loginRes.json().catch(() => ({}));
    if (!loginRes.ok) {
      throw ApiError.unauthorized(loginPayload.message || 'Samagama login failed.');
    }

    const token = parseToken(loginPayload);
    if (!token) {
      throw ApiError.internal('Samagama login response did not include an access token.');
    }

    const profileRes = await fetch(env.samagama.profileUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    const profilePayload = await profileRes.json().catch(() => ({}));
    if (!profileRes.ok) {
      throw ApiError.internal(profilePayload.message || 'Unable to retrieve Samagama profile.');
    }

    return {
      email,
      points: parsePoints(profilePayload),
      source: 'samagama',
      syncedAt: new Date().toISOString(),
    };
  }
}
