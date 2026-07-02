import { Router } from 'express';
import { 
  submitQuery, 
  getMyQueries, 
  getQueryById, 
  requestHuman,
  closeCase 
} from './Query.controller.js';
import { authenticate } from '../../middlewares/auth.middleware.js';
import { querySubmissionLimiter } from '../../middlewares/rateLimiter.middleware.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/queries
 * @desc    Submit a new query
 * @access  Private (authenticated users)
 */
router.post('/', querySubmissionLimiter, submitQuery);

/**
 * @route   GET /api/v1/queries/my-queries
 * @desc    Get current user's queries
 * @access  Private
 */
router.get('/my-queries', getMyQueries);

/**
 * @route   GET /api/v1/queries/:id
 * @desc    Get query details
 * @access  Private (owner or admin)
 */
router.get('/:id', getQueryById);

/**
 * @route   POST /api/v1/queries/:id/request-human
 * @desc    Request human intervention for a query
 * @access  Private (owner)
 */
router.post('/:id/request-human', requestHuman);

/**
 * @route   POST /api/v1/queries/:id/close
 * @desc    Close a resolved/answered query
 * @access  Private (owner)
 */
router.post('/:id/close', closeCase);

export default router;
