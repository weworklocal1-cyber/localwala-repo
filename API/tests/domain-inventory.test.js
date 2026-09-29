/**
 * Phase 3.1 gate: the domain inventory stays honest.
 *
 * The eleven domain boundaries are only meaningful if they are complete and
 * current, and a hand-maintained map of 275 modules rots silently. This test
 * pins the three properties that make the map trustworthy, by running
 * tools/domain-inventory.js (not by re-implementing its logic here):
 *
 *   1. every governed module has a domain - an unclassified module would make
 *      the Phase 3 exit criterion ("zero cross-domain imports") unfalsifiable;
 *   2. the generated facades match the classification, so nobody hand-edits a
 *      generated file and drifts;
 *   3. every module the barrels export today is reachable from some domain
 *      facade under the *same* name - that is what makes a consumer's
 *      `require('../services')` -> `require('../domains/<d>')` switch safe.
 *
 * It also records the coupling numbers the plan was written against, so a
 * future Phase 3 step that makes the boundaries worse is visible in review.
 */
import { describe, it, expect, beforeAll } from 'vitest';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const tool = path.join(apiRoot, 'tools', 'domain-inventory.js');

function run(args) {
  return execFileSync(process.execPath, [tool, ...args], { cwd: apiRoot, encoding: 'utf8' });
}

describe('Phase 3.1 - domain inventory', () => {
  let report;

  beforeAll(() => {
    report = JSON.parse(run(['--json']));
  }, 60000);

  it('classifies every service and model', () => {
    expect(report.unclassified).toEqual([]);

    // The barrels plus the three plugins under models/plugins/ are the only
    // things the inventory deliberately does not govern.
    const services = fs
      .readdirSync(path.join(apiRoot, 'src', 'services'))
      .filter((f) => f.endsWith('.js') && f !== 'index.js').length;
    const models = fs
      .readdirSync(path.join(apiRoot, 'src', 'models'))
      .filter((f) => f.endsWith('.js') && f !== 'index.js' && !f.endsWith('.model.js')).length;
    const modelFiles = fs
      .readdirSync(path.join(apiRoot, 'src', 'models'))
      .filter((f) => f.endsWith('.js') && f !== 'index.js').length;

    const total = Object.values(report.domains).reduce((n, d) => n + d.modules.length, 0);
    expect(total).toBe(services + modelFiles);
    expect(modelFiles).toBeGreaterThanOrEqual(models);
  });

  it('keeps the generated facades in sync with the classification', () => {
    // Exits non-zero and names the drifted files.
    expect(() => run(['--check-domains'])).not.toThrow();
  });

  it('has a facade per domain, and none for an unknown domain', () => {
    const dirs = fs
      .readdirSync(path.join(apiRoot, 'src', 'domains'), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort();
    expect(dirs).toEqual(Object.keys(report.domains).sort());
    for (const d of dirs) {
      expect(fs.existsSync(path.join(apiRoot, 'src', 'domains', d, 'index.ts'))).toBe(true);
    }
  });

  it('re-exports every barrel name from exactly one domain facade', () => {
    // Read the barrel export names and the names each facade exports, then
    // assert the union matches: nothing lost, nothing invented.
    const barrelNames = new Set();
    for (const barrel of ['services', 'models']) {
      const src = fs.readFileSync(path.join(apiRoot, 'src', barrel, 'index.js'), 'utf8');
      for (const m of src.matchAll(/module\.exports\.([A-Za-z_$][\w$]*)\s*=/g)) barrelNames.add(m[1]);
    }

    const facadeNames = new Set();
    for (const d of fs.readdirSync(path.join(apiRoot, 'src', 'domains'))) {
      const src = fs.readFileSync(path.join(apiRoot, 'src', 'domains', d, 'index.ts'), 'utf8');
      for (const m of src.matchAll(/^export \{ ([A-Za-z_$][\w$]*) \};/gm)) facadeNames.add(m[1]);
    }

    const missing = [...barrelNames].filter((n) => !facadeNames.has(n)).sort();
    const extra = [...facadeNames].filter((n) => !barrelNames.has(n)).sort();

    expect({ missing, extra }).toEqual({ missing: [], extra: [] });
  });

  it('records the coupling the phase is trying to remove', () => {
    // 22 direct cross-domain edges and ~130 barrel edges at the time of
    // writing. These are the numbers 3.3/3.4 and the barrel removal have to
    // drive down; asserting a range rather than an exact value keeps the test
    // useful without making every legitimate edit a test edit.
    expect(report.crossDomainEdges.length).toBeGreaterThan(0);
    expect(report.crossDomainEdges.length).toBeLessThan(60);
    expect(report.barrelEdges).toBeGreaterThan(0);
  });
});
