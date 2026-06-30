import { Metric, Alert } from '../Analytics.model.js';
import { AIAnalyticsLog } from '../../ai/AI.model.js';

export class ReportGenerator {
  /**
   * Aggregates a comprehensive JSON report for the admin dashboard.
   */
  static async generateDashboardReport(days = 7) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const [alerts, aiStats, systemMetrics] = await Promise.all([
      // 1. Fetch unresolved alerts
      Alert.find({ resolved: false }).sort({ severity: -1, createdAt: -1 }).limit(20),
      
      // 2. Fetch AI Token/Cost Aggregation
      AIAnalyticsLog.aggregate([
        { $match: { createdAt: { $gte: cutoff } } },
        {
          $group: {
            _id: '$provider',
            totalTokens: { $sum: '$totalTokens' },
            totalCost: { $sum: '$costUsd' },
            avgLatency: { $avg: '$latencyMs' },
            requests: { $sum: 1 },
          }
        }
      ]),

      // 3. System Metrics Trend
      Metric.aggregate([
        { $match: { type: 'system', name: 'memory_usage', timestamp: { $gte: cutoff } } },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$timestamp" } },
            avgMemory: { $avg: '$value' },
            maxMemory: { $max: '$value' }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    return {
      period: `${days} days`,
      generatedAt: new Date(),
      alerts,
      aiStats,
      systemMetrics
    };
  }
}
