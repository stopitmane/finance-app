import { AddTransactionUseCase } from '../src/domain/usecases/AddTransactionUseCase';
import type { ITransactionRepository, TransactionFilters, Page } from '../src/data/repositories/ITransactionRepository';
import type { Transaction, NewTransaction } from '../src/domain/models/Transaction';
import { ok, type Result } from '../src/core/types/Result';
import type { AppError } from '../src/core/errors/AppError';

/**
 * A hand-rolled fake, not a mocking library. For a repository this small,
 * a fake is more readable than jest.mock() boilerplate and doubles as
 * documentation of the interface's contract.
 */
class FakeTransactionRepository implements ITransactionRepository {
  public added: NewTransaction[] = [];

  async add(input: NewTransaction) {
    this.added.push(input);
    return ok<Transaction>({ id: 'fake-id', ...input });
  }
  async update(_id: string, _changes: Partial<NewTransaction>): Promise<Result<Transaction, AppError>> {
    throw new Error('not used in this test');
  }
  async delete(_id: string): Promise<Result<void, AppError>> {
    throw new Error('not used in this test');
  }
  async getPage(_filters: TransactionFilters, _cursor: string | null, _limit: number): Promise<Result<Page<Transaction>, AppError>> {
    return ok<Page<Transaction>>({ items: [], nextCursor: null });
  }
  async sync() {
    return ok({ synced: 0, conflicts: 0 });
  }
}

describe('AddTransactionUseCase', () => {
  const baseInput: NewTransaction = {
    amount: 1000,
    currency: 'NGN',
    categoryId: 'cat-1',
    occurredAt: new Date('2026-01-01'),
  };

  it('rejects a zero or negative amount before touching the repository', async () => {
    const repo = new FakeTransactionRepository();
    const useCase = new AddTransactionUseCase(repo);

    const result = await useCase.execute({ ...baseInput, amount: 0 });

    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error.type).toBe('validation');
    expect(repo.added).toHaveLength(0);
  });

  it('rejects a missing category', async () => {
    const repo = new FakeTransactionRepository();
    const useCase = new AddTransactionUseCase(repo);

    const result = await useCase.execute({ ...baseInput, categoryId: '' });

    expect(result.ok).toBe(false);
    expect(repo.added).toHaveLength(0);
  });

  it('delegates to the repository when input is valid', async () => {
    const repo = new FakeTransactionRepository();
    const useCase = new AddTransactionUseCase(repo);

    const result = await useCase.execute(baseInput);

    expect(result.ok).toBe(true);
    expect(repo.added).toEqual([baseInput]);
  });
});
