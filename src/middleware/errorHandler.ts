import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import { errorResponse } from '../utils/response';
import { env } from '../config/env';
import { Prisma } from '@prisma/client';

/**
 * Global error handling middleware.
 * Must be registered as the LAST middleware in app.ts (after all routes).
 *
 * Handles:
 *   - AppError (operational, safe to expose)
 *   - Prisma errors (mapped to user-friendly messages)
 *   - JWT errors (should be caught upstream, this is a fallback)
 *   - Unexpected programming errors (generic 500, stack hidden in prod)
 */
export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  const isDev = env.NODE_ENV === 'development';

  // ── Operational AppErrors ──────────────────────────────────────────────────
  if (err instanceof AppError) {
    res.status(err.statusCode).json(
      errorResponse({
        message: err.message,
        stack: isDev ? err.stack : undefined,
      }),
    );
    return;
  }

  // ── Prisma: Unique constraint violation ───────────────────────────────────
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      const target = (err.meta?.target as string[])?.join(', ') ?? 'field';
      res.status(409).json(
        errorResponse({
          message: `A record with this ${target} already exists`,
        }),
      );
      return;
    }

    if (err.code === 'P2025') {
      res.status(404).json(errorResponse({ message: 'The requested resource was not found' }));
      return;
    }
  }

  // ── Prisma: Validation errors ──────────────────────────────────────────────
  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json(errorResponse({ message: 'Invalid data provided' }));
    return;
  }

  // ── Fallback: Unexpected / Programming errors ──────────────────────────────
  console.error('💥 UNHANDLED ERROR:', err);

  res.status(500).json(
    errorResponse({
      message: 'Something went wrong. Please try again later.',
      stack: isDev ? err.stack : undefined,
    }),
  );
}

/**
 * 404 handler — mount before errorHandler, after all routes.
 */
export function notFound(req: Request, _res: Response, next: NextFunction): void {
  next(new AppError(`Cannot ${req.method} ${req.path}`, 404));
}
