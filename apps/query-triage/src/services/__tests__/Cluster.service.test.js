import { jest } from '@jest/globals';
import { ClusterService } from '../Cluster.service.js';

// Mock env
jest.mock('../../config/env.js', () => ({
  env: {
    thresholds: {
      duplicateSimilarity: 0.90,
    },
  },
}));

describe('ClusterService', () => {
  describe('calculateSimilarity', () => {
    test('should return 1 for identical texts', () => {
      const text = 'How do I submit my assignment';
      const similarity = ClusterService.calculateSimilarity(text, text);
      expect(similarity).toBeGreaterThan(0.99);
    });

    test('should return high similarity for similar texts', () => {
      const text1 = 'How do I submit my assignment?';
      const text2 = 'How to submit assignment?';
      const similarity = ClusterService.calculateSimilarity(text1, text2);
      expect(similarity).toBeGreaterThan(0.5);
    });

    test('should return low similarity for different texts', () => {
      const text1 = 'How do I submit my assignment?';
      const text2 = 'Where is the cafeteria located?';
      const similarity = ClusterService.calculateSimilarity(text1, text2);
      expect(similarity).toBeLessThan(0.3);
    });

    test('should handle empty strings', () => {
      const similarity = ClusterService.calculateSimilarity('', '');
      expect(similarity).toBe(0);
    });

    test('should normalize case', () => {
      const text1 = 'HOW DO I SUBMIT';
      const text2 = 'how do i submit';
      const similarity = ClusterService.calculateSimilarity(text1, text2);
      expect(similarity).toBeGreaterThan(0.9);
    });
  });

  describe('tokenize', () => {
    test('should lowercase and split by spaces', () => {
      const tokens = ClusterService.tokenize('Hello World Test');
      expect(tokens).toEqual(['hello', 'world', 'test']);
    });

    test('should remove special characters', () => {
      const tokens = ClusterService.tokenize('Hello, World! How are you?');
      expect(tokens).toContain('hello');
      expect(tokens).toContain('world');
      expect(tokens).not.toContain(',');
      expect(tokens).not.toContain('!');
    });

    test('should filter short tokens', () => {
      const tokens = ClusterService.tokenize('I am a test string');
      expect(tokens).not.toContain('am');
      expect(tokens).toContain('test');
    });

    test('should filter stop words', () => {
      const tokens = ClusterService.tokenize('What is the answer?');
      expect(tokens).not.toContain('the');
      expect(tokens).not.toContain('is');
    });
  });

  describe('isStopWord', () => {
    test('should identify common stop words', () => {
      expect(ClusterService.isStopWord('the')).toBe(true);
      expect(ClusterService.isStopWord('is')).toBe(true);
      expect(ClusterService.isStopWord('and')).toBe(true);
    });

    test('should not identify content words as stop words', () => {
      expect(ClusterService.isStopWord('assignment')).toBe(false);
      expect(ClusterService.isStopWord('submit')).toBe(false);
    });
  });

  describe('calculateTermFrequency', () => {
    test('should calculate normalized term frequency', () => {
      const tokens = ['test', 'test', 'other'];
      const tf = ClusterService.calculateTermFrequency(tokens);
      
      expect(tf.test).toBe(1); // normalized: 2/2
      expect(tf.other).toBe(0.5); // normalized: 1/2
    });

    test('should handle empty array', () => {
      const tf = ClusterService.calculateTermFrequency([]);
      expect(Object.keys(tf).length).toBe(0);
    });
  });
});
