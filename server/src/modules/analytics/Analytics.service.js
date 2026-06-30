import { HealthMonitor } from './system/HealthMonitor.js';
import { ReportGenerator } from './reports/ReportGenerator.js';
import { Metric, Alert } from './Analytics.model.js';

export class AnalyticsService {
  static async getHealth() {
    return await HealthMonitor.checkHealth();
  }

  static async getDashboard() {
    return await ReportGenerator.generateDashboardReport(7); // Last 7 days by default
  }

  static async getActiveAlerts() {
    return await Alert.find({ resolved: false }).sort({ severity: -1, createdAt: -1 });
  }

  static async resolveAlert(alertId) {
    return await Alert.findByIdAndUpdate(
      alertId, 
      { resolved: true, resolvedAt: new Date() },
      { new: true }
    );
  }
}
