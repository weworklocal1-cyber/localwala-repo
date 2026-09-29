/**
 * LocalWala – Local Commerce & Delivery Platform
 * (NodeJS, MongoDB, Angular & Flutter)
 *
 * Copyright © 2026 WeWorkLocal Private Limited
 * https://weworklocal.in/
 *
 * WeWorkLocal Private Limited
 * This source code is confidential.
 *
 * Ownership Fingerprint:
 * LWL|WWL|2026|LOCALWALA|NODE
 *
 * Phase 3.1: the domain inventory.
 *
 * ---------------------------------------------------------------------------
 * What this is, and why it is a tool rather than a document
 * ---------------------------------------------------------------------------
 * Phase 3 turns one monolith into eleven domains (src/domains/*). Before any
 * file moves we need two facts, both of which rot the moment they are written
 * down by hand:
 *
 *   1. which of the 133 services and 142 models belongs to which domain; and
 *   2. which cross-domain edges actually exist today.
 *
 * (2) is measured from the source, never declared - the real require() graph.
 * (1) is the one judgement call, so it lives in DOMAINS below as data with
 * explicit prefix rules and an `overrides` escape hatch, and the tool fails
 * if any module ends up unclassified. An unclassified module is a bug in this
 * file, not a shrug: the Phase 3 exit criterion ("zero cross-domain imports")
 * is only meaningful if every module has a domain.
 *
 * Measured result that shaped the whole phase (see the plan's Phase 3 note):
 * the plan's risk #9 calls orders+restaurant "30,798 LOC of coupling", and the
 * LOC is right, but at module level they are barely entangled - each has 11
 * internal neighbours and orders -> restaurant is the *only* direct edge
 * between them. The real coupling is the four barrels (services 133, models
 * 142, controllers 121, validations 114): one import gives a controller all
 * 133 services. That is why 3.1 starts by publishing boundaries, not by
 * moving files.
 *
 * Usage:
 *   node tools/domain-inventory.js                 # human summary
 *   node tools/domain-inventory.js --json          # machine-readable
 *   node tools/domain-inventory.js --strict        # non-zero exit if
 *                                                  #   unclassified modules
 *                                                  #   or cycles exist
 */
const fs = require('fs');
const path = require('path');

const API_ROOT = path.resolve(__dirname, '..');
const SRC = path.join(API_ROOT, 'src');

/**
 * The eleven domains from the migration plan, with the module-name prefixes
 * that belong to each. Order matters only for the summary output.
 *
 * `prefixes` match the *filename* of services (`<prefix>.service.js`) and
 * models (`<prefix>.model.js`). Everything not matched by any rule must be
 * handled by `overrides` below or the tool reports it as unclassified.
 */
