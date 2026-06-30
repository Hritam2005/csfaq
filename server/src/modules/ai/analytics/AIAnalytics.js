import { AIAnalyticsLog } from '../AI.model.js';

export class AIAnalytics {
  /**
   * Tracks an AI response cycle to calculate cost, tokens, and latency.
   */
  static async logUsage(data) {
    // Standardize cost calculation based on provider/model
    let estimatedCost = 0;
    if (data.provider === 'openai' && data.model.includes('gpt-3.5')) {
      estimatedCost = (data.promptTokens * 0.0005 + data.completionTokens * 0.0015) / 1000;
    } else if (data.provider === 'openai' && data.model.includes('gpt-4')) {
      estimatedCost = (data.promptTokens * 0.01 + data.completionTokens * 0.03) / 1000;
    }

    await AIAnalyticsLog.create({
      ...data,
      costUsd: estimatedCost,
    });
  }

  /**
   * Generates a dashboard summary of token usage and costs.
   */
  static async getUsageStatistics(days = 30) {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const stats = await AIAnalyticsLog.aggregate([
      { $match: { createdAt: { $gte: cutoff } } },
      {
        $group: {
          _id: null,
          totalPromptTokens: { $sum: '$promptTokens' },
          totalCompletionTokens: { $sum: '$completionTokens' },
          totalTokens: { $sum: '$totalTokens' },
          totalCost: { $sum: '$costUsd' },
          avgLatencyMs: { $avg: '$latencyMs' },
          totalRequests: { $sum: 1 },
          hallucinations: {
            $sum: { $cond: ['$hadHallucination', 1, 0] }
          }
        }
      }
    ]);

    return stats.length > 0 ? stats[0] : null;
  }
}
