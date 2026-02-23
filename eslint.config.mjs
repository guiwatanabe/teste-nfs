import { defineConfig } from 'eslint/config';
import globals from 'globals';
import js from '@eslint/js';

export default defineConfig([
  // Base configuration for all JavaScript files
  {
    files: ['**/*.{js,mjs,cjs}'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    plugins: { js },
    extends: ['js/recommended'],
  },

  // Production code - stricter rules
  {
    files: ['src/**/*.js'],
    rules: {
      complexity: ['error', 15],
      'max-depth': ['error', 4],
      'max-lines-per-function': ['error', 50],
      'no-console': 'error',
    },
  },

  // Test files - more lenient rules
  {
    files: ['test/**/*.js', '**/*.test.js', '**/*.spec.js'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      'no-unused-vars': 'off',
      'max-lines-per-function': 'off',
    },
  },

  // Configuration files - special rules
  {
    files: ['*.config.js', '*.conf.js'],
    rules: {
      'no-console': 'off',
    },
  },

  // Ignore patterns
  {
    ignores: ['node_modules/', 'dist/', 'coverage/', 'build/'],
  },
]);