const DOMAINS = {
  orders: {
    description: 'Order lifecycle: creation, assignment, status, pricing, ratings, exports',
    prefixes: [
      'order', 'orders', 'cart', 'cart.item', 'table.order', 'pos.or.table.order',
      'dining.booking', 'dining.booking.refund', 'dining.booking.refund.reason',
      'dining.cancellation.reason', 'order.rating', 'order.cancellation',
      'subscription', 'subscriber', 'tiffin.subscription', 'user.purchased.tiffin',
      'refund.request', 'restaurant.disbursement', 'disbursement', 'withdrawal.request',
    ],
  },
  restaurant: {
    description: 'Restaurants, menus, catalogue wiring, facilities, staff relationships',
    prefixes: [
      'restaurant', 'restaurants', 'outlet', 'kitchen', 'kitchen.owner',
      'restaurant.campaign', 'restaurant.complaints', 'restaurant.facilities',
      'restaurant.food.license', 'restaurant.notice', 'restaurant.type',
      'restaurant.joining', 'restaurant.expense', 'hide.restaurant',
    ],
  },
  catalog: {
    // Phase 3.1a shipped 10 domains because the plan's `catalog` had no
    // members: everything menu-shaped was filed under `restaurant`. The plan
    // lists 11, and menu/catalogue is genuinely its own extraction in Phase 6,
    // so it is restored here rather than left permanently empty.
    description: 'Menu and catalogue: foods, categories, add-ons, cuisine, taxes',
    prefixes: [
      'food', 'food.campaign', 'food.taxation', 'addon', 'addons',
      'category', 'sub.category', 'cuisine', 'vendor.category',
      'vendor.sub.category', 'banners',
    ],
  },
  identity: {
    description: 'Users, auth, roles, tokens, drivers, waiters, support, accountants',
    prefixes: [
      'user', 'users', 'auth', 'token', 'visitor', 'role', 'permission',
      'driver', 'waiter', 'support', 'accountant', 'admin', 'auth.factory',
      'user.avatar', 'user.delete.account.reason', 'vehicle', 'country', 'city',
      'locality', 'language', 'location', 'app.page', 'app.web.setting', 'report.issue',
      'report.emergency', 'feedback.form', 'complaints', 'complaints.reason',
      'coupon', 'dining.coupon', 'delivery.gratitude', 'delivery.instructions',
    ],
  },
  delivery: {
    description: 'Dispatch, driver funds, shifts, offline messaging',
    prefixes: [
      'deliveryman', 'delivery.instruction', 'delivery.gratitude',
      'deliveryman.shift', 'deliveryman.cash.in.hand', 'deliveryman.fund',
      'deliveryman.incentive', 'deliveryman.offline', 'driver.offline',
    ],
  },
  dining: {
    description: 'Dining-specific campaigns, notices, dining configuration',
    prefixes: ['dining.campaign', 'dining.notice', 'dining.category'],
  },
  wallet: {
    description: 'Wallets, bonuses, transactions, collections, cash in hand',
    prefixes: [
      'wallet', 'transaction', 'collect.cash', 'restaurant.disbursement.data',
      'deliveryman.disbursement.data', 'cash.in.hand', 'loyalty.points',
    ],
  },
  payments: {
    description: 'Payment initiation, gateways, refunds, withdrawal methods',
    prefixes: ['payment', 'payment.initiation', 'stripe', 'refund', 'withdrawal.method'],
  },
  notifications: {
    description: 'FCM push, email, chat, conversion tracking',
    prefixes: [
      'fcm', 'email', 'chat', 'chat.room', 'support.chat', 'chat.conversion',
      'notification', 'msg91',
    ],
  },
  storage: {
    description: 'Media and file storage (local, GCS, Azure, S3)',
    prefixes: ['media', 'file', 'storage'],
  },
  settings: {
    description: 'Business and platform settings, admin expense, cron bookkeeping',
    prefixes: [
      'business.settings', 'settings', 'admin.expense', 'cron', 'import.collection',
      'app.page', 'app.web.setting',
    ],
  },
};

/**
 * Modules the rules above cannot classify by prefix, or that genuinely belong
 * to another domain than their name suggests. Keys are paths relative to src/.
 * Keep this list short and justified - it is the seam the reviewer reads.
 *
 * Every entry here was surfaced by the tool itself (`UNCLASSIFIED` in the
 * summary) rather than guessed: the names are plural, abbreviated, or
 * misspelled in ways no prefix rule can catch (`bussiness.settings.model.js`).
 */
