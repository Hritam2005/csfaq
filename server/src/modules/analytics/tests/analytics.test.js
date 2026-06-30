import { jest } from '@jest/globals';
import { AlertEngine } from '../alerts/AlertEngine.js';

describe('Analytics & Observability Module', () => {
  describe('AlertEngine', () => {
    it('should not throw on valid metric processing', async () => {
      // Very basic validation that the engine doesn't crash on standard metrics
      const mockMetric = { name: 'memory_usage', value: 50 };
      await expect(AlertEngine.evaluate(mockMetric)).resolves.not.toThrow();
    });
  });
});
