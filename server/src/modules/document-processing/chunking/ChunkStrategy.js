/**
 * Interface for chunking strategies
 */
export class ChunkStrategy {
  /**
   * @param {string} text - The complete document text
   * @param {Object} options - Configuration for chunking (maxTokens, overlap, etc)
   * @returns {Array<{text: string, metadata: Object}>} Array of text chunks
   */
  chunk(text, options = {}) {
    throw new Error('Method not implemented.');
  }
}
