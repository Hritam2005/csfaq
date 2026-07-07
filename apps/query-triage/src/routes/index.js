import { Router } from 'express';
import queryRoutes from '../modules/queries/Query.routes.js';
import adminRoutes from '../modules/admin/Admin.routes.js';
import healthRoutes from './health.routes.js';

const router = Router();

// Health check
router.use('/health', healthRoutes);

// Query submission routes (user-facing)
router.use('/queries', queryRoutes);

// Admin routes
router.use('/admin/queries', adminRoutes);

export default router;
