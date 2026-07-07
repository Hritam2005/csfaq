import QueryCase, { 
  QueryStatus, 
  QueryDecision, 
  PriorityLevel,
  ActorType 
} from '../models/QueryCase.model.js';
import { TriageEngine } from './TriageEngine.service.js';
import { AuditService } from './Audit.service.js';
import { SlaService } from './Sla.service.js';
import { ClusterService } from './Cluster.service.js';
import { CapacityService } from './Capacity.service.js';
import { emitToUser, emitToProgram, emitToResolver } from '../config/socket.js';
import { logger } from '../config/logger.js';
import ApiError from '../utils/ApiError.js';
import { EVENT_TYPES, DECISION_REASONS } from '../constants/triage.constants.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Query Service - Main orchestrator for query case operations
 */
export class QueryService {
  /**
   * Submit a new query - Entry point for user queries
   */
  static async submitQuery(data, user = null) {
    const { 
      idempotencyKey,
      programId,
      channel = 'unified_intake',
      externalRef,
      title,
      body,
      attachments = [],
      humanRequested = false,
      humanRequestReason,
      affectedUsers = 'one',
      deadlineAt,
      userUrgencyReason,
    } = data;

    // Check idempotency
    if (idempotencyKey) {
      const existing = await QueryCase.findOne({ idempotencyKey, isDeleted: false });
      if (existing) {
        return {
          queryCase: existing,
          isIdempotent: true,
        };
      }
    }

    // Create query case
    const queryCase = new QueryCase({
      idempotencyKey: idempotencyKey || uuidv4(),
      userId: user?._id?.toString() || user?.userId,
      programId,
      channel,
      externalRef,
      title,
      body,
      attachments,
      humanRequested,
      humanRequestReason,
      affectedUsers,
      deadlineAt: deadlineAt ? new Date(deadlineAt) : undefined,
      userUrgencyReason,
      status: QueryStatus.RECEIVED,
      decision: QueryDecision.HUMAN_REQUIRED, // Default until triage
      policyVersion: '1.0',
    });

    await queryCase.save();

    await AuditService.log({
      queryCaseId: queryCase._id,
      eventType: EVENT_TYPES.CREATED,
      actorType: user ? ActorType.USER : ActorType.SYSTEM,
      actorId: user?._id?.toString(),
      toStatus: QueryStatus.RECEIVED,
      metadata: { channel, humanRequested },
    });

    // Trigger async triage
    setImmediate(() => {
      this.processTriage(queryCase._id.toString()).catch(err => {
        logger.error('Async triage failed:', err);
      });
    });

    return {
      queryCase,
      isIdempotent: false,
    };
  }

  /**
   * Process triage asynchronously
   */
  static async processTriage(queryCaseId) {
    try {
      const updatedCase = await TriageEngine.triageQuery(queryCaseId);
      
      // Notify via WebSocket
      if (updatedCase.userId) {
        emitToUser(updatedCase.userId, 'query:updated', {
          queryId: updatedCase._id,
          status: updatedCase.status,
          decision: updatedCase.decision,
          priority: updatedCase.priority,
          slaDueAt: updatedCase.slaDueAt,
          canRequestHuman: true,
        });
      }

      // Notify program channel if human required
      if ([QueryDecision.HUMAN_REQUIRED, QueryDecision.HUMAN_REVIEW_AI_DRAFT].includes(updatedCase.decision)) {
        emitToProgram(updatedCase.programId, 'query:new_human_case', {
          queryId: updatedCase._id,
          priority: updatedCase.priority,
          isParentIncident: updatedCase.isParentIncident,
        });
      }

      return updatedCase;
    } catch (error) {
      logger.error('Triage processing error:', error);
      // Mark as needing manual triage
      await QueryCase.findByIdAndUpdate(queryCaseId, {
        status: QueryStatus.AWAITING_HUMAN,
        decisionReasons: ['TRIAGE_FAILED'],
      });
      throw error;
    }
  }

  /**
   * Get query by ID
   */
  static async getQueryById(queryId) {
    const queryCase = await QueryCase.findById(queryId).populate('parentIncidentId', 'title priority status');
    
    if (!queryCase || queryCase.isDeleted) {
      throw ApiError.notFound('Query not found');
    }
    
    return queryCase;
  }

