export class AIError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'AIError';
    this.code = code;
    this.details = details;
  }
}

export const ERROR_CODES = {
  PROVIDER_FAILED: 'PROVIDER_FAILED',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  HALLUCINATION_DETECTED: 'HALLUCINATION_DETECTED',
  PROMPT_INJECTION: 'PROMPT_INJECTION',
  CONTEXT_WINDOW_EXCEEDED: 'CONTEXT_WINDOW_EXCEEDED',
  INVALID_CONFIGURATION: 'INVALID_CONFIGURATION',
};
