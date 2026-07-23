import { Response } from 'express';

export interface ApiResponse<T = null> {
  success: boolean;
  message: string;
  data?: T;
  meta?: PaginationMeta;
  errors?: ValidationError[];
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
}

/**
 * Standardized API response builder
 */
export const ApiResponseBuilder = {
  success<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200,
    meta?: PaginationMeta
  ): Response {
    const response: ApiResponse<T> = {
      success: true,
      message,
      data,
      ...(meta && { meta }),
    };
    return res.status(statusCode).json(response);
  },

  created<T>(res: Response, data: T, message = 'Created successfully'): Response {
    return ApiResponseBuilder.success(res, data, message, 201);
  },

  noContent(res: Response): Response {
    return res.status(204).send();
  },

  error(
    res: Response,
    message: string,
    statusCode = 500,
    errors?: ValidationError[]
  ): Response {
    const response: ApiResponse = {
      success: false,
      message,
      ...(errors && { errors }),
    };
    return res.status(statusCode).json(response);
  },

  unauthorized(res: Response, message = 'Unauthorized'): Response {
    return ApiResponseBuilder.error(res, message, 401);
  },

  forbidden(res: Response, message = 'Forbidden'): Response {
    return ApiResponseBuilder.error(res, message, 403);
  },

  notFound(res: Response, message = 'Resource not found'): Response {
    return ApiResponseBuilder.error(res, message, 404);
  },

  conflict(res: Response, message = 'Conflict'): Response {
    return ApiResponseBuilder.error(res, message, 409);
  },

  validationError(res: Response, errors: ValidationError[]): Response {
    return ApiResponseBuilder.error(res, 'Validation failed', 422, errors);
  },

  tooManyRequests(res: Response, message = 'Too many requests'): Response {
    return ApiResponseBuilder.error(res, message, 429);
  },
};

/**
 * Build pagination meta from query params and total count
 */
export function buildPaginationMeta(
  total: number,
  page: number,
  limit: number
): PaginationMeta {
  const totalPages = Math.ceil(total / limit);
  return {
    total,
    page,
    limit,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

/**
 * Parse pagination params from query with safe defaults
 */
export function parsePagination(query: Record<string, unknown>): {
  page: number;
  limit: number;
  skip: number;
} {
  const page = Math.max(1, parseInt((query.page as string) || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt((query.limit as string) || '10', 10)));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}
