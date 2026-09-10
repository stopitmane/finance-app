/**
 * Deliberately simple DI: a typed service locator, not a full framework.
 * For an app this size, pulling in InversifyJS/tsyringe adds decorator
 * complexity RN's Hermes engine doesn't always play nicely with, and buys
 * you nothing a Map + factory functions don't already give you.
 *
 * Usage:
 *   container.register('transactionRepository', () => new TransactionRepository(db));
 *   const repo = container.resolve('transactionRepository');
 *
 * Swap the registration in tests: container.register('transactionRepository', () => fakeRepo)
 */
type Factory<T> = () => T;

class Container {
  private factories = new Map<string, Factory<unknown>>();
  private singletons = new Map<string, unknown>();

  register<T>(key: string, factory: Factory<T>): void {
    this.factories.set(key, factory);
    this.singletons.delete(key); // force re-resolution, useful in tests
  }

  resolve<T>(key: string): T {
    if (this.singletons.has(key)) {
      return this.singletons.get(key) as T;
    }
    const factory = this.factories.get(key);
    if (!factory) {
      throw new Error(`No factory registered for "${key}". Did you forget to call container.register()?`);
    }
    const instance = factory();
    this.singletons.set(key, instance);
    return instance as T;
  }

  reset(): void {
    this.factories.clear();
    this.singletons.clear();
  }
}

export const container = new Container();

// Central place that lists every dependency key in the app, so there's one
// file to check when you're wondering "what's injectable here?"
export const Tokens = {
  Database: 'database',
  ApiClient: 'apiClient',
  Logger: 'logger',
  TransactionRepository: 'transactionRepository',
  CategoryRepository: 'categoryRepository',
  SyncQueue: 'syncQueue',
} as const;