  /**
   * Get queries for a user
   */
  static async getUserQueries(userId, options = {}) {
    const { status, limit = 50, skip = 0 } = options;
    
    const query = {
      userId: userId?.toString(),
      isDeleted: false,
    };
    
    if (status) {
      query.status = status;
    }
    
    const [queries, total] = await Promise.all([
      QueryCase.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      QueryCase.countDocuments(query),
    ]);

    return { queries, total, limit, skip };
  }

  /**
   * Get admin inbox - unified queue
   */
  static async getAdminInbox(options = {}) {
    const {
      programId,
      priority,
      status = [QueryStatus.AWAITING_HUMAN],
      assignedTo,
      includeResolved = false,
      limit = 50,
      skip = 0,
    } = options;

    const query = {
      isDeleted: false,
      ...(programId && { programId }),
      ...(priority && { priority }),
      ...(assignedTo && { assignedTo }),
    };

    // Filter by status
    if (status && status.length > 0) {
      if (includeResolved) {
        query.status = { $in: [...status, QueryStatus.RESOLVED, QueryStatus.CLOSED] };
      } else {
        query.status = { $in: status };
      }
    }

    const queries = await QueryCase.find(query)
      .sort({ 
        priority: 1, // P0 first
        slaDueAt: 1, // Then by SLA due
        createdAt: 1, // Then oldest first
      })
      .skip(skip)
      .limit(limit)
      .populate('parentIncidentId', 'title linkedCaseCount');

    const total = await QueryCase.countDocuments(query);

    // Calculate queue score for ordering
    const queriesWithScore = queries.map(q => ({
      ...q.toObject(),
      queueScore: this.calculateQueueScore(q),
      slaStatus: SlaService.getSlaStatus(q.slaDueAt),
    }));

    return { 
      queries: queriesWithScore, 
      total, 
      limit, 
      skip,
      capacity: await CapacityService.getSystemCapacity(),
    };
  }

  /**
   * Calculate queue score for ordering
   * S = w1*(Tnow-Tcreated/SLAtotal) + w2*Pweight + w3*log10(Uaffected) - w4*WIPpenalty
   */
  static calculateQueueScore(queryCase) {
    const priorityWeights = { P0: 100, P1: 50, P2: 20, P3: 5 };
    
    const pWeight = priorityWeights[queryCase.priority] || 5;
    
    // Time factor
    let timeFactor = 0;
    if (queryCase.slaDueAt && queryCase.createdAt) {
      const totalSla = new Date(queryCase.slaDueAt) - new Date(queryCase.createdAt);
      const elapsed = Date.now() - new Date(queryCase.createdAt);
      timeFactor = elapsed / totalSla;
    }
    
    // Affected users factor
    const uAffected = (queryCase.linkedCaseCount || 0) + 1;
    const affectedFactor = Math.log10(uAffected);
    
    // SLA breach bonus
    const slaBreachBonus = queryCase.isSlaBreached() ? 500 : 0;
    
    return (0.3 * timeFactor) + (0.4 * pWeight) + (0.3 * affectedFactor) + slaBreachBonus;
  }

  /**
   * Claim a case (admin action)
   */
  static async claimCase(queryId, resolverId, resolverName) {
    const queryCase = await QueryCase.findById(queryId);
    
    if (!queryCase) {
      throw ApiError.notFound('Query not found');
    }

    if (queryCase.status !== QueryStatus.AWAITING_HUMAN) {
      throw ApiError.badRequest(`Cannot claim case in status: ${queryCase.status}`);
    }

    // Check capacity
    const canAccept = await CapacityService.canAcceptCases(resolverId);
    if (!canAccept) {
      throw ApiError.badRequest('Maximum active cases reached. Complete existing cases first.');
    }

    const previousStatus = queryCase.status;
    queryCase.status = QueryStatus.ASSIGNED;
    queryCase.assignedTo = resolverId;
    queryCase.claimedAt = new Date();
    await queryCase.save();

    // Record resolver activity
    await CapacityService.recordResolverActivity(resolverId, resolverName);

    await AuditService.log({
      queryCaseId: queryCase._id,
      eventType: EVENT_TYPES.CLAIMED,
      actorType: ActorType.ADMIN,
      actorId: resolverId,
      fromStatus: previousStatus,
      toStatus: QueryStatus.ASSIGNED,
    });

    // Notify user
    if (queryCase.userId) {
      emitToUser(queryCase.userId, 'query:assigned', {
        queryId: queryCase._id,
        assignedTo: resolverName,
      });
    }

    return queryCase;
  }

