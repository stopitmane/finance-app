import { useCallback, useEffect, useState } from 'react';
import { container, Tokens } from '../../core/di/container';
import type { ITransactionRepository } from '../../data/repositories/ITransactionRepository';
import type { Transaction } from '../../domain/models/Transaction';
import type { AppError } from '../../core/errors/AppError';

type ViewState =
  | { status: 'loading' }
  | { status: 'empty' }
  | { status: 'error'; error: AppError }
  | { status: 'success'; transactions: Transaction[]; hasMore: boolean };

/**
 * The screen component (TransactionsScreen.tsx) should be almost entirely
 * dumb rendering of `state`. All the "what state are we in" logic lives
 * here, which is what makes the screen easy to visually reason about and
 * this hook easy to unit test without rendering anything.
 */
export function useTransactionsViewModel() {
  const [state, setState] = useState<ViewState>({ status: 'loading' });
  const [cursor, setCursor] = useState<string | null>(null);

  const repo = container.resolve<ITransactionRepository>(Tokens.TransactionRepository);

  const load = useCallback(async (nextCursor: string | null = null) => {
    setState({ status: 'loading' });
    const result = await repo.getPage({}, nextCursor, 20);

    if (!result.ok) {
      setState({ status: 'error', error: result.error });
      return;
    }
    if (result.value.items.length === 0 && !nextCursor) {
      setState({ status: 'empty' });
      return;
    }
    setState({ status: 'success', transactions: result.value.items, hasMore: result.value.nextCursor !== null });
    setCursor(result.value.nextCursor);
  }, [repo]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    state,
    retry: () => load(),
    loadMore: () => cursor && load(cursor),
  };
}
