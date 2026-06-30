export class DocumentError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'DocumentError';
    this.code = code;
    this.details = details;
  }
}

export const ERROR_CODES = {
  INVALID_MIME_TYPE: 'INVALID_MIME_TYPE',
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  PARSE_FAILED: 'PARSE_FAILED',
  CHUNK_FAILED: 'CHUNK_FAILED',
  EMBEDDING_FAILED: 'EMBEDDING_FAILED',
  STORAGE_FAILED: 'STORAGE_FAILED',
  VIRUS_DETECTED: 'VIRUS_DETECTED',
  DOCUMENT_NOT_FOUND: 'DOCUMENT_NOT_FOUND',
};
