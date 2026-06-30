/**
 * Abstract interface for Embedding Providers
 */
export class EmbeddingProvider {
  /**
   * Generates embeddings for an array of input texts.
   * @param {string[]} texts - Array of string chunks
   * @returns {Promise<Array<{vector: number[], dimensions: number, provider: string, model: string}>>}
   */
  async embedBatch(texts) {
    throw new Error('Method not implemented.');
  }

  /**
   * Generates embedding for a single text.
   * @param {string} text 
   */
  async embedSingle(text) {
    throw new Error('Method not implemented.');
  }
}