const OVERRIDES = {
  // Money movement owned by payments/wallet even though the name says
  // restaurant / deliveryman.
  'services/restaurant.cash.in.hand.service.js': 'wallet',
  'services/deliveryman.cash.in.hand.service.js': 'wallet',
  'models/restaurant.cash.in.hand.model.js': 'wallet',
  'models/deliveryman.cash.in.hand.model.js': 'wallet',

  // Catalogue, pluralised so the prefix rules miss it (and now genuinely a
  // domain of its own rather than a corner of restaurant).
  'services/addons.service.js': 'catalog',
  'models/addons.model.js': 'catalog',
  'services/vendor.category.service.js': 'catalog',
  'models/vendor.category.model.js': 'catalog',
  'services/vendor.sub.category.service.js': 'catalog',
  'models/vendor.sub.category.model.js': 'catalog',

  // Platform settings - note the upstream spelling of "bussiness" and the
  // plural forms; three separate models for the same concern.
  'services/app.pages.service.js': 'settings',
  'models/app.pages.model.js': 'settings',
  'models/app.web.settings.model.js': 'settings',
  'models/bussiness.settings.model.js': 'settings',
  'models/landing.page.model.js': 'settings',
  'services/landing.page.service.js': 'settings',
  'services/dining.settings.service.js': 'settings',
  'models/dining.settings.model.js': 'settings',

  // Deleted-account tombstones: identity owns the lifecycle even though the
  // name starts with restaurant/kitchen/driver.
  'models/deleted.deliveryman.account.model.js': 'identity',
  'models/deleted.kitchen.account.model.js': 'identity',
  'models/deleted.restaurant.account.model.js': 'identity',
  'models/deleted.user.account.model.js': 'identity',
  'models/deleted.waiter.account.model.js': 'identity',

  // Coupons are marketing attached to the catalogue but keyed to users.
  'models/coupons.model.js': 'catalog',
  'models/dining.coupons.model.js': 'catalog',

  // Favourites are a user-profile concern spanning orders and restaurants.
  'models/favourite.model.js': 'identity',
  'models/favourite.orders.model.js': 'identity',
  'services/favourite.service.js': 'identity',
  'services/favourite.order.service.js': 'identity',
  'services/review.ratings.service.js': 'identity',

  // Identity/session data.
  // Keyed by BASENAME where the file is likely to move. An override keyed by
  // full path is lost the moment Phase 3.6 extracts the file into a shared
  // kernel, and the module then classifies as null - which fails the inventory
  // and drops the name out of its domain facade. The `auth` kernel is the case
  // that forced this: otp.verification and otp.web.verification matched no
  // filename prefix, so both went unclassified the moment they moved.
  //
  // Both spellings are kept for files that are not moving, so this is additive
  // rather than a rename: dropping a path key while adding a basename key is
  // only equivalent if the basename is unique, and the earlier attempt at that
  // edit silently removed guest.user.info from the identity facade.
  'guest.user.info.model.js': 'identity',
  'guest.user.info.service.js': 'identity',
  'otp.verification.model.js': 'identity',
  'otp.verification.service.js': 'identity',
  'otp.web.verification.model.js': 'identity',
  'models/otp.verification.model.js': 'identity',
  'services/otp.verification.service.js': 'identity',
  'models/otp.web.verification.model.js': 'identity',
  'models/social.signin.model.js': 'identity',
  'services/social.signin.service.js': 'identity',
  'models/languages.model.js': 'identity',
  'models/sms.providers.config.model.js': 'settings',
  'services/sms.provider.config.service.js': 'settings',

  // Referral/wallet growth.
  'models/redeem.referral.model.js': 'wallet',
  'models/referral.codes.model.js': 'wallet',
  'services/referral.service.js': 'wallet',

  // Order-adjacent money and content.
  'services/invoice.instruction.service.js': 'orders',
  'models/invoice.instruction.model.js': 'orders',
  'models/subscriptions.model.js': 'orders',
  'models/transactions.model.js': 'wallet',
  'models/withdrawal.methods.model.js': 'payments',

  // Restaurant onboarding.
  'services/joining.form.service.js': 'restaurant',
  'models/joining.form.model.js': 'restaurant',

  // Push tokens are notification infrastructure keyed to a user.
  'models/push.notitication.token.model.js': 'notifications',
  'services/push.notification.token.service.js': 'notifications',
};

// ---------------------------------------------------------------------------
// Domain facades (3.1)
// ---------------------------------------------------------------------------
/**
 * Reads `module.exports.<name> = require('./<file>')` out of the barrels, so
 * a generated facade exports exactly the names the barrel exported today and
 * a consumer can switch `require('../services')` -> `require('../domains/orders')`
 * without renaming anything.
 */
