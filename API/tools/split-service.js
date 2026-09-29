/**
 * Split a large service into lifecycle buckets, without changing behaviour.
 *
 *   node tools/split-service.js <service> --taxonomy
 *   node tools/split-service.js <service> --plan
 *   node tools/split-service.js <service> --apply
 *   node tools/split-service.js <service> --verify
 *
 * The taxonomy is DATA, loaded from tools/taxonomies/<service>.js, and every
 * bucket goes through the same code. The orders tool was hard-coded to one
 * service with one list of names; doing the same to restaurant would have been
 * a 700-line copy, and copies are how the invariants quietly stop holding.
 *
 * The split is a cut-and-paste, not a refactoring. The tool copies function
 * text verbatim, derives each module's imports by scanning the moved text, and
 * rebuilds the service file in one step as a facade over the buckets. The
 * public `module.exports` block is never rewritten, so the public surface
 * cannot drift.
 *
 * The whole rebuild is done from the pristine original rather than pass by pass.
 * Pruning per pass is wrong: a require is dropped as soon as no surviving
 * function uses it, but a later bucket's functions are still surviving at that
 * moment and need it.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const API_ROOT = path.resolve(__dirname, '..');
const TAXONOMY_DIR = path.join(__dirname, 'taxonomies');

const service = process.argv[2];
const args = process.argv.slice(3);
const flag = (f) => args.includes(f);

if (!service) {
  process.stderr.write(
    `usage: node tools/split-service.js <service> [--taxonomy|--plan|--apply|--verify]\n` +
      `known services: ${fs
        .readdirSync(TAXONOMY_DIR)
        .filter((f) => f.endsWith('.js'))
        .map((f) => f.replace(/\.js$/, ''))
        .join(', ')}\n`
  );
  process.exit(2);
}

const taxonomy = require(path.join(TAXONOMY_DIR, `${service}.js`));
const SRC_FILE = path.join(API_ROOT, 'src', 'services', `${service}.service.js`);
const SRC_REPO_PATH = `API/src/services/${service}.service.js`;
const readSource = () => fs.readFileSync(SRC_FILE, 'utf8');

/**
 * The text with full-line comments removed.
 *
 * The import matcher is a word-boundary regex, so it cannot tell code from a
 * comment: `// await emailConfigService.sendExpiredPackageBlockedEmail(...)`
 * in restaurant.vendor counted as a use, and the bucket shipped an import
 * nothing referenced - a new lint warning, which this repo treats as a
 * regression.
 *
 * Only *full-line* comments are dropped, deliberately. A trailing comment after
 * real code may still mention the name, and keeping it means this filter can
 * only ever remove false positives. The opposite error - concluding a name is
 * unused when it is not - would produce a missing import and a 500, so the bias
 * is fixed: conservative about imports, precise about comments.
 */
function codeOnly(text) {
  return text
    .split('\n')
    .filter((l) => {
      const t = l.trim();
      return !(t.startsWith('//') || t.startsWith('/*') || t.startsWith('*') || t.startsWith('*/'));
    })
    .join('\n');
}

const uses = (raw, name) => {
  const text = codeOnly(raw);
  return new RegExp(`\\b${name.replace(/\$/g, '\\$')}\\b`).test(text);
};
/** Does the moved text actually CALL this name, rather than merely mention it? */
const calls = (raw, name) =>
  new RegExp(`\\b${name.replace(/\$/g, '\\$')}\\s*\\(`).test(codeOnly(raw));

/**
 * A reference to `name` as a standalone binding - NOT `something.name`.
 *
 * A word-boundary match cannot tell those apart, so
 * `subscriptionService.getById(param.subscription)` in the export bucket looked
 * like a call to the identity bucket's `getById`, and the bucket shipped an
 * import nothing used.
 *
 * This guard is applied ONLY to cross-bucket and publish detection, never to
 * the original's own imports. The failure modes are not symmetric: an extra
 * cross-bucket import is one lint warning, but dropping an import the original
 * genuinely needs is a runtime 500. So imports stay conservative and only the
 * new cross-bucket edges are held to the stricter test.
 */
