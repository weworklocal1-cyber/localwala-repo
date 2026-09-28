/**
 * Typecheck gate: `npm test` must fail if any TypeScript in src/ stops
 * compiling. Run standalone with `npm run typecheck`.
 */
import { describe, it, expect } from 'vitest';
import { execSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

describe('TypeScript typecheck', () => {
  it('tsc --noEmit passes', () => {
    let output = '';
    try {
      output = execSync('npm run typecheck', {
        cwd: apiRoot,
        encoding: 'utf8',
        timeout: 180000,
        shell: true,
        stdio: 'pipe',
      });
    } catch (err) {
      expect.fail(
        `typecheck failed:\n${err.stdout || ''}\n${err.stderr || ''}\n${err.message}`
      );
    }
    expect(output).not.toMatch(/error TS\d+/);
  }, 200000);
});
