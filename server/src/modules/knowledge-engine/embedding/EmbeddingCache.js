import crypto from 'crypto';

/**
 * Basic in-memory cache to prevent redundant API calls to embedding providers.
 * In a real enterprise system, this connects to Redis.
 */
class CacheStore {
  constructor() {
    this.cache = new Map();
  }

  generateHash(text) {
    return crypto.createHash('sha256').update(text).digest('hex');
  }

  get(text) {
    const hash = this.generateHash(text);
    return this.cache.get(hash);
  }

  set(text, embeddingResult) {
    const hash = this.generateHash(text);
    this.cache.set(hash, embeddingResult);
  }
}

export const EmbeddingCache = new CacheStore();