const bareRef = (raw, name) =>
  new RegExp(`(?<![.\\w$])${name.replace(/\$/g, '\\$')}\\b`).test(codeOnly(raw));
const bareCall = (raw, name) =>
  new RegExp(`(?<![.\\w$])${name.replace(/\$/g, '\\$')}\\s*\\(`).test(codeOnly(raw));

/** A binding can only be declared once in a scope. */
const unique = (names) => [...new Set(names)];
/** Public plus private names a module owns. */
const allNames = (spec) => [...spec.names, ...(spec.privateNames || [])];

/** Every module a name can be reached through, including the shared kernel. */
const MODULES = taxonomy.shared
  ? { shared: taxonomy.shared, ...taxonomy.buckets }
  : taxonomy.buckets;

/** Which module publishes each name, so a bucket can import across. */
function ownerOf() {
  const owner = new Map();
  for (const [bucket, spec] of Object.entries(MODULES)) {
    for (const n of allNames(spec)) if (!owner.has(n)) owner.set(n, bucket);
  }
  return owner;
}

function exportedNames(src) {
  const block = src.match(/module\.exports\s*=\s*\{([\s\S]*?)\n\};/);
  if (!block) return [];
  return unique([...block[1].matchAll(/([A-Za-z_$][\w$]*)\s*[,:]?/g)].map((m) => m[1]));
}

/** Every top-level require, with its line range, bindings and original specs. */
function requireBlocks(src) {
  const lines = src.split('\n');
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/^const\s.*=\s*require\(/.test(lines[i]) && !/^const\s*\{\s*$/.test(lines[i])) continue;
    let end = i;
    let stmt = lines[i];
    while (end < lines.length && !/;\s*$/.test(stmt)) stmt += `\n${lines[++end]}`;
    // Skip past the statement: a block may contain lines that look like the
    // start of another one, and re-detecting it emitted the same import twice.
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
    const consumed = stmt.split('\n').length;
    blocks.push({
      start: i - consumed + 1,
      end,
      names: entries.map((e) => e.local),
      entries,
      text: stmt,
    });
  }
  return blocks;
}

/** Cut a top-level function's text verbatim, up to the next top-level declaration. */
function sliceTopLevel(src, name) {
  const lines = src.split('\n');
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (
      new RegExp(`^(?:const|let|var)\\s+${name}\\s*=\\s*(?:async\\s*)?\\(`).test(lines[i]) ||
      new RegExp(`^(?:async\\s+)?function\\s+${name}\\b`).test(lines[i])
    ) {
      start = i;
      break;
    }
  }
  if (start < 0) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (
      /^(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=/.test(lines[i]) ||
      /^(?:async\s+)?function\s+[A-Za-z_$][\w$]*/.test(lines[i]) ||
      /^module\.exports/.test(lines[i])
    ) {
      end = i;
      break;
    }
  }
  while (end > start + 1 && lines[end - 1].trim() === '') end--;
  return { start, end, text: lines.slice(start, end).join('\n') };
}

/** Does this file declare `name`? Two forms: `const f = async () =>` and `function f()`. */
function declares(src, name) {
  return new RegExp(
    `^(?:const|let|var)\\s+${name}\\s*=|^(?:async\\s+)?function\\s+${name}\\b`,
    'm'
  ).test(src);
}

function header(bucket, note) {
  return [
    '/**',
    ' * LocalWala - Local Commerce & Delivery Platform',
    ' * (NodeJS, MongoDB, Angular & Flutter)',
    ' *',
    ' * Copyright (c) 2026 WeWorkLocal Private Limited',
    ' * https://weworklocal.in/',
    ' *',
    ' * WeWorkLocal Private Limited',
    ' * This source code is confidential.',
    ' *',
    ' * Ownership Fingerprint:',
    ' * LWL|WWL|2026|LOCALWALA|NODE',
    ' *',
    ` * Phase 3: ${service} bucket "${bucket}" - ${note}.`,
    ' *',
    ` * Split out of ${service}.service.js. The function text is byte-identical to`,
    ' * what it replaced; GENERATED by tools/split-service.js - do not hand-edit.',
    ' */',
    '',
  ].join('\n');
}

