import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { env } from './env.config';

const { combine, timestamp, printf, colorize, errors, json } = winston.format;

const logDir = 'logs';

// Custom log format for console
const consoleFormat = printf(({ level, message, timestamp: ts, stack, ...meta }) => {
  const metaStr = Object.keys(meta).length ? `\n${JSON.stringify(meta, null, 2)}` : '';
  return `${ts} [${level}]: ${stack || message}${metaStr}`;
});

// File transport (JSON, rotated daily)
const fileTransport = new DailyRotateFile({
  dirname: logDir,
  filename: 'wheelswap-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '14d',
  maxSize: '20m',
  format: combine(timestamp(), errors({ stack: true }), json()),
});

// Error-only file transport
const errorFileTransport = new DailyRotateFile({
  level: 'error',
  dirname: path.join(logDir, 'errors'),
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '30d',
  maxSize: '20m',
  format: combine(timestamp(), errors({ stack: true }), json()),
});

export const logger = winston.createLogger({
  level: env.NODE_ENV === 'production' ? 'info' : 'debug',
  defaultMeta: { service: 'wheelswap-api' },
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize({ all: true }),
        timestamp({ format: 'HH:mm:ss' }),
        errors({ stack: true }),
        consoleFormat
      ),
      silent: env.NODE_ENV === 'test',
    }),
    fileTransport,
    errorFileTransport,
  ],
});

export default logger;
