import { jest } from '@jest/globals';
import { SlaService } from '../Sla.service.js';
import { PriorityLevel } from '../../models/QueryCase.model.js';

// Mock env
jest.mock('../../config/env.js', () => ({
  env: {
    sla: {
      p0: { responseMinutes: 15, resolutionHours: 2 },
      p1: { responseHours: 1, resolutionHours: 4 },
      p2: { responseHours: 8, resolutionHours: 48 },
      p3: { responseHours: 48, resolutionHours: 120 },
    },
  },
}));

describe('SlaService', () => {
  describe('calculateSlaDue', () => {
    test('should calculate P0 response SLA in minutes', () => {
      const now = new Date();
      const sla = SlaService.calculateSlaDue(PriorityLevel.P0, 'response');
      
      const diffMinutes = (sla - now) / (1000 * 60);
      expect(diffMinutes).toBeGreaterThanOrEqual(14);
      expect(diffMinutes).toBeLessThanOrEqual(16);
    });

    test('should calculate P1 response SLA in hours', () => {
      const now = new Date();
      const sla = SlaService.calculateSlaDue(PriorityLevel.P1, 'response');
      
      const diffHours = (sla - now) / (1000 * 60 * 60);
      expect(diffHours).toBeGreaterThanOrEqual(0.9);
      expect(diffHours).toBeLessThanOrEqual(2);
    });

    test('should default to P3 for unknown priority', () => {
      const now = new Date();
      const sla = SlaService.calculateSlaDue('UNKNOWN', 'response');
      
      const diffHours = (sla - now) / (1000 * 60 * 60);
      expect(diffHours).toBeGreaterThanOrEqual(47);
    });
  });

  describe('getRemainingTime', () => {
    test('should return remaining time for future SLA', () => {
      const futureDate = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
      const result = SlaService.getRemainingTime(futureDate);
      
      expect(result.overdue).toBe(false);
      expect(result.remainingMs).toBeGreaterThan(0);
      expect(result.remainingText).toBeDefined();
    });

    test('should return overdue for past SLA', () => {
      const pastDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
      const result = SlaService.getRemainingTime(pastDate);
      
      expect(result.overdue).toBe(true);
      expect(result.overdueMs).toBeGreaterThan(0);
    });

    test('should return null for null input', () => {
      const result = SlaService.getRemainingTime(null);
      expect(result).toBeNull();
    });
  });

  describe('getSlaStatus', () => {
    test('should return breached for overdue', () => {
      const pastDate = new Date(Date.now() - 60 * 60 * 1000);
      const result = SlaService.getSlaStatus(pastDate);
      
      expect(result.status).toBe('breached');
      expect(result.text).toContain('Overdue');
    });

    test('should return ok for distant future', () => {
      const futureDate = new Date(Date.now() + 48 * 60 * 60 * 1000);
      const result = SlaService.getSlaStatus(futureDate);
      
      expect(result.status).toBe('ok');
    });

    test('should return unknown for null input', () => {
      const result = SlaService.getSlaStatus(null);
      expect(result.status).toBe('unknown');
    });
  });

  describe('formatDuration', () => {
    test('should format days', () => {
      const result = SlaService.formatDuration(2 * 24 * 60 * 60 * 1000);
      expect(result).toBe('2d 0h');
    });

    test('should format hours and minutes', () => {
      const result = SlaService.formatDuration(2 * 60 * 60 * 1000 + 30 * 60 * 1000);
      expect(result).toBe('2h 30m');
    });

    test('should format minutes', () => {
      const result = SlaService.formatDuration(45 * 60 * 1000);
      expect(result).toBe('45m');
    });
  });
});
