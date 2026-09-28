const js = require('@eslint/js');
const prettierConfig = require('eslint-config-prettier');
const tseslint = require('typescript-eslint');

const tsRecommended = tseslint.configs.recommended.reduce(
  (acc, entry) => Object.assign(acc, entry.rules),
  {}
);

module.exports = [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'logs/**',
      'src/models/plugins/**',
    ],
  },
  js.configs.recommended,
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'commonjs',
      globals: {
        console: 'readonly',
        process: 'readonly',
        __dirname: 'readonly',
      },
    },
    rules: {
      'no-console': 'off',
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  {
    files: ['src/services/**/*.js'],
    rules: {
      'no-useless-assignment': 'off',
    },
  },
  // TypeScript: new code only. `tsc --noEmit` is the real gate; these rules
  // catch the things the type system lets through (floating promises aside,
  // ban-ts-comment, no-explicit-any usage, unused locals).
  {
    files: ['src/**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
    },
    rules: {
      ...tsRecommended,
      // `no-undef` is redundant once tsc runs and cannot see the ambient
      // declarations @types/node provides.
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
    },
  },
  prettierConfig,
];
