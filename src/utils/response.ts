// ─── Success Response ─────────────────────────────────────────────────────────

interface SuccessOptions<T> {
  message: string;
  data: T;
  meta?: Record<string, unknown>;
}

export function successResponse<T>({ message, data, meta }: SuccessOptions<T>) {
  return {
    success: true,
    message,
    data,
    ...(meta ? { meta } : {}),
  };
}

// ─── Error Response ───────────────────────────────────────────────────────────

interface ErrorOptions {
  message: string;
  errors?: Record<string, string[]> | null;
  stack?: string;
}

export function errorResponse({ message, errors, stack }: ErrorOptions) {
  return {
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(stack ? { stack } : {}),
  };
}
