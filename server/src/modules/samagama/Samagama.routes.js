import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { authLimiter } from '../../middlewares/rateLimiter.middleware.js';
import {
  syncSpurtiPoints,
  createRedemption,
  getMyRedemptions,
  useRedemption,
  resetSpurtiPoints,
} from './Samagama.controller.js';

const router = Router();

// Apply auth to all samagama routes
router.use(authenticate);

router.post('/spurti-points/sync', authLimiter, syncSpurtiPoints);
router.post('/spurti-points/reset', resetSpurtiPoints);
router.post('/redemptions', createRedemption);
router.get('/redemptions', getMyRedemptions);
router.patch('/redemptions/:id/use', useRedemption);

export default router;
