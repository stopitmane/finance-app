-- Local SQLite schema. This is the source of truth the UI always reads
-- from; the network layer only ever writes here (never straight to state).

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY,
  amount REAL NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  note TEXT,
  category_id TEXT REFERENCES categories(id),
  occurred_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  -- sync bookkeeping: every write-path field lives here, not bolted onto the
  -- domain model, so `Transaction` (domain/models) stays free of sync noise.
  sync_status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'synced' | 'conflict'
  server_id TEXT,
  deleted_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_transactions_occurred_at ON transactions(occurred_at);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_sync_status ON transactions(sync_status);

-- Outbox pattern: every mutation gets queued here before being attempted
-- against the network. This is what makes offline-first + retry possible
-- without special-casing every screen.
CREATE TABLE IF NOT EXISTS sync_queue (
  id TEXT PRIMARY KEY,
  entity_type TEXT NOT NULL, -- 'transaction' | 'category'
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL, -- 'create' | 'update' | 'delete'
  payload TEXT NOT NULL, -- JSON snapshot at time of queueing
  attempt_count INTEGER NOT NULL DEFAULT 0,
  next_attempt_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
