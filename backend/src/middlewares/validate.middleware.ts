import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ApiResponseBuilder } from '../utils/response.util';

type RequestPart = 'body' | 'query' | 'params';

/**
 * Zod-based request validator middleware factory.
 * Usage: validate(MyZodSchema) — validates req.body by default
 * Usage: validate(MyZodSchema, 'query') — validates req.query
 */
export function validate(schema: ZodSchema, part: RequestPart = 'body') {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      const errors = result.error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      ApiResponseBuilder.validationError(res, errors);
      return;
    }

    // Replace the request part with the parsed (coerced) data
    req[part] = result.data;
    next();
  };
}
