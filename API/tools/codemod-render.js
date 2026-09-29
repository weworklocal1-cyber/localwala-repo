/**
 * Phase 2.13 codemod: `res.render(` -> `await renderView(req, res,`.
 *
 * The `{ locals: {...} }` argument is left byte-identical - renderView keeps
 * Express's calling convention and unwraps it only on Fastify. Adds the
 * require for files that render. Throws on anything unexpected.
 *
 * Line endings are preserved per line (CRLF licence header, LF body).
 *
 * Usage: node tools/codemod-render.js <controller-file> [--dry]
 */
const fs = require('fs');

const REQUIRE_LINE = "const renderView = require('../utils/renderView');";

function main() {
  const file = process.argv[2];
  const dry = process.argv.includes('--dry');
  if (!file) throw new Error('usage: node tools/codemod-render.js <controller-file> [--dry]');

  const raw = fs.readFileSync(file, 'binary');
  const lines = raw.split('\n');

  let sites = 0;
  const out = lines.map((l) => {
    const stripped = l.replace(/\r$/, '');
    const m = stripped.match(/^(\s*)res\.render\(/);
    if (!m) return l;
    sites++;
    const ending = l.endsWith('\r') ? '\r' : '';
    const rest = stripped.slice(m[0].length);
    const sep = rest === '' || rest.startsWith(' ') ? '' : ' ';
    return `${m[1]}await renderView(req, res,${sep}${rest}${ending}`;
  });

  if (!sites) throw new Error(`${file}: no res.render sites found`);

  let insertAt = -1;
  out.forEach((l, i) => {
    if (i < 80 && /^const .* = require\(.*\);\r?$/.test(l)) insertAt = i;
  });
  if (insertAt < 0) throw new Error(`${file}: no require block found`);
  const ending = out[insertAt].endsWith('\r') ? '\r' : '';
  out.splice(insertAt + 1, 0, `${REQUIRE_LINE}${ending}`);

  const text = out.join('\n');

  if (dry) {
    process.stdout.write(text);
    return;
  }
  fs.writeFileSync(file, text, 'binary');
  process.stderr.write(`${file}: ${sites} render site(s) rewritten\n`);
}

main();
