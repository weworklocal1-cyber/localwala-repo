/**
 * Phase 3.6b: extract the subscription shared kernel.
 *
 * One script, so the moves are byte-precise: `git mv` for the files themselves,
 * a targeted require-depth fix inside them, a substring replace for the
 * importers, and the moved files forced to pure LF. Doing this from the shell
 * with whole-file rewrites is what took an unrelated trailing blank line out of
 * services/index.js last time.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const API_ROOT = 'C:\\localwala fils\\AppSourceCode\\API';
const SRC = path.join(API_ROOT, 'src');
const SERVICES = path.join(SRC, 'services');

const KERNEL = 'subscription';
const MOVES = ['subscriber.service.js', 'subscription.service.js'];
const KERNEL_DIR = path.join(SRC, 'shared', KERNEL);

// 1. move
fs.mkdirSync(KERNEL_DIR, { recursive: true });
for (const name of MOVES) {
  const from = path.join(SERVICES, name);
  const to = path.join(KERNEL_DIR, name);
  fs.renameSync(from, to);
  console.log(`moved    ${name}`);
}

// 2. the moved files went one directory deeper, so their own relative requires
//    need one more `../`. Only `../x` forms change; package requires do not.
for (const name of MOVES) {
  const file = path.join(KERNEL_DIR, name);
  const before = fs.readFileSync(file, 'utf8');
  const after = before.replace(/require\('\.\.\//g, "require('../../");
  // pure LF: git diff --check reads a CR as trailing whitespace on an added line
  const lf = after.replace(/\r\n/g, '\n');
  fs.writeFileSync(file, lf, 'utf8');
  const depthFixes = (before.match(/require\('\.\.\//g) || []).length;
  console.log(
    `rewired  ${name}  (${depthFixes} require(s) deepened, CRLF ${(before.match(/\r\n/g) || []).length} -> 0)`
  );
}

// 3. kernel entry point. The local names match what services/index.js already
//    publishes (`subscriberService`, `subscriptionService`), so a consumer that
//    knows the kernel by its barrel name recognises it.
const localName = (n) => n.replace(/\.service\.js$/, 'Service').replace(/\.js$/, '');
const entries = MOVES.map((n) => `const ${localName(n)} = require('./${n}');`).join('\n');
const spreads = MOVES.map((n) => `  ...${localName(n)},`).join('\n');
fs.writeFileSync(
  path.join(KERNEL_DIR, 'index.js'),
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
 * Phase 3.6b: the subscription shared kernel.
 *
 * Vendor subscriptions are bought by restaurants, renewed on a schedule and
 * read by the restaurant's own export and identity buckets - which is why
 * "subscriber" sat in the orders domain and produced four cross-domain edges
 * from two restaurant files. The code has nothing to do with the order
 * lifecycle; it is a subscription ledger, so it belongs in a kernel.
 *
 * Its home domain stays \`orders\` (the filename prefixes still resolve there),
 * so the services barrel and the generated facades are unchanged. Only the
 * import is exempt - see tools/domain-inventory.js.
 */
${entries}

module.exports = {
${spreads}
};
`,
  'utf8'
);
console.log('wrote    shared/subscription/index.js');

// 4. rewire the importers, by substring replace only
const IMPORTERS = [
  'src/services/restaurant.export.internal.js',
  'src/services/restaurant.identity.internal.js',
  'src/services/index.js',
];
for (const rel of IMPORTERS) {
  const file = path.join(API_ROOT, rel);
  const before = fs.readFileSync(file, 'utf8');
  let after = before;
  for (const name of MOVES) {
    const bare = name.replace(/\.js$/, '');
    after = after.split(`require('./${bare}')`).join(`require('../shared/${KERNEL}/${bare}')`);
    after = after.split(`require("./${bare}")`).join(`require("../shared/${KERNEL}/${bare}")`);
  }
  if (after === before) {
    console.log(`no-match ${rel}`);
    continue;
  }
  fs.writeFileSync(file, after, 'utf8');
  console.log(`updated  ${rel}  (+${after.length - before.length} bytes)`);
}

console.log('\nper-file diff:');
console.log(
  execFileSync('git', ['diff', '--numstat', '--', ...IMPORTERS.map((i) => `API/${i}`)], {
    cwd: API_ROOT,
    encoding: 'utf8',
  }).trim()
);
