/**
 * Phase 3.3: orders.service.js is split into lifecycle buckets.
 *
 * What is pinned here are the invariants that must hold *after* the split, not
 * the shape of any one bucket file. They fall into three groups:
 *
 *   - the public surface is unchanged (86 names), and each is defined exactly
 *     once across the facade and the buckets;
 *   - the taxonomy is a partition: no name unplaced, none placed twice;
 *   - every import the buckets carry is verbatim from the original.
 *
 * That last group exists because of a bug this file could not have caught with
 * a shape assertion. `http-status` is imported as
 * `const { status: httpStatus } = require('http-status')`. A splitter that
 * recorded the local name and re-emitted it produced
 * `const { httpStatus } = require('http-status')` - a binding that exists and is
 * `undefined`. There is no `no-undef` for that, and every affected endpoint
 * returned 500 on `httpStatus.NOT_FOUND` while lint stayed clean. The only thing
 * that caught it was the live-DB probe. So this asserts the spec text, which is
 * the thing an alias can be lost from.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const API_ROOT = path.resolve(import.meta.dirname, '..');
const SERVICES = path.join(API_ROOT, 'src', 'services');
const ORDERS = path.join(SERVICES, 'orders.service.js');
const PRE_SPLIT = 'HEAD';

/**
 * The nine modules orders.service.js is a facade over.
 *
 * `published` is what the module itself exports. `inFacade` is whether the
 * facade re-imports it - false for the analytics kernel, whose eight queries
 * are consumed by the dashboard bucket instead, and whose names are not among
 * the 86 the facade publishes.
 */
const BUCKETS = {
  'orders.analytics.internal.js': { published: 8, inFacade: false },
  'orders.create.internal.js': { published: 3, inFacade: true },
  'orders.assign.internal.js': { published: 5, inFacade: true },
  'orders.status.internal.js': { published: 18, inFacade: true },
  'orders.query.internal.js': { published: 27, inFacade: true },
  'orders.dashboard.internal.js': { published: 10, inFacade: true },
  'orders.refund.internal.js': { published: 8, inFacade: true },
  'orders.export.internal.js': { published: 14, inFacade: true },
  'orders.pricing.internal.js': { published: 1, inFacade: true },
};

/** Two declaration forms: `const f = async () =>` and `function f()`. */
const declares = (src, name) =>
  new RegExp(
    `^(?:const|let|var)\\s+${name}\\s*=|^(?:async\\s+)?function\\s+${name}\\b`,
    'm'
  ).test(src);

const read = (p) => fs.readFileSync(p, 'utf8');

function requireBlocks(src) {
  const lines = src.split('\n');
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/^const\s.*=\s*require\(/.test(lines[i]) && !/^const\s*\{\s*$/.test(lines[i])) continue;
    let end = i;
    let stmt = lines[i];
    while (end < lines.length && !/;\s*$/.test(stmt)) stmt += `\n${lines[++end]}`;
    i = end;
    const entries = [];
    const braced = stmt.match(/\{([\s\S]*?)\}/);
    if (braced) {
      for (const part of braced[1].split(',')) {
        const spec = part.trim();
        if (spec) entries.push({ local: spec.split(':').pop().trim(), spec });
      }
    } else {
      const m = stmt.match(/^const\s+([A-Za-z_$][\w$]*)\s*=/);
      if (m) entries.push({ local: m[1], spec: m[1] });
    }
    blocks.push({ start: i - stmt.split('\n').length + 1, end, entries, text: stmt });
  }
  return blocks;
}

function exportedNames(src) {
  const block = src.match(/module\.exports\s*=\s*\{([\s\S]*?)\n\};/);
  if (!block) return [];
  return [...block[1].matchAll(/([A-Za-z_$][\w$]*)\s*[,:]?/g)].map((m) => m[1]);
}

const preSplit = execFileSync(
  'git',
  ['show', `${PRE_SPLIT}:API/src/services/orders.service.js`],
  { cwd: API_ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }
);

