import { jest } from '@jest/globals';
import { TriageEngine } from '../TriageEngine.service.js';
import { DECISION_REASONS } from '../../constants/triage.constants.js';

// Mock dependencies
jest.mock('../../models/QueryCase.model.js', () => {
  const QueryStatus = {
    RECEIVED: 'received',
    TRIAGING: 'triaging',
    AWAITING_HUMAN: 'awaiting_human',
    ANSWERED: 'answered',
  };
  
  return {
    __esModule: true,
    default: {
      findById: jest.fn(),
      calculatePriority: jest.fn(() => 'P2'),
    },
    QueryStatus,
    QueryDecision: {
      AI_ANSWER: 'ai_answer',
      HUMAN_REQUIRED: 'human_required',
      HUMAN_REVIEW_AI_DRAFT: 'human_review_ai_draft',
    },
    PriorityLevel: {
      P0: 'P0',
      P1: 'P1',
      P2: 'P2',
      P3: 'P3',
    },
    AffectedUsers: {
      ONE: 'one',
      SEVERAL: 'several',
      MANY: 'many',
    },
  };
});

jest.mock('../Audit.service.js', () => ({
  AuditService: {
    log: jest.fn().mockResolvedValue({}),
  },
}));

jest.mock('../RAG.service.js', () => ({
  RAGService: {
    retrieve: jest.fn().mockResolvedValue({
      confidence: 0,
      commonalityScore: 0,
      documents: [],
      evidence: [],
    }),
    verifyAndGenerate: jest.fn().mockResolvedValue({
      verified: false,
      answer: null,
    }),
  },
}));

jest.mock('../Sla.service.js', () => ({
  SlaService: {
    calculateSlaDue: jest.fn().mockReturnValue(new Date()),
  },
}));

jest.mock('../Cluster.service.js', () => ({
  ClusterService: {
    findPotentialDuplicate: jest.fn().mockResolvedValue(null),
  },
}));

jest.mock('../../config/logger.js', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock('../../config/env.js', () => ({
  env: {
    thresholds: {
      minAiConfidence: 0.85,
      mediumAiConfidence: 0.60,
    },
  },
}));

jest.mock('mongoose', () => ({
  ...jest.requireActual('mongoose'),
  model: jest.fn().mockReturnValue({
    findById: jest.fn(),
  }),
}));

describe('TriageEngine', () => {
  describe('evaluateHardGates', () => {
    test('should trigger USER_REQUESTED_HUMAN when humanRequested is true', () => {
      const result = TriageEngine.evaluateHardGates({
        humanRequested: true,
      });
      
      expect(result.triggered).toBe(true);
      expect(result.reason).toBe(DECISION_REASONS.USER_REQUESTED_HUMAN);
    });

    test('should trigger SAFETY_EMERGENCY for depression keywords', () => {
      const result = TriageEngine.evaluateHardGates({
        title: 'I am feeling depressed',
        body: 'I need help',
      });
      
      expect(result.triggered).toBe(true);
      expect(result.reason).toBe(DECISION_REASONS.SAFETY_EMERGENCY);
    });

    test('should trigger SAFETY_EMERGENCY for suicide keywords', () => {
      const result = TriageEngine.evaluateHardGates({
        title: 'Having thoughts of suicide',
        body: 'Cannot continue',
      });
      
      expect(result.triggered).toBe(true);
      expect(result.reason).toBe(DECISION_REASONS.SAFETY_EMERGENCY);
    });

    test('should trigger PRIVILEGED_DATA_REQUIRED for attendance queries', () => {
      const result = TriageEngine.evaluateHardGates({
        title: 'Attendance discrepancy',
        body: 'My attendance shows incorrect data',
      });
      
      expect(result.triggered).toBe(true);
      expect(result.reason).toBe(DECISION_REASONS.PRIVILEGED_DATA_REQUIRED);
    });

    test('should trigger POLICY_APPEAL for exception requests', () => {
      const result = TriageEngine.evaluateHardGates({
        title: 'Request for exception',
        body: 'Please make an exception for me',
      });
      
      expect(result.triggered).toBe(true);
      expect(result.reason).toBe(DECISION_REASONS.POLICY_APPEAL);
    });

    test('should trigger NEAR_DEADLINE for queries within 24 hours of deadline', () => {
      const tomorrow = new Date(Date.now() + 12 * 60 * 60 * 1000); // 12 hours from now
      
      const result = TriageEngine.evaluateHardGates({
        title: 'Assignment issue',
        body: 'Cannot submit',
        deadlineAt: tomorrow,
      });
      
      expect(result.triggered).toBe(true);
      expect(result.reason).toBe(DECISION_REASONS.NEAR_DEADLINE);
    });

    test('should NOT trigger hard gate for routine query', () => {
      const result = TriageEngine.evaluateHardGates({
        title: 'When is the next lecture?',
        body: 'What time does the Python lecture start?',
        humanRequested: false,
      });
      
      expect(result.triggered).toBe(false);
    });
  });

  describe('classifyQuery', () => {
    test('should identify problem intent', () => {
      const classification = {};
      TriageEngine.classifyQuery('I cannot submit my assignment', classification);
      
      expect(classification.intent).toBe('problem');
      expect(classification.categories).toContain('problem');
    });

    test('should identify information intent', () => {
      const classification = {};
      TriageEngine.classifyQuery('What time is the lecture?', classification);
      
      expect(classification.intent).toBe('information');
    });

    test('should identify emergency risk tag', () => {
      const classification = {};
      TriageEngine.classifyQuery('URGENT: Cannot access exam portal', classification);
      
      expect(classification.riskTags).toContain('emergency');
    });

    test('should identify financial risk tag', () => {
      const classification = {};
      TriageEngine.classifyQuery('My fee payment failed', classification);
      
      expect(classification.riskTags).toContain('financial');
    });

    test('should set requiresPrivateData for attendance queries', () => {
      const classification = {};
      TriageEngine.classifyQuery('Why is my attendance marked missing?', classification);
      
      expect(classification.requiresPrivateData).toBe(true);
    });
  });
});
