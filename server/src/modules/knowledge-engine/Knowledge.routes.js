import { Router } from 'express';
import { getStatistics, clearCache, getConfidence } from './Knowledge.controller.js';
import { authenticate, requireRole } from '../../middlewares/auth.middleware.js';

const router = Router();

// Apply auth middleware
router.use(authenticate);

/**
 * @swagger
 * /knowledge/statistics:
 *   get:
 *     summary: Get overall knowledge base statistics
 *     tags: [Knowledge]
 */
router.get('/statistics', getStatistics);

/**
 * @swagger
 * /knowledge/cache/clear:
 *   post:
 *     summary: Clear the embedding cache
 *     tags: [Knowledge]
 */
router.post('/cache/clear', requireRole('Super Admin'), clearCache);

/**
 * @swagger
 * /knowledge/confidence:
 *   post:
 *     summary: Calculate confidence score
 *     tags: [Knowledge]
 */
router.post('/confidence', getConfidence);

export default router;
