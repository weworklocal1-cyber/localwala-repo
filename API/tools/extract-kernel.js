/**
 * Phase 3.6: extract a shared kernel.
 *
 *   node tools/extract-kernel.js --list
 *   node tools/extract-kernel.js --plan <kernel>
 *   node tools/extract-kernel.js --apply <kernel>
 *   node tools/extract-kernel.js --verify
 *
 * The point of this tool is that the first two kernels were done by hand, in two
 * separate one-off scripts, and each one had to be debugged:
 *
 *   - a local name derived by stripping only `.js` produced
 *     `const subscriber.service = require(...)`;
 *   - a whole-file rewrite through the shell took an unrelated trailing blank
 *     line out of services/index.js, so the diff carried an unrelated change.
 *
 * So the move is one byte-precise path, and a kernel is a small JSON file rather
 * than a paragraph of shell. Everything that can go wrong here is either
 * impossible by construction (a substring replace cannot disturb a line ending
 * it did not match) or checked before the caller sees a result.
 *
 * The kernel keeps its home domain, so the services barrel and the generated
 * facades still publish every name it used to. Only the *import* is exempt - see
 * tools/domain-inventory.js and tools/eslint-rules/domain-boundary.cjs.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const API_ROOT = path.resolve(__dirname, '..');
const SRC = path.join(API_ROOT, 'src');
const KERNEL_DIR = path.join(__dirname, 'kernels');

const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const wanted = args.find((a) => !a.startsWith('--'));

const specs = fs
  .readdirSync(KERNEL_DIR)
  .filter((f) => f.endsWith('.json'))
  .map((f) => JSON.parse(fs.readFileSync(path.join(KERNEL_DIR, f), 'utf8')));

if (flag('--list')) {
  for (const s of specs.sort((a, b) => a.kernel.localeCompare(b.kernel))) {
    process.stdout.write(
      `${s.done ? '[done]' : '[todo]'} ${s.kernel.padEnd(14)} home=${(s.home || '?').padEnd(14)} ` +
        `${s.members.length} member(s)\n           ${s.note}\n`
    );
  }
  process.exit(0);
}

const destName = (rel) => path.basename(rel);
/**
 * The local name a kernel member is published under, matching what
 * services/index.js already exports for it.
 *
 * Dotted filenames have to be camelCased, not merely stripped: `restaurant.
 * cash.in.hand.service.js` became `restaurant.cash.in.handService` - and a
 * dotted `const` is a syntax error, so the kernel index did not even parse.
 * This is the same class of bug twice in two tools, which is why it is now a
 * named function with the derivation spelled out.
 */
