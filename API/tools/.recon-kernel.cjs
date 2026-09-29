// Recon for the next shared kernel: size, exports, and every importer.
const fs = require('fs');
const path = require('path');
const API = 'C:\\localwala fils\\AppSourceCode\\API';
const SRC = path.join(API, 'src');
const i = require(path.join(API, 'tools', 'domain-inventory.js'));

const targets = process.argv.slice(2);

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (/\.(js|ts)$/.test(e.name)) out.push(full);
  }
  return out;
}
const all = walk(SRC);

for (const rel of targets) {
  const abs = path.join(SRC, rel);
  if (!fs.existsSync(abs)) {
    console.log(`MISSING ${rel}`);
    continue;
  }
  const src = fs.readFileSync(abs, 'utf8');
  const lines = src.split('\n');
  const exp = src.match(/module\.exports\s*=\s*\{([\s\S]*?)\n\};/);
  const names = exp
    ? [...new Set([...exp[1].matchAll(/([A-Za-z_$][\w$]*)\s*[,:]?/g)].map((m) => m[1]))]
    : [];
  console.log(`\n=== ${rel}`);
  console.log(`  ${lines.length} lines, domain ${i.domainOf(rel)}, ${names.length} exports`);
  console.log(`  exports: ${names.join(', ')}`);
  const relReqs = [...src.matchAll(/require\(['"](\.[^'"]*)['"]\)/g)].map((m) => m[1]);
  console.log(`  relative requires: ${[...new Set(relReqs)].join(', ')}`);

  const base = path.basename(rel).replace(/\.js$/, '');
  const importers = [];
  for (const f of all) {
    if (f === abs) continue;
    const s = fs.readFileSync(f, 'utf8');
    for (const m of s.matchAll(/require\((['"])([^'"]+)\1\)/g)) {
      if (path.basename(m[2]).replace(/\.js$/, '') !== base) continue;
      const relf = path.relative(SRC, f).replace(/\\/g, '/');
      importers.push({ rel: relf, spec: m[2], domain: i.domainOf(relf) });
    }
  }
  console.log(`  importers: ${importers.length}`);
  for (const im of importers) {
    console.log(`    [${(im.domain || 'ungoverned').padEnd(12)}] ${im.rel}  ->  ${im.spec}`);
  }
}
