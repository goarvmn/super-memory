import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import prettier from 'eslint-config-prettier';

export default [
  // Base JavaScript rules
  js.configs.recommended,

  // TypeScript files
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.base.json',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': tseslint,
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-inferrable-types': 'error',

      // General code quality
      'no-console': 'warn',
      'no-debugger': 'error',
      'prefer-const': 'error',
      'no-var': 'error',

      // Import/Export
      'no-duplicate-imports': 'error',

      // Spacing and formatting
      indent: 'off',
      quotes: 'off',
      semi: 'off',
    },
  },

  // Client-specific rules (React)
  {
    files: ['client/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'no-console': 'warn', // Allow console in client for debugging
    },
  },

  // Server-specific rules (Node.js)
  {
    files: ['server/**/*.{ts,js}'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
        },
      ],
      'no-console': 'off', // Allow console.log in server
    },
  },

  // Test files
  {
    files: ['**/*.{test,spec}.{ts,tsx,js}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      'no-console': 'off',
    },
  },

  // Prettier integration - must be last
  prettier,

  // Global ignores
  {
    ignores: ['node_modules/**', 'dist/**', 'build/**', 'coverage/**', '.turbo/**', '*.tsbuildinfo'],
  },
];
