import { Router } from 'express';
import { chat, streamChat, getStatistics } from './AI.controller.js';
import { authenticate, requireRole } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/chat', chat);
router.post('/stream', streamChat);
router.get('/statistics', requireRole('Super Admin'), getStatistics);

export default router;
