import { jest } from '@jest/globals';
import { ParagraphChunker } from '../chunking/ParagraphChunker.js';
import { TokenChunker } from '../chunking/TokenChunker.js';

describe('Chunking Strategies', () => {
  describe('ParagraphChunker', () => {
    it('should split text by paragraphs without exceeding token limits', () => {
      const chunker = new ParagraphChunker();
      
      // Simulate 3 large paragraphs
      const p1 = 'A'.repeat(500); // 500 chars
      const p2 = 'B'.repeat(500);
      const p3 = 'C'.repeat(500);
      
      const text = `${p1}\n\n${p2}\n\n${p3}`;
      
      // Set very small limits to force chunking
      const chunks = chunker.chunk(text, { maxTokens: 200, overlap: 0 }); // 200 tokens = 800 chars
      
      // P1 + P2 = 1000 chars (overflows 800). So Chunk 1 = P1. Chunk 2 = P2. Chunk 3 = P3.
      expect(chunks.length).toBe(3);
      expect(chunks[0].text.trim()).toBe(p1);
      expect(chunks[1].text.trim()).toBe(p2);
      expect(chunks[2].text.trim()).toBe(p3);
    });

    it('should include overlap across chunk boundaries', () => {
      const chunker = new ParagraphChunker();
      const p1 = 'A'.repeat(500); 
      const p2 = 'B'.repeat(500);
      const p3 = 'C'.repeat(500);
      
      const text = `${p1}\n\n${p2}\n\n${p3}`;
      
      // Overlap of 150 tokens = 600 chars. Should pull in previous paragraph
      const chunks = chunker.chunk(text, { maxTokens: 200, overlap: 150 });
      
      expect(chunks.length).toBe(3);
      
      // Chunk 2 should contain the overlap of P1 + P2
      expect(chunks[1].text).toContain(p1);
      expect(chunks[1].text).toContain(p2);
    });
  });

  describe('TokenChunker', () => {
    it('should perform hard cuts at character approximations', () => {
      const chunker = new TokenChunker();
      const text = 'abcdefghij'; // 10 chars
      
      // maxTokens 1 = 4 chars. Overlap 0 = 0 chars
      const chunks = chunker.chunk(text, { maxTokens: 1, overlap: 0 });
      
      expect(chunks.length).toBe(3);
      expect(chunks[0].text).toBe('abcd');
      expect(chunks[1].text).toBe('efgh');
      expect(chunks[2].text).toBe('ij');
    });
  });
});
