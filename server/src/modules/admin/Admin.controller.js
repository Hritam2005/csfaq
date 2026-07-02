import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { AdminService } from './Admin.service.js';

export const getConfigs = asyncHandler(async (req, res) => {
  const configs = await AdminService.getConfigs();
  res.status(200).json(ApiResponse.success(configs, 'Configurations retrieved'));
});

export const updateConfig = asyncHandler(async (req, res) => {
  const { key, value } = req.body;
  const config = await AdminService.updateConfig(key, value, req.user);
  res.status(200).json(ApiResponse.success(config, 'Configuration updated'));
});

export const getFeatureFlags = asyncHandler(async (req, res) => {
  const flags = await AdminService.getFeatureFlags();
  res.status(200).json(ApiResponse.success(flags, 'Feature flags retrieved'));
});

export const toggleFeature = asyncHandler(async (req, res) => {
  const { isEnabled } = req.body;
  const flag = await AdminService.toggleFeatureFlag(req.params.name, isEnabled, req.user);
  res.status(200).json(ApiResponse.success(flag, 'Feature flag toggled'));
});

export const getBackups = asyncHandler(async (req, res) => {
  const backups = await AdminService.getBackups();
  res.status(200).json(ApiResponse.success(backups, 'Backups retrieved'));
});

export const createBackup = asyncHandler(async (req, res) => {
  const { type } = req.body;
  const backup = await AdminService.createBackup(type, req.user);
  res.status(202).json(ApiResponse.success(backup, 'Backup initiated'));
});

export const getAuditLogs = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const logs = await AdminService.getAuditLogs(page, 50);
  res.status(200).json(ApiResponse.success(logs, 'Audit logs retrieved'));
});

import User from '../../models/User.js';
import Role from '../../models/Role.js';
import Query from '../queries/Query.model.js';

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').populate('role', 'name');
  res.status(200).json(ApiResponse.success({ users, totalPages: 1 }, 'Users retrieved'));
});

export const getRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find().populate('permissions', 'name');
  res.status(200).json(ApiResponse.success(roles, 'Roles retrieved'));
});

export const getStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const activeUsers = await User.countDocuments({ accountStatus: 'active' });
  const totalRoles = await Role.countDocuments();
  
  const totalQueries = await Query.countDocuments();
  const pendingQueries = await Query.countDocuments({ status: 'Pending' });
  const resolvedQueries = await Query.countDocuments({ status: 'Resolved' });
  const dismissedQueries = await Query.countDocuments({ status: 'Dismissed' });
  const criticalQueries = await Query.countDocuments({ isCritical: true });
  const pendingCriticalQueries = await Query.countDocuments({ isCritical: true, status: 'Pending' });
  
  const criticalQueriesList = await Query.find({ isCritical: true })
    .populate('user', 'fullName email')
    .sort({ createdAt: -1 });

  // Custom sort: Pending first, then Resolved, then Dismissed
  const statusOrder = { 'Pending': 1, 'Resolved': 2, 'Dismissed': 3 };
  const topCriticalQueries = criticalQueriesList
    .sort((a, b) => (statusOrder[a.status] || 99) - (statusOrder[b.status] || 99))
    .slice(0, 5);

  res.status(200).json(ApiResponse.success({
    totalUsers,
    activeUsers,
    totalRoles,
    queryStats: {
      total: totalQueries,
      pending: pendingQueries,
      resolved: resolvedQueries,
      dismissed: dismissedQueries,
      critical: criticalQueries,
      pendingCritical: pendingCriticalQueries
    },
    mostCriticalQueries: topCriticalQueries
  }, 'Dashboard stats retrieved'));
});
