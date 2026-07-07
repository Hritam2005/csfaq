import QueryAuditEvent, { ActorType } from '../models/QueryAuditEvent.model.js';
import { logger } from '../config/logger.js';

/**
 * Audit Service - Complete audit trail for all query case operations
 */
export class AuditService {
  /**
   * Log an audit event
   */
  static async log({
    queryCaseId,
    eventType,
    actorType = ActorType.SYSTEM,
    actorId = null,
    fromStatus = null,
    toStatus = null,
    reasonCodes = [],
    metadata = {},
    ipAddress = null,
    userAgent = null,
  }) {
    try {
      const event = await QueryAuditEvent.create({
        queryCaseId,
        eventType,
        actorType,
        actorId,
        fromStatus,
        toStatus,
        reasonCodes,
        metadata,
        ipAddress,
        userAgent,
      });
      
      // Log important events
      if (this.isImportantEvent(eventType)) {
        logger.info(`Audit: ${eventType} for case ${queryCaseId}`, {
          actorType,
          actorId,
          fromStatus,
          toStatus,
        });
      }
      
      return event;
    } catch (error) {
      logger.error('Failed to log audit event:', error);
      // Don't throw - audit failures shouldn't break operations
      return null;
    }
  }

  /**
   * Check if event should be logged prominently
   */
  static isImportantEvent(eventType) {
    const importantEvents = [
      'query_created',
      'decision_human_required',
      'case_claimed',
      'answered',
      'resolved',
      'sla_breached',
      'promoted_to_faq',
      'user_requested_human',
    ];
    return importantEvents.includes(eventType);
  }

  /**
   * Get audit trail for a query case
   */
  static async getAuditTrail(queryCaseId) {
    return QueryAuditEvent.find({ queryCaseId })
      .sort({ createdAt: 1 })
      .lean();
  }

  /**
   * Get audit events by actor
   */
  static async getEventsByActor(actorId, options = {}) {
    const { startDate, endDate, limit = 100 } = options;
    
    const query = { actorId };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }
    
    return QueryAuditEvent.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Get events by type (for analytics)
   */
  static async getEventsByType(eventType, options = {}) {
    const { startDate, endDate, limit = 100 } = options;
    
    const query = { eventType };
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }
    
    return QueryAuditEvent.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  /**
   * Get audit statistics
   */
  static async getStatistics(startDate, endDate) {
    const matchStage = {};
    if (startDate || endDate) {
      matchStage.createdAt = {};
      if (startDate) matchStage.createdAt.$gte = startDate;
      if (endDate) matchStage.createdAt.$lte = endDate;
    }

    const pipeline = [
      { $match: matchStage },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ];

    const results = await QueryAuditEvent.aggregate(pipeline);
    
    const stats = {
      total: 0,
      byType: {},
    };
    
    for (const item of results) {
      stats.byType[item._id] = item.count;
      stats.total += item.count;
    }
    
    return stats;
  }
}

export default AuditService;
