import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async (or sync) route handler and forwards any rejected promise to Express's
 * next(err) — eliminating the need for try/catch in every controller.
 */
export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => void | Promise<void>,
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = fn(req, res, next);
    if (result instanceof Promise) {
      result.catch(next);
    }
  };
};
