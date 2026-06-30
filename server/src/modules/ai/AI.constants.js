export const AI_EVENTS = {
  PROMPT_RECEIVED: 'ai.prompt.received',
  KNOWLEDGE_RETRIEVED: 'ai.knowledge.retrieved',
  PROVIDER_CALLED: 'ai.provider.called',
  RESPONSE_GENERATED: 'ai.response.generated',
  STREAM_STARTED: 'ai.stream.started',
  STREAM_ENDED: 'ai.stream.ended',
  HALLUCINATION_DETECTED: 'ai.hallucination.detected',
  SECURITY_VIOLATION: 'ai.security.violation',
  ERROR: 'ai.error',
  ANALYTICS_LOGGED: 'ai.analytics.logged',
};

export const PROVIDER_TYPES = {
  OPENAI: 'openai',
  GEMINI: 'gemini',
  ANTHROPIC: 'anthropic',
  OPENROUTER: 'openrouter',
  MOCK: 'mock',
};

export const CONVERSATION_STATUS = {
  ACTIVE: 'active',
  ARCHIVED: 'archived',
  COMPRESSED: 'compressed',
};

export const AI_LIMITS = {
  MAX_HISTORY_TOKENS: 4000,
  MAX_RETRIEVAL_TOKENS: 4000,
  MAX_TOTAL_TOKENS: 16000, // e.g. for gpt-3.5-turbo-16k or gpt-4o
};
