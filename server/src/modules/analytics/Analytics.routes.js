import { Router } from 'express';
import { getHealth, getDashboard, getAlerts, resolveAlert } from './Analytics.controller.js';
import { authenticate, requireRole } from '../../middlewares/auth.middleware.js';

const router = Router();

// Publicly exposed health check (ping)
router.get('/health', getHealth);

// Admin Observability endpoints
router.use(authenticate, requireRole('Super Admin'));

router.get('/dashboard', getDashboard);
router.get('/alerts', getAlerts);
router.put('/alerts/:id/resolve', resolveAlert);

export default router;
