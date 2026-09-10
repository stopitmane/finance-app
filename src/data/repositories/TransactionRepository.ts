import { randomUUID } from 'expo-crypto'; // or 'react-native-uuid', whichever you already depend on
import type { Database } from '../local/database';
import type { ApiClient } from '../network/ApiClient';
import type { Logger } from '../../core/logger/Logger';
import type { ITransactionRepository, TransactionFilters, Page } from './ITransactionRepository';
import type { Transaction, NewTransaction } from '../../domain/models/Transaction';
import { Result, ok, err } from '../../core/types/Result';
import { AppError, databaseError } from '../../core/errors/AppError';

/** Row shape as stored in SQLite - includes sync bookkeeping fields. */
interface TransactionRow {
  id: string;
  amount: number;
  currency: string;
  note: string | null;
  category_id: string;
  occurred_at: string;
  updated_at: string;
  sync_status: 'pending' | 'synced' | 'conflict';
  server_id: string | null;
}

function rowToDomain(row: TransactionRow): Transaction {
  return {
    id: row.id,
    amount: row.amount,
    currency: row.currency,
    note: row.note ?? undefined,
    categoryId: row.category_id,
    occurredAt: new Date(row.occurred_at),
  };
}

export class TransactionRepository implements ITransactionRepository {
  constructor(
    private readonly db: Database,
    private readonly api: ApiClient,
    private readonly logger: Logger,
  ) {}

  async add(input: NewTransaction): Promise<Result<Transaction, AppError>> {
    const id = randomUUID();
    const now = new Date().toISOString();

    try {
      // Optimistic write: the row lands in SQLite immediately with
      // sync_status = 'pending'. The UI reads this row right away - it
      // never waits on the network round-trip.
      await this.db.transaction(async (tx) => {
        await tx.execute(
          `INSERT INTO transactions (id, amount, currency, note, category_id, occurred_at, created_at, updated_at, sync_status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
          [id, input.amount, input.currency, input.note ?? null, input.categoryId, input.occurredAt.toISOString(), now, now],
        );
        await tx.execute(
          `INSERT INTO sync_queue (id, entity_type, entity_id, operation, payload, next_attempt_at, created_at)
           VALUES (?, 'transaction', ?, 'create', ?, ?, ?)`,
          [randomUUID(), id, JSON.stringify({ ...input, id }), now, now],
        );
      });

      return ok({ id, ...input });
    } catch (cause) {
      this.logger.error('Failed to add transaction locally', cause);
      return err(databaseError('Could not save transaction'));
    }
  }

  async update(id: string, changes: Partial<NewTransaction>): Promise<Result<Transaction, AppError>> {
    // Same shape as add(): write locally + queue, don't touch the network here.
    throw new Error('Not implemented - mirror add() pattern with an UPDATE + queued op');
  }

  async delete(id: string): Promise<Result<void, AppError>> {
    // Soft delete: set deleted_at, queue a 'delete' op, filter deleted_at IS NULL
    // everywhere else. Never hard-delete before a sync has confirmed the
    // server has seen it - otherwise a queued create/delete can race.
    throw new Error('Not implemented - see comment above for the intended approach');
  }

  async getPage(filters: TransactionFilters, cursor: string | null, limit: number): Promise<Result<Page<Transaction>, AppError>> {
    try {
      const conditions: string[] = ['deleted_at IS NULL'];
      const params: unknown[] = [];

      if (filters.categoryId) {
        conditions.push('category_id = ?');
        params.push(filters.categoryId);
      }
      if (filters.searchQuery) {
        conditions.push('note LIKE ?');
        params.push(`%${filters.searchQuery}%`);
      }
      if (cursor) {
        conditions.push('occurred_at < ?');
        params.push(cursor);
      }

      const rows = await this.db.query<TransactionRow>(
        `SELECT * FROM transactions WHERE ${conditions.join(' AND ')} ORDER BY occurred_at DESC LIMIT ?`,
        [...params, limit + 1], // fetch one extra to know if there's a next page
      );

      const hasMore = rows.length > limit;
      const items = rows.slice(0, limit).map(rowToDomain);
      const nextCursor = hasMore ? items[items.length - 1].occurredAt.toISOString() : null;

      return ok({ items, nextCursor });
    } catch (cause) {
      this.logger.error('Failed to page transactions', cause);
      return err(databaseError('Could not load transactions'));
    }
  }

  async sync(): Promise<Result<{ synced: number; conflicts: number }, AppError>> {
    // Pull queued ops from sync_queue, POST/PUT to the API via `this.api`,
    // on success mark sync_status = 'synced' and store server_id, on 409
    // mark 'conflict' (see AppError's 'conflict' variant) and surface it to
    // the UI rather than silently overwriting. On network failure, leave
    // the row queued and bump attempt_count/next_attempt_at for backoff.
    throw new Error('Not implemented - this is the centerpiece of Phase 3, build it deliberately');
  }
}
