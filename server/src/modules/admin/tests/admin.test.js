import { jest } from '@jest/globals';
import { FeatureFlag } from '../Admin.model.js';
import { FeatureFlags } from '../system/FeatureFlags.js';

describe('Admin Module', () => {
  describe('FeatureFlags', () => {
    it('should return false if flag does not exist', async () => {
      const findOneSpy = jest.spyOn(FeatureFlag, 'findOne').mockReturnValue({
        lean: jest.fn().mockResolvedValue(null)
      });

      const result = await FeatureFlags.isEnabled('non_existent_feature');
      expect(result).toBe(false);

      findOneSpy.mockRestore();
    });
  });
});
