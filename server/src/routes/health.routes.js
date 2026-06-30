import { Router } from 'express';
import { checkHealth, checkLive, checkReady } from '../controllers/health.controller.js';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Basic health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is healthy
 */
router.get('/', checkHealth);

/**
 * @swagger
 * /health/live:
 *   get:
 *     summary: Liveness probe
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is alive
 */
router.get('/live', checkLive);

/**
 * @swagger
 * /health/ready:
 *   get:
 *     summary: Readiness probe
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server is ready
 *       503:
 *         description: Service unavailable
 */
router.get('/ready', checkReady);

export default router;
