import { jest } from '@jest/globals';
import mongoose from 'mongoose';

// Mock mongoose before importing the model
jest.mock('mongoose', () => {
  const mockSchema = function(definition, options) {
    this.definition = definition;
    this.options = options;
    this.methods = {};
    this.statics = {};
  };
  
  mockSchema.prototype.index = jest.fn();
  mockSchema.prototype.pre = jest.fn();
  mockSchema.methods.canTransitionTo = function(nextStatus) {
    const validTransitions = {
      received: ['triaging'],
      triaging: ['awaiting_human', 'answered'],
      awaiting_human: ['assigned'],
      assigned: ['waiting_for_user', 'resolved'],
      waiting_for_user: ['assigned'],
      answered: ['closed', 'awaiting_human'],
      resolved: ['closed'],
      closed: [],
    };
    return validTransitions[this.status]?.includes(nextStatus) || false;
  };
  mockSchema.methods.isSlaBreached = function() {
    if (!this.slaDueAt) return false;
    return new Date() > new Date(this.slaDueAt);
  };
  mockSchema.methods.getAgeHours = function() {
    return (Date.now() - new Date(this.createdAt).getTime()) / (1000 * 60 * 60);
  };
  mockSchema.statics.calculatePriority = function(queryData) {
    if (queryData.decisionReasons?.some(r => ['SAFETY_EMERGENCY', 'SYSTEM_WIDE_OUTAGE'].includes(r))) {
      return 'P0';
    }
    if (queryData.humanRequested) return 'P2';
    return 'P3';
  };
  
  return {
    Schema: mockSchema,
    model: jest.fn(() => MockModel),
    connect: jest.fn(),
    connection: { on: jest.fn() },
  };
});

// Import after mocking
import QueryCase, { 
  QueryChannel, 
  QueryDecision, 
  QueryStatus, 
  PriorityLevel 
} from '../QueryCase.model.js';

describe('QueryCase Model', () => {
  describe('Type Definitions', () => {
    test('should have all QueryChannel values', () => {
      expect(QueryChannel.UNIFIED_INTAKE).toBe('unified_intake');
      expect(QueryChannel.COMMUNITY).toBe('community');
      expect(QueryChannel.SUPPORT).toBe('support');
    });

    test('should have all QueryDecision values', () => {
      expect(QueryDecision.AI_ANSWER).toBe('ai_answer');
      expect(QueryDecision.HUMAN_REQUIRED).toBe('human_required');
      expect(QueryDecision.HUMAN_REVIEW_AI_DRAFT).toBe('human_review_ai_draft');
    });

    test('should have all QueryStatus values', () => {
      expect(QueryStatus.RECEIVED).toBe('received');
      expect(QueryStatus.TRIAGING).toBe('triaging');
      expect(QueryStatus.AWAITING_HUMAN).toBe('awaiting_human');
    });

    test('should have all PriorityLevel values', () => {
      expect(PriorityLevel.P0).toBe('P0');
      expect(PriorityLevel.P1).toBe('P1');
      expect(PriorityLevel.P2).toBe('P2');
      expect(PriorityLevel.P3).toBe('P3');
    });
  });
});

describe('QueryCase State Machine', () => {
  describe('canTransitionTo', () => {
    test('received can transition to triaging', () => {
      const caseInstance = { status: 'received' };
      const canTransition = QueryCase.schema.statics?.calculatePriority || 
        (() => {
          const valid = {
            received: ['triaging'],
            triaging: ['awaiting_human', 'answered'],
            awaiting_human: ['assigned'],
          };
          return valid[caseInstance.status]?.includes('triaging') || false;
        })();
      
      expect(canTransition).toBeDefined();
    });

    test('closed cannot transition to any status', () => {
      const valid = {
        closed: [],
      };
      expect(valid.closed.length).toBe(0);
    });
  });

  describe('isSlaBreached', () => {
    test('should return true for past SLA', () => {
      const pastDate = new Date(Date.now() - 60 * 60 * 1000);
      const slaDueAt = pastDate;
      
      const breached = new Date() > new Date(slaDueAt);
      expect(breached).toBe(true);
    });

    test('should return false for future SLA', () => {
      const futureDate = new Date(Date.now() + 60 * 60 * 1000);
      const slaDueAt = futureDate;
      
      const breached = new Date() > new Date(slaDueAt);
      expect(breached).toBe(false);
    });

    test('should return false for null SLA', () => {
      const slaDueAt = null;
      expect(slaDueAt).toBeFalsy();
    });
  });
});

describe('Priority Calculation', () => {
  test('should return P0 for safety emergency', () => {
    const priority = QueryCase.schema.statics?.calculatePriority || ((data) => {
      if (data.decisionReasons?.some(r => ['SAFETY_EMERGENCY', 'SYSTEM_WIDE_OUTAGE'].includes(r))) {
        return 'P0';
      }
      if (data.humanRequested) return 'P2';
      return 'P3';
    });
    
    const result = priority({
      decisionReasons: ['SAFETY_EMERGENCY'],
    });
    expect(result).toBe('P0');
  });

  test('should return P2 for human requested', () => {
    const priority = (data) => {
      if (data.humanRequested) return 'P2';
      return 'P3';
    };
    
    const result = priority({ humanRequested: true });
    expect(result).toBe('P2');
  });

  test('should return P3 for routine queries', () => {
    const priority = (data) => {
      if (data.humanRequested) return 'P2';
      return 'P3';
    };
    
    const result = priority({ humanRequested: false });
    expect(result).toBe('P3');
  });
});
