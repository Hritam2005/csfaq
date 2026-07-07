import { Router } from 'express';
import {
  getConfigs,
  updateConfig,
  getFeatureFlags,
  toggleFeature,
  getBackups,
  createBackup,
  getAuditLogs,
  getUsers,
  getRoles,
  getStats,
  getRedemptions,
  deleteUser,
  suspendUser
} from './Admin.controller.js';
import { authenticate, requireRole } from '../../middlewares/auth.middleware.js';

const router = Router();

// Strict Security Barrier: All admin routes absolutely require Super Admin role
router.use(authenticate, requireRole('Super Admin'));

// System Configuration
router.get('/config', getConfigs);
router.put('/config', updateConfig);

// Feature Flags
router.get('/features', getFeatureFlags);
router.put('/features/:name', toggleFeature);

// Backups & Disaster Recovery
router.get('/backups', getBackups);
router.post('/backups', createBackup);

// Audit & Security Logs
router.get('/logs/audit', getAuditLogs);

// Users and Roles
router.get('/users', getUsers);
router.delete('/users/:userId', deleteUser);
router.put('/users/:userId/suspend', suspendUser);
router.get('/roles', getRoles);
router.get('/stats', getStats);
router.get('/redemptions', getRedemptions);

export default router;
