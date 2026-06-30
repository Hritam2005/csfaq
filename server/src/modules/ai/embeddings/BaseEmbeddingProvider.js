export class BaseEmbeddingProvider {
  constructor(config = {}) {
    this.config = config;
    this.modelName = config.modelName || 'default-embedding-model';
    this.dimension = config.dimension || 1536;
  }

  /**
   * Initialize the provider (e.g., set up clients, check API keys)
   */
  async initialize() {
    throw new Error('initialize() must be implemented by subclass');
  }

  /**
   * Generate embeddings for an array of texts.
   * @param {string[]} texts 
   * @returns {Promise<number[][]>} Array of vectors
   */
  async generateEmbeddings(texts) {
    throw new Error('generateEmbeddings() must be implemented by subclass');
  }

  /**
   * Generate embedding for a single text.
   * @param {string} text 
   * @returns {Promise<number[]>}
   */
  async generateEmbedding(text) {
    const results = await this.generateEmbeddings([text]);
    return results[0];
  }
}
