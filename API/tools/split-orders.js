/**
 * Phase 3.3: split services/orders.service.js into lifecycle buckets.
 *
 * Table-driven on purpose. The first slice (the analytics kernel) proved the
 * cut-and-paste mechanism but hard-coded one list of names; doing the other
 * buckets that way would mean eight near-copies of the same careful code, and
 * the invariants that matter - verbatim text, no lost require, no unused
 * import, no lost export - have to hold identically for all of them. So the
 * buckets are DATA here, and every bucket goes through the same code.
 *
 * The split is a cut-and-paste, not a refactoring. The tool copies function
 * text verbatim, derives each new file's imports by scanning the moved text,
 * and leaves orders.service.js's `module.exports` block untouched: the names
 * stay bound there by the requires, so the public surface cannot drift.
 *
 * Usage:
 *   node tools/split-orders.js --taxonomy   (is every export placed exactly once?)
 *   node tools/split-orders.js --plan [b]   (what would bucket b do?)
 *   node tools/split-orders.js --apply [b]  (cut and paste one bucket, or all)
 *   node tools/split-orders.js --verify [b] (byte-identity vs the pre-split file)
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const API_ROOT = path.resolve(__dirname, '..');
const SRC_FILE = path.join(API_ROOT, 'src', 'services', 'orders.service.js');

/**
 * The lifecycle taxonomy.
 *
 * The plan named six buckets (create, assign, status-transition, pricing,
 * rating, export). The measured surface does not fit six: there are analytics
 * dashboards, refunds, and bulk read queries with no home among them, and
 * inventing a "misc" bucket would be how a 15k-line file stays a 15k-line
 * file. So the taxonomy is widened to eight, and every name below is placed
 * exactly once - `--taxonomy` fails if that stops being true.
 *
 * review/rewards live in `query` rather than a `rating` bucket: the only
 * rating-shaped exports are getOrderDetailForReview and the two complaint
 * detail readers, which are reads, not a lifecycle stage.
 */
