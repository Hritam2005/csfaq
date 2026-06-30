import { jest } from '@jest/globals';
import { FeatureFlags } from '../system/FeatureFlags.js';

describe('Admin Module', () => {
  describe('FeatureFlags', () => {
    it('should return false if flag does not exist', async () => {
      // A mock flag that is not saved to the DB should yield false
      const result = await FeatureFlags.isEnabled('non_existent_feature');
      expect(result).toBe(false);
    });
  });
});
