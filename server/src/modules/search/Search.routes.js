import { Router } from 'express';
import { searchHybrid, autocomplete, getTrending, getKnowledgeGaps } from './Search.controller.js';
import { authenticate, requireRole } from '../../middlewares/auth.middleware.js';

const router = Router();

// Publicly available (or minimally authenticated) endpoints
router.get('/', searchHybrid);
router.get('/autocomplete', autocomplete);
router.get('/trending', getTrending);

// Admin / Analytics Endpoints
router.get('/gaps', authenticate, requireRole('Super Admin', 'Knowledge Admin'), getKnowledgeGaps);

export default router;
