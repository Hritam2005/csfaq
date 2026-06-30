import { jest } from '@jest/globals';
import { SuggestedQuestions } from '../suggestions/SuggestedQuestions.js';

describe('Chat Experience Module', () => {
  describe('SuggestedQuestions', () => {
    it('should generate policy-related suggestions', () => {
      const suggestions = SuggestedQuestions.generate('You can find the holiday policy in the manual.');
      expect(suggestions).toContain('Where can I download the full policy?');
    });

    it('should return default suggestions for unknown text', () => {
      const suggestions = SuggestedQuestions.generate('The answer is 42.');
      expect(suggestions).toContain('Can you explain this in more detail?');
    });

    it('should return empty array for empty input', () => {
      const suggestions = SuggestedQuestions.generate('');
      expect(suggestions).toEqual([]);
    });
  });
});
