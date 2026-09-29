/**
 * Phase 3.2: the domain boundary rule.
 *
 * ESLint's own `no-restricted-imports` cannot express this. It matches patterns
 * globally, so "domain A may not import domain B" would also stop domain B
 * importing *itself*, and it has no idea which domain the file being linted
 * belongs to. This rule computes both sides with the same classification the
 * inventory tool uses, so the lint result and `npm run domain:inventory` can
 * never disagree.
 *
 * What it enforces, and what it deliberately does not:
 *
 *   enforced  - a module in domain A must not import a module in domain B
 *               directly, except for the edges in
 *               tools/domain-boundary-allowlist.json (generated from the
 *               measured graph, drained by Phase 3.3/3.4);
 *   enforced  - a domain facade must not be imported by another domain;
 *   NOT yet   - importing the `services` / `models` barrels. 131 edges go
 *               through them today and removing them is the consumer migration,
 *               not a rule that can be switched on without breaking the build.
 *               It lands with that migration.
 *
 * Files outside the governed set (controllers, routes, utils, config) are
 * skipped: they are consumers, not domain members, and a rule that failed on
 * every controller would be turned off within a day.
 */
const fs = require('fs');
const path = require('path');

const inventory = require('../domain-inventory.js');

const { API_ROOT, SRC, domainOf, governed, isBarrel, resolveRelative } = inventory;

const ALLOWLIST_FILE = path.join(API_ROOT, 'tools', 'domain-boundary-allowlist.json');

let allowlistCache = null;
function allowlist() {
  if (allowlistCache) return allowlistCache;
  if (!fs.existsSync(ALLOWLIST_FILE)) {
    throw new Error(
      'domain-boundary: tools/domain-boundary-allowlist.json is missing.\n' +
        '  run: npm run domain:allowlist'
    );
  }
  const parsed = JSON.parse(fs.readFileSync(ALLOWLIST_FILE, 'utf8'));
  allowlistCache = new Set((parsed.edges || []).map((e) => `${e.from} -> ${e.to}`));
  return allowlistCache;
}

/** Tests reset the module cache; drop the memoised allowlist with it. */
function resetCache() {
  allowlistCache = null;
}

const relFromSrc = (abs) => path.relative(SRC, abs).replace(/\\/g, '/');

/**
 * Domain of a resolved target under src/domains/<name>/, or null.
 *
 * This deliberately works on the *resolved* path rather than the specifier:
 * a facade importing a sibling domain writes `../catalog`, which contains no
 * mention of "domains" at all.
 */
function facadeDomainOfResolved(abs) {
  const rel = relFromSrc(abs);
  const m = rel.match(/^domains\/([a-z-]+)(?:\/|$)/);
  return m ? m[1] : null;
}

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Enforce the Phase 3 domain boundary: no cross-domain imports except the ' +
        'generated allowlist.',
    },
    schema: [],
    messages: {
      crossDomain:
        "'{{fromDomain}}' must not import '{{toDomain}}' ({{to}}). Route it through a " +
        'facade in src/domains/{{toDomain}}, or add the edge to ' +
        'tools/domain-boundary-allowlist.json if it is genuinely unavoidable.',
      crossFacade:
        "domain '{{fromDomain}}' must not import another domain's facade ({{spec}}); " +
        'import from src/domains/{{toDomain}} explicitly via the shared kernel instead.',
    },
  },

  create(context) {
    resetCache();
    // ESLint 9 dropped `context.getFilename()` in favour of `context.filename`;
    // the fallback keeps the rule working if the project is ever pinned back.
    const filename = context.filename || (context.getFilename && context.getFilename());
    if (!filename || filename === '<input>' || !fs.existsSync(filename)) return {};

    const fromRel = relFromSrc(path.resolve(filename));

    // Only domain members are constrained. A file the inventory cannot
    // classify is skipped rather than guessed at - the inventory's own
    // `unclassified` count is the thing that makes that visible.
    const fromDomain = facadeDomainOfResolved(path.resolve(filename)) || domainOf(fromRel);
    if (!fromDomain) return {};

    const allowed = allowlist();

    function check(node, rawSpec) {
      if (typeof rawSpec !== 'string' || !rawSpec.startsWith('.')) return;

      const target = resolveRelative(filename, rawSpec);
      if (!target) return;

      // A facade importing another domain's facade.
      const toFacade = facadeDomainOfResolved(target);
      if (toFacade && toFacade !== fromDomain) {
        context.report({
          node,
          messageId: 'crossFacade',
          data: { fromDomain, toDomain: toFacade, spec: rawSpec },
        });
        return;
      }

      const toRel = relFromSrc(target);
      if (isBarrel(toRel)) return; // tracked separately; see the header comment
      if (!governed(toRel)) return;

      const toDomain = domainOf(toRel);
      if (!toDomain || toDomain === fromDomain) return;
      if (allowed.has(`${fromRel} -> ${toRel}`)) return;

      context.report({
        node,
        messageId: 'crossDomain',
        data: { fromDomain, toDomain, to: toRel },
      });
    }

    return {
      // ESM, for the generated domain facades.
      ImportDeclaration: (node) => check(node.source, node.source.value),

      // Re-exports cross a boundary exactly as imports do - `export * from
      // '../catalog'` is a facade leaking another domain just as surely as an
      // import is.
      ExportAllDeclaration: (node) => check(node.source, node.source.value),
      ExportNamedDeclaration: (node) =>
        node.source ? check(node.source, node.source.value) : undefined,

      // CommonJS: the whole codebase is `require('...')`, and an
      // ImportDeclaration visitor alone would never fire - a boundary rule that
      // silently matches nothing is worse than no rule, because it looks green.
      CallExpression: (node) => {
        if (node.callee.type !== 'Identifier' || node.callee.name !== 'require') return;
        const [arg] = node.arguments;
        if (!arg || arg.type !== 'Literal' || typeof arg.value !== 'string') return;
        check(node, arg.value);
      },
    };
  },
};