const localName = (rel) => {
  const file = destName(rel);
  const isModel = /\.model\.js$/.test(file);
  const bare = file.replace(/\.(service|model)\.js$/, '');
  return (
    bare
      .split('.')
      .map((part, i) => (i === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
      .join('') + (isModel ? 'Model' : 'Service')
  );
};

/** SRC-relative, forward-slashed, because that is how the inventory keys paths. */
const relFromSrc = (abs) => path.relative(SRC, abs).replace(/\\/g, '/');
/** From an SRC-relative path back to an absolute one. */
const absFromSrc = (rel) => path.join(SRC, rel);

/**
 * Resolve a relative specifier the way Node would, or null.
 *
 * A kernel index is a directory, so `../catalog` style resolution is not enough
 * - the candidates have to include the extensionless form and index files, the
 * same list the inventory uses. Verifying the move without this is what let a
 * dangling `../models/otp.web.verification.model` reach 19 test files.
 */
const RESOLVE_CANDIDATES = ['', '.js', '.cjs', '.ts', '/index.js', '/index.ts'];
function resolveRelative(fromAbs, spec) {
  if (!spec.startsWith('.')) return null;
  const base = path.resolve(path.dirname(fromAbs), spec);
  for (const ext of RESOLVE_CANDIDATES) {
    const candidate = base + ext;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate;
  }
  return null;
}

/** Every file under src/ that requires `basename`, as { rel, spec }. */
function findImporters(basename) {
  const out = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, e.name);
      if (e.isDirectory()) walk(full);
      else if (/\.(js|ts)$/.test(e.name)) {
        const src = fs.readFileSync(full, 'utf8');
        for (const m of src.matchAll(/require\((['"])([^'"]+)\1\)/g)) {
          if (path.basename(m[2]).replace(/\.js$/, '') === basename) {
            out.push({ rel: relFromSrc(full), spec: m[2] });
          }
        }
      }
    }
  };
  walk(SRC);
  return out;
}

/**
 * --verify and --list need no kernel name, so they run before the spec is
 * resolved. Resolving first made `--verify` print usage and exit 2, which reads
 * like the tool is broken rather than mis-invoked.
 */
if (flag('--verify')) {
  let ok = true;
  for (const s of specs) {
    const dir = path.join(SRC, 'shared', s.kernel);
    if (!fs.existsSync(dir)) {
      if (s.done) {
        process.stdout.write(`  MISSING  shared/${s.kernel} (declared done)\n`);
        ok = false;
      }
      continue;
    }
    const present = fs.readdirSync(dir);
    for (const member of s.members) {
      if (!present.includes(destName(member))) {
        process.stdout.write(`  MISSING  shared/${s.kernel}/${destName(member)}\n`);
        ok = false;
      }
    }
    if (!present.includes('index.js')) {
      process.stdout.write(`  MISSING  shared/${s.kernel}/index.js\n`);
      ok = false;
    }
    // No member may still exist at its old path: a partial run would leave two
    // copies, and the one the barrel points at is the one that silently wins.
    for (const member of s.members) {
      if (fs.existsSync(path.join(API_ROOT, member))) {
        process.stdout.write(`  DUPLICATE  ${member} still exists alongside the kernel\n`);
        ok = false;
      }
    }
  }
  process.stdout.write(`${ok ? 'KERNELS OK' : 'KERNELS INCOMPLETE'}\n`);
  process.exit(ok ? 0 : 1);
}

const spec = wanted && specs.find((s) => s.kernel === wanted);
if (!spec) {
  process.stderr.write(
    `usage: --list | --plan <kernel> | --apply <kernel> | --verify\n` +
      `known: ${specs.map((s) => s.kernel).join(', ')}\n`
  );
  process.exit(2);
}

const KERNEL_DIRNAME = spec.kernel;
const TARGET = path.join(SRC, 'shared', KERNEL_DIRNAME);


if (flag('--plan')) {
  process.stdout.write(
    `kernel ${spec.kernel}  ->  src/shared/${KERNEL_DIRNAME}/\n  ${spec.note}\n` +
      `  home domain: ${spec.home}\n\n`
  );
  for (const member of spec.members) {
    const abs = path.join(API_ROOT, member);
    if (!fs.existsSync(abs)) {
      process.stdout.write(`  MISSING ${member}\n`);
      continue;
    }
    const src = fs.readFileSync(abs, 'utf8');
    const names = (src.match(/module\.exports\s*=\s*\{([\s\S]*?)\n\};/) || [, ''])[1];
    const count = [...new Set([...names.matchAll(/([A-Za-z_$][\w$]*)\s*[,:]?/g)].map((m) => m[1]))].length;
    process.stdout.write(
      `  ${member}\n    ${src.split('\n').length} lines, ${count} exports\n`
    );
    for (const im of findImporters(destName(member).replace(/\.js$/, ''))) {
      process.stdout.write(`    importer: ${im.rel}  ->  ${im.spec}\n`);
    }
  }
  process.exit(0);
}

if (flag('--apply')) {
  if (fs.existsSync(TARGET)) {
    process.stderr.write(
      `src/shared/${KERNEL_DIRNAME}/ already exists. If a previous run was partial,\n` +
        'git checkout the affected files and remove the directory first.\n'
    );
    process.exit(1);
  }
  fs.mkdirSync(TARGET, { recursive: true });

  const importerSet = new Set();
  for (const member of spec.members) {
    const from = path.join(API_ROOT, member);
    if (!fs.existsSync(from)) {
      process.stderr.write(`missing member: ${member}\n`);
      process.exit(1);
    }
    const to = path.join(TARGET, destName(member));
    fs.renameSync(from, to);
    process.stdout.write(`moved    ${member}`);

    // Fix every relative specifier, not just the `../` ones. A member may
    // require a *sibling* - `restaurant.cash.in.hand.service.js` requires
    // `./restaurant.service` - and after the move that resolves inside the
    // kernel directory, where nothing lives. Only rewriting `../` left the
    // kernel index unable to load at all: MODULE_NOT_FOUND on a sibling that
    // used to sit next door.
    const before = fs.readFileSync(to, 'utf8');
    const originalDir = path.dirname(member).replace(/\\/g, '/'); // e.g. src/services
    const fixed = before
      .replace(/require\('\.\.\//g, "require('../../")
      .replace(/require\("\.\.\//g, 'require("../../')
      .replace(/require\('\.\/([^']+)'\)/g, (match, rest) => {
        const here = path.join(TARGET, rest);
        if (fs.existsSync(here) || fs.existsSync(`${here}.js`) || fs.existsSync(path.join(here, 'index.js'))) {
          return match; // the sibling moved with us
        }
        return `require('../../${originalDir.replace(/^src\//, '')}/${rest}')`;
      });
    // Pure LF: git diff --check reads a CR as trailing whitespace on an added
    // line, and a moved file is entirely added lines.
    fs.writeFileSync(to, fixed.replace(/\r\n/g, '\n'), 'utf8');
    process.stdout.write(
      `  (${(before.match(/require\(['"]\.\.?\//g) || []).length} require(s) fixed, ` +
        `CRLF ${(before.match(/\r\n/g) || []).length} -> 0)\n`
    );

    for (const im of findImporters(destName(member).replace(/\.js$/, ''))) {
      if (im.rel.startsWith(`shared/${KERNEL_DIRNAME}/`)) continue;
      importerSet.add(im.rel);
    }
  }

  // The kernel publishes its members as MODULE bindings, exactly as
  // services/index.js does - not as a flattened spread of their functions.
  //
  // Flattening collides silently: restaurant.cash.in.hand.service and
  // deliveryman.cash.in.hand.service both export `saveCashInHand` and
  // `clearCashInHand`, so `...restaurant, ...deliveryman` published the
  // deliveryman versions under the restaurant's name with no error anywhere.
  // The domain facades have the same guard for the same reason.
  const localNames = spec.members.map(localName);
  const clash = localNames.filter((n, i) => localNames.indexOf(n) !== i);
  if (clash.length) {
    process.stderr.write(
      `two members of shared/${KERNEL_DIRNAME} publish the same name: ${[...new Set(clash)].join(', ')}\n`
    );
    process.exit(1);
  }
  const entries = spec.members
    .map((m) => `const ${localName(m)} = require('./${destName(m)}');`)
    .join('\n');
  const bindings = localNames.map((n) => `  ${n},`).join('\n');
  fs.writeFileSync(
    path.join(TARGET, 'index.js'),
    `/**
 * LocalWala - Local Commerce & Delivery Platform
 * (NodeJS, MongoDB, Angular & Flutter)
 *
 * Copyright (c) 2026 WeWorkLocal Private Limited
 * https://weworklocal.in/
 *
 * WeWorkLocal Private Limited
 * This source code is confidential.
 *
 * Ownership Fingerprint:
 * LWL|WWL|2026|LOCALWALA|NODE
 *
 * Phase 3.6: the ${spec.kernel} shared kernel - ${spec.note}.
 *
 * Pulled out of a business domain because it is cross-cutting, not because the
 * code moved: the boundary rule and the inventory exempt a shared kernel as an
 * import *target*, so the edges that reach it stop being boundary violations.
 * The kernel keeps ${spec.home} as its home domain, so the services barrel and
 * the generated facades still publish every name it used to.
 *
 * Published as module bindings, the same shape services/index.js uses. A
 * flattened spread of the members' own functions is not equivalent, and the
 * difference is not academic: two of these members export identically named
 * functions, so a spread would shadow one set with the other and report
 * nothing.
 *
 * GENERATED by tools/extract-kernel.js - do not hand-edit.
 */
${entries}

module.exports = {
${bindings}
};
`,
    'utf8'
  );
  process.stdout.write(`wrote    src/shared/${KERNEL_DIRNAME}/index.js\n`);

  for (const rel of [...importerSet].sort()) {
    const file = absFromSrc(rel);
    const fromDir = path.dirname(file);
    const before = fs.readFileSync(file, 'utf8');
    let after = before;
    for (const member of spec.members) {
      const bare = destName(member).replace(/\.js$/, '');
      // Match on the specifier's BASENAME and rebuild the whole path, rather
      // than pattern-matching './x'. The auth kernel is why: its model was
      // required as `../models/otp.web.verification.model`, so a rewrite that
      // only handled `./otp.web.verification.model` silently left the importer
      // pointing at a file that no longer exists, and 19 test files failed on
      // MODULE_NOT_FOUND.
      const re = new RegExp(`require\\((['"])[^'"]*\\/${bare.replace(/\./g, '\\.')}\\1\\)`, 'g');
      after = after.replace(re, () => {
        // Extensionless, matching every other import in the repo - and the
        // inventory's barrel reader appends `.js` itself, so a spec that keeps
        // the extension resolves to `...service.js.js` and the name silently
        // vanishes from its domain facade.
        const to = path
          .relative(fromDir, path.join(TARGET, destName(member)))
          .replace(/\.js$/, '')
          .replace(/\\/g, '/');
        return `require('${to.startsWith('.') ? to : `./${to}`}')`;
      });
    }
    if (after === before) {
      process.stdout.write(`no-match ${rel}\n`);
      continue;
    }
    fs.writeFileSync(file, after, 'utf8');
    process.stdout.write(`updated  ${rel}  (+${after.length - before.length} bytes)\n`);
  }

  // Verify the move by RESOLVING each remaining specifier, not by matching
  // basenames. A basename check flags the correctly-rewired importers too,
  // since a new spec ends with the same filename as the old one; what actually
  // matters is whether the spec still points outside the kernel, or at nothing.
  const dangling = [];
  for (const member of spec.members) {
    const bare = destName(member).replace(/\.js$/, '');
    for (const im of findImporters(bare)) {
      if (im.rel.startsWith(`shared/${KERNEL_DIRNAME}/`)) continue;
      const from = absFromSrc(im.rel);
      const resolved = resolveRelative(from, im.spec);
      if (resolved && relFromSrc(resolved).startsWith(`shared/${KERNEL_DIRNAME}/`)) continue;
      dangling.push(`  ${im.rel}  ->  ${im.spec}${resolved ? '' : '   (does not resolve)'}`);
    }
  }
  if (dangling.length) {
    process.stderr.write(
      `STILL REFERENCING OUTSIDE THE KERNEL for shared/${KERNEL_DIRNAME}:\n${dangling.join('\n')}\n`
    );
    process.exit(1);
  }
  process.stdout.write('verified: every specifier resolves inside the kernel\n');
  process.exit(0);
}

if (flag('--verify')) {
  process.stdout.write('unreachable: --verify is handled before the spec is resolved\n');
  process.exit(1);
}

process.stdout.write('usage: --list | --plan <kernel> | --apply <kernel> | --verify\n');
process.exit(2);
