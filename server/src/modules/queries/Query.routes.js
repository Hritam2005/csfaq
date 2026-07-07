import express from 'express';
import { submitQuery, getMyQueries, getAllQueries, resolveQuery, deleteQuery } from './Query.controller.js';
import { authenticate, requireRole } from '../../middlewares/auth.middleware.js';

const router = express.Router();

router.use(authenticate); // All routes require authentication

router.post('/', submitQuery);
router.get('/my-queries', getMyQueries);

// Admin only routes
router.use(requireRole('Admin', 'Super Admin'));
router.get('/', getAllQueries);
router.patch('/:id/resolve', resolveQuery);
router.delete('/:id', deleteQuery);

export default router;
