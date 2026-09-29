/**
 * Phase 3: every large service is split into lifecycle buckets by
 * tools/split-service.js, driven by a taxonomy in tools/taxonomies/.
 *
 * These tests are driven by the taxonomy modules themselves rather than by a
 * hand-written list per service, so a new service is covered as soon as its
 * taxonomy exists. They assert the invariants that must hold AFTER the split.
 *
 * The strongest of them exists because of a bug no shape assertion could have
 * caught. `http-status` is imported as
 * `const { status: httpStatus } = require('http-status')`. A splitter that
 * recorded the local name and re-emitted it produced
 * `const { httpStatus } = require('http-status')` - a binding that exists and is
 * `undefined`. ESLint has no `no-undef` for that: lint stayed at 0 errors and 6
 * warnings, and a dozen endpoints returned 500 on `httpStatus.NOT_FOUND`. Only
 * tests/db.probe.test.js caught it. So the alias is asserted explicitly, per
 * file, on the spelling rather than on the shape.
 *
 * Byte-identity of the moved text is NOT asserted here. It is checked by
 * `node tools/split-service.js <service> --verify`, which compares against the
 * pre-split file in git and is therefore only meaningful before the commit -
 * a test that depended on it would start failing the moment the work landed.
 */
import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const API_ROOT = path.resolve(import.meta.dirname, '..');
const SERVICES = path.join(API_ROOT, 'src', 'services');
const TAXONOMY_DIR = path.join(API_ROOT, 'tools', 'taxonomies');

const services = fs
  .readdirSync(TAXONOMY_DIR)
  .filter((f) => f.endsWith('.js'))
  .map((f) => f.replace(/\.js$/, ''));

const read = (p) => fs.readFileSync(p, 'utf8');

