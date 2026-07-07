import { Router } from 'express';
import healthRoutes from './health.routes.js';
import authRoutes from './auth.routes.js';
import documentRoutes from '../modules/document-processing/Document.routes.js';
import knowledgeRoutes from '../modules/knowledge-engine/Knowledge.routes.js';
import searchRoutes from '../modules/search/Search.routes.js';
import aiRoutes from '../modules/ai/AI.routes.js';
import chatRoutes from '../modules/chat/Chat.routes.js';
import analyticsRoutes from '../modules/analytics/Analytics.routes.js';
import adminRoutes from '../modules/admin/Admin.routes.js';
import queryRoutes from '../modules/queries/Query.routes.js';
import faqRoutes from '../modules/knowledge/FAQ.routes.js';

const router = Router();

// Mount all feature routes
router.use('/health', healthRoutes); // old health route
router.use('/auth', authRoutes);
router.use('/documents', documentRoutes);
router.use('/knowledge/faqs', faqRoutes);
router.use('/knowledge', knowledgeRoutes);
router.use('/search', searchRoutes);
router.use('/ai', aiRoutes);
router.use('/chat', chatRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/admin', adminRoutes);
router.use('/queries', queryRoutes);

export default router;
