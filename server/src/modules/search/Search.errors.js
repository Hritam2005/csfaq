export class SearchError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'SearchError';
    this.code = code;
    this.details = details;
  }
}

export const ERROR_CODES = {
  INVALID_QUERY: 'INVALID_QUERY',
  TIMEOUT_EXCEEDED: 'TIMEOUT_EXCEEDED',
  EMBEDDING_FAILED: 'EMBEDDING_FAILED',
  DATABASE_ERROR: 'DATABASE_ERROR',
  CACHE_UNAVAILABLE: 'CACHE_UNAVAILABLE',
};
