/**
 * A typed success/failure wrapper. Every repository and use-case returns this
 * instead of throwing, so callers are forced to handle the error path
 * explicitly (no silently-swallowed try/catch, no "just crash" in prod).
 */
export type Result<T, E = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

// Re-export here to avoid a circular import between Result and AppError.
import type { AppError } from '../errors/AppError';
