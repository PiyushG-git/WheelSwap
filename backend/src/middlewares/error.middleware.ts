import { Request, Response, NextFunction } from 'express';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/appError.util';
import { ApiResponseBuilder } from '../utils/response.util';
import { logger } from '../config/logger.config';
import { env } from '../config/env.config';
import { ZodError } from 'zod';
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken';

/**
 * Global Express error handling middleware.
 * Must be registered last in app.ts.
 */
export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void {
  // ── Operational / known errors ──────────────────────────────
  if (err instanceof AppError) {
    logger.warn(`[AppError] ${req.method} ${req.path} — ${err.statusCode}: ${err.message}`);
    ApiResponseBuilder.error(res, err.message, err.statusCode);
    return;
  }

  // ── Zod validation errors ────────────────────────────────────
  if (err instanceof ZodError) {
    const errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
    ApiResponseBuilder.validationError(res, errors);
    return;
  }

  // ── JWT errors ───────────────────────────────────────────────
  if (err instanceof TokenExpiredError) {
    ApiResponseBuilder.unauthorized(res, 'Token has expired');
    return;
  }
  if (err instanceof JsonWebTokenError) {
    ApiResponseBuilder.unauthorized(res, 'Invalid token');
    return;
  }

  // ── Prisma errors ────────────────────────────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    logger.error(`[PrismaError] ${err.code}: ${err.message}`);
    switch (err.code) {
      case 'P2002': {
        const fields = (err.meta?.target as string[])?.join(', ') ?? 'field';
        ApiResponseBuilder.conflict(res, `${fields} already exists`);
        return;
      }
      case 'P2025':
        ApiResponseBuilder.notFound(res, 'Record not found');
        return;
      case 'P2003':
        ApiResponseBuilder.error(res, 'Related record not found', 400);
        return;
      case 'P2014':
        ApiResponseBuilder.error(res, 'Invalid relationship constraint', 400);
        return;
      default:
        ApiResponseBuilder.error(res, 'Database error', 500);
        return;
    }
  }

  if (err instanceof Prisma.PrismaClientValidationError) {
    ApiResponseBuilder.error(res, 'Database validation error', 400);
    return;
  }

  // ── Multer errors ────────────────────────────────────────────
  const multerErr = err as { code?: string; message?: string };
  if (multerErr.code === 'LIMIT_FILE_SIZE') {
    ApiResponseBuilder.error(res, 'File too large. Max size is 10MB', 413);
    return;
  }
  if (multerErr.code === 'LIMIT_FILE_COUNT') {
    ApiResponseBuilder.error(res, 'Too many files uploaded', 400);
    return;
  }
  if (multerErr.code === 'LIMIT_UNEXPECTED_FILE') {
    ApiResponseBuilder.error(res, 'Unexpected file field', 400);
    return;
  }

  // ── Unknown / programming errors ─────────────────────────────
  const error = err as Error;
  logger.error(`[UnhandledError] ${req.method} ${req.path}`, {
    message: error.message,
    stack: env.NODE_ENV === 'development' ? error.stack : undefined,
  });

  ApiResponseBuilder.error(
    res,
    env.NODE_ENV === 'production' ? 'Internal server error' : error.message,
    500
  );
}

/**
 * 404 handler for unmatched routes
 */
export function notFoundHandler(req: Request, res: Response): void {
  ApiResponseBuilder.notFound(res, `Route ${req.method} ${req.originalUrl} not found`);
}
