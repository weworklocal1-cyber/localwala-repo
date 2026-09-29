/**
 * Phase 4.3 - which service could actually be extracted first?
 *
 * CORRECTED. The first attempt at this analysis was wrong twice over, and both
 * bugs pushed in the same direction - towards "everything is extractable":
 *
 *   1. The models-require parser used a non-greedy `const \{([\s\S]*?)\}` which
 *      starts at the FIRST destructuring in the file and runs to the models
 *      require, so it captured every name in between - `httpStatus` from
 *      `http-status` showed up as a model. It has to accumulate the statement
 *      line by line, as the inventory's own require reader does.
 *   2. Model domains were keyed by FILENAME (`orders.model`) and looked up by
 *      BINDING NAME (`Orders`), so every lookup missed, every cross-domain read
 *      came back empty, and a module reading 70 models looked self-contained.
 *      The binding name has to come from models/index.js, the same place the
 *      facades get theirs.
 *
 * A measurement that flatters the answer is worse than no measurement.
 */
const fs = require('fs');
const path = require('path');
const API = 'C:\\localwala fils\\AppSourceCode\\API';
const SRC = path.join(API, 'src');
const i = require(path.join(API, 'tools', 'domain-inventory.js'));

/** The models barrel: binding name -> module file, as `models/index.js` states. */
const barrel = new Map();
{
  const src = fs.readFileSync(path.join(SRC, 'models', 'index.js'), 'utf8');
  const re =
    /module\.exports\.([A-Za-z_$][\w$]*)\s*=\s*require\(\s*['"]\.\/([^'"]+)['"]\s*\)/g;
  let m;
  while ((m = re.exec(src))) barrel.set(m[1], `models/${m[2]}.js`);
}

/** Which domain owns each model binding. */
const modelDomain = new Map();
for (const [binding, file] of barrel) {
  const dom = i.domainOf(file);
  if (dom) modelDomain.set(binding, dom);
}

/**
 * The names a file binds from the models barrel, read by accumulating the
 * require statement line by line so a preceding destructuring cannot be
 * swallowed into it.
 */
function modelBindings(src) {
  const lines = src.split('\n');
  const out = new Set();
  for (let i = 0; i < lines.length; i++) {
    // Start at ANY destructuring, single-line or wrapped, then accumulate to
    // the statement's terminating semicolon. Matching only `const {\s*$` missed
    // `const { X } = require('../models')` written on one line, which made three
    // modules report "uses no models" when they do use one.
    if (!/^const\s*\{/.test(lines[i])) continue;
    let end = i;
    let stmt = lines[i];
    while (end < lines.length && !/;\s*$/.test(stmt)) stmt += `\n${lines[++end]}`;
    if (/require\(['"](?:\.\.\/)+models['"]\)/.test(stmt)) {
      const braced = stmt.match(/\{([\s\S]*?)\}/);
      if (braced) {
        for (const part of braced[1].split(',')) {
          const spec = part.trim();
          if (spec) out.add(spec.split(':').pop().trim());
        }
      }
    }
    i = end;
  }
  return out;
}

/** Of those, the ones actually referenced - with the require lines removed. */
function usedBindings(src, declared) {
  const lines = src.split('\n');
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/^const\s/.test(lines[i])) continue;
    let end = i;
    let stmt = lines[i];
    while (end < lines.length && !/;\s*$/.test(stmt)) stmt += `\n${lines[++end]}`;
    blocks.push([i, end]);
    i = end;
  }
  const inRequire = (n) => blocks.some(([a, b]) => n >= a && n <= b);
  const body = lines.filter((_, n) => !inRequire(n)).join('\n');
  return [...declared].filter((n) => new RegExp(`\\b${n}\\b`).test(body));
}

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (/\.js$/.test(e.name)) out.push(full);
  }
  return out;
}

const clean = [];
const dirty = [];
const files = walk(path.join(SRC, 'services')).concat(walk(path.join(SRC, 'shared')));

for (const f of files) {
  const rel = path.relative(SRC, f).replace(/\\/g, '/');
  if (rel.endsWith('/index.js')) continue;
  const dom = i.domainOf(rel);
  if (!dom) continue;
  const src = fs.readFileSync(f, 'utf8');
  const used = usedBindings(src, modelBindings(src));
  if (!used.length) continue;
  const foreign = used.filter((n) => {
    const d = modelDomain.get(n);
    return d !== undefined && d !== dom;
  });
  const row = { rel, dom, lines: src.split('\n').length, used, foreign };
  (foreign.length ? dirty : clean).push(row);
}

clean.sort((a, b) => b.lines - a.lines);
dirty.sort((a, b) => b.lines - a.lines);

console.log(`modules with any model use: ${clean.length + dirty.length}`);
console.log(`SELF-CONTAINED (only their own domain's models): ${clean.length}`);
console.log(`cross-domain data reads: ${dirty.length}\n`);

console.log('=== SELF-CONTAINED - extractable with their data');
for (const r of clean) {
  console.log(`  ${String(r.lines).padStart(5)}L  [${r.dom.padEnd(12)}] ${r.rel}`);
  console.log(`           ${r.used.length} model(s): ${r.used.slice(0, 12).join(', ')}${r.used.length > 12 ? ', ...' : ''}`);
}
const byDomain = {};
for (const r of clean) byDomain[r.dom] = (byDomain[r.dom] || 0) + r.lines;
console.log('\n  self-contained lines per domain:');
for (const [d, n] of Object.entries(byDomain).sort((a, c) => c[1] - a[1])) {
  console.log(`    ${String(n).padStart(6)}  ${d}`);
}
console.log(
  `\n  TOTAL self-contained: ${clean.reduce((n, r) => n + r.lines, 0)} lines / ${clean.length} modules`
);
console.log(
  `  NOT extractable    : ${dirty.reduce((n, r) => n + r.lines, 0)} lines / ${dirty.length} modules\n`
);

console.log('=== the notifications candidates, specifically');
for (const rel of [
  'shared/notifications/fcm.notification.service.js',
  'shared/notifications/email.config.service.js',
  'services/notification.list.service.js',
  'services/push.notification.token.service.js',
  'shared/auth/otp.verification.service.js',
  'services/sms.provider.config.service.js',
]) {
  const r = [...clean, ...dirty].find((x) => x.rel === rel);
  if (!r) {
    console.log(`  (${rel}: uses no models)`);
    continue;
  }
  const tag = r.foreign.length ? 'CROSS-DOMAIN' : 'self-contained';
  console.log(`  [${tag}] ${rel}`);
  if (r.foreign.length) {
    console.log(`           reads: ${[...new Set(r.foreign.map((n) => `${n} (${modelDomain.get(n)})`))].join(', ')}`);
  }
}