/** Require statements with their bindings, local names and original specs. */
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
    blocks.push({
      start: i - stmt.split('\n').length + 1,
      end,
      entries,
      text: stmt,
      mod: (stmt.match(/require\((['"])([^'"]+)\1\)/) || [])[2],
    });
  }
  return blocks;
}

function exportedNames(src) {
  const block = src.match(/module\.exports\s*=\s*\{([\s\S]*?)\n\};/);
  if (!block) return [];
  return [...new Set([...block[1].matchAll(/([A-Za-z_$][\w$]*)\s*[,:]?/g)].map((m) => m[1]))];
}

const declares = (src, name) =>
  new RegExp(
    `^(?:const|let|var)\\s+${name}\\s*=|^(?:async\\s+)?function\\s+${name}\\b`,
    'm'
  ).test(src);

describe.each(services)('%s.service.js lifecycle split', (service) => {
  const taxonomy = require(path.join(TAXONOMY_DIR, `${service}.js`));
  const modules = taxonomy.shared
    ? { shared: taxonomy.shared, ...taxonomy.buckets }
    : taxonomy.buckets;
  const facadePath = path.join(SERVICES, `${service}.service.js`);
  const facade = read(facadePath);
  const moduleFiles = Object.entries(modules).filter(([, s]) =>
    fs.existsSync(path.join(SERVICES, s.file))
  );
  const publicNames = Object.values(modules).flatMap((s) => s.names);

  it('has a taxonomy that is a partition of the surface', () => {
    const out = execFileSync(
      process.execPath,
      ['tools/split-service.js', service, '--taxonomy'],
      { cwd: API_ROOT, encoding: 'utf8' }
    );
    expect(out).toContain('TAXONOMY OK');
    expect(out).toContain('duplicates          : 0');
    expect(out).toContain('not placed anywhere : 0');
  });

  it('is a facade: one require per bucket that publishes public names', () => {
    const blocks = requireBlocks(facade);
    const publishing = moduleFiles.filter(([, s]) => s.names.length);
    expect(blocks).toHaveLength(publishing.length);
    for (const b of blocks) {
      const file = b.text.match(/require\('\.\/([\w.]+)'/);
      expect(file, `unexpected facade import: ${b.text.slice(0, 70)}`).toBeTruthy();
      const spec = publishing.find(([, s]) => s.file === file[1]);
      expect(spec, `${file[1]} should publish public names`).toBeTruthy();
      expect(b.entries.map((e) => e.local).sort()).toEqual([...spec[1].names].sort());
    }
  });

  it('publishes exactly the taxonomy public surface, unchanged', () => {
    expect(exportedNames(facade).sort()).toEqual([...publicNames].sort());
    // No stray name in the export block that the taxonomy does not place.
    for (const name of exportedNames(facade)) {
      expect(publicNames, `${name} is exported but not in any bucket`).toContain(name);
    }
  });

  it('defines each public name in exactly one bucket', () => {
    const defined = new Map();
    for (const [bucket, spec] of moduleFiles) {
      for (const name of exportedNames(read(path.join(SERVICES, spec.file)))) {
        expect(
          defined.has(name),
          `${name} is exported by both ${defined.get(name)} and ${spec.file}`
        ).toBe(false);
        defined.set(name, spec.file);
      }
    }
    for (const name of publicNames) {
      expect(defined.has(name), `${name} is published but never defined`).toBe(true);
    }
  });

  it('keeps a private name out of the facade', () => {
    const privateNames = Object.values(modules).flatMap((s) => s.privateNames || []);
    for (const name of privateNames) {
      expect(exportedNames(facade)).not.toContain(name);
      expect(new RegExp(`\\b${name}\\b`).test(facade), `${name} leaked into the facade`).toBe(
        false
      );
    }
  });

  it('publishes a private name only when another bucket calls it', () => {
    const textOf = (spec) => read(path.join(SERVICES, spec.file));
    for (const [, spec] of moduleFiles) {
      for (const name of spec.privateNames || []) {
        const usedElsewhere = moduleFiles.some(
          ([, other]) => other.file !== spec.file && new RegExp(`(?<![.\\w$])${name}\\s*\\(`).test(textOf(other))
        );
        const published = exportedNames(textOf(spec)).includes(name);
        expect(
          published,
          `${name}: ${usedElsewhere ? 'is called elsewhere so must be published' : 'is unused elsewhere so must stay private'}`
        ).toBe(usedElsewhere);
      }
    }
  });

  it('spells every aliased import with its alias', () => {
    // The bug: `const { httpStatus } = require('http-status')` binds undefined.
    const aliased = new Map();
    for (const [, spec] of moduleFiles) {
      for (const b of requireBlocks(read(path.join(SERVICES, spec.file)))) {
        for (const e of b.entries) {
          if (!e.spec.includes(':')) continue;
          const key = `${b.mod}::${e.spec}`;
          aliased.set(key, (aliased.get(key) || 0) + 1);
        }
      }
    }
    for (const b of requireBlocks(facade)) {
      for (const e of b.entries) {
        if (!e.spec.includes(':')) continue;
        aliased.set(`${b.mod}::${e.spec}`, (aliased.get(`${b.mod}::${e.spec}`) || 0) + 1);
      }
    }
    // The alias the repo actually uses, spelled the way it must be spelled.
    expect(aliased.has('http-status::status: httpStatus')).toBe(true);

    // And no file may have collapsed it to a bare local name.
    for (const file of [facadePath, ...moduleFiles.map(([, s]) => path.join(SERVICES, s.file))]) {
      for (const b of requireBlocks(read(file))) {
        for (const e of b.entries) {
          if (b.mod !== 'http-status') continue;
          expect(
            e.spec,
            `${path.basename(file)}: ${b.mod} must be imported as 'status: httpStatus'`
          ).toBe('status: httpStatus');
        }
      }
    }
  });

  it('leaves no unused import in the facade or any bucket', () => {
    for (const file of [facadePath, ...moduleFiles.map(([, s]) => path.join(SERVICES, s.file))]) {
      const src = read(file);
      const blocks = requireBlocks(src);
      const isImport = new Set();
      blocks.forEach((b) => {
        for (let i = b.start; i <= b.end; i++) isImport.add(i);
      });
      const body = src
        .split('\n')
        .filter((_, i) => !isImport.has(i))
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

  it('imports across buckets explicitly wherever one calls another', () => {
    const owner = new Map();
    for (const [bucket, spec] of moduleFiles) {
      for (const n of [...spec.names, ...(spec.privateNames || [])]) {
        if (!owner.has(n)) owner.set(n, spec);
      }
    }
    for (const [bucket, spec] of moduleFiles) {
      const src = read(path.join(SERVICES, spec.file));
      const imported = new Set(requireBlocks(src).flatMap((b) => b.entries.map((e) => e.local)));
      for (const [name, target] of owner) {
        if (target.file === spec.file) continue;
        if (!new RegExp(`(?<![.\\w$])${name}\\s*\\(`).test(src)) continue;
        expect(
          imported.has(name),
          `${spec.file} calls ${name} from ${target.file} without importing it`
        ).toBe(true);
      }
    }
  });

  it('every taxonomy name is defined somewhere', () => {
    for (const [bucket, spec] of moduleFiles) {
      const src = read(path.join(SERVICES, spec.file));
      for (const name of [...spec.names, ...(spec.privateNames || [])]) {
        expect(declares(src, name), `${name} is not defined in ${spec.file}`).toBe(true);
      }
    }
  });
});
