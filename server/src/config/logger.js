import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

// Configure Transports
const transports = [
  // Application Logs (Info and above)
  new winston.transports.DailyRotateFile({
    filename: path.join(process.cwd(), 'logs/application-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'info',
    maxSize: '20m',
    maxFiles: '14d',
  }),
  // Error Logs (Error only)
  new winston.transports.DailyRotateFile({
    filename: path.join(process.cwd(), 'logs/error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    maxSize: '20m',
    maxFiles: '30d',
  }),
  // Access Logs (HTTP requests - handled by morgan via stream)
  new winston.transports.DailyRotateFile({
    filename: path.join(process.cwd(), 'logs/access-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'http',
    maxSize: '20m',
    maxFiles: '14d',
  }),
  // Security/Audit Logs
  new winston.transports.DailyRotateFile({
    filename: path.join(process.cwd(), 'logs/security-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'warn',
    maxSize: '20m',
    maxFiles: '90d',
  }),
];

// Add Console transport for development
if (process.env.NODE_ENV !== 'production') {
  transports.push(
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
    })
  );
}

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    errors({ stack: true }), // capture stack traces
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.json() // default format for files
  ),
  transports,
});

// Stream for morgan to use for HTTP access logging
export const logStream = {
  write: (message) => logger.http(message.trim()),
};
