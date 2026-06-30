import { SearchLog } from '../Search.model.js';

export class SearchAnalytics {
  /**
   * Aggregates trending searches over the last X hours.
   */
  static async getTrendingQueries(hours = 24, limit = 10) {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    return await SearchLog.aggregate([
      { $match: { createdAt: { $gte: cutoff } } },
      { $group: { _id: "$normalizedQuery", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { query: "$_id", count: 1, _id: 0 } }
    ]);
  }

  /**
   * Identifies queries resulting in zero results (Knowledge Gaps).
   */
  static async getZeroResultQueries(limit = 20) {
    return await SearchLog.aggregate([
      { $match: { zeroResults: true } },
      { $group: { _id: "$normalizedQuery", count: { $sum: 1 }, lastSeen: { $max: "$createdAt" } } },
      { $sort: { count: -1 } },
      { $limit: limit },
      { $project: { query: "$_id", frequency: "$count", lastSeen: 1, _id: 0 } }
    ]);
  }
}
