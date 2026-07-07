import { Router } from 'express';
import {
  listFaqs,
  getPopularFaqs,
  getFaq,
  submitFaqFeedback,
  listCategories,
  createFaq,
  updateFaq,
  deleteFaq,
  publishFaq,
  listAllFaqsAdmin,
} from './FAQ.controller.js';
import { authenticate, requireRole } from '../../middlewares/auth.middleware.js';

const router = Router();
const adminRoles = ['Super Admin', 'Knowledge Admin', 'System Administrator', 'Admin'];

// Public knowledge base endpoints
router.get('/categories', listCategories);
router.get('/popular', getPopularFaqs);
router.get(
  '/admin/all',
  authenticate,
  requireRole(...adminRoles),
  listAllFaqsAdmin
);
router.get('/', listFaqs);
router.get('/:id', getFaq);
router.post('/:id/feedback', submitFaqFeedback);

// Admin knowledge management
router.post('/', authenticate, requireRole(...adminRoles), createFaq);
router.put('/:id/publish', authenticate, requireRole(...adminRoles), publishFaq);
router.put('/:id', authenticate, requireRole(...adminRoles), updateFaq);
router.delete('/:id', authenticate, requireRole(...adminRoles), deleteFaq);

export default router;
