/**
 * Domain model: what the app's business logic actually cares about.
 * Deliberately has no `sync_status`, no `server_id` - those are persistence
 * concerns and live in the data layer's row type. Mapping between the two
 * happens in the repository (see TransactionRepository.ts).
 */
export interface Transaction {
  id: string;
  amount: number;
  currency: string;
  note?: string;
  categoryId: string;
  occurredAt: Date;
}

export interface NewTransaction {
  amount: number;
  currency: string;
  note?: string;
  categoryId: string;
  occurredAt: Date;
}
