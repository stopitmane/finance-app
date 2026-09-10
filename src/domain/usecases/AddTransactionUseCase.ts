import type { ITransactionRepository } from '../../data/repositories/ITransactionRepository';
import type { NewTransaction, Transaction } from '../models/Transaction';
import { Result, err } from '../../core/types/Result';
import { AppError, validationError } from '../../core/errors/AppError';

/**
 * Use-cases hold business rules that don't belong in a repository (pure
 * persistence) or a component (pure presentation). This is intentionally
 * the smallest possible example - most of your business rules will live
 * in use-cases like this one, not scattered across screens.
 */
export class AddTransactionUseCase {
  constructor(private readonly repository: ITransactionRepository) {}

  async execute(input: NewTransaction): Promise<Result<Transaction, AppError>> {
    if (input.amount <= 0) {
      return err(validationError('amount', 'Amount must be greater than zero'));
    }
    if (!input.categoryId) {
      return err(validationError('categoryId', 'A category is required'));
    }

    return this.repository.add(input);
  }
}
