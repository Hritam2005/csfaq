import QueryCase, { 
  QueryDecision, 
  QueryStatus, 
  PriorityLevel,
  AffectedUsers 
} from '../models/QueryCase.model.js';
import { AuditService } from './Audit.service.js';
import { RAGService } from './RAG.service.js';
import { SlaService } from './Sla.service.js';
import { ClusterService } from './Cluster.service.js';
import { logger } from '../config/logger.js';
import { DECISION_REASONS, RISK_TAGS } from '../constants/triage.constants.js';
import { env } from '../config/env.js';
import ApiError from '../utils/ApiError.js';

/**
 * Hard Human Gate Rules
 * These rules MUST route to human, AI cannot handle them
 */
const HARD_HUMAN_GATE_RULES = [
  {
    id: 'USER_REQUESTED_HUMAN',
    check: (queryData) => queryData.humanRequested === true,
    reason: DECISION_REASONS.USER_REQUESTED_HUMAN,
  },
  {
    id: 'SAFETY_EMERGENCY',
    check: (queryData) => {
      const text = `${queryData.title} ${queryData.body}`.toLowerCase();
      return /\b(depressed|suicide|self[- ]harm|harassment|abuse|emergency|danger|threat)\b/.test(text);
    },
    reason: DECISION_REASONS.SAFETY_EMERGENCY,
  },
  {
    id: 'PRIVILEGED_DATA',
    check: (queryData) => {
      const text = `${queryData.title} ${queryData.body}`.toLowerCase();
      return /\b(attendance|marks?|grade|fees?|payment|account.*issue|missing.*data|private)\b/.test(text);
    },
    reason: DECISION_REASONS.PRIVILEGED_DATA_REQUIRED,
  },
  {
    id: 'POLICY_APPEAL',
    check: (queryData) => {
      const text = `${queryData.title} ${queryData.body}`.toLowerCase();
      return /\b(exception|appeal|waive|reconsider|make.*exception)\b/.test(text);
    },
    reason: DECISION_REASONS.POLICY_APPEAL,
  },
  {
    id: 'NEAR_DEADLINE',
    check: (queryData) => {
      if (!queryData.deadlineAt) return false;
      const hoursUntil = (new Date(queryData.deadlineAt) - Date.now()) / (1000 * 60 * 60);
      return hoursUntil > 0 && hoursUntil <= 24;
    },
    reason: DECISION_REASONS.NEAR_DEADLINE,
  },
];

/**
 * Risk Classification Tags
 */
const RISK_CLASSIFIERS = [
  { tag: RISK_TAGS.PRIVATE_DATA, patterns: [/\b(attendance|marks?|grade|fees?|balance)\b/] },
  { tag: RISK_TAGS.PRIVILEGED_ACTION, patterns: [/\b(waive|exception|appeal|override|reset)\b/] },
  { tag: RISK_TAGS.FINANCIAL, patterns: [/\b(payment|fees?|refund|transaction|debited|amount)\b/] },
  { tag: RISK_TAGS.EMERGENCY, patterns: [/\b(urgent|asap|emergency|critical|immediate)\b/] },
];

/**
 * Query Triage Engine
 * Implements the human-first query resolution logic
 */
export class TriageEngine {
  /**
   * Main triage entry point - processes a new query
   */
  static async triageQuery(queryCaseId) {
    const queryCase = await QueryCase.findById(queryCaseId);
    if (!queryCase) {
      throw ApiError.notFound('Query case not found');
    }

    try {
      // Update status to triaging
      queryCase.status = QueryStatus.TRIAGING;
      await queryCase.save();
      
      await AuditService.log({
        queryCaseId: queryCase._id,
        eventType: 'triage_started',
        actorType: 'system',
        toStatus: QueryStatus.TRIAGING,
      });

      // Execute triage logic
      const triageResult = await this.executeTriage(queryCase);

      // Update query case with triage results
      Object.assign(queryCase, triageResult);
      await queryCase.save();

      await AuditService.log({
        queryCaseId: queryCase._id,
        eventType: 'triage_completed',
        actorType: 'system',
        toStatus: queryCase.status,
        metadata: { decision: queryCase.decision, priority: queryCase.priority },
      });

      return queryCase;
    } catch (error) {
      logger.error('Triage error:', error);
      throw error;
    }
  }

