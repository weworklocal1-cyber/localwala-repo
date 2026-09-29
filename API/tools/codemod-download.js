/**
 * Phase 2.11 codemod, two rewrites in one pass:
 *
 *   res.download(P);                        -> await sendFileDownload(req, res, P);
 *   res.download(P, (err) => {               -> await sendFileDownload(req, res, P, (err) => {
 *   res.download(P, 'F.json', (err) => {     -> await sendFileDownload(req, res, P, 'F.json', (err) => {
 *   await workbook.xlsx.write(res);          -> await sendXlsx(workbook, req, res);
 *   res.end();            (following write)  -> (deleted)
 *
 * Callback bodies are left byte-identical - the unlink-on-success stays in
 * the caller. The helper returns a promise that settles after the callback,
 * so every call site is emitted awaited: on Fastify an async handler that
 * returns before `send` makes Fastify answer an empty 200 first.
 * Requires are added per file for only the helpers it uses.
 * Throws rather than guessing on anything outside these shapes.
 *
 * Line endings are preserved per line (CRLF licence header, LF body).
 *
 * Usage: node tools/codemod-download.js <controller-file> [--dry]
 */
const fs = require('fs');

function main() {
  const file = process.argv[2];
  const dry = process.argv.includes('--dry');
  if (!file) throw new Error('usage: node tools/codemod-download.js <controller-file> [--dry]');

  const raw = fs.readFileSync(file, 'binary');
  const lines = raw.split('\n');
  const stripped = lines.map((l) => l.replace(/\r$/, ''));

  let downloads = 0;
  let xlsx = 0;
  const out = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const s = stripped[i];

    // res.download(P[, F][, cb]) - the callback (if any) starts on this line
    // and its body follows untouched.
    let m = s.match(/^(\s*)res\.download\(downloadPath\);?\s*$/);
    if (m) {
      out.push(withEnding(line, `${m[1]}await sendFileDownload(req, res, downloadPath);`));
      downloads++;
      continue;
    }
    m = s.match(/^(\s*)res\.download\(downloadPath, (\(err\) => \{)\s*$/);
    if (m) {
      out.push(withEnding(line, `${m[1]}await sendFileDownload(req, res, downloadPath, ${m[2]}`));
      downloads++;
      continue;
    }
    m = s.match(/^(\s*)res\.download\(downloadPath, ('[^']+'), (\(err\) => \{)\s*$/);
    if (m) {
      out.push(withEnding(line, `${m[1]}await sendFileDownload(req, res, downloadPath, ${m[2]}, ${m[3]}`));
      downloads++;
      continue;
    }
    if (/res\.download\(/.test(s)) {
      throw new Error(`${file}:${i + 1}: unrecognised download shape: ${s.trim().slice(0, 80)}`);
    }

    // await workbook.xlsx.write(res); immediately followed by res.end();
    m = s.match(/^(\s*)await workbook\.xlsx\.write\(res\);\s*$/);
    if (m) {
      const next = stripped[i + 1] || '';
      if (!/^\s*res\.end\(\);\s*$/.test(next)) {
        throw new Error(`${file}:${i + 1}: xlsx write not followed by res.end()`);
      }
      out.push(withEnding(line, `${m[1]}await sendXlsx(workbook, req, res);`));
      i++; // swallow the res.end() line
      xlsx++;
      continue;
    }
    if (/workbook\.xlsx\.write\(/.test(s)) {
      throw new Error(`${file}:${i + 1}: unrecognised xlsx shape: ${s.trim().slice(0, 80)}`);
    }

    out.push(line);
  }

  if (!downloads && !xlsx) throw new Error(`${file}: nothing to rewrite`);

  // Add requires for only the helpers used, after the last top-level require
  // (controllers keep every require in the header block).
  const needed = [];
  if (downloads) needed.push('sendFileDownload');
  if (xlsx) needed.push('sendXlsx');
  const requireLine = `const { ${needed.join(', ')} } = require('../utils/download');`;
  let insertAt = -1;
  out.forEach((l, i) => {
    if (i < 80 && /^const .* = require\(.*\);\r?$/.test(l)) insertAt = i;
  });
  if (insertAt < 0) throw new Error(`${file}: no require block found`);
  const ending = out[insertAt].endsWith('\r') ? '\r' : '';
  out.splice(insertAt + 1, 0, `${requireLine}${ending}`);

  const text = out.join('\n');

  if (dry) {
    process.stdout.write(text);
    return;
  }
  fs.writeFileSync(file, text, 'binary');
  process.stderr.write(`${file}: ${downloads} download(s), ${xlsx} xlsx block(s) rewritten\n`);
}

function withEnding(originalLine, replacement) {
  return originalLine.endsWith('\r') ? `${replacement}\r` : replacement;
}

main();
