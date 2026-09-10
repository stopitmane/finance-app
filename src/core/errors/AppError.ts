/**
 * Every error that crosses a layer boundary should be one of these, not a
 * raw Error/string. This is what lets the UI layer decide "show a retry
 * button" vs "show a toast" vs "log out the user" based on error *type*
 * rather than parsing a message string.
 */
export type AppError =
  | { type: 'network'; message: string; retryable: boolean }
  | { type: 'database'; message: string }
  | { type: 'validation'; field: string; message: string }
  | { type: 'auth'; message: string }
  | { type: 'conflict'; message: string; serverValue: unknown; localValue: unknown }
  | { type: 'unknown'; message: string; cause?: unknown };

export function networkError(message: string, retryable = true): AppError {
  return { type: 'network', message, retryable };
}

export function databaseError(message: string): AppError {
  return { type: 'database', message };
}

export function validationError(field: string, message: string): AppError {
  return { type: 'validation', field, message };
}

export function unknownError(cause: unknown): AppError {
  return {
    type: 'unknown',
    message: cause instanceof Error ? cause.message : 'Unexpected error',
    cause,
  };
}
