import { jest } from '@jest/globals';
import { QueryParser } from '../query/QueryParser.js';
import { QueryNormalizer } from '../query/QueryNormalizer.js';
import { Highlighter } from '../highlighting/Highlighter.js';
import { SEARCH_INTENTS } from '../Search.constants.js';

describe('Search Engine Pipeline', () => {
  describe('QueryNormalizer', () => {
    it('should normalize and strip basic punctuation', () => {
      const result = QueryNormalizer.normalize('   Hello, WORLD!!  ');
      expect(result).toBe('hello world');
    });

    it('should return empty string on null', () => {
      expect(QueryNormalizer.normalize(null)).toBe('');
    });
  });

  describe('QueryParser', () => {
    it('should detect FAQ intent on question words', () => {
      const result = QueryParser.parse('How do I reset my password?');
      expect(result.isQuestion).toBe(true);
      expect(result.intent).toBe(SEARCH_INTENTS.FAQ_LOOKUP);
    });

    it('should detect Document intent', () => {
      const result = QueryParser.parse('employee handbook document');
      expect(result.intent).toBe(SEARCH_INTENTS.DOCUMENT_SEARCH);
    });
  });

  describe('Highlighter', () => {
    it('should wrap exact token matches in mark tags', () => {
      const text = 'This is a test document containing important data.';
      const result = Highlighter.highlight(text, 'test data');
      expect(result).toBe('This is a <mark>test</mark> document containing important <mark>data</mark>.');
    });
  });
});
