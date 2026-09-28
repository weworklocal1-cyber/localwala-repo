/**
 * Phase 2.9c codemod: `router.<verb>(path, ...mw, handler)` ->
 * `route({ method, url, preHandler, handler })`, wrapped in
 * `module.exports.register = function register(route) { ... }`.
 *
 * Uses a real paren-matching scanner rather than a regex: admin.route.js is
 * 154KB and a non-greedy regex would silently stop at the first nested call
 * that happens to be followed by `);`.
 *
 * Line endings are preserved per line - untouched lines keep whatever
 * `\r` they already had, which matters because this repo keeps the licence
 * header in CRLF and the body in LF.
 *
 * Usage: node <this-file> <route-file> [--dry]
 */
const fs = require('fs');

const VERBS = new Set(['get', 'post', 'put', 'patch', 'delete']);

function findMatching(text, open) {
  let depth = 0;
  let quote = null;
  for (let i = open; i < text.length; i++) {
    const ch = text[i];
    const prev = text[i - 1];
    if (quote) {
      if (ch === quote && prev !== '\\') quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '(') depth++;
    else if (ch === ')') {
      depth--;
      if (depth === 0) return i;
    }
  }
  throw new Error(`unbalanced parens starting at offset ${open}`);
}

function splitArgs(text) {
  const args = [];
  let depth = 0;
  let quote = null;
  let start = 0;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const prev = text[i - 1];
    if (quote) {
      if (ch === quote && prev !== '\\') quote = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') {
      quote = ch;
      continue;
    }
    if ('([{'.includes(ch)) depth++;
    else if (')]}'.includes(ch)) depth--;
    else if (ch === ',' && depth === 0) {
      args.push(text.slice(start, i));
      start = i + 1;
    }
  }
  args.push(text.slice(start));
  return args.map((a) => a.trim()).filter((a, i, all) => !(i === all.length - 1 && a === ''));
}

function scan(text) {
  const found = [];
  const re = /\brouter\s*\.\s*([A-Za-z_$][\w$]*)\s*\(/g;
  let m;
  while ((m = re.exec(text))) {
    const verb = m[1];
    if (!VERBS.has(verb)) throw new Error(`unsupported router method: router.${verb}`);
    const open = m.index + m[0].length - 1;
    const close = findMatching(text, open);
    found.push({
      start: m.index,
      end: text[close + 1] === ';' ? close + 2 : close + 1,
      verb,
      args: splitArgs(text.slice(open + 1, close)),
    });
  }
  return found;
}

function render(call) {
  const [path, ...rest] = call.args;
  if (!/^['"`]/.test(path)) {
    throw new Error(`route path is not a string literal: ${String(path).slice(0, 60)}`);
  }
  const handler = rest[rest.length - 1];
  const preHandler = rest.slice(0, -1);
  if (!handler) throw new Error(`no handler for ${call.verb} ${path}`);

  const url = path.slice(1, -1);
  const method = call.verb.toUpperCase();

  const lines = ['route({', `  method: '${method}',`, `  url: '${url}',`];
  if (preHandler.length === 1) {
    lines.push(`  preHandler: [${preHandler[0]}],`);
  } else if (preHandler.length > 1) {
    lines.push('  preHandler: [');
    for (const p of preHandler) lines.push(`    ${p},`);
    lines.push('  ],');
  }
  lines.push(`  handler: ${handler},`, '});');
  return lines.join('\n');
}

function main() {
  const file = process.argv[2];
  const dry = process.argv.includes('--dry');
  if (!file) throw new Error('usage: node codemod-route.js <route-file> [--dry]');

  const raw = fs.readFileSync(file, 'binary');
  const headerCrlf = raw
    .split('\n')
    .slice(0, 16)
    .map((l) => l.endsWith('\r'));
  const text = raw.replace(/\r\n/g, '\n');

  const expressIdx = text.split('\n').findIndex((l) => l.trim() === "const express = require('express');");
  const routerIdx = text.split('\n').findIndex((l) => l.trim() === 'const router = express.Router();');
  const exportIdx = text.split('\n').findIndex((l) => l.trim() === 'module.exports = router;');
  if (routerIdx < 0) throw new Error('`const router = express.Router();` not found');
  if (exportIdx < 0) throw new Error('`module.exports = router;` not found');
  if (exportIdx < routerIdx) throw new Error('export found before router declaration');

  const lines = text.split('\n');

  // Express is only needed for the router declaration; drop it when unused.
  let usesExpress = false;
  for (let i = 0; i < lines.length; i++) {
    if (i === expressIdx) continue;
    if (lines[i].trim() === 'const router = express.Router();') continue;
    if (/\bexpress\s*\./.test(lines[i])) usesExpress = true;
  }
  if (expressIdx >= 0 && !usesExpress) lines.splice(expressIdx, 1);

  const rIdx = lines.findIndex((l) => l.trim() === 'const router = express.Router();');
  const eIdx = lines.findIndex((l) => l.trim() === 'module.exports = router;');
  if (rIdx < 0 || eIdx < 0 || eIdx < rIdx) throw new Error('router/export markers moved unexpectedly');

  let body = lines.slice(rIdx + 1, eIdx).join('\n');

  const calls = scan(body);
  if (!calls.length) throw new Error('no router.<verb> calls found between the markers');
  for (let i = calls.length - 1; i >= 0; i--) {
    const c = calls[i];
    body = body.slice(0, c.start) + render(c) + body.slice(c.end);
  }
  body = body
    .split('\n')
    .map((l) => (l.trim() === '' ? '' : `  ${l}`))
    .join('\n')
    .replace(/^\n+/, '')
    .replace(/\n+$/, '\n');

  const head = lines.slice(0, rIdx);
  while (head.length && head[head.length - 1].trim() === '') head.pop();
  const tail = lines.slice(eIdx + 1);
  while (tail.length && tail[0].trim() === '') tail.shift();

  let finalText = [
    ...head,
    '',
    'module.exports.register = function register(route) {',
    ...body.replace(/\n$/, '').split('\n'),
    '};',
    '',
    ...tail,
  ].join('\n');
  finalText = finalText.replace(/\n*$/, '\n');

  // This repo keeps the licence header in CRLF and the body in LF; restore
  // the header endings so the diff does not show 16 whitespace-only lines.
  if (headerCrlf.some(Boolean)) {
    finalText = finalText
      .split('\n')
      .map((l, i) => (headerCrlf[i] && !l.endsWith('\r') ? `${l}\r` : l))
      .join('\n');
  }

  if (dry) {
    process.stdout.write(finalText);
    return;
  }
  fs.writeFileSync(file, finalText, 'binary');
  process.stderr.write(`${file}: ${calls.length} routes rewritten\n`);
}

main();
