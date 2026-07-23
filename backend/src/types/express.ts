import { UserRole } from '@prisma/client';

/**
 * Extends Express Request interface globally
 */
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: UserRole;
      };
    }
  }
}

export {};
