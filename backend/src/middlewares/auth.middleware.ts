import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt.util';
import { ApiResponseBuilder } from '../utils/response.util';
import { UserRole } from '@prisma/client';
import { prisma } from '../config/database.config';

/**
 * Protects routes — verifies JWT access token.
 * Attaches decoded user to req.user.
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      ApiResponseBuilder.unauthorized(res, 'Access token missing');
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = verifyAccessToken(token);

    // Ensure user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: payload.sub, deletedAt: null },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (!user || !user.isActive) {
      ApiResponseBuilder.unauthorized(res, 'User account not found or deactivated');
      return;
    }

    req.user = { id: user.id, email: user.email, role: user.role };
    next();
  } catch (error: unknown) {
    const err = error as Error;
    if (err.name === 'TokenExpiredError') {
      ApiResponseBuilder.unauthorized(res, 'Access token expired');
    } else if (err.name === 'JsonWebTokenError') {
      ApiResponseBuilder.unauthorized(res, 'Invalid access token');
    } else {
      next(error);
    }
  }
}

/**
 * Parses JWT access token optionally without blocking request if missing or expired.
 * Attaches decoded user to req.user if valid.
 */
export async function optionalAuthenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      // Ignore invalid or expired token for optional auth
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.sub, deletedAt: null },
      select: { id: true, email: true, role: true, isActive: true },
    });

    if (user && user.isActive) {
      req.user = { id: user.id, email: user.email, role: user.role };
    }
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Role-based access control middleware factory.
 * Usage: authorize(UserRole.ADMIN)
 */
export function authorize(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      ApiResponseBuilder.unauthorized(res);
      return;
    }
    if (!roles.includes(req.user.role)) {
      ApiResponseBuilder.forbidden(res, 'Insufficient permissions');
      return;
    }
    next();
  };
}

/**
 * Requires KYC to be verified.
 * Must be used after authenticate middleware.
 */
export async function requireKyc(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user) {
      ApiResponseBuilder.unauthorized(res);
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isKycVerified: true },
    });

    if (!user?.isKycVerified) {
      ApiResponseBuilder.forbidden(
        res,
        'KYC verification required to perform this action'
      );
      return;
    }
    next();
  } catch (error) {
    next(error);
  }
}