function readBarrelExports(relPath) {
  const file = path.join(SRC, relPath);
  if (!fs.existsSync(file)) return new Map();
  const source = fs.readFileSync(file, 'utf8');
  const map = new Map();
  const re =
    /module\.exports\.([A-Za-z_$][\w$]*)\s*=\s*require\(\s*['"](\.[^'"]*)['"]\s*\)/g;
  let m;
  while ((m = re.exec(source))) {
    // Resolve the specifier against the barrel's own directory and key by the
    // SRC-relative path, so the key lines up with how `nodes` is keyed.
    //
    // This used to assume every spec was `./x` and rebuild the key as
    // `services/x.js`. That was fine until Phase 3.6a moved a kernel out of
    // services/, so the barrel wrote `require("../shared/notifications/...")` -
    // which the old pattern did not match at all, and the two names silently
    // vanished from every domain facade.
    const abs = path.resolve(path.dirname(file), m[2]);
    // The exact path first: a specifier that already carries its extension
    // (`./otp.web.verification.model.js`) must not be probed again as
    // `...js.js`, which does not exist, and the name then silently vanishes
    // from its domain facade.
    const candidates = [abs, `${abs}.js`, `${abs}.ts`, path.join(abs, 'index.js')];
    for (const candidate of candidates) {
      if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
        map.set(path.relative(SRC, candidate).replace(/\\/g, '/'), m[1]);
        break;
      }
    }
  }
  return map;
}
function renderFacade(domain, members, def) {
  // Two import shapes. A model does `module.exports = Model` and needs a
  // default import; a service exports an object of functions, which a namespace
  // import captures correctly.
  //
  // The test is path OR filename, because a shared kernel may hold a model that
  // no longer lives under models/ - and 141 of the 142 models are named
  // `*.model.js` while one is `models/food.order.review.js`. Filename alone
  // would silently flip that one to a namespace import; path alone would miss a
  // model inside a kernel.
  const isModelPath = (p) => /(^|\/)models\//.test(p) || /\.model\.(js|ts)$/.test(p);
  const namespaces = members
    .filter((m) => !isModelPath(m.path))
    .sort((a, b) => a.path.localeCompare(b.path));
  const models = members.filter((m) => isModelPath(m.path)).sort((a, b) =>
    a.path.localeCompare(b.path)
  );

  const header = [
    '/**',
    ' * LocalWala – Local Commerce & Delivery Platform',
    ' * (NodeJS, MongoDB, Angular & Flutter)',
    ' *',
    ' * Copyright © 2026 WeWorkLocal Private Limited',
    ' * https://weworklocal.in/',
    ' *',
    ' * WeWorkLocal Private Limited',
    ' * This source code is confidential.',
    ' *',
    ' * Ownership Fingerprint:',
    ' * LWL|WWL|2026|LOCALWALA|NODE',
    ' *',
    ` * Phase 3.1 - the ${domain} domain's public entry point.`,
    ` * ${def.description}.`,
    ' *',
    ' * GENERATED by tools/domain-inventory.js --write-domains. Do not edit by',
    ' * hand: `npm run domain:check` fails if this file drifts from the',
    ' * classification in the inventory tool.',
    ' *',
    ' * Re-exports the same names the src/services and src/models barrels',
    ' * export today, so moving a consumer to this file is a one-line change.',
    ' */',
    '',
  ];

  const body = [];
  // Extensionless specifiers, matching every other import in the repo (they
  // are CommonJS, and Node resolves them the same way).
  const spec = (p) => `../../${p.replace(/\.js$/, '')}`;
  for (const m of namespaces) {
    body.push(`import * as ${m.name} from '${spec(m.path)}';`);
  }
  for (const m of models) {
    body.push(`import ${m.name} from '${spec(m.path)}';`);
  }
  if (body.length) body.push('');
  for (const m of namespaces) body.push(`export { ${m.name} };`);
  for (const m of models) body.push(`export { ${m.name} };`);

  return `${header.join('\n')}\n${body.join('\n')}\n`;
}