  /**
   * Unclaim a case
   */
  static async unclaimCase(queryId, resolverId) {
    const queryCase = await QueryCase.findById(queryId);
    
    if (!queryCase) {
      throw ApiError.notFound('Query not found');
    }

    if (queryCase.assignedTo !== resolverId) {
      throw ApiError.forbidden('You can only unclaim your own cases');
    }

    const previousStatus = queryCase.status;
    queryCase.status = QueryStatus.AWAITING_HUMAN;
    queryCase.assignedTo = null;
    queryCase.claimedAt = null;
    await queryCase.save();

    await AuditService.log({
      queryCaseId: queryCase._id,
      eventType: EVENT_TYPES.UNCLAIMED,
      actorType: ActorType.ADMIN,
      actorId: resolverId,
      fromStatus: previousStatus,
      toStatus: QueryStatus.AWAITING_HUMAN,
    });

    return queryCase;
  }

  /**
   * Answer a query (admin action)
   */
  static async answerQuery(queryId, answerData, resolverId) {
    const { 
      answerText, 
      resolveImmediately = true,
      nominateForKnowledge = false,
      status = 'waiting_for_user',
    } = answerData;

    const queryCase = await QueryCase.findById(queryId);
    
    if (!queryCase) {
      throw ApiError.notFound('Query not found');
    }

    if (queryCase.assignedTo !== resolverId && queryCase.status === QueryStatus.AWAITING_HUMAN) {
      throw ApiError.forbidden('You must claim this case first');
    }

    const previousStatus = queryCase.status;
    
    queryCase.finalAnswer = {
      text: answerText,
      actorType: ActorType.ADMIN,
      actorId: resolverId,
      answeredAt: new Date(),
    };

    if (resolveImmediately) {
      queryCase.status = QueryStatus.RESOLVED;
      queryCase.resolvedAt = new Date();
    } else {
      queryCase.status = QueryStatus.WAITING_FOR_USER;
    }

    await queryCase.save();

    await AuditService.log({
      queryCaseId: queryCase._id,
      eventType: EVENT_TYPES.RESOLVED,
      actorType: ActorType.ADMIN,
      actorId: resolverId,
      fromStatus: previousStatus,
      toStatus: queryCase.status,
      metadata: { nominateForKnowledge },
    });

    // Broadcast to linked cases if parent incident
    if (queryCase.isParentIncident && resolveImmediately) {
      const linkedCount = await ClusterService.broadcastResolution(
        queryCase._id,
        queryCase.finalAnswer
      );
      logger.info(`Broadcast resolution to ${linkedCount} linked cases`);
    }

    // Notify user
    if (queryCase.userId) {
      emitToUser(queryCase.userId, 'query:resolved', {
        queryId: queryCase._id,
        answerText: resolveImmediately ? answerText : undefined,
        awaitingResponse: !resolveImmediately,
        isParentResolution: queryCase.isParentIncident,
      });
    }

    return queryCase;
  }

  /**
   * User requests human
   */
  static async requestHuman(queryId, userId, reason) {
    const queryCase = await QueryCase.findById(queryId);
    
    if (!queryCase) {
      throw ApiError.notFound('Query not found');
    }

    if (queryCase.userId !== userId?.toString()) {
      throw ApiError.forbidden('You can only request human for your own queries');
    }

    if (!queryCase.canTransitionTo(QueryStatus.AWAITING_HUMAN)) {
      throw ApiError.badRequest(`Cannot request human from status: ${queryCase.status}`);
    }

    const previousStatus = queryCase.status;
    
    queryCase.status = QueryStatus.AWAITING_HUMAN;
    queryCase.humanRequested = true;
    queryCase.humanRequestReason = reason;
    queryCase.decision = QueryDecision.HUMAN_REQUIRED;
    queryCase.decisionReasons.push(DECISION_REASONS.USER_REQUESTED_HUMAN);
    
    // Escalate priority
    queryCase.priority = QueryCase.calculatePriority({
      humanRequested: true,
      affectedUsers: queryCase.affectedUsers,
      classification: queryCase.classification,
      decisionReasons: queryCase.decisionReasons,
    });
    
    queryCase.slaDueAt = SlaService.calculateSlaDue(queryCase.priority);
    queryCase.assignedTo = null; // Unassign if was assigned
    
    await queryCase.save();

    await AuditService.log({
      queryCaseId: queryCase._id,
      eventType: EVENT_TYPES.USER_REQUESTED_HUMAN,
      actorType: ActorType.USER,
      actorId: userId,
      fromStatus: previousStatus,
      toStatus: QueryStatus.AWAITING_HUMAN,
      reasonCodes: [DECISION_REASONS.USER_REQUESTED_HUMAN],
      metadata: { reason },
    });

    // Notify program channel
    emitToProgram(queryCase.programId, 'query:human_requested', {
      queryId: queryCase._id,
      priority: queryCase.priority,
      reason,
    });

    return queryCase;
  }

