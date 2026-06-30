export class AnalyticsError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = 'AnalyticsError';
    this.code = code;
    this.details = details;
  }
}

export const ERROR_CODES = {
  INVALID_METRIC: 'INVALID_METRIC',
  REPORT_GENERATION_FAILED: 'REPORT_GENERATION_FAILED',
  EXPORT_FAILED: 'EXPORT_FAILED',
  MONITOR_FAILED: 'MONITOR_FAILED',
};
