import { AppError, networkError, unknownError } from '../../core/errors/AppError';
import { Result, ok, err } from '../../core/types/Result';
import type { Logger } from '../../core/logger/Logger';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  /** Max retry attempts for retryable failures (network/5xx). Not for 4xx. */
  maxRetries?: number;
}

/**
 * All network calls go through this. Retry/backoff lives here once, not
 * copy-pasted into every repository method.
 */
export class ApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly logger: Logger,
    private readonly getAuthToken: () => Promise<string | null>,
  ) {}

  async request<T>(path: string, options: RequestOptions = {}): Promise<Result<T, AppError>> {
    const maxRetries = options.maxRetries ?? 3;
    let attempt = 0;

    while (true) {
      try {
        const token = await this.getAuthToken();
        const response = await fetch(`${this.baseUrl}${path}`, {
          method: options.method ?? 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...options.headers,
          },
          body: options.body ? JSON.stringify(options.body) : undefined,
        });

        if (response.status >= 500 && attempt < maxRetries) {
          await this.backoff(attempt);
          attempt++;
          continue;
        }

        if (!response.ok) {
          return err(networkError(`Request failed: ${response.status}`, response.status >= 500));
        }

        const data = (await response.json()) as T;
        return ok(data);
      } catch (cause) {
        if (attempt < maxRetries) {
          await this.backoff(attempt);
          attempt++;
          continue;
        }
        this.logger.error('Network request failed after retries', cause, { path });
        return err(unknownError(cause));
      }
    }
  }

  /** Exponential backoff with jitter: 500ms, 1s, 2s (+/- up to 100ms). */
  private backoff(attempt: number): Promise<void> {
    const base = 500 * 2 ** attempt;
    const jitter = Math.random() * 100;
    return new Promise((resolve) => setTimeout(resolve, base + jitter));
  }
}
