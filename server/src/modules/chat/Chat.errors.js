export class ChatError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'ChatError';
    this.code = code;
    this.details = details;
  }
}

export const ERROR_CODES = {
  CONVERSATION_NOT_FOUND: 'CONVERSATION_NOT_FOUND',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  STREAM_FAILED: 'STREAM_FAILED',
  EXPORT_FAILED: 'EXPORT_FAILED',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
};