  /**
   * Close a resolved case
   */
  static async closeCase(queryId, userId, feedback) {
    const queryCase = await QueryCase.findById(queryId);
    
    if (!queryCase) {
      throw ApiError.notFound('Query not found');
    }

    const previousStatus = queryCase.status;
    
    if (![QueryStatus.RESOLVED, QueryStatus.ANSWERED].includes(queryCase.status)) {
      throw ApiError.badRequest('Can only close resolved or answered cases');
    }

    queryCase.status = QueryStatus.CLOSED;
    queryCase.closedAt = new Date();
    queryCase.userSatisfaction = feedback?.satisfied ? 'satisfied' : 'unsatisfied';
    queryCase.userFeedback = feedback?.comment;
    await queryCase.save();

    await AuditService.log({
      queryCaseId: queryCase._id,
      eventType: EVENT_TYPES.CLOSED,
      actorType: ActorType.USER,
      actorId: userId,
      fromStatus: previousStatus,
      toStatus: QueryStatus.CLOSED,
      metadata: { feedback },
    });

    return queryCase;
  }

  /**
   * Get incident details (parent + linked cases)
   */
  static async getIncidentDetails(queryId) {
    const queryCase = await QueryCase.findById(queryId);
    
    if (!queryCase) {
      throw ApiError.notFound('Query not found');
    }

    const parentId = queryCase.parentIncidentId || queryCase._id;
    const linkedCases = await ClusterService.getLinkedCases(parentId);

    return {
      parent: queryCase.parentIncidentId ? await QueryCase.findById(parentId) : queryCase,
      linkedCases,
      totalAffected: linkedCases.length,
    };
  }

  /**
   * Update user query
   */
  static async updateUserQuery(queryId, userId, updateData) {
    const queryCase = await QueryCase.findById(queryId);
    
    if (!queryCase || queryCase.isDeleted) {
      throw ApiError.notFound('Query not found');
    }

    if (queryCase.userId !== userId?.toString() && !['Admin', 'Super Admin'].includes(userId)) {
      throw ApiError.forbidden('You can only update your own queries');
    }

    if (updateData.title !== undefined) queryCase.title = updateData.title;
    if (updateData.body !== undefined) queryCase.body = updateData.body;
    if (updateData.attachments !== undefined) queryCase.attachments = updateData.attachments;
    
    await queryCase.save();

    await AuditService.log({
      queryCaseId: queryCase._id,
      eventType: EVENT_TYPES.UPDATED,
      actorType: ActorType.USER,
      actorId: userId,
      toStatus: queryCase.status,
      metadata: { updatedFields: Object.keys(updateData) },
    });

    if (queryCase.userId) {
      emitToUser(queryCase.userId, 'query:updated', {
        queryId: queryCase._id,
        status: queryCase.status,
      });
    }

    return queryCase;
  }

  /**
   * Delete user query (soft delete)
   */
  static async deleteUserQuery(queryId, userId) {
    const queryCase = await QueryCase.findById(queryId);
    
    if (!queryCase || queryCase.isDeleted) {
      throw ApiError.notFound('Query not found');
    }

    if (queryCase.userId !== userId?.toString() && !['Admin', 'Super Admin'].includes(userId)) {
      throw ApiError.forbidden('You can only delete your own queries');
    }

    const previousStatus = queryCase.status;
    queryCase.isDeleted = true;
    await queryCase.save();

    await AuditService.log({
      queryCaseId: queryCase._id,
      eventType: EVENT_TYPES.DELETED,
      actorType: ActorType.USER,
      actorId: userId,
      fromStatus: previousStatus,
      toStatus: 'deleted',
    });

    if (queryCase.userId) {
      emitToUser(queryCase.userId, 'query:deleted', {
        queryId: queryCase._id,
      });
    }

    return { success: true };
  }
}

export default QueryService;
