# Finance App

A personal expense tracker built as an offline-first engineering project, not a CRUD tutorial. See the root of this conversation for the full scope; this README covers how the code is organized so the pattern is reusable for every new feature.

## Architecture

```
src/
├── core/            # Cross-cutting: DI container, error types, logger, Result<T,E>
├── data/
│   ├── local/        # SQLite schema + driver wrapper (source of truth)
│   ├── network/       # ApiClient - retry/backoff lives here once
│   └── repositories/   # Implements domain interfaces, maps DB rows <-> domain models
├── domain/
│   ├── models/        # Plain business types, no persistence/sync fields
│   └── usecases/      # Business rules; depend on repository INTERFACES, not implementations
└── presentation/
    ├── screens/       # Dumb rendering of viewmodel state - no business logic
    ├── viewmodels/     # useXViewModel hooks: loading/empty/error/success state machine
    └── components/     # Shared LoadingState/EmptyState/ErrorState/theme
```

**Dependency direction:** `presentation → domain → data`. Domain never imports from presentation or the concrete `TransactionRepository` - only from `ITransactionRepository`. That's what makes `AddTransactionUseCase` testable with a fake repository (see `__tests__/AddTransactionUseCase.test.ts`) with no SQLite, no React, no network involved.

## The vertical slice pattern

`Transaction` (add + list) is built end-to-end as the template: domain model → repository interface → SQLite-backed implementation → use-case → viewmodel → screen → test. Every other feature (categories, recurring transactions, budgets) should copy this shape rather than inventing a new one - that consistency is the actual engineering deliverable here, more than any individual feature.

## Offline-first / sync design

- Every write lands in SQLite immediately (`sync_status = 'pending'`) and is queued in the `sync_queue` outbox table in the same transaction - see `TransactionRepository.add()`.
- `sync()` drains the queue against the API with retry/backoff (`ApiClient` handles the backoff itself).
- Conflict strategy is **last-write-wins by `updated_at`**, with a `conflict` `AppError` variant surfaced to the UI rather than silently overwritten - see `ErrorState.tsx`'s `conflict` branch. This is a deliberate simplification over CRDTs, worth defending explicitly in an interview: for a single-user expense log, true concurrent edits are rare, and LWW-with-visibility is a better cost/benefit than a merge-log architecture that adds real complexity for edge cases this app is unlikely to hit.

## What's stubbed vs. real

- `openDatabase()`, `update()`, `delete()`, and `sync()` on `TransactionRepository` are intentionally left as documented stubs - they're the next things to implement, in that order. `sync()` is the centerpiece of the offline-first phase; don't rush it.
- Encryption: swap `expo-sqlite` for `react-native-quick-sqlite` with SQLCipher once the schema stabilizes, pulling the encryption key from Keychain/Keystore (`expo-secure-store` or `react-native-keychain`).
- Crash reporting: wire `Logger.error()`'s TODO to `Sentry.captureException()` - one line, once you've created a Sentry project.

## Running things

```bash
npm install
npm run typecheck
npm run lint
npm test
```

CI (`.github/workflows/ci.yml`) runs lint + typecheck + unit tests with coverage on every push/PR. UI tests (Maestro) are stubbed as a commented-out job - add once there's an actual built app to run flows against.
