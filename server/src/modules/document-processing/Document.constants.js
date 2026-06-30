export const DOCUMENT_EVENTS = {
  UPLOADED: 'document.uploaded',
  PARSED: 'document.parsed',
  CHUNKED: 'document.chunked',
  INDEXED: 'document.indexed',
  PUBLISHED: 'document.published',
  ARCHIVED: 'document.archived',
  RESTORED: 'document.restored',
  DELETED: 'document.deleted',
  ERROR: 'document.error',
};

export const PROCESSING_STATUS = {
  PENDING: 'pending',
  UPLOADING: 'uploading',
  VALIDATING: 'validating',
  PARSING: 'parsing',
  CHUNKING: 'chunking',
  EMBEDDING: 'embedding',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'text/plain',
  'text/markdown',
  'text/html',
];

export const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md', '.html'];

export const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
