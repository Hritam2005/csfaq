import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { AdminService } from './Admin.service.js';
import User from '../../models/User.js';
import Role from '../../models/Role.js';
import FAQ from '../../models/FAQ.js';
import Query from '../queries/Query.model.js';
import AuditLog from '../../models/AuditLog.js';
import { Backup, FeatureFlag } from './Admin.model.js';
import Redemption from '../../models/Redemption.js';

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

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password').populate('role', 'name');
  res.status(200).json(ApiResponse.success({ users, totalPages: 1 }, 'Users retrieved'));
});

export const getRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find().populate('permissions', 'name');
  res.status(200).json(ApiResponse.success(roles, 'Roles retrieved'));
});

export const getStats = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    totalUsers,
    activeUsers,
    newUsersThisWeek,
    totalRoles,
    totalFaqs,
    publishedFaqs,
    pendingFaqs,
    totalQueries,
    pendingQueries,
    resolvedQueries,
    failedAuditEvents,
    enabledFeatures,
    latestBackup,
    recentUsers,
    recentQueries,
    recentBackups,
    recentAudits,
  ] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ accountStatus: 'active' }),
    User.countDocuments({ createdAt: { $gte: since } }),
    Role.countDocuments(),
    FAQ.countDocuments(),
    FAQ.countDocuments({ approvalStatus: 'approved' }),
    FAQ.countDocuments({ approvalStatus: 'pending_review' }),
    Query.countDocuments(),
    Query.countDocuments({ status: { $regex: /^pending$/i } }),
    Query.countDocuments({ status: { $regex: /^resolved$/i } }),
    AuditLog.countDocuments({ status: { $in: ['failure', 'warning'] }, createdAt: { $gte: since } }),
    FeatureFlag.countDocuments({ isEnabled: true }),
    Backup.findOne().sort({ createdAt: -1 }).select('type status createdAt completedAt sizeBytes').lean(),
    User.find().sort({ createdAt: -1 }).limit(2).select('fullName email createdAt').lean(),
    Query.find().sort({ createdAt: -1 }).limit(3).select('question status createdAt').populate('user', 'fullName email').lean(),
    Backup.find().sort({ createdAt: -1 }).limit(2).select('type status createdAt').lean(),
    AuditLog.find().sort({ createdAt: -1 }).limit(3).select('action resource status createdAt').lean(),
  ]);

  const recentActivity = [
    ...recentUsers.map((user) => ({
      _id: `user-${user._id}`,
      type: 'bookmark',
      title: 'New user registered',
      description: user.fullName || user.email,
      timestamp: user.createdAt,
    })),
    ...recentQueries.map((query) => ({
      _id: `query-${query._id}`,
      type: 'conversation',
      title: `Query ${query.status}`,
      description: query.question,
      timestamp: query.createdAt,
    })),
    ...recentBackups.map((backup) => ({
      _id: `backup-${backup._id}`,
      type: 'download',
      title: `${backup.type} backup ${backup.status.toLowerCase()}`,
      description: 'Backup administration',
      timestamp: backup.createdAt,
    })),
    ...recentAudits.map((log) => ({
      _id: `audit-${log._id}`,
      type: log.status === 'success' ? 'search' : 'upload',
      title: log.action,
      description: log.resource || log.status,
      timestamp: log.createdAt,
    })),
  ]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 6);

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const usageData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    usageData.push({
      name: days[d.getDay()],
      queries: 0,
      tokens: 0,
      date: d,
    });
  }

  const allRecentQueriesForStats = await Query.find({ createdAt: { $gte: usageData[0].date } }).select('createdAt').lean();
  allRecentQueriesForStats.forEach(q => {
    const qDate = new Date(q.createdAt);
    const dayData = usageData.find(d =>
      d.date.getFullYear() === qDate.getFullYear() &&
      d.date.getMonth() === qDate.getMonth() &&
      d.date.getDate() === qDate.getDate()
    );
    if (dayData) {
      dayData.queries += 1;
      dayData.tokens += 120 + Math.floor(Math.random() * 50); // Simulate token usage based on queries
    }
  });

  const finalUsageData = usageData.map(d => ({ name: d.name, queries: d.queries, tokens: d.tokens }));

  res.status(200).json(ApiResponse.success({
    totalUsers,
    activeUsers,
    newUsersThisWeek,
    totalRoles,
    totalFaqs,
    publishedFaqs,
    pendingFaqs,
    totalQueries,
    pendingQueries,
    resolvedQueries,
    failedAuditEvents,
    enabledFeatures,
    latestBackup,
    recentActivity,
    usageData: finalUsageData,
  }, 'Dashboard stats retrieved'));
});

export const getRedemptions = asyncHandler(async (req, res) => {
  const redemptions = await Redemption.find()
    .populate('user', 'fullName email')
    .sort({ redeemedAt: -1 });

  res.status(200).json(ApiResponse.success(redemptions, 'Redemptions retrieved successfully'));
});
