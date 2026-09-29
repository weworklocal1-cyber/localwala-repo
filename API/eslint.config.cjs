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
    // `src/shared/` is included from Phase 3.6a because a shared kernel starts
    // life as a *verbatim move* of a legacy service. Without this the two moved
    // files surfaced 81 pre-existing `no-useless-assignment` errors the moment
    // they changed directory - not one of them caused by the move. The
    // exemption follows the code, it is not a blanket waiver for new code.
    files: ['src/services/**/*.js', 'src/shared/**/*.js'],
    rules: {
      'no-useless-assignment': 'off',
    },
  },
  // Phase 3.2: the domain boundary. A custom rule rather than
  // `no-restricted-imports` because the rule needs to know which domain the
  // file being linted belongs to - see tools/eslint-rules/domain-boundary.cjs.
  {
    // Shared kernels are governed too, and deliberately: a kernel is exempt as
    // an import *target*, but it must not itself reach sideways into a
    // business domain. That is the direction a shared kernel can rot in.
    files: [
      'src/services/**/*.js',
      'src/models/**/*.js',
      'src/domains/**/*.ts',
      'src/shared/**/*.js',
    ],
    plugins: {
      local: { rules: { 'domain-boundary': require('./tools/eslint-rules/domain-boundary.cjs') } },
    },
    rules: {
      'local/domain-boundary': 'error',
    },
  },
  // TypeScript: new code only. `tsc --noEmit` is the real gate; these rules
  // catch the things the type system lets through (floating promises aside,
  // ban-ts-comment, no-explicit-any usage, unused locals).
  {
    // `apps/**` is the gateway. It was absent here, and absent from the root
    // tsconfig's include, so the new code was invisible to both gates while
    // `npm run lint` and `npm run typecheck` still reported success. A gate
    // that is not pointed at the code is the same failure as a rule that never
    // fires, and it is why the gateway's own tsconfig now exists.
    files: ['src/**/*.ts', 'apps/**/*.ts'],
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
