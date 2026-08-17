import js from '@eslint/js';
import globals from 'globals';

export default [
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      globals: { ...globals.browser },
    },
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: { ...globals.node },
    },
    rules: {
      'no-undef': 'off', // TypeScript сам следит за типами
    },
  },
  {
    ignores: ['node_modules/', 'playwright-report/', 'test-results/'],
  },
];