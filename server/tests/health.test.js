import request from 'supertest';
import app from '../src/app.js';
import mongoose from 'mongoose';

import { jest } from '@jest/globals';

// Tests will reflect the actual disconnected state of the DB (0)

describe('Health APIs', () => {
  
  describe('GET /api/v1/health', () => {
    it('should return 200 OK and healthy status', async () => {
      const res = await request(app).get('/api/v1/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('OK');
    });
  });

  describe('GET /api/v1/health/live', () => {
    it('should return 200 OK with uptime', async () => {
      const res = await request(app).get('/api/v1/health/live');
      expect(res.statusCode).toEqual(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('uptime');
      expect(res.body.data).toHaveProperty('timestamp');
    });
  });

  describe('GET /api/v1/health/ready', () => {
    it('should return 503 since DB is actually disconnected in tests', async () => {
      const res = await request(app).get('/api/v1/health/ready');
      expect(res.statusCode).toEqual(503);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Service Unavailable');
    });
  });

  describe('404 Not Found', () => {
    it('should return 404 for unknown routes', async () => {
      const res = await request(app).get('/api/v1/unknown-route');
      expect(res.statusCode).toEqual(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Route Not Found');
    });
  });

});
