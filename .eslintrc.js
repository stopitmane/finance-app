module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
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
  },
  env: { 'react-native/react-native': true, jest: true },
};
