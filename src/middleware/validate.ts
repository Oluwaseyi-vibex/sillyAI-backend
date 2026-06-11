import { Request, Response, NextFunction } from 'express';
import { type ZodSchema } from 'zod';
import { errorResponse } from '../utils/response';

/**
 * Request validation middleware factory.
 * Validates req.body, req.params, and req.query against a Zod schema.
 * Returns a structured 422 response on failure.
 *
 * @example
 *   router.post('/register', validate(registerSchema), controller.register)
 */
export function validate(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse({
      body: req.body as unknown,
      params: req.params,
      query: req.query,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string[]> = {};

      for (const issue of result.error.issues) {
        // Remove the "body." / "params." / "query." prefix from the path
        const path = issue.path.slice(1).join('.');
        if (!fieldErrors[path]) {
          fieldErrors[path] = [];
        }
        fieldErrors[path].push(issue.message);
      }

      res.status(422).json(
        errorResponse({
          message: 'Validation failed',
          errors: fieldErrors,
        }),
      );
      return;
    }

    // Attach validated + coerced values back to the request
    const validated = result.data as {
      body?: Record<string, unknown>;
      params?: Record<string, string>;
      query?: Record<string, string>;
    };

    if (validated.body) req.body = validated.body;
    if (validated.params) req.params = validated.params;
    if (validated.query) req.query = validated.query;

    next();
  };
}
