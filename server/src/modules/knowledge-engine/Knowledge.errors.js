export class KnowledgeError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'KnowledgeError';
    this.code = code;
    this.details = details;
  }
}

export const ERROR_CODES = {
  EMBEDDING_API_ERROR: 'EMBEDDING_API_ERROR',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  GRAPH_CYCLE_DETECTED: 'GRAPH_CYCLE_DETECTED',
  INDEX_BUILD_FAILED: 'INDEX_BUILD_FAILED',
  CACHE_ERROR: 'CACHE_ERROR',
  NODE_NOT_FOUND: 'NODE_NOT_FOUND',
};
