import { ParagraphChunker } from './ParagraphChunker.js';
import { RecursiveCharacterChunker } from './RecursiveCharacterChunker.js';
import { SentenceChunker } from './SentenceChunker.js';
import { DocumentError, ERROR_CODES } from '../Document.errors.js';

export class ChunkService {
  constructor(strategyName = 'recursive', config = {}) {
    this.config = { maxTokens: 1000, overlap: 100, ...config };
    this.strategy = this._getStrategy(strategyName);
  }

  _getStrategy(name) {
    switch (name.toLowerCase()) {
      case 'sentence': return new SentenceChunker();
      case 'paragraph': return new ParagraphChunker();
      case 'recursive':
      default:
        return new RecursiveCharacterChunker();
    }
  }

  /**
   * Processes the full text into chunks
   * @param {string} text - Parsed plain text
   * @returns {Array<{text: string, metadata: Object}>}
   */
  process(text) {
    try {
      const chunks = this.strategy.chunk(text, this.config);
      if (!chunks || chunks.length === 0) {
        throw new DocumentError('Chunking resulted in 0 chunks', ERROR_CODES.CHUNK_FAILED);
      }
      return chunks;
    } catch (error) {
      if (error instanceof DocumentError) throw error;
      throw new DocumentError(`Chunking failed: ${error.message}`, ERROR_CODES.CHUNK_FAILED);
    }
  }
}
