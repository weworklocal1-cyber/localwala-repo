/**
 * Phase 3.3: the split of services/orders.service.js must not change what the
 * service exposes, and must not leave dead imports behind.
 *
 * The byte-identity of the moved functions was checked once, with
 * `node tools/split-orders.js --verify`, against the pre-split file in git.
 * That check is only meaningful before the commit, so it cannot be a
 * regression test. What *can* hold afterwards are the structural invariants,
 * and those are what this file pins down.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const API_ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(API_ROOT, 'src', 'services');
const ORDERS = path.join(SRC, 'orders.service.js');
const ANALYTICS = path.join(SRC, 'orders.analytics.internal.js');

/** The eight queries the analytics kernel owns. */
const MOVED = [
  'orderEarningBreakdown',
  'posOrderEarningBreakdown',
  'tableOrderEarningBreakdown',
  'diningBookingEarningBreakdown',
  'cityBasedOrderEarningBreakdown',
  'cityBasedPOSOrderEarningBreakdown',
  'cityBasedTableOrderEarningBreakdown',
  'cityBasedDiningBookingEarningBreakdown',
];

/** Names bound by a file's top-level requires, and the statement ranges. */
function requires(src) {
  const lines = src.split('\n');
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/^const\s.*=\s*require\(/.test(lines[i]) && !/^const\s*\{\s*$/.test(lines[i])) continue;
    let end = i;
    let stmt = lines[i];
    while (end < lines.length && !/;\s*$/.test(stmt)) stmt += `\n${lines[++end]}`;
    const names = [];
    const braced = stmt.match(/\{([\s\S]*?)\}/);
    if (braced) {
      for (const part of braced[1].split(',')) {
        const n = part.split(':').pop().trim();
        if (n) names.push(n);
      }
    } else {
      const m = stmt.match(/^const\s+([A-Za-z_$][\w$]*)\s*=/);
      if (m) names.push(m[1]);
    }
    out.push({ start: i, end, names, source: stmt });
  }
  return out;
}

/** The names a file's `module.exports = { ... }` block publishes. */
function exportedNames(src) {
  const block = src.match(/module\.exports\s*=\s*\{([\s\S]*?)\n\};/);
  if (!block) return [];
  return [...block[1].matchAll(/([A-Za-z_$][\w$]*)\s*[,:]?/g)].map((m) => m[1]);
}

describe('Phase 3.3 - orders.service analytics split', () => {
  const orders = fs.readFileSync(ORDERS, 'utf8');
  const analytics = fs.readFileSync(ANALYTICS, 'utf8');

  it('moves the eight analytics queries out of orders.service', () => {
    for (const name of MOVED) {
      expect(
        new RegExp(`^const ${name}\\s*=\\s*(?:async\\s*)?\\(`, 'm').test(orders),
        `${name} is still defined in orders.service`
      ).toBe(false);
      expect(
        new RegExp(`^const ${name}\\s*=\\s*(?:async\\s*)?\\(`, 'm').test(analytics),
        `${name} is not defined in the analytics kernel`
      ).toBe(true);
    }
  });

  it('keeps them out of the public surface', () => {
    const surface = exportedNames(orders);
    expect(surface).toHaveLength(86);
    for (const name of MOVED) {
      expect(surface).not.toContain(name);
    }
  });

  it('imports the kernel rather than redeclaring it', () => {
    const binding = requires(orders).find((r) => r.source.includes('orders.analytics.internal'));
    expect(binding, 'orders.service does not require the analytics kernel').toBeTruthy();
    expect([...binding.names].sort()).toEqual([...MOVED].sort());
  });

  it('publishes exactly the moved functions from the kernel', () => {
    expect(exportedNames(analytics).sort()).toEqual([...MOVED].sort());
  });

  it('leaves no unused import behind in either file', () => {
    // An import nobody references is a lint warning, and this repo treats a new
    // warning as a regression. The 31-name `../models` require in
    // orders.service is the case that bit during this split: it survives, so a
    // whole-block orphan check sees it as still needed, while two of its names
    // had become unused and had to be pruned individually.
    for (const [file, src] of [
      ['orders.service', orders],
      ['orders.analytics.internal', analytics],
    ]) {
      const blocks = requires(src);
      const body = blocks
        .reduce((acc, b) => {
          const copy = src.split('\n');
          copy.splice(b.start, b.end - b.start + 1);
          return acc;
        }, src)
        .split('\n')
        .filter((_, i) => !blocks.some((b) => i >= b.start && i <= b.end))
        .join('\n');
      for (const b of blocks) {
        for (const name of b.names) {
          expect(
            new RegExp(`\\b${name}\\b`).test(body),
            `${file}: '${name}' is imported but never used`
          ).toBe(true);
        }
      }
    }
  });

  it('still has the 14 top-level requires it started with', () => {
    // Guard against the block-merge bug: the imports are 14 separate requires
    // on consecutive lines, so any tooling that treats a contiguous run of
    // require-looking lines as one unit can silently drop 13 of them.
    expect(requires(orders)).toHaveLength(14);
  });
});