const BUCKETS = {
  create: {
    file: 'orders.create.internal.js',
    note: 'order creation, and the bulk import that creates orders',
    names: ['createOrder', 'getUserOrderCount', 'importCollection'],
  },
  assign: {
    file: 'orders.assign.internal.js',
    note: 'driver assignment: which driver, and who is near the order',
    names: [
      'assignDriverOrderAdmin',
      'assignDriverOrderVendor',
      'fetchDriverNearToOrder',
      'fetchDriverPhoneNumber',
      'getDriverNewOrderList',
    ],
  },
  'status-transition': {
    file: 'orders.status.internal.js',
    note: 'the order state machine, plus the five private helpers only it uses',
    names: [
      // the transitions
      'updateOrderStatus',
      'updateOrderPayment',
      'prepareOrder',
      'orderReady',
      'acceptScheduleOrder',
      'cancelOrderByUser',
      'driverAcceptOrder',
      'driverRejectOrder',
      'driverPickupOrder',
      'driverDeliverOrder',
      'driverReachedCustomer',
      'driverReachedRestaurant',
      'restuarantOrderHandoverDriver',
      'restaurantOrderHandoverCustomer',
      'restaurantRejectOrder',
      'getOrderMetaNotification',
      'callCustomer',
      'callDeliveryman',
    ],
    /**
     * Every caller of these five is in this bucket (measured, not assumed), so
     * they are file-local. Exporting them and re-importing them into the facade
     * produced four unused-import warnings, because the facade's job is to
     * re-export the 86 public names and these are not among them.
     */
    privateNames: [
      'getOrderById',
      'getVendorOrderById',
      'getDriverNewOrderById',
      'haversineDistance',
      'getPercentageAmount',
    ],
  },
  query: {
    file: 'orders.query.internal.js',
    note: 'reads: lists and detail views, for every actor',
    names: [
      'getVendorOrder',
      'getMyOrderList',
      'getMyFavouriteOrders',
      'getUserOrderDetail',
      'getOrderDetailAdmin',
      'getOrderDetailForReview',
      'getOrderDetailForComplaints',
      'getOrderDetailForRestaurantComplaint',
      'supportTeamOrderDetail',
      'getAdminOrderList',
      'getAdminScheduleOrderList',
      'getAdminSubscriptionOrderList',
      'getAdminUnAssignedOrderList',
      'vendorOrderList',
      'vendorOrderListWeb',
      'vendorOrderDetail',
      'vendorOrderCountWeb',
      'customerOrderList',
      'cityzenOrderList',
      'cityzenOrderCounts',
      'cityzenSubscriptionOrderList',
      'cityzenUnAssignedOrderList',
      'driverOrderList',
      'driverOrderDetails',
      'driverActiveOrders',
      'deliverymanOrderList',
      'getOrderCounts',
    ],
  },
  dashboard: {
    file: 'orders.dashboard.internal.js',
    note: 'analytics and business insight, for admin, accountant, vendor and cityzen',
    names: [
      'adminDashboard',
      'accountantDashboard',
      'cityzenDashboard',
      'deliverymanInsight',
      'vendorOrderBusinessInsight',
      'vendorOrderCustomDateBusinessInsight',
      'vendorWebTodayDashboardBusinessInsight',
      'vendorWebWeeklyDashboardBusinessInsight',
      'vendorWebMonthlyDashboardBusinessInsight',
      'vendorWebOverallDashboardBusinessInsight',
    ],
  },
  refund: {
    file: 'orders.refund.internal.js',
    note: 'refund requests and refund lists, customer and vendor side',
    names: [
      'customerAllRefundRequest',
      'customerBookingRefundList',
      'customerOrderRefundList',
      'customerTiffinRefundList',
      'vendorAllRefundRequest',
      'vendorDiningRefundRequest',
      'vendorOrderRefundRequest',
      'vendorTiffinRefundRequest',
    ],
  },
  export: {
    file: 'orders.export.internal.js',
    note: 'reports, exports and invoice/summary downloads',
    names: [
      'exportQueryCollection',
      'exportQueryRawCollection',
      'exportRegularOrderReportCollection',
      'exportSubscriptionOrderQueryCollection',
      'exportSubscriptionOrderQueryRawCollection',
      'exportUnAssignedOrderCollection',
      'exportUnAssignedRawOrderCollection',
      'orderReports',
      'downloadOrderInvoice',
      'downloadOrderSummary',
      'downloadVendorOrderInvoice',
      'downloadVendorOrderSummary',
      'adminOrderInvoice',
      'vendorOrderInvoice',
    ],
  },
  pricing: {
    file: 'orders.pricing.internal.js',
    note: 'coupon and pricing reads',
    names: ['couponOrders'],
  },
};

/** The analytics kernel, extracted in the first slice of 3.3. */
const KERNEL = {
  file: 'orders.analytics.internal.js',
  note: 'the eight earning-breakdown queries behind the dashboards',
  /**
   * Published by this module, but consumed by the dashboard bucket rather than
   * by the facade - so the facade must not re-import them, or they are unused
   * imports there.
   */
  privateNames: [
    'orderEarningBreakdown',
    'posOrderEarningBreakdown',
    'tableOrderEarningBreakdown',
    'diningBookingEarningBreakdown',
    'cityBasedOrderEarningBreakdown',
    'cityBasedPOSOrderEarningBreakdown',
    'cityBasedTableOrderEarningBreakdown',
    'cityBasedDiningBookingEarningBreakdown',
  ],
  names: [],
};

/** Public plus private names a module owns - what the taxonomy must account for. */
const allNames = (spec) => [...spec.names, ...(spec.privateNames || [])];

/** Every module the buckets can be reached through, including the kernel. */
const MODULES = { analytics: KERNEL, ...BUCKETS };

const readSource = () => fs.readFileSync(SRC_FILE, 'utf8');
const uses = (text, name) => new RegExp(`\\b${name.replace(/\$/g, '\\$')}\\b`).test(text);

/**
 * Drop repeated bindings, keeping first-seen order.
 *
 * A name can only be declared once in a scope, so a duplicated entry in an
 * emitted import list is unconditionally invalid JavaScript. This is enforced
 * at every emission point rather than assumed absent: a require block that gets
 * re-detected while it is being rewritten reintroduced `Restaurant` twice, and
 * the file it produced would not parse.
 */
const unique = (names) => [...new Set(names)];

