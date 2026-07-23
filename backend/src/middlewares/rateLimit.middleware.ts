import rateLimit from 'express-rate-limit';
import { env } from '../config/env.config';
import { ApiResponseBuilder } from '../utils/response.util';

/**
 * General API rate limiter — applied to all routes
 */
export const generalLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    ApiResponseBuilder.tooManyRequests(
      res,
      'Too many requests. Please try again later.'
    );
  },
});

/**
 * Strict limiter for authentication endpoints
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    ApiResponseBuilder.tooManyRequests(
      res,
      'Too many authentication attempts. Please try again in 15 minutes.'
    );
  },
});

/**
 * Limiter for file upload routes
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => {
    ApiResponseBuilder.tooManyRequests(res, 'Upload limit reached. Try again in 1 hour.');
  },
});
