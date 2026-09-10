/**
 * Thin wrapper around the SQLite driver so repositories never import the
 * driver package directly - if you switch expo-sqlite -> quick-sqlite ->
 * SQLCipher later (see README, "encryption" section), only this file changes.
 *
 * NOTE: this is a structural stub. Wire up your chosen driver's real
 * open/exec/query calls here; the interface below is what the rest of the
 * app is written against.
 */
export interface Database {
  execute(sql: string, params?: unknown[]): Promise<void>;
  query<T>(sql: string, params?: unknown[]): Promise<T[]>;
  transaction(work: (tx: Database) => Promise<void>): Promise<void>;
}

export async function openDatabase(_name = 'finance.db'): Promise<Database> {
  // Example with expo-sqlite:
  //
  // import * as SQLite from 'expo-sqlite';
  // const db = await SQLite.openDatabaseAsync(name);
  // await db.execAsync(SCHEMA_SQL);
  // return {
  //   execute: (sql, params) => db.runAsync(sql, params ?? []),
  //   query: (sql, params) => db.getAllAsync(sql, params ?? []),
  //   transaction: (work) => db.withTransactionAsync(() => work(wrappedDb)),
  // };
  //
  // For encrypted storage, swap to react-native-quick-sqlite with SQLCipher
  // support and pass an encryption key pulled from Keychain/Keystore
  // (never hardcode it, never store it in the db itself).
  throw new Error('openDatabase: wire up your chosen SQLite driver here');
}
