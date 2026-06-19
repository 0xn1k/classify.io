import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export type ErrorCode =
  | "AUTHENTICATION_REQUIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export class ApiError extends Error {
  constructor(
    public readonly status: ContentfulStatusCode,
    public readonly code: ErrorCode,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export function ok<T>(c: Context, data: T, status: ContentfulStatusCode = 200) {
  return c.json({ data, error: null }, status);
}

export function fail(c: Context, error: ApiError) {
  return c.json(
    {
      data: null,
      error: {
        code: error.code,
        message: error.message,
        details: error.details ?? {}
      }
    },
    error.status
  );
}