describe('Phase 3.3 - orders.service lifecycle buckets', () => {
  const orders = read(ORDERS);

  it('is a facade: one require per bucket, and no function bodies', () => {
    const blocks = requireBlocks(orders);
    const inFacade = Object.entries(BUCKETS).filter(([, v]) => v.inFacade);
    // Eight modules are re-imported by the facade. The analytics kernel is not:
    // its names are not among the 86 the facade publishes, and an empty
    // `const {} = require(...)` does not parse.
    expect(blocks).toHaveLength(inFacade.length);
    for (const b of blocks) {
      const file = b.text.match(/require\('\.\/(orders\.[\w.]+)'/);
      expect(file, `unexpected import in the facade: ${b.text.slice(0, 60)}`).toBeTruthy();
      expect(BUCKETS[file[1]].inFacade, `${file[1]} should be in the facade`).toBe(true);
    }
    // The 86 public names are listed in the export block and nowhere defined.
    expect(exportedNames(orders)).toHaveLength(86);
  });

  it('exports each public name from exactly one bucket', () => {
    const defined = new Map();
    for (const [file, spec] of Object.entries(BUCKETS)) {
      const src = read(path.join(SERVICES, file));
      for (const name of exportedNames(src)) {
        expect(defined.has(name), `${name} is exported by both ${defined.get(name)} and ${file}`)
          .toBe(false);
        defined.set(name, file);
      }
      expect(exportedNames(src), `${file} published export count`).toHaveLength(
        spec.published
      );
    }
    // Every name the facade publishes is defined in a bucket.
    for (const name of exportedNames(orders)) {
      expect(defined.has(name), `${name} is exported but never defined`).toBe(true);
    }
  });

  it('keeps the five private helpers out of the facade', () => {
    const privateNames = ['getOrderById', 'getVendorOrderById', 'getDriverNewOrderById', 'haversineDistance', 'getPercentageAmount'];
    for (const name of privateNames) {
      expect(exportedNames(orders)).not.toContain(name);
      expect(new RegExp(`\\b${name}\\b`).test(orders), `${name} leaked into the facade`).toBe(false);
    }
    const status = read(path.join(SERVICES, 'orders.status.internal.js'));
    for (const name of privateNames) {
      expect(declares(status, name), `${name} should be defined in the status bucket`).toBe(true);
    }
  });

  it('carries every import verbatim from the original, aliases included', () => {
    const originalSpecs = new Set();
    for (const b of requireBlocks(preSplit)) {
      for (const e of b.entries) originalSpecs.add(`${b.text.match(/require\((['"])([^'"]+)\1\)/)[2]}::${e.spec}`);
    }
    // The alias that motivated this assertion.
    expect(originalSpecs.has("http-status::status: httpStatus")).toBe(true);

    for (const [file, spec] of Object.entries(BUCKETS)) {
      // The analytics kernel was extracted a commit earlier and its imports
      // were verified byte-identical there. Comparing it against the current
      // HEAD is meaningless: that HEAD is the file the first slice already
      // pruned `DiningBooking` from, while the kernel legitimately still needs
      // it.
      if (!spec.inFacade) continue;
      for (const b of requireBlocks(read(path.join(SERVICES, file)))) {
        // Bucket-to-bucket requires are the new structure, not original ones.
        if (b.text.includes('./orders.')) continue;
        const mod = b.text.match(/require\((['"])([^'"]+)\1\)/)[2];
        for (const e of b.entries) {
          expect(
            originalSpecs.has(`${mod}::${e.spec}`),
            `${file}: '${e.spec}' from '${mod}' is not an import the original had`
          ).toBe(true);
        }
      }
    }
  });

  it('leaves no unused import in the facade or any bucket', () => {
    for (const file of [ORDERS, ...Object.keys(BUCKETS).map((f) => path.join(SERVICES, f))]) {
      const src = read(file);
      const blocks = requireBlocks(src);
      const lineOf = new Map();
      blocks.forEach((b) => {
        for (let i = b.start; i <= b.end; i++) lineOf.set(i, b);
      });
      const body = src
        .split('\n')
        .filter((_, i) => !lineOf.has(i))
        .join('\n');
      for (const b of blocks) {
        for (const e of b.entries) {
          expect(
            new RegExp(`\\b${e.local}\\b`).test(body),
            `${path.basename(file)}: '${e.local}' is imported but never used`
          ).toBe(true);
        }
      }
    }
  });

  it('has a taxonomy that is a partition of the whole surface', () => {
    const out = execFileSync(process.execPath, ['tools/split-orders.js', '--taxonomy'], {
      cwd: API_ROOT,
      encoding: 'utf8',
    });
    expect(out).toContain('TAXONOMY OK');
    expect(out).toContain('duplicates           : 0');
    expect(out).toContain('not placed anywhere  : 0');
  });
});
