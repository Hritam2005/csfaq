import asyncHandler from '../../utils/asyncHandler.js';
import ApiResponse from '../../utils/ApiResponse.js';
import { AnalyticsService } from './Analytics.service.js';

export const getHealth = asyncHandler(async (req, res) => {
  const health = await AnalyticsService.getHealth();
  // Return 503 if system is down, else 200
  const statusCode = health.isHealthy ? 200 : 503;
  res.status(statusCode).json(ApiResponse.success(health, 'System health retrieved'));
});

export const getDashboard = asyncHandler(async (req, res) => {
  const dashboard = await AnalyticsService.getDashboard();
  res.status(200).json(ApiResponse.success(dashboard, 'Dashboard analytics retrieved'));
});

export const getAlerts = asyncHandler(async (req, res) => {
  const alerts = await AnalyticsService.getActiveAlerts();
  res.status(200).json(ApiResponse.success(alerts, 'Active alerts retrieved'));
});

export const resolveAlert = asyncHandler(async (req, res) => {
  const alert = await AnalyticsService.resolveAlert(req.params.id);
  res.status(200).json(ApiResponse.success(alert, 'Alert resolved successfully'));
});
