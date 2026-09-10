module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
  },
  plugins: ['@typescript-eslint', 'react', 'react-hooks'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
  ],
  settings: { react: { version: 'detect' } },
  rules: {
    // Force the Result<T,E> pattern - a raw throw crossing a repository/use-case
    // boundary defeats the whole point of the AppError design.
    '@typescript-eslint/no-floating-promises': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    // Allow unused vars that start with underscore (stub implementations)
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
  },
  env: { 
    es6: true,
    node: true,
    jest: true,
  },
  globals: {
    __DEV__: 'readonly',
  },
};