function buildFacades() {
  const result = build();
  const barrels = new Map([
    ...readBarrelExports('services/index.js'),
    ...readBarrelExports('models/index.js'),
  ]);

  const facades = {};
  const internal = [];
  for (const [domain, v] of Object.entries(result.byDomain)) {
    // Only barrel members are part of the domain's public surface. A module
    // that neither barrel re-exports is an internal kernel - orders.service
    // splitting out its analytics queries is the first one - and it has no
    // public name. The previous `|| derivedName(p)` fallback invented one and
    // put it in the facade, which made the facade export a name no consumer
    // could have imported and broke the "every barrel name exactly once"
    // invariant. The fallback was dead code: all 275 modules were in a barrel.
    const members = v.modules
      .filter((p) => barrels.has(p))
      .map((p) => ({ path: p, name: barrels.get(p) }));
    for (const p of v.modules) if (!barrels.has(p)) internal.push({ domain, path: p });

    // Two members in one domain resolving to the same export name would emit
    // a facade that does not compile ("Duplicate identifier"). Fail here,
    // naming both files, instead of leaving broken TypeScript behind.
    const seen = new Map();
    for (const m of members) {
      if (seen.has(m.name)) {
        throw new Error(
          `domain "${domain}" has an export-name collision: ${m.name}\n` +
            `  ${seen.get(m.name)}\n  ${m.path}\n` +
            '  add a barrel re-export or an override so the names differ.'
        );
      }
      seen.set(m.name, m.path);
    }

    facades[domain] = renderFacade(domain, members, DOMAINS[domain]);
  }
  facades.__internal = internal;
  return facades;
}
function walkDir(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(full, out);
    else if (/\.(js|cjs|ts)$/.test(entry.name)) out.push(full);
  }
  return out;
}

function resolveRelative(fromFile, spec) {
  const base = path.resolve(path.dirname(fromFile), spec);
  // `index.ts` matters: the generated domain facades are TypeScript, so
  // resolving `../catalog` has to find src/domains/catalog/index.ts. Without
  // it the boundary rule silently skipped every facade-to-facade import.
  const candidates = [
    base,
    `${base}.js`,
    `${base}.cjs`,
    `${base}.ts`,
    path.join(base, 'index.js'),
    path.join(base, 'index.ts'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c) && fs.statSync(c).isFile()) return c;
  }
  return null;
}

function localRequires(source) {
  const out = [];
  for (const m of source.matchAll(/\brequire\(\s*['"](\.[^'"]+)['"]\s*\)/g)) out.push(m[1]);
  for (const m of source.matchAll(/(?<!type\s)(?<!typeof\s)\bfrom\s+['"](\.[^'"]+)['"]/g)) out.push(m[1]);
  return out;
}