  /**
   * Execute the full triage decision tree
   */
  static async executeTriage(queryCase) {
    const { title, body, programId, humanRequested, affectedUsers, deadlineAt } = queryCase;
    const queryText = `${title} ${body}`;
    
    const result = {
      decisionReasons: [],
      classification: {
        intent: 'unknown',
        categories: [],
        riskTags: [],
        requiresPrivateData: false,
        requiresPrivilegedAction: false,
        commonalityScore: 0,
        retrievalConfidence: 0,
        answerConfidence: 0,
      },
    };

    // Step 1: Evaluate Hard Human Gates
    const hardGateResult = this.evaluateHardGates(queryCase);
    if (hardGateResult.triggered) {
      result.decision = QueryDecision.HUMAN_REQUIRED;
      result.decisionReasons.push(hardGateResult.reason);
      result.priority = QueryCase.calculatePriority({
        humanRequested,
        affectedUsers,
        deadlineAt,
        classification: result.classification,
        decisionReasons: result.decisionReasons,
      });
      result.slaDueAt = SlaService.calculateSlaDue(result.priority);
      result.status = QueryStatus.AWAITING_HUMAN;
      
      // Check for potential duplicates
      const duplicateMatch = await ClusterService.findPotentialDuplicate(queryText, programId);
      if (duplicateMatch) {
        result.parentIncidentId = duplicateMatch.parentIncidentId || duplicateMatch._id;
        result.decisionReasons.push(DECISION_REASONS.DUPLICATE_DETECTED);
      }
      
      return result;
    }

    // Step 2: Classify risk and intent
    this.classifyQuery(queryText, result.classification);

    // Step 3: RAG retrieval for approved knowledge
    const ragResult = await RAGService.retrieve(queryText, programId);
    
    if (ragResult.confidence >= env.thresholds.minAiConfidence && 
        ragResult.commonalityScore >= 0.7) {
      // High confidence - attempt AI answer with verification
      const verificationResult = await RAGService.verifyAndGenerate(
        queryText, 
        ragResult.documents, 
        programId
      );
      
      if (verificationResult.verified) {
        result.decision = QueryDecision.AI_ANSWER;
        result.decisionReasons.push(DECISION_REASONS.HIGH_CONFIDENCE_RAG);
        result.classification.retrievalConfidence = ragResult.confidence;
        result.classification.answerConfidence = verificationResult.confidence;
        result.classification.commonalityScore = ragResult.commonalityScore;
        result.evidence = ragResult.evidence;
        result.status = QueryStatus.ANSWERED;
        result.aiDraft = {
          text: verificationResult.answer,
          model: verificationResult.model || 'unknown',
          promptVersion: '1.0',
          visibleToUser: true,
        };
        result.finalAnswer = {
          text: verificationResult.answer,
          actorType: 'ai',
          answeredAt: new Date(),
        };
      } else {
        // Verification failed - route to human with draft
        result.decision = QueryDecision.HUMAN_REVIEW_AI_DRAFT;
        result.decisionReasons.push(DECISION_REASONS.LOW_CONFIDENCE_RAG);
        result.aiDraft = {
          text: verificationResult.answer,
          model: verificationResult.model || 'unknown',
          promptVersion: '1.0',
          visibleToUser: false,
        };
        result.priority = PriorityLevel.P2;
        result.slaDueAt = SlaService.calculateSlaDue(result.priority);
        result.status = QueryStatus.AWAITING_HUMAN;
      }
    } else if (ragResult.confidence >= env.thresholds.mediumAiConfidence) {
      // Medium confidence - create human case with draft
      result.decision = QueryDecision.HUMAN_REVIEW_AI_DRAFT;
      result.decisionReasons.push(DECISION_REASONS.MEDIUM_CONFIDENCE_RAG);
      result.classification.retrievalConfidence = ragResult.confidence;
      result.evidence = ragResult.evidence;
      result.aiDraft = {
        text: ragResult.draftAnswer || 'Draft not available',
        model: 'unknown',
        promptVersion: '1.0',
        visibleToUser: false,
      };
      result.priority = PriorityLevel.P3;
      result.slaDueAt = SlaService.calculateSlaDue(result.priority);
      result.status = QueryStatus.AWAITING_HUMAN;
    } else {
      // Low or no confidence - route to human
      result.decision = QueryDecision.HUMAN_REQUIRED;
      result.decisionReasons.push(DECISION_REASONS.LOW_CONFIDENCE_RAG);
      result.priority = PriorityLevel.P3;
      result.slaDueAt = SlaService.calculateSlaDue(result.priority);
      result.status = QueryStatus.AWAITING_HUMAN;
    }

    // Check for duplicates even for low-confidence
    const duplicateMatch = await ClusterService.findPotentialDuplicate(queryText, programId);
    if (duplicateMatch) {
      result.parentIncidentId = duplicateMatch.parentIncidentId || duplicateMatch._id;
      result.decisionReasons.push(DECISION_REASONS.DUPLICATE_DETECTED);
    }

    return result;
  }

  /**
   * Evaluate hard human gate rules
   */
  static evaluateHardGates(queryCase) {
    for (const rule of HARD_HUMAN_GATE_RULES) {
      if (rule.check(queryCase)) {
        return { triggered: true, reason: rule.reason, ruleId: rule.id };
      }
    }
    return { triggered: false };
  }

  /**
   * Classify query for risk and intent detection
   */
  static classifyQuery(queryText, classification) {
    const lowerText = queryText.toLowerCase();
    
    // Detect risk tags
    for (const classifier of RISK_CLASSIFIERS) {
      if (classifier.patterns.some(pattern => pattern.test(lowerText))) {
        classification.riskTags.push(classifier.tag);
        
        if (classifier.tag === RISK_TAGS.PRIVATE_DATA) {
          classification.requiresPrivateData = true;
        }
        if (classifier.tag === RISK_TAGS.PRIVILEGED_ACTION) {
          classification.requiresPrivilegedAction = true;
        }
      }
    }
    
    // Detect intent categories
    const intentPatterns = {
      'information': /\b(what|when|where|how|explain|tell|info)\b/,
      'request': /\b(need|want|please|request|require)\b/,
      'problem': /\b(cannot|can't|error|issue|problem|bug|fix)\b/,
      'complaint': /\b(unhappy|dissatisfied|wrong|incorrect|bad)\b/,
      'emergency': /\b(urgent|asap|emergency|critical|immediately)\b/,
    };
    
    for (const [intent, pattern] of Object.entries(intentPatterns)) {
      if (pattern.test(lowerText)) {
        classification.categories.push(intent);
        classification.intent = intent;
      }
    }
    
    if (!classification.intent || classification.intent === 'unknown') {
      classification.intent = 'general';
      classification.categories.push('general');
    }
  }
}

export default TriageEngine;