export class AdminError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'AdminError';
    this.code = code;
    this.details = details;
  }
}

export const ERROR_CODES = {
  UNAUTHORIZED_ACTION: 'UNAUTHORIZED_ACTION',
  INVALID_CONFIGURATION: 'INVALID_CONFIGURATION',
  BACKUP_FAILED: 'BACKUP_FAILED',
  RESTORE_FAILED: 'RESTORE_FAILED',
  MAINTENANCE_MODE_ACTIVE: 'MAINTENANCE_MODE_ACTIVE',
};
