import os from 'os';
import mongoose from 'mongoose';
import { AnalyticsCollector } from '../events/AnalyticsCollector.js';
import { METRIC_TYPES } from '../Analytics.constants.js';

export class HealthMonitor {
  /**
   * Compiles the comprehensive health status of the entire architecture.
   */
  static async checkHealth() {
    const status = {
      timestamp: new Date(),
      isHealthy: true,
      services: {},
      system: {}
    };

    // 1. Database Check
    try {
      const dbState = mongoose.connection.readyState;
      status.services.database = {
        status: dbState === 1 ? 'up' : 'down',
        state: dbState
      };
      if (dbState !== 1) status.isHealthy = false;
    } catch (e) {
      status.services.database = { status: 'down', error: e.message };
      status.isHealthy = false;
    }

    // 2. System Hardware (CPU/Memory)
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memUsagePct = ((totalMem - freeMem) / totalMem) * 100;

    status.system = {
      memoryUsagePercent: memUsagePct.toFixed(2),
      uptimeSeconds: process.uptime(),
      loadAverage: os.loadavg(),
    };

    if (memUsagePct > 90) status.isHealthy = false;

    // Background telemetry logging
    AnalyticsCollector.record(METRIC_TYPES.SYSTEM, 'memory_usage', memUsagePct);
    AnalyticsCollector.record(METRIC_TYPES.SYSTEM, 'db_connection_state', mongoose.connection.readyState);

    return status;
  }
}
