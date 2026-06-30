export class BaseVectorStore {
  constructor(config = {}) {
    this.config = config;
  }

  /**
   * Insert vectors with their corresponding metadata/payloads.
   * @param {Array<{id: string, vector: number[], metadata: Object}>} vectors 
   */
  async insert(vectors) {
    throw new Error('insert() must be implemented by subclass');
  }

  /**
   * Search for similar vectors.
   * @param {number[]} queryVector 
   * @param {number} limit 
   * @param {Object} filters 
   * @returns {Promise<Array<{id: string, score: number, metadata: Object}>>}
   */
  async search(queryVector, limit = 10, filters = {}) {
    throw new Error('search() must be implemented by subclass');
  }

  /**
   * Delete vectors by their IDs.
   * @param {string[]} ids 
   */
  async delete(ids) {
    throw new Error('delete() must be implemented by subclass');
  }
}
