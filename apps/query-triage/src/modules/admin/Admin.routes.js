import { Router } from 'express';
import { 
  getAdminInbox,
  claimCase,
  unclaimCase,
  answerQuery,
  getIncidentDetails,
  getCapacityStats,
  getResolverWorkload,
  getAuditTrail,
} from './Admin.controller.js';
import { authenticate, requireRole } from '../../middlewares/auth.middleware.js';

const router = Router();

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(requireRole('Admin', 'Super Admin', 'Resolver'));

/**
 * @route   GET /api/v1/admin/queries/inbox
 * @desc    Get unified admin inbox
 * @access  Admin/Resolver
 */
router.get('/inbox', getAdminInbox);

/**
 * @route   POST /api/v1/admin/queries/:id/claim
 * @desc    Claim a case
 * @access  Admin/Resolver
 */
router.post('/:id/claim', claimCase);

/**
 * @route   POST /api/v1/admin/queries/:id/unclaim
 * @desc    Unclaim a case
 * @access  Admin/Resolver
 */
router.post('/:id/unclaim', unclaimCase);

/**
 * @route   POST /api/v1/admin/queries/:id/answer
 * @desc    Answer a query
 * @access  Admin/Resolver
 */
router.post('/:id/answer', answerQuery);

/**
 * @route   GET /api/v1/admin/queries/:id/incident
 * @desc    Get incident details with linked cases
 * @access  Admin/Resolver
 */
router.get('/:id/incident', getIncidentDetails);

/**
 * @route   GET /api/v1/admin/queries/:id/audit
 * @desc    Get audit trail for a query
 * @access  Admin/Resolver
 */
router.get('/:id/audit', getAuditTrail);

/**
 * @route   GET /api/v1/admin/queries/incident/:id
 * @desc    Get incident details (alternate route)
 * @access  Admin/Resolver
 */
router.get('/incident/:id', getIncidentDetails);

// Capacity management routes
/**
 * @route   GET /api/v1/admin/queries/capacity
 * @desc    Get system capacity status
 * @access  Admin/Resolver
 */
router.get('/capacity', getCapacityStats);

/**
 * @route   GET /api/v1/admin/queries/workload
 * @desc    Get resolver workload distribution
 * @access  Admin/Resolver
 */
router.get('/workload', getResolverWorkload);

export default router;