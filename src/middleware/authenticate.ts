import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AppError } from '../utils/AppError';
import type { JwtPayload } from '../modules/auth/auth.types';

/**
 * JWT authentication middleware.
 *
 * Accepts the token from:
 *   1. Authorization header: "Bearer <token>"
 *   2. Signed cookie: "token"
 *
 * Attaches the decoded payload to req.user on success.
 */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  try {
    let token: string | undefined;

    // 1. Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    // 2. Fall back to cookie
    if (!token && req.cookies?.token) {
      token = req.cookies.token as string;
    }

    console.log("authenticate middleware:", { authHeader, cookies: req.cookies, token });

    if (!token) {
      throw new AppError('Authentication required. Please log in.', 401);
    }

    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Your session has expired. Please log in again.', 401));
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token. Please log in again.', 401));
      return;
    }

    next(error);
  }
}

/**
 * Role-based authorization middleware factory.
 * Must be used AFTER authenticate.
 *
 * @example
 *   router.get('/admin', authenticate, authorize('ADMIN'), handler)
 */
export function authorize(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new AppError('Authentication required.', 401));
      return;
    }

    if (!roles.includes(req.user.role)) {
      next(new AppError('You do not have permission to perform this action.', 403));
      return;
    }

    next();
  };
}
