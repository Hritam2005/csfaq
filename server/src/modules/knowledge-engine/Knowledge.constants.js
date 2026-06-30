export const KNOWLEDGE_EVENTS = {
  INDEXED: 'knowledge.indexed',
  UPDATED: 'knowledge.updated',
  DELETED: 'knowledge.deleted',
  PUBLISHED: 'knowledge.published',
  EMBEDDING_CREATED: 'knowledge.embedding.created',
  EMBEDDING_FAILED: 'knowledge.embedding.failed',
  RELATIONSHIP_CREATED: 'knowledge.relationship.created',
  CACHE_CLEARED: 'knowledge.cache.cleared',
  CACHE_WARMED: 'knowledge.cache.warmed',
};

export const INDEX_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export const RANKING_WEIGHTS = {
  SIMILARITY: 0.6,
  FRESHNESS: 0.15,
  POPULARITY: 0.15,
  AUTHORITY: 0.1,
};
