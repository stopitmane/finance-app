import type { Transaction, NewTransaction } from '../../domain/models/Transaction';
import type { Result } from '../../core/types/Result';
import type { AppError } from '../../core/errors/AppError';

export interface TransactionFilters {
  categoryId?: string;
  searchQuery?: string;
  from?: Date;
  to?: Date;
}

export interface Page<T> {
  items: T[];
  nextCursor: string | null;
}

/**
 * Use-cases and viewmodels depend on THIS interface, never on
 * TransactionRepository directly. That's what makes AddTransactionUseCase
 * testable with a fake in-memory repo instead of a real SQLite database.
 */
export interface ITransactionRepository {
  add(transaction: NewTransaction): Promise<Result<Transaction, AppError>>;
  update(id: string, changes: Partial<NewTransaction>): Promise<Result<Transaction, AppError>>;
  delete(id: string): Promise<Result<void, AppError>>;
  getPage(filters: TransactionFilters, cursor: string | null, limit: number): Promise<Result<Page<Transaction>, AppError>>;
  /** Pushes any locally-queued, unsynced changes to the backend. */
  sync(): Promise<Result<{ synced: number; conflicts: number }, AppError>>;
}
