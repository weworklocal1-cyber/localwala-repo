/**
 * Phase 2.10 codemod: `upload.single('F')(req, res, cb)` ->
 * `handleUpload(req, res, 'F', <storage>, cb)`.
 *
 * Every one of the 78 sites shares the exact shape
 * `upload.single('F')(req, res,`, where `upload` comes from the nearest
 * preceding `const upload = uploadMiddleware(EXPR);`. The callback body is
 * left byte-identical - each site maps multer errors differently, and
 * flattening those is the Phase 2.12 controller rewrite's job.
 *
 * Also swaps the `uploadMiddleware` require for `handleUpload` and deletes
 * the now-unused `const upload` lines. Throws rather than guessing when a
 * site has no preceding storage expression.
 *
 * Line endings are preserved per line (CRLF licence header, LF body).
 *
 * Usage: node tools/codemod-upload.js <controller-file> [--dry]
 */
const fs = require('fs');

const REQUIRE_LINE = "const uploadMiddleware = require('../middlewares/upload');";
const HANDLEUPLOAD_REQUIRE = "const handleUpload = require('../utils/handleUpload');";

function main() {
  const file = process.argv[2];
  const dry = process.argv.includes('--dry');
  if (!file) throw new Error('usage: node tools/codemod-upload.js <controller-file> [--dry]');

  const raw = fs.readFileSync(file, 'binary');
  const lines = raw.split('\n');

  // Index the storage expression each `upload.single` resolves to.
  const constAt = [];
  lines.forEach((l, i) => {
    const m = l.replace(/\r$/, '').match(/^\s*const upload = uploadMiddleware\((.*)\);\s*$/);
    if (m) constAt.push({ line: i, expr: m[1] });
  });

  let sites = 0;
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const stripped = line.replace(/\r$/, '');

    if (/^\s*const upload = uploadMiddleware\(.*\);\s*$/.test(stripped)) {
      continue; // deleted; its expression travels with each site below
    }

    const m = stripped.match(/upload\.single\('([^']+)'\)\(req, res,/);
    if (m) {
      const preceding = constAt.filter((c) => c.line < i);
      if (!preceding.length) {
        throw new Error(`${file}:${i + 1}: upload.single with no preceding const upload`);
      }
      const expr = preceding[preceding.length - 1].expr;
      // Awaited: on Fastify an async handler that returns before the upload
      // callback settles makes Fastify answer an empty 200 first.
      const replaced = stripped.replace(
        /upload\.single\('([^']+)'\)\(req, res,/,
        `await handleUpload(req, res, '$1', ${expr},`
      );
      out.push(line.endsWith('\r') ? `${replaced}\r` : replaced);
      sites++;
      continue;
    }

    out.push(line);
  }

  if (!sites) throw new Error(`${file}: no upload.single sites found`);

  let text = out.join('\n');
  if (!text.includes(REQUIRE_LINE)) {
    throw new Error(`${file}: uploadMiddleware require line not found`);
  }
  text = text.replace(REQUIRE_LINE, HANDLEUPLOAD_REQUIRE);

  // Safety: nothing may reference the removed pieces afterwards.
  for (const needle of ['uploadMiddleware', 'upload.single(', 'const upload =']) {
    if (text.includes(needle)) {
      throw new Error(`${file}: leftover reference to ${needle}`);
    }
  }

  if (dry) {
    process.stdout.write(text);
    return;
  }
  fs.writeFileSync(file, text, 'binary');
  process.stderr.write(`${file}: ${sites} upload site(s) rewritten\n`);
}

main();