/** The set of module paths the inventory governs: services + models. */
function governed(relPath) {
  // `shared/` is governed too, and for a specific reason. A shared kernel is
  // extracted out of a business domain but stays reachable from that domain's
  // facade, because the barrel still re-exports its names and the facades are
  // only "drop-in" while the union of their exports equals the union of the
  // barrel's. So a shared module is classified into its home domain - see
  // domainOf - and is exempt only as an import *target*, via isSharedKernel.
  if (!/^(services|models|shared)\//.test(relPath)) return false;
  // Barrels are the thing being replaced, not a member of any domain. A shared
  // kernel's own index.js is a barrel in exactly that sense.
  if (relPath.endsWith('/index.js')) return false;
  // Mongoose plugins are infrastructure, not domain data.
  if (relPath.includes('/plugins/')) return false;
  return true;
}

/** True for a shared kernel's entry point (`src/shared/<kernel>/index.js`). */
function isSharedKernel(relPath) {
  return /^shared\/[^/]+\//.test(relPath);
}

/** True for the four barrels that hand out every module at once, plus kernel entry points. */
function isBarrel(relPath) {
  return (
    /^(services|models|controllers|validations)\/index\.js$/.test(relPath) ||
    /^shared\/[^/]+\/index\.js$/.test(relPath)
  );
}

function domainOf(relPath) {
  if (OVERRIDES[relPath]) return OVERRIDES[relPath];
  // A basename-keyed override survives being moved into a shared kernel, which
  // a path-keyed one does not - see the note on the identity OTP entries.
  const base0 = path.basename(relPath);
  if (OVERRIDES[base0]) return OVERRIDES[base0];

  // A shared kernel lives under src/shared/<kernel>/, so the usual
  // services/models prefixes cannot classify it. Its *home* domain is the
  // kernel's directory name, which keeps the barrel-to-facade mapping intact
  // while the import exemption lives in build(). If the kernel name is not a
  // known domain, fall through and classify by filename as before rather than
  // returning something invented.
  const shared = relPath.match(/^shared\/([^/]+)\//);
  if (shared && DOMAINS[shared[1]]) return shared[1];

  const base = path.basename(relPath).replace(/\.(service|model)\.js$/, '');
  for (const [domain, def] of Object.entries(DOMAINS)) {
    if (def.prefixes.includes(base)) return domain;
  }
  // Longest-prefix fallback so `dining.booking.refund` beats `dining`.
  let best = null;
  let bestLen = -1;
  for (const [domain, def] of Object.entries(DOMAINS)) {
    for (const p of def.prefixes) {
      if ((base === p || base.startsWith(`${p}.`)) && p.length > bestLen) {
        best = domain;
        bestLen = p.length;
      }
    }
  }
  return best;
}

function build() {
  const files = walkDir(SRC);
  const rel = (f) => path.relative(SRC, f).replace(/\\/g, '/');

  const nodes = new Map(); // relPath -> { domain, edges: Set<relPath> }
  const edges = [];

  for (const file of files) {
    const source = fs.readFileSync(file, 'utf8');
    const from = rel(file);
    for (const spec of localRequires(source)) {
      const target = resolveRelative(file, spec);
      if (!target) continue;
      const to = rel(target);
      edges.push([from, to]);
    }
  }

  for (const file of files) {
    const r = rel(file);
    if (!governed(r)) continue;
    nodes.set(r, { domain: domainOf(r), edges: new Set() });
  }
  for (const [a, b] of edges) {
    if (nodes.has(a) && nodes.has(b)) nodes.get(a).edges.add(b);
  }

  // Cross-domain edges. Two very different kinds are counted separately:
  //
  //   direct  - the source module genuinely uses another domain's module.
  //   barrel  - the source module reaches it through `require('../models')`,
  //             which loads all 142 models to hand out one. That is load-time
  //             coupling with no domain meaning, and it is precisely what
  //             3.1 exists to remove, so it is measured and reported on its
  //             own rather than being mixed in with real dependencies.
  const crossDomain = [];
  const barrelEdges = [];
  for (const [a, b] of edges) {
    if (isBarrel(b)) {
      if (nodes.has(a)) barrelEdges.push({ from: a, to: b });
      continue;
    }
    // Importing a shared kernel is not a boundary violation. A kernel is
    // cross-cutting by construction - that is the whole reason it was pulled
    // out of a domain in Phase 3.6 - so `orders -> shared/notifications` is
    // the intended shape, while `orders -> restaurant` still is not.
    //
    // The kernel keeps its home domain for classification (so the barrel and the
    // generated facades still line up), but the edge itself is exempt. Without
    // this, extracting the code out of the directory would change nothing:
    // the edge would simply be re-measured as orders -> notifications.
    if (isSharedKernel(b)) continue;
    const na = nodes.get(a);
    const nb = nodes.get(b);
    if (!na || !nb || na.domain === null || nb.domain === null) continue;
    if (na.domain === nb.domain) continue;
    crossDomain.push({ from: a, fromDomain: na.domain, to: b, toDomain: nb.domain });
  }

  const unclassified = [...nodes.entries()].filter(([, n]) => n.domain === null).map(([f]) => f);

  const byDomain = {};
  for (const [f, n] of nodes) {
    if (!n.domain) continue;
    byDomain[n.domain] = byDomain[n.domain] || { modules: [], edgesOut: 0, edgesIn: 0 };
    byDomain[n.domain].modules.push(f);
  }
  for (const e of crossDomain) {
    if (byDomain[e.fromDomain]) byDomain[e.fromDomain].edgesOut++;
    if (byDomain[e.toDomain]) byDomain[e.toDomain].edgesIn++;
  }

  return {
    nodes,
    edges,
    crossDomain,
    barrelEdges,
    unclassified,
    byDomain,
    crossDomainEdges: crossDomain,
  };
}

// ---------------------------------------------------------------------------
// Cross-domain allowlist (3.2)
// ---------------------------------------------------------------------------
/**
 * The edges that are allowed to cross a domain boundary *today*, generated
 * from the measured graph rather than curated by hand - so the allowlist can
 * never be wider than reality, and shrinking it is a one-command review.
 *
 * It is deliberately not empty. A domain boundary that forbids the
 * dependencies the code actually has is not a boundary, it is a broken
 * build; 3.3/3.4 exist to drain this list, and the lint rule fails if a new
 * cross-domain edge appears without going through this file.
 */
function buildAllowlist() {
  const result = build();
  return {
    _comment:
      'GENERATED by tools/domain-inventory.js --write-allowlist. Each entry is a ' +
      'cross-domain import that exists today and is tolerated until Phase 3.3/3.4 ' +
      'removes it. Regenerate; never hand-edit. Run npm run domain:allowlist:check to ' +
      'see whether it has shrunk (that is progress).',
    generatedAt: new Date().toISOString(),
    edges: result.crossDomainEdges.map((e) => ({
      from: e.from,
      fromDomain: e.fromDomain,
      to: e.to,
      toDomain: e.toDomain,
    })),
  };
}

function allowlistPath() {
  return path.join(API_ROOT, 'tools', 'domain-boundary-allowlist.json');
}

function readAllowlist() {
  const file = allowlistPath();
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function main() {
  const args = process.argv.slice(2);

  if (args.includes('--write-allowlist') || args.includes('--check-allowlist')) {
    const next = buildAllowlist();
    const current = readAllowlist();

    if (args.includes('--write-allowlist')) {
      fs.writeFileSync(allowlistPath(), `${JSON.stringify(next, null, 2)}\n`, 'utf8');
      process.stdout.write(`wrote tools/domain-boundary-allowlist.json (${next.edges.length} edges)\n`);
      return 0;
    }

    // A stale entry (an edge that no longer exists) is not an error - it is
    // progress, and the fix is to regenerate. It is reported so the list does
    // not quietly accumulate dead entries.
    const currentKeys = new Set((current ? current.edges : []).map((e) => `${e.from} -> ${e.to}`));
    const nextKeys = new Set(next.edges.map((e) => `${e.from} -> ${e.to}`));
    const stale = [...currentKeys].filter((k) => !nextKeys.has(k));
    const added = [...nextKeys].filter((k) => !currentKeys.has(k));

    if (added.length) {
      process.stderr.write(
        `new cross-domain edge(s) not in the allowlist:\n${added.map((k) => `  ${k}`).join('\n')}\n` +
          '  A domain boundary was crossed. Either route it through a facade, or add it\n' +
          '  deliberately with `npm run domain:allowlist` and justify it in review.\n'
      );
      return 1;
    }
    if (stale.length) {
      process.stdout.write(
        `allowlist has ${stale.length} stale entr(y/ies) - the boundary improved:\n` +
          `${stale.map((k) => `  ${k}`).join('\n')}\n  regenerate: npm run domain:allowlist\n`
      );
    } else {
      process.stdout.write(`allowlist in sync (${next.edges.length} edges)\n`);
    }
    return 0;
  }

  if (args.includes('--write-domains') || args.includes('--check-domains')) {
    const facades = buildFacades();
    const domainsDir = path.join(SRC, 'domains');
    const drift = [];

    for (const x of facades.__internal || []) {
      process.stdout.write(
        `internal (not re-exported by any barrel, so absent from the facade): ` +
          `${path.relative(API_ROOT, x.path).replace(/\\/g, '/')}  [${x.domain}]\n`
      );
    }

    for (const [domain, content] of Object.entries(facades)) {
      // `__internal` is the list of classified modules that no barrel
      // re-exports. It is reported, never written as a domain.
      if (domain === '__internal') continue;
      const file = path.join(domainsDir, domain, 'index.ts');
      const current = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
      if (current === content) continue;
      if (args.includes('--write-domains')) {
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, content, 'utf8');
        process.stdout.write(`wrote ${path.relative(API_ROOT, file).replace(/\\/g, '/')}\n`);
      } else {
        drift.push(path.relative(API_ROOT, file).replace(/\\/g, '/'));
      }
    }

    if (args.includes('--check-domains')) {
      if (drift.length) {
        process.stderr.write(
          `domain facades out of date (${drift.length}):\n${drift.map((f) => `  ${f}`).join('\n')}\n` +
            'run: npm run domain:write\n'
        );
        return 1;
      }
      process.stdout.write(
        `domain facades in sync (${Object.keys(facades).filter((d) => d !== '__internal').length} domains)\n`
      );
    }
    return 0;
  }

  const result = build();

  if (args.includes('--json')) {
    process.stdout.write(
      `${JSON.stringify(
        {
          domains: Object.fromEntries(
            Object.entries(result.byDomain).map(([d, v]) => [
              d,
              { ...v, modules: v.modules.sort() },
            ])
          ),
          unclassified: result.unclassified.sort(),
          crossDomainEdges: result.crossDomainEdges,
          barrelEdges: result.barrelEdges.length,
        },
        null,
        2
      )}\n`
    );
  } else {
    const lines = [
      `governed modules (services + models, barrels excluded): ${result.nodes.size}`,
      `unclassified                                     : ${result.unclassified.length}`,
      `cross-domain edges (direct)                       : ${result.crossDomainEdges.length}`,
      `cross-domain edges via a barrel (3.1's target)   : ${result.barrelEdges.length}`,
      '',
      'per domain:',
      ...Object.entries(result.byDomain)
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([d, v]) => `  ${d.padEnd(14)} modules=${String(v.modules.length).padStart(3)}  out=${v.edgesOut}  in=${v.edgesIn}`),
      '',
      'direct cross-domain edges:',
      ...result.crossDomainEdges.map(
        (e) => `  ${e.fromDomain} -> ${e.toDomain}  ${e.from}  =>  ${e.to}`
      ),
    ];
    if (result.unclassified.length) {
      lines.push('', 'UNCLASSIFIED (add a prefix rule or an override):');
      lines.push(...result.unclassified.sort().map((f) => `  ${f}`));
    }
    process.stdout.write(`${lines.join('\n')}\n`);
  }

  if (args.includes('--strict') && result.unclassified.length) {
    process.stderr.write(`\n${result.unclassified.length} module(s) unclassified\n`);
    return 1;
  }
  return 0;
}

if (require.main === module) {
  process.exit(main());
}

// Imported by tools/eslint-rules/domain-boundary.cjs so the lint rule and the
// inventory can never disagree about which domain a module belongs to. The
// CLI is the only thing that should call process.exit.
module.exports = {
  DOMAINS,
  OVERRIDES,
  API_ROOT,
  SRC,
  build,
  buildFacades,
  governed,
  isBarrel,
  domainOf,
  resolveRelative,
};