/**
 * The requires a moved body needs.
 *
 * Two sources. The original's own imports contribute their ORIGINAL spec text -
 * never the local name. `http-status` is imported as
 * `const { status: httpStatus } = require('http-status')`, and re-emitting the
 * local name produced `const { httpStatus } = ...`: a binding that exists and is
 * `undefined`. Lint cannot see that, there is no `no-undef`, and a dozen
 * endpoints 500 on `httpStatus.NOT_FOUND` while every static gate is green.
 *
 * And names that belong to ANOTHER bucket contribute a require of that bucket,
 * so cross-bucket calls are explicit rather than accidental.
 */
function importsFor(text, original, bucket, owner) {
  const out = [];
  const claimed = new Set();
  for (const b of requireBlocks(original)) {
    const keep = b.entries.filter((e) => uses(text, e.local) && !claimed.has(e.local));
    if (!keep.length) continue;
    for (const e of keep) claimed.add(e.local);
    const source = b.text.match(/require\((['"])([^'"]+)\1\)/);
    if (!source) continue;
    if (!b.text.includes('{')) {
      out.push(`const ${keep[0].spec} = require('${source[2]}');`);
    } else {
      out.push(`const {\n${keep.map((e) => `  ${e.spec},`).join('\n')}\n} = require('${source[2]}');`);
    }
  }

  // Cross-bucket requires, grouped by the module that publishes the name.
  // `owner` is a Map: Object.keys() on one returns nothing, which is why the
  // first run reported zero cross-bucket edges while the recon showed three.
  const byModule = new Map();
  for (const [name, target] of owner) {
    if (claimed.has(name)) continue;
    const target = owner.get(name);
    if (target === bucket) continue;
    if (!bareRef(text, name)) continue;
    if (!byModule.has(target)) byModule.set(target, []);
    byModule.get(target).push(name);
    claimed.add(name);
  }
  for (const [target, names] of [...byModule.entries()].sort()) {
    out.push(
      `const { ${names.sort().join(', ')} } = require('./${MODULES[target].file}');`
    );
  }
  return out;
}

/** Every bucket's plan, all derived from the pristine original. */
function planAll(original) {
  const owner = ownerOf();
  const plans = Object.entries(MODULES).map(([bucket, spec]) => {
    const slices = [];
    const missing = [];
    for (const name of allNames(spec)) {
      const s = sliceTopLevel(original, name);
      if (s) slices.push(s);
      else missing.push(name);
    }
    slices.sort((a, b) => a.start - b.start);
    return { bucket, spec, missing, movedText: slices.map((s) => s.text).join('\n\n') };
  });

  // A private name is file-local unless ANOTHER bucket's moved text calls it.
  // Deriving this beats declaring it: the orders analytics kernel and the
  // restaurant shared kernel both publish a name that is not part of the
  // service's public surface, and the orders status bucket keeps five helpers
  // that nobody else uses. Hand-maintaining that distinction is how
  // restaurant.shared.internal.js ended up with a function nothing exported and
  // one new unused-import warning.
  const published = new Map(plans.map((p) => [p.bucket, new Set()]));
  for (const p of plans) {
    for (const name of p.spec.privateNames || []) {
      for (const other of plans) {
        if (other.bucket === p.bucket) continue;
        if (bareCall(other.movedText, name)) published.get(p.bucket).add(name);
      }
    }
  }

  for (const p of plans) {
    p.imports = importsFor(p.movedText, original, p.bucket, owner);
    // What this module's `module.exports` must publish: its public names plus
    // the private ones other buckets actually call.
    p.published = [...p.spec.names, ...[...(published.get(p.bucket) || [])].sort()];
  }
  return plans;
}

/**
 * Rebuild the service file: the original's header, one require per bucket that
 * publishes public names, then the original's export block onward.
 */
function composeFacade(original) {
  const lines = original.split('\n');
  const blocks = requireBlocks(original);
  const exportAt = lines.findIndex((l) => /^module\.exports/.test(l));
  if (!blocks.length || exportAt < 0) throw new Error('cannot locate the import/export regions');

  const head = lines.slice(0, blocks[0].start);
  const tail = lines.slice(exportAt);
  const requires = Object.values(MODULES)
    .filter((m) => fs.existsSync(path.join(API_ROOT, 'src', 'services', m.file)))
    // A module with no public names contributes nothing to the facade, and an
    // empty `const {} = require(...)` is a syntax error.
    .filter((m) => m.names.length)
    .map((m) => `const { ${m.names.join(', ')} } = require('./${m.file}');`);

  return `${[...head, ...requires, '', ...tail].join('\n')}`;
}

function originalAt(commit) {
  return execFileSync('git', ['show', `${commit}:${SRC_REPO_PATH}`], {
    cwd: API_ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
}

function applyAll(commit) {
  const original = originalAt(commit);
  for (const p of planAll(original)) {
    if (p.missing.length) {
      process.stdout.write(`${p.bucket}: already extracted, skipping\n`);
      continue;
    }
    fs.writeFileSync(
      path.join(API_ROOT, 'src', 'services', p.spec.file),
      `${header(p.bucket, p.spec.note)}\n${p.imports.join('\n')}\n\n${p.movedText}\n\n` +
        `module.exports = {\n${p.published.map((n) => `  ${n},`).join('\n')}\n};\n`,
      'utf8'
    );
    process.stdout.write(
      `${p.bucket}: ${p.spec.names.length} public, ${p.published.length} published -> ${p.spec.file}\n`
    );
  }

  fs.writeFileSync(SRC_FILE, composeFacade(original), 'utf8');
  process.stdout.write(
    `${service}.service.js: rebuilt as a facade over ${Object.keys(MODULES).length} modules\n`
  );

  for (const f of [
    ...Object.values(MODULES).map((m) => path.join(API_ROOT, 'src', 'services', m.file)),
    SRC_FILE,
  ]) {
    if (!fs.existsSync(f)) continue;
    try {
      execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' });
    } catch (err) {
      process.stderr.write(`syntax error in ${f}:\n${err.stderr}\n`);
      return 1;
    }
  }
  process.stdout.write('all touched files parse\n');
  return 0;
}

/** Is the taxonomy still a partition of the surface? */
function taxonomyReport() {
  const src = readSource();
  const surface = exportedNames(src);
  const owner = ownerOf();
  const placed = [...owner.keys()];
  const dupes = [];
  const seen = new Map();
  for (const [bucket, spec] of Object.entries(MODULES)) {
    for (const n of allNames(spec)) {
      if (seen.has(n)) dupes.push(`${n}: ${seen.get(n)} and ${bucket}`);
      else seen.set(n, bucket);
    }
  }
  const unplaced = surface.filter((n) => !owner.has(n));
  const inOrders = [];
  const extracted = [];
  const phantom = [];
  for (const [n, bucket] of owner) {
    if (declares(src, n)) inOrders.push(n);
    else {
      const file = path.join(API_ROOT, 'src', 'services', MODULES[bucket].file);
      if (fs.existsSync(file) && declares(fs.readFileSync(file, 'utf8'), n)) extracted.push(n);
      else phantom.push(`${n} (${bucket})`);
    }
  }
  return { surface, owner, dupes, unplaced, inOrders, extracted, phantom, total: seen.size };
}

function main() {
  if (flag('--taxonomy')) {
    const t = taxonomyReport();
    const lines = [
      `${service}: public surface      : ${t.surface.length}`,
      `${service}: names placed        : ${t.total}`,
      `${service}:   still in service  : ${t.inOrders.length}`,
      `${service}:   already extracted : ${t.extracted.length}`,
      `${service}: duplicates          : ${t.dupes.length}`,
      ...t.dupes.map((d) => `  DUP ${d}`),
      `${service}: not placed anywhere : ${t.unplaced.length}`,
      ...t.unplaced.map((n) => `  UNPLACED ${n}`),
      `${service}: in neither the service nor its bucket : ${t.phantom.length}`,
      ...t.phantom.map((n) => `  PHANTOM ${n}`),
      '',
      'per bucket:',
      ...Object.entries(MODULES).map(
        ([b, s]) =>
          `  ${String(allNames(s).length).padStart(3)}  ${b.padEnd(20)} ${s.file}` +
          `  (${s.names.length} public)`
      ),
    ];
    process.stdout.write(`${lines.join('\n')}\n`);
    const ok = !t.dupes.length && !t.unplaced.length && !t.phantom.length;
    process.stdout.write(`${ok ? 'TAXONOMY OK' : 'TAXONOMY INCOMPLETE'}\n`);
    return ok ? 0 : 1;
  }

  const commit = process.env.SPLIT_BASE || 'HEAD';

  if (flag('--plan')) {
    const original = originalAt(commit);
    for (const p of planAll(original)) {
      const cross = p.imports.filter((i) => i.includes(`require('./${service}`));
      process.stdout.write(
        [
          `bucket ${p.bucket}  ->  ${p.spec.file}`,
          `  ${p.spec.note}`,
          `  functions : ${p.spec.names.length} public, ${(p.spec.privateNames || []).length} private` +
            `${p.missing.length ? `  MISSING ${p.missing.length}` : ''}`,
          `  moved text: ${p.movedText.split('\n').length} lines`,
          `  imports   : ${p.imports.length} (${cross.length} cross-bucket)`,
          cross.length ? `    ${cross.map((c) => c.slice(0, 90)).join('\n    ')}` : '',
          '',
        ]
          .filter(Boolean)
          .join('\n')
      );
    }
    return 0;
  }

  if (flag('--apply')) return applyAll(commit);

  if (flag('--verify')) {
    const original = originalAt(commit);
    let ok = true;
    let checked = 0;
    for (const [bucket, spec] of Object.entries(MODULES)) {
      const file = path.join(API_ROOT, 'src', 'services', spec.file);
      if (!fs.existsSync(file)) continue;
      const text = fs.readFileSync(file, 'utf8');
      for (const n of allNames(spec)) {
        const before = sliceTopLevel(original, n);
        if (!before) continue;
        if (!text.includes(before.text)) {
          process.stdout.write(`  MISMATCH ${bucket}/${n}\n`);
          ok = false;
        } else checked++;
      }
    }
    const beforeSurface = exportedNames(original);
    const afterSurface = exportedNames(readSource());
    const lost = beforeSurface.filter((n) => !afterSurface.includes(n));
    const added = afterSurface.filter((n) => !beforeSurface.includes(n));
    if (lost.length) {
      process.stdout.write(`  LOST EXPORTS: ${lost.join(', ')}\n`);
      ok = false;
    }
    if (added.length) {
      process.stdout.write(`  NEW EXPORTS: ${added.join(', ')}\n`);
      ok = false;
    }
    process.stdout.write(`byte-identical: ${checked} functions\n`);
    process.stdout.write(
      `public surface: ${afterSurface.length} names (was ${beforeSurface.length})\n`
    );
    process.stdout.write(`${ok ? 'VERIFY OK' : 'VERIFY FAILED'}\n`);
    return ok ? 0 : 1;
  }

  process.stdout.write('usage: --taxonomy | --plan | --apply | --verify\n');
  return 2;
}

process.exit(main());