function exportedNames(src) {
  const block = src.match(/module\.exports\s*=\s*\{([\s\S]*?)\n\};/);
  if (!block) return [];
  return [...block[1].matchAll(/([A-Za-z_$][\w$]*)\s*[,:]?/g)].map((m) => m[1]);
}

/** Every top-level require, with the line range and the bindings it occupies. */
function requireBlocks(src) {
  const lines = src.split('\n');
  const blocks = [];
  for (let i = 0; i < lines.length; i++) {
    if (!/^const\s.*=\s*require\(/.test(lines[i]) && !/^const\s*\{\s*$/.test(lines[i])) continue;
    let end = i;
    let stmt = lines[i];
    while (end < lines.length && !/;\s*$/.test(stmt)) stmt += `\n${lines[++end]}`;
    // Skip past the statement: a require block may contain lines that look like
    // the start of another one, and re-detecting it produced the same import
    // twice - "Identifier 'RefundRequest' has already been declared".
    i = end;
    const entries = [];
    const braced = stmt.match(/\{([\s\S]*?)\}/);
    if (braced) {
      for (const part of braced[1].split(',')) {
        const spec = part.trim();
        if (spec) entries.push({ local: spec.split(':').pop().trim(), spec });
      }
    } else {
      const m = stmt.match(/^const\s+([A-Za-z_$][\w$]*)\s*=/);
      if (m) entries.push({ local: m[1], spec: m[1] });
    }
    const consumed = stmt.split('\n').length;
    blocks.push({
      start: i - consumed + 1,
      end,
      names: entries.map((e) => e.local),
      entries,
      text: stmt,
    });
  }
  return blocks;
}

/** Cut a top-level function's text verbatim, up to the next top-level declaration. */
function sliceTopLevel(src, name) {
  const lines = src.split('\n');
  let start = -1;
  for (let i = 0; i < lines.length; i++) {
    if (
      new RegExp(`^(?:const|let|var)\\s+${name}\\s*=\\s*(?:async\\s*)?\\(`).test(lines[i]) ||
      new RegExp(`^(?:async\\s+)?function\\s+${name}\\b`).test(lines[i])
    ) {
      start = i;
      break;
    }
  }
  if (start < 0) return null;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    if (
      /^(?:const|let|var)\s+[A-Za-z_$][\w$]*\s*=/.test(lines[i]) ||
      /^(?:async\s+)?function\s+[A-Za-z_$][\w$]*/.test(lines[i]) ||
      /^module\.exports/.test(lines[i])
    ) {
      end = i;
      break;
    }
  }
  while (end > start + 1 && lines[end - 1].trim() === '') end--;
  return { start, end, text: lines.slice(start, end).join('\n') };
}

function header(bucket, note) {
  return [
    '/**',
    ' * LocalWala - Local Commerce & Delivery Platform',
    ' * (NodeJS, MongoDB, Angular & Flutter)',
    ' *',
    ' * Copyright (c) 2026 WeWorkLocal Private Limited',
    ' * https://weworklocal.in/',
    ' *',
    ' * WeWorkLocal Private Limited',
    ' * This source code is confidential.',
    ' *',
    ' * Ownership Fingerprint:',
    ' * LWL|WWL|2026|LOCALWALA|NODE',
    ' *',
    ` * Phase 3.3: orders bucket "${bucket}" - ${note}.`,
    ' *',
    ' * Split out of orders.service.js. The function text is byte-identical to',
    ' * what it replaced; GENERATED by tools/split-orders.js - do not hand-edit.',
    ' */',
    '',
  ].join('\n');
}

/**
 * Render the require statements a moved body needs, one binding per line.
 *
 * The ORIGINAL spec text is emitted, never the local name. `http-status` is
 * imported as `const { status: httpStatus } = require('http-status')`, and
 * re-emitting the local name produced `const { httpStatus } = ...` - a binding
 * that exists and is `undefined`. Lint cannot see that: there is no
 * `no-undef`, just endpoints 500ing on `httpStatus.NOT_FOUND`. The live-DB
 * probe is what caught it.
 */
function importsFor(text, src) {
  const out = [];
  // A binding can only be declared once in a file, so a name already emitted is
  // skipped even if a second require claims it.
  const claimed = new Set();
  for (const b of requireBlocks(src)) {
    const keep = b.entries.filter((e) => uses(text, e.local) && !claimed.has(e.local));
    if (!keep.length) continue;
    for (const e of keep) claimed.add(e.local);
    const source = b.text.match(/require\((['"])([^'"]+)\1\)/);
    if (!source) continue;
    if (!b.text.includes('{')) {
      out.push(`const ${keep[0].spec} = require('${source[2]}');`);
    } else {
      out.push(`const {\n${keep.map((e) => `  ${e.spec},`).join('\n')}\n} = require('${source[2]}');`);
    }
  }
  return out;
}

/**
 * Plan one bucket against the current source: the slices, the imports it needs,
 * and which requires in the original become unused because of the move.
 */
function planBucket(src, spec) {
  const slices = [];
  const missing = [];
  for (const name of spec.names) {
    const s = sliceTopLevel(src, name);
    if (s) slices.push(s);
    else missing.push(name);
  }
  slices.sort((a, b) => a.start - b.start);
  const movedText = slices.map((s) => s.text).join('\n\n');

  const lines = src.split('\n');
  const drop = new Set();
  for (const s of slices) for (let i = s.start; i < s.end; i++) drop.add(i);

  // Collapse the blank runs the removal leaves behind, keeping original line
  // numbers so the require pass below can still address them.
  const survivors = [];
  let blanks = 0;
  for (let i = 0; i < lines.length; i++) {
    if (drop.has(i)) continue;
    if (lines[i].trim() === '') {
      blanks++;
      if (blanks <= 1) survivors.push({ i, text: lines[i] });
      continue;
    }
    blanks = 0;
    survivors.push({ i, text: lines[i] });
  }
  const survivorText = survivors.map((s) => s.text).join('\n');

  return {
    spec,
    slices,
    missing,
    movedText,
    survivors,
    survivorText,
    imports: importsFor(movedText, src),
    tail: /(\n[\r\n]*)$/.exec(src)?.[0] || '\n',
    // Names still called from the text that will remain.
    stillCalled: spec.names.filter((n) => new RegExp(`\\b${n}\\s*\\(`).test(survivorText)),
  };
}

/**
 * Compose the new orders.service.js: the original's header, one require per
 * bucket module, then the original's export block onward.
 *
 * The whole file is rebuilt in ONE step from the pristine original rather than
 * pruned pass by pass. Pruning per pass was the original design and it is
 * wrong: a require is dropped as soon as no *surviving* function uses it, but a
 * later bucket's functions are still surviving at that moment and need it - so
 * `checkArrayNotEmpty` was deleted by the query pass and the dashboard pass,
 * which needs it, could never find a declaration to copy. Rebuilding from the
 * original makes bucket order irrelevant, and the output deterministic.
 */
function composeFacade(original) {
  const lines = original.split('\n');
  const blocks = requireBlocks(original);
  const first = blocks[0].start;
  const exportAt = lines.findIndex((l) => /^module\.exports/.test(l));
  if (!blocks.length || exportAt < 0) throw new Error('cannot locate the import/export regions');

  // Keep any leading comment inside the import region? There is none: the region
  // between the last require and `module.exports` is entirely function bodies.
  const head = lines.slice(0, first);
  const tail = lines.slice(exportAt);
  const requires = Object.values(MODULES)
    .filter((m) => fs.existsSync(path.join(path.dirname(SRC_FILE), m.file)))
    // A module with no public names contributes nothing to the facade, and an
    // empty `const {} = require(...)` is a syntax error (no-empty-pattern).
    .filter((m) => m.names.length)
    .map((m) => `const { ${m.names.join(', ')} } = require('./${m.file}');`);

  return `${[...head, ...requires, '', ...tail].join('\n')}`;
}

/** Everything orders.service.js needs to keep, taken from the pristine original. */
function planAll(original) {
  return Object.entries(MODULES).map(([bucket, spec]) => {
    const all = allNames(spec);
    const slices = [];
    const missing = [];
    for (const name of all) {
      const s = sliceTopLevel(original, name);
      if (s) slices.push(s);
      else missing.push(name);
    }
    slices.sort((a, b) => a.start - b.start);
    const movedText = slices.map((s) => s.text).join('\n\n');
    return {
      bucket,
      spec,
      missing,
      movedText,
      // Imports are derived from the ORIGINAL, never from a partially pruned
      // copy, so which buckets have already been applied cannot change them.
      imports: importsFor(movedText, original),
    };
  });
}

function applyAll(commit) {
  const original = execFileSync('git', ['show', `${commit}:API/src/services/orders.service.js`], {
    cwd: API_ROOT,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });

  for (const p of planAll(original)) {
    if (p.missing.length) {
      process.stdout.write(`${p.bucket}: already extracted, skipping\n`);
      continue;
    }
    const file = path.join(path.dirname(SRC_FILE), p.spec.file);
    fs.writeFileSync(
      file,
      `${header(p.bucket, p.spec.note)}\n${p.imports.join('\n')}\n\n${p.movedText}\n\n` +
        `module.exports = {\n${p.spec.names.map((n) => `  ${n},`).join('\n')}\n};\n`,
      'utf8'
    );
    process.stdout.write(`${p.bucket}: ${p.spec.names.length} functions -> ${p.spec.file}\n`);
  }

  fs.writeFileSync(SRC_FILE, composeFacade(original), 'utf8');
  process.stdout.write(`orders.service.js: rebuilt as a facade over ${Object.keys(MODULES).length} modules\n`);

  const touched = [
    ...Object.values(MODULES).map((m) => path.join(path.dirname(SRC_FILE), m.file)),
    SRC_FILE,
  ];
  for (const f of touched) {
    if (!fs.existsSync(f)) continue;
    try {
      execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' });
    } catch (err) {
      process.stderr.write(`syntax error in ${f}:\n${err.stderr}\n`);
      return 1;
    }
  }
  process.stdout.write('all touched files parse\n');
  return 0;
}

/**
 * Is the taxonomy still a partition of the public surface? Every exported name
 * in exactly one bucket, no name in two, and nothing listed that is not real.
 */
function taxonomy() {
  const src = readSource();
  const surface = exportedNames(src);
  const placed = new Map();
  const dupes = [];
  for (const [bucket, spec] of Object.entries(MODULES)) {
    for (const n of allNames(spec)) {
      if (placed.has(n)) dupes.push(`${n}: ${placed.get(n)} and ${bucket}`);
      else placed.set(n, bucket);
    }
  }
  const unplaced = surface.filter((n) => !placed.has(n));

  // A placed name is either still in orders.service.js, or already extracted
  // into its bucket's own file. Only "neither" is a real error - checking the
  // source alone reported the 8 analytics helpers as missing on every run,
  // because 3.3's first slice had already moved them.
  const inOrders = [];
  const extracted = [];
  const phantom = [];
  // Two declaration forms: `const f = async () =>` and `function f()`. The two
  // private helpers that are `function` declarations were reported as missing
  // until both forms were accepted.
  const declares = (src, name) =>
    new RegExp(
      `^(?:const|let|var)\\s+${name}\\s*=|^(?:async\\s+)?function\\s+${name}\\b`,
      'm'
    ).test(src);
  for (const [n, bucket] of placed) {
    if (declares(src, n)) inOrders.push(n);
    else {
      const file = path.join(path.dirname(SRC_FILE), MODULES[bucket].file);
      if (fs.existsSync(file) && declares(fs.readFileSync(file, 'utf8'), n)) {
        extracted.push(n);
      } else phantom.push(`${n} (${bucket})`);
    }
  }
  return { surface, placed, dupes, unplaced, inOrders, extracted, phantom, total: placed.size };
}

function main() {
  const args = process.argv.slice(2);
  // The command is a flag; the bucket is a positional. Reading the first
  // positional as the command and then hunting for "a different positional"
  // meant `--apply create` silently applied every bucket instead.
  const wanted = args.find((a) => !a.startsWith('--'));

  if (args.includes('--taxonomy')) {
    const t = taxonomy();
    const lines = [
      `public surface       : ${t.surface.length}`,
      `names placed         : ${t.total}`,
      `  still in orders.service : ${t.inOrders.length}`,
      `  already extracted      : ${t.extracted.length}`,
      `duplicates           : ${t.dupes.length}`,
      ...t.dupes.map((d) => `  DUP ${d}`),
      `not placed anywhere  : ${t.unplaced.length}`,
      ...t.unplaced.map((n) => `  UNPLACED ${n}`),
      `in neither orders.service nor its bucket : ${t.phantom.length}`,
      ...t.phantom.map((n) => `  PHANTOM ${n}`),
      '',
      'per bucket:',
      ...Object.entries(MODULES).map(
        ([b, s]) => `  ${String(s.names.length).padStart(3)}  ${b.padEnd(18)} ${s.file}`
      ),
    ];
    process.stdout.write(`${lines.join('\n')}\n`);
    const ok = !t.dupes.length && !t.unplaced.length && !t.phantom.length;
    process.stdout.write(`${ok ? 'TAXONOMY OK' : 'TAXONOMY INCOMPLETE'}\n`);
    return ok ? 0 : 1;
  }

  const names = wanted ? [wanted] : Object.keys(MODULES);
  for (const n of names) if (!MODULES[n]) {
    process.stderr.write(`unknown bucket: ${n}\nknown: ${Object.keys(MODULES).join(', ')}\n`);
    return 2;
  }

  const src = readSource();
  const plans = names.map((n) => {
    const p = planBucket(src, MODULES[n]);
    p.spec = { ...MODULES[n], srcForRender: src };
    p.bucket = n;
    return p;
  });

  if (args.includes('--plan')) {
    for (const p of plans) {
      const orphans = p.spec.names.filter((n) => !p.movedText.includes(n));
      process.stdout.write(
        [
          `bucket ${p.bucket}  ->  ${p.spec.file}`,
          `  ${p.spec.note}`,
          `  functions : ${p.slices.length}/${p.spec.names.length}${
            p.missing.length ? `  MISSING: ${p.missing.join(', ')}` : ''
          }`,
          `  moved text: ${p.movedText.split('\n').length} lines`,
          `  imports   : ${p.imports.length}`,
          `  still called from orders.service : ${
            p.stillCalled.length ? p.stillCalled.join(', ') : '(nothing - pure move)'
          }`,
          '',
        ].join('\n')
      );
      void orphans;
    }
    return 0;
  }

  if (args.includes('--apply')) {
    // One rebuild from the pristine original. --apply <bucket> narrows which
    // buckets are written, but the facade is always composed the same way, so
    // the result does not depend on the order the buckets were run in.
    return applyAll(process.env.SPLIT_BASE || 'HEAD');
  }

  if (args.includes('--verify')) {
    const rel = Object.fromEntries(
      Object.values(MODULES).map((m) => [m.file, m.names])
    );
    const commit = process.env.SPLIT_BASE || 'HEAD';
    const original = execFileSync('git', ['show', `${commit}:API/src/services/orders.service.js`], {
      cwd: API_ROOT,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
    let ok = true;
    let checked = 0;
    for (const [bucket, spec] of Object.entries(MODULES)) {
      const file = path.join(path.dirname(SRC_FILE), spec.file);
      if (!fs.existsSync(file)) continue;
      const text = fs.readFileSync(file, 'utf8');
      for (const n of allNames(spec)) {
        const before = sliceTopLevel(original, n);
        if (!before) continue;
        if (!text.includes(before.text)) {
          process.stdout.write(`  MISMATCH ${bucket}/${n}\n`);
          ok = false;
        } else checked++;
      }
    }
    // The public surface must be untouched.
    const now = readSource();
    const beforeSurface = exportedNames(original).filter((n) => !rel ? true : true);
    const afterSurface = exportedNames(now);
    const lost = beforeSurface.filter((n) => !afterSurface.includes(n));
    if (lost.length) {
      process.stdout.write(`  LOST EXPORTS: ${lost.join(', ')}\n`);
      ok = false;
    }
    const added = afterSurface.filter((n) => !beforeSurface.includes(n));
    if (added.length) {
      process.stdout.write(`  NEW EXPORTS: ${added.join(', ')}\n`);
      ok = false;
    }
    process.stdout.write(`byte-identical: ${checked} functions\n`);
    process.stdout.write(`public surface: ${afterSurface.length} names (was ${beforeSurface.length})\n`);
    process.stdout.write(`${ok ? 'VERIFY OK' : 'VERIFY FAILED'}\n`);
    return ok ? 0 : 1;
  }

  process.stdout.write('usage: --taxonomy | --plan [bucket] | --apply [bucket] | --verify\n');
  return 2;
}

process.exit(main());
