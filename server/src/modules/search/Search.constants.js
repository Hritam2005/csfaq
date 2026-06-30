export const SEARCH_EVENTS = {
  QUERY_RECEIVED: 'search.query.received',
  RESULTS_RETURNED: 'search.results.returned',
  CACHE_HIT: 'search.cache.hit',
  CACHE_MISS: 'search.cache.miss',
  ZERO_RESULTS: 'search.zero_results',
  TIMEOUT: 'search.timeout',
  ERROR: 'search.error',
  ANALYTICS_LOGGED: 'search.analytics.logged',
};

export const SEARCH_INTENTS = {
  FAQ_LOOKUP: 'faq_lookup',
  DOCUMENT_SEARCH: 'document_search',
  CONCEPT_EXPLORATION: 'concept_exploration',
  NAVIGATIONAL: 'navigational',
  UNKNOWN: 'unknown',
};

export const CACHE_TTL = {
  AUTOCOMPLETE: 60 * 5, // 5 mins
  STANDARD_QUERY: 60 * 60, // 1 hour
  TRENDING: 60 * 60 * 24, // 24 hours
};

export const SEARCH_WEIGHTS = {
  KEYWORD: 0.3,
  SEMANTIC: 0.5,
  METADATA: 0.1,
  POPULARITY: 0.05,
  FRESHNESS: 0.05,
};
