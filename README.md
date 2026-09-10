# 💰 Finance App

[![CI](https://github.com/stopitmane/finance-app/actions/workflows/ci.yml/badge.svg)](https://github.com/stopitmane/finance-app/actions/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.74-61DAFB.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-51-000020.svg)](https://expo.dev/)

A personal expense tracker built with **clean architecture** and **offline-first** design principles. This is an engineering showcase demonstrating proper separation of concerns, testability, and production-ready patterns for mobile development.

## 🎯 Key Features

- **Offline-First Architecture** - All writes land in SQLite immediately, sync happens in background
- **Clean Architecture** - Proper separation: Presentation → Domain → Data
- **Type-Safe** - Full TypeScript with strict mode enabled
- **Testable** - Dependency injection, repository pattern, Result types
- **Production Ready** - Error handling, logging, retry logic, CI/CD pipeline

## 🏗️ Engineering Highlights

This isn't a CRUD tutorial - it's a demonstration of production-grade mobile architecture:

- **Repository Pattern** with interface abstractions for easy testing
- **Result Type** for explicit error handling (no thrown exceptions across boundaries)
- **Dependency Injection** container for loose coupling
- **Optimistic UI** - Instant feedback, background sync
- **Conflict Resolution** - Last-write-wins with visibility (not silent overwrites)
- **CI/CD Pipeline** - Automated linting, type checking, testing with coverage

## 📐 Architecture

```
src/
├── core/            # Cross-cutting: DI container, error types, logger, Result<T,E>
├── data/
│   ├── local/        # SQLite schema + driver wrapper (source of truth)
│   ├── network/      # ApiClient - retry/backoff lives here once
│   └── repositories/ # Implements domain interfaces, maps DB rows <-> domain models
├── domain/
│   ├── models/       # Plain business types, no persistence/sync fields
│   └── usecases/     # Business rules; depend on repository INTERFACES, not implementations
└── presentation/
    ├── screens/      # Dumb rendering of viewmodel state - no business logic
    ├── viewmodels/   # useXViewModel hooks: loading/empty/error/success state machine
    └── components/   # Shared LoadingState/EmptyState/ErrorState/theme
```

**Dependency direction:** `presentation → domain → data`

Domain never imports from presentation or concrete implementations - only from interfaces. This makes use cases testable with fake repositories (see `__tests__/AddTransactionUseCase.test.ts`) with no SQLite, no React, no network involved.

## 🚀 Tech Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - Development tools and managed workflow
- **TypeScript** - Type safety and better DX
- **SQLite** - Local-first data storage (via expo-sqlite)
- **Jest** - Unit testing with coverage
- **ESLint** - Code quality and consistency
- **GitHub Actions** - Automated CI/CD pipeline

## 📦 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/stopitmane/finance-app.git
cd finance-app

# Install dependencies
npm install --legacy-peer-deps

# Run tests
npm test

# Type check
npm run typecheck

# Lint
npm run lint
```

### Running the App

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

## 🧪 Testing Strategy

The project demonstrates proper testing practices:

- **Unit Tests** for use cases (business logic)
- **Fake Repositories** instead of mocking libraries for better readability
- **Coverage Thresholds** enforced in CI
- **No UI dependencies** in domain tests

Example test structure:
```typescript
// Hand-rolled fake, not jest.mock() - more readable, doubles as documentation
class FakeTransactionRepository implements ITransactionRepository {
  public added: NewTransaction[] = [];
  async add(input: NewTransaction) {
    this.added.push(input);
    return ok<Transaction>({ id: 'fake-id', ...input });
  }
  // ... other methods
}
```

## 📊 Project Status

- ✅ Core architecture established
- ✅ Transaction add/list functionality
- ✅ Offline-first write path with queue
- ✅ Unit tests with coverage
- ✅ CI/CD pipeline
- 🚧 Sync implementation (Phase 3)
- 🚧 Update/delete operations
- 🚧 Categories and budgets
- 🚧 E2E tests with Maestro

## 🎓 What I Learned

Building this project taught me:

1. **Clean Architecture in Practice** - How to properly separate concerns in a real mobile app
2. **Offline-First Design** - Optimistic writes, sync queues, conflict resolution
3. **Testable Code** - Dependency injection and interface-based design for testing
4. **TypeScript Best Practices** - Strict mode, Result types, proper type safety
5. **Production Patterns** - Error handling, logging, retry logic, CI/CD

## 📝 Design Decisions

### Why Result<T,E> instead of throw?

Throwing across repository/use-case boundaries defeats explicit error handling. Result types make success/failure explicit in the type system.

### Why hand-rolled fakes instead of mocks?

For small interfaces, fakes are more readable and serve as documentation. They're easier to maintain than mock setup boilerplate.

### Why last-write-wins for conflicts?

For a single-user expense tracker, true concurrent edits are rare. LWW with visibility is simpler than CRDTs and appropriate for this use case.

## 🔗 Links

- **Repository**: [github.com/stopitmane/finance-app](https://github.com/stopitmane/finance-app)
- **CI/CD**: [GitHub Actions](https://github.com/stopitmane/finance-app/actions)

## 📄 License

MIT

---

**Built with ❤️ as a portfolio project to demonstrate production-ready mobile architecture**
