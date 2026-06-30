/**
 * Basic in-memory cache simulating a Redis implementation for Search Responses.
 * Prevents repeating identical semantic/hybrid searches within the TTL window.
 */
class SearchCacheStore {
  constructor() {
    this.cache = new Map();
  }

  _generateKey(prefix, query, filters = {}) {
    const filterString = JSON.stringify(filters);
    // basic base64 to avoid special characters
    return `${prefix}:${Buffer.from(query.toLowerCase() + filterString).toString('base64')}`;
  }

  get(prefix, query, filters = {}) {
    const key = this._generateKey(prefix, query, filters);
    const item = this.cache.get(key);
    
    if (item && item.expiry > Date.now()) {
      return item.data;
    }
    
    // Cleanup expired
    if (item) this.cache.delete(key);
    return null;
  }

  set(prefix, query, filters = {}, data, ttlSeconds) {
    const key = this._generateKey(prefix, query, filters);
    this.cache.set(key, {
      data,
      expiry: Date.now() + (ttlSeconds * 1000),
    });
  }

  clear() {
    this.cache.clear();
  }
}

export const SearchCache = new SearchCacheStore();
