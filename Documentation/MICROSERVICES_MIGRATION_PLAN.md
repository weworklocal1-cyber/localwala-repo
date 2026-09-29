# LocalWala — Monolith → Microservices Migration Plan

**Stack:** Node.js / Express 5 → **Fastify 5** · JavaScript → **TypeScript (new code only)** · Single MongoDB → **DB-per-service (last)** · Angular admin + 5 Flutter apps (**unchanged**)

**Strategy:** Strangler Fig, strictly sequential phases. The monolith keeps serving traffic the entire time; services grow around it and it shrinks until it's gone.

**Ownership Fingerprint:** `LWL|WWL|2026|LOCALWALA|NODE`

---

## 1. Current State Assessment

| Metric | Value |
|---|---|
| Files under `src/` | 560 |
| Total LOC | **211,175** |
| Endpoints | **1,926** (GET 1,018 / POST 546 / PATCH 258 / DELETE 104) |
| Models / Services / Controllers | 143 / 134 / 122 |
| Joi validation schemas | 118 |
| Cross-collection `$lookup` joins | **1,901** |
| Mongoose `ref:` edges | 275 |
| Tests | **0** |
| Docker / CI / Git | **None** |

### 1.1 LOC distribution

| Folder | Files | LOC | % | Express-coupled |
|---|---:|---:|---:|---|
| `src/services/` | 134 | 116,251 | 55.1% | **No** |
| `src/controllers/` | 122 | 55,151 | 26.1% | Yes |
| `src/routes/v1/` | 14 | 12,455 | 5.9% | Yes |
| `src/models/` | 143 | 12,388 | 5.9% | No |
| `src/validations/` | 118 | 10,675 | 5.1% | No |
| `src/utils/ config/ middlewares/ root` | 25 | 4,044 | 1.9% | Partial |
| **Total** | **560** | **211,175** | **100%** | **142 files** |

**418 of 560 files (75%) have zero Express coupling.** The framework port touches 142 files.

### 1.2 Blocking hotspots

| Issue | Scale | Impact |
|---|---|---|
| `services/orders.service.js` | 15,785 LOC | 7.5% of codebase; everything points at it |
| `services/restaurant.service.js` | 15,013 LOC | #2; combined with orders = **14.6% of codebase** |
| `services/user.service.js` | 6,903 LOC | touches **80 models** (delete-account cascade) |
| `utils/catchAsync.js` | 1,596 uses / 121 files | calls `next(err)` → `TypeError` under Fastify |
| Inline multer callbacks | 78 sites / 71 files | `(req,res,next)` pattern breaks under Fastify |
| Export blocks writing to `res` | ~78 files × 3 formats | `res.download`, `workbook.xlsx.write(res)`, `res.end()` |
| `res.redirect(code, url)` code-first | 111 sites | Fastify arg order differs → **silent failure** |
| Duplicate route | `routes/v1/cityzen.route.js:1092` | Fastify **throws at boot** |
| Passport auth gate | ~1,767 protected routes | rewrite = 100% auth outage if wrong |
| `services/index.js` + `models/index.js` barrels | hide all coupling | nothing can deploy independently until removed |

### 1.3 Top 10 largest files (30.5% of codebase)

| LOC | File | | LOC | File |
|---:|---|---|---:|---|
| 15,785 | `services/orders.service.js` | | 2,390 | `services/table.order.service.js` |
| 15,013 | `services/restaurant.service.js` | | 2,337 | `services/user.purchased.tiffin.subscription.service.js` |
| 6,993 | `controllers/orders.controller.js` | | 2,323 | `services/pos.or.table.order.service.js` |
| 6,903 | `services/user.service.js` | | 2,090 | `controllers/user.purchased.tiffin.subscription.controller.js` |
| 4,666 | `routes/v1/admin.route.js` | | 1,920 | `services/refund.request.service.js` |

### 1.4 `$lookup` hotspots (what breaks at DB split)

| Collection | `$lookup`s | | Collection | `$lookup`s |
|---|---:|---|---|---:|
| `restaurants` | **349** | | `paymentconfigs` | 88 |
| `users` | **324** | | `cities` | 86 |
| `orders` | 82 | | `localities` | 67 |
| `foodtaxations` | 62 | | `foods` | 48 |
| `addons` | 40 | | `withdrawalmethods` | 34 |
| `cuisines` | 31 | | `favourites` | 30 |
| `deliveryman` | 28 | | `driverneworderstatuses` | 27 |

### 1.5 Shared infrastructure inventory

| Kernel | Key files | Consumers |
|---|---|---|
| **FCM push** | `fcm.notification.service.js` (4,043 LOC), `fcm_keys/serviceAccountKey.json`, `app.js:59` | 7 controllers + orders, POS, kitchen, tiffin, cron |
| **Email (SMTP)** | `email.config.service.js` (1,659 LOC, nodemailer + handlebars) | 12 controllers |
| **SMS / OTP** | `sms.provider.config.service.js` (Twilio, MSG91, Firebase), `otp.verification.service.js` | auth, user, public |
| **Payments** | `payment.initiation.controller.js` (2,540 LOC) — Stripe + Razorpay, Paystack, PayPal, Cashfree, Flutterwave, Instamojo, Xendit | orders, dining, tiffin, refunds ×3, joining |
| **File storage** | `file.controller.js` — S3 / Azure / GCS / local; `middlewares/upload.js` | 4 controllers; multer in 72 files |
| **Wallet / ledger** | `wallet.*`, `transactions.*`, `disbursement.*`, `withdrawal.*`, `collect.cash.*`, `*cash.in.hand.*` | 11 controllers |
| **Settings** | 11 `*.settings` models; `BusinessSettings` read in **23 services** | cross-cutting (restaurant.service: 127 refs, orders.service: 84) |
| **Cron** | `cron.job.scheduler.service.js` (`node-cron`), started at `app.js:285` | process-wide side effect at boot |
| **WebSockets** | `index.js` socket.io — `joinRoom`/`sendMessage` (chat) + `joinLiveLocation`/`sendLocation` (GPS) | 1 shared `io` instance |
| **i18n** | `utils/translate.js`, `languages.model`, `order.notification.translation.model` | orders, dining, tiffin |
| **Import/Export** | `exceljs` in 78 controllers, `papaparse` | nearly all admin CRUD |
| **Invoice render** | `playwright` + `handlebars`, `templates/other/*invoice*.html` | orders, dining, tiffin (duplicated 3×) |
| **Auth / RBAC** | `config/passport.js` (`jwt-web`, `jwt-app`), `config/roles.js`, `middlewares/auth.factory.js`, `appAuth.js`, `webAuth.js` | every route group |
| **Logging** | `config/logger.js` (winston), `config/morgan.js` | process-wide |
| **Validation** | `middlewares/validate.js` + 118 Joi schemas | 1,655 `validate()` calls |

### 1.6 Cross-domain dependency matrix (A → B = A imports B)

| Source | → Target | Evidence |
|---|---|---|
| Orders | Restaurant, Driver, Payments/Wallet, Catalog, Coupons, Dining, Tiffin, Settings, Notifications | `orders.service` imports `restaurant.service`, `driver.service`, cash-in-hand services, `fcm.notification.service`; 30 models |
| Restaurant/Vendor | User, Wallet, Subscription, Driver, Geography, Payments, Catalog, Dining, Tiffin, Withdrawals | `restaurant.service.js` = 43 models |
| Auth/Identity | User, Wallet, Restaurant, Waiter, Kitchen, OTP, SMS, Email, Referral, Guest, Social | `auth.controller.js` = 15 services |
| Payments | Orders, Dining, Tiffin, Wallet, Subscriber, Admin expense, Notifications | `payment.initiation.controller.js` = 10 services |
| Driver/Delivery | User, Wallet, Geography, Restaurant, Orders, Cash-in-hand | `driver.service.js` = 12 models |
| Dining | Payments, Notifications, Settings, Expenses | `dining.booking.service.js` = 10 models |
| Disbursement | Wallet, Transactions, Withdrawals, Geography | `disbursement.service.js` = 8 models |
| Tiffin | Payments, Address, Packages | 10 models |
| Wallet | Transactions, Restaurant, Payout methods, Admin expense | `wallet.service` → `transaction.service` + 7 models |
| Referral/Loyalty | Wallet, Transactions, Admin expense, UserSettings | write `Wallet` + `Transactions` + `AdminExpense` |
| Chat/Support | Orders, Dining, Tiffin, Complaints, Restaurant, User | `support.chat.room.service.js` = 11 models |
| User lifecycle | *everything* | `user.service.js` touches **80 models** |
| Cron | Orders, Restaurant, Disbursement, Tiffin, Driver, Notifications | imports 3 services + 10 models |
| Catalog/Food | Restaurant, Reviews, Kitchen, Taxation | `food.service.js` = 5 models |
| Geography/City | Settings, Orders, Restaurant, User | `city.service.js` = 7 models |

**Hardest nodes (highest fan-in/fan-out):** `orders.service.js`, `restaurant.service.js`, `user.service.js`, `walletService`, `fcmNotificationService`, `businessSettingsService`.

### 1.7 Express API usage (porting surface)

| API | Occurrences | Files |
|---|---:|---:|
| Route definitions (`router.get/post/...`) | **1,926** | 13 |
| `catchAsync(...)` wrapper | 1,596 | 122 |
| `res.send(...)` | 1,386 | 121 |
| `req.body` | 1,369 | 122 |
| `res.status(...)` | 901 | 81 |
| `req.params` | 606 | 115 |
| `res.setHeader(...)` | 645 | 79 |
| `req.query` | 417 | 98 |
| `req.file` (multer) | 156 | 71 |
| `res.redirect(code, url)` | 111 | 2 (`auth`, `payment.initiation`) |
| `res.download(path, name, cb)` | 110 | 77 |
| `res.end()` | 110 | 78 |
| `req.connection.remoteAddress` | 44 | 2 |
| `res.render(...)` | 13 | 2 |
| `ApiError` (framework-agnostic) | 1,051 | 117 |
| **Not present:** raw body, webhooks, `req.pipe`, `res.write`, wildcards, `req.session` | **0** | — |

### 1.8 Repo tooling findings

| Item | Status |
|---|---|
| Tests | ❌ `"test": "echo \"No tests configured\""` |
| Docker | ❌ no Dockerfile / docker-compose anywhere |
| CI | ❌ no `.github/`, no Jenkinsfile |
| Git | ❌ **not a repository** |
| Monorepo tooling | ❌ no root package.json, no workspaces/nx/turbo |
| Lint / format | ✅ `eslint.config.cjs` (ESLint 10 flat), `.prettierrc` |
| Process manager | ✅ PM2 (`ecosystem.config.json`, `instances: 1`) |
| Frontends | Angular admin (TS ✅) + 5 Flutter apps (Dart) |
| Secrets | ⚠️ `.env` + `src/fcm_keys/serviceAccountKey.json` committed in-tree |
| Stale code | `controllers/index.js` exports `admin.controller` which **does not exist** |

---

## 2. Target Architecture

```
                        ┌──────────────────────────────┐
  Admin (Angular)  ──►  │                              │
  Customer (Flutter)──► │        API GATEWAY           │ ──► /v1 contract identical
  Deliveryman ──────►   │   (Fastify, auth, routing,   │     frontends NEVER change
  Restaurant ──────►    │    rate limit, CORS)         │
  Kitchen ──────►       │                              │
  Waiter ──────►        └──────────────┬───────────────┘
                                       │ internal HTTP (REST)
      ┌──────────┬──────────┬──────────┼──────────┬──────────┬──────────┐
      ▼          ▼          ▼          ▼          ▼          ▼          ▼
  identity    catalog    orders     delivery    dining    wallet     payments
  (auth,     (food,    (orders,   (driver,   (booking, (ledger,  (gateways,
   users,     cats,     refunds,   vehicle,   tables,   payouts,  refunds)
   drivers,   addons,   POS,       shift,     campaigns)
   restaurants cuisines) reviews)   incentive)
      │          │          │          │          │          │          │
      └──────────┴──────────┴────┬─────┴──────────┴──────────┴──────────┘
                                 ▼
                     ┌───────────────────────┐
                     │  Cross-cutting        │  notifications · media/storage
                     │  notifications svc    │  settings · scheduler
                     │  media svc            │
                     └───────────────────────┘

  Messaging:  Redis pub/sub + BullMQ (phase 6+)
  Database:   1 cluster, N logical DBs → N clusters (phase 8)
```

**Rules:**

1. A service owns its collections; cross-domain reads go over HTTP or from events.
2. Every service = own folder, own `tsconfig`, own deploy unit.
3. Gateway is the **only** public entry — `/v1` paths and response shapes preserved exactly.
4. Business logic is identical; only the plumbing changes.

---

## 3. The 9 Phases

> **Golden rule:** each phase ends with the route-manifest parity diff clean, all tests green, and all 6 frontends working. Nothing starts until that's true. Never do two risky things at once.

### Phase 0 — Safety net *(prerequisite)*

| Step | Detail |
|---|---|
| 0.1 | `git init` + initial commit (currently **not a repo**) |
| 0.2 | Route-manifest tool: dump all 1,926 `method + path + auth-role` entries to JSON → `tools/route-manifest.js` |
| 0.3 | Test harness: Vitest + Supertest against the **existing Express app**; smoke suite hitting every route group |
| 0.4 | Contract tests: record request/response fixtures for the top 100 endpoints (orders, auth, payments, restaurant, driver) |
| 0.5 | Replace the stub `npm test` with a real runner |

**Exit criteria:** tests green, manifest captured, code in git.

---

### Phase 1 — TypeScript scaffolding *(no behavior change)*

| Step | Detail |
|---|---|
| 1.1 | Add `typescript` + `tsconfig.json`: `"allowJs": true, "checkJs": false, "strict": true, "module": "commonjs"`, `outDir: dist` |
| 1.2 | `tsx` for dev, `tsc` build for prod; update `npm run dev` / `build` / `start` |
| 1.3 | ESLint: keep flat config, add `typescript-eslint` |
| 1.4 | Verify `tsc --noEmit` passes and build output runs identically |

**Exit criteria:** JS + TS coexist, zero behavior diff.

**Decisions locked:** CommonJS (no ESM switch), `strict: true` for new files only, **keep the 118 Joi schemas** (do not rewrite as Fastify JSON schemas).

> **Done (commits `0b779d4`, `168afa7`, `1e16dd1`).** Deviations worth recording:
> - **1.2 is only half-actionable now.** The entry point is still `src/index.js`, so switching `npm run dev` / `npm start` onto a `dist/` or `tsx` entry would be a behaviour change with nothing to gain. `tsx` is installed and proven working; the runner switch happens with the entry-point move in **2.15**. `npm run build` was added.
> - **TypeScript pinned to 5.9.3, not 7.x.** npm resolves `typescript@7.0.2` (native port), but `typescript-eslint@8` peers on `>=4.8.4 <6.1.0`. 5.9 keeps both the typecheck gate and linting on new TS files.
> - **Credential cleanup:** `.env.example` shipped a real Mongo password; sanitised in `168afa7`. It remains in history from the initial commit and should be rotated.

---

### Phase 2 — Express → Fastify *(still 1 process)*

| Step | Detail |
|---|---|
| 2.1 | **Fix landmines first:** `catchAsync` → identity/2-arg wrapper; delete duplicate route `cityzen.route.js:1092`; snapshot route manifest |
| 2.2 | New `src/fastify.ts`: `Fastify({ bodyLimit: 5MB, trustProxy, ignoreTrailingSlash: true, logger })` |
| 2.3 | Plugins: `@fastify/helmet` (port CSP from `app.js:61-128`), `@fastify/cors` (rewrite callback origin fn), `@fastify/cookie`, `@fastify/formbody`, `@fastify/compression`, `@fastify/static` (`/storage/`) |
| 2.4 | `setNotFoundHandler` + `setErrorHandler` from `middlewares/error.js` |
| 2.5 | `middlewares/validate.js` → `preValidation` hook — ⚠️ **spike first**: `Object.assign` on Fastify's lazy `request.query` |
| 2.6 | Passport → `@fastify/jwt`: two strategies (`jwt-app` = Bearer, `jwt-web` = cookie) → `appAuth`/`webAuth` decorators. **Gates ~1,767 routes.** |
| 2.7 | `express-rate-limit` → `@fastify/rate-limit` scoped to `/v1/auth`, prod only (`skipSuccessfulRequests` has no 1:1 — custom counter) |
| 2.8 | Hand-roll XSS + mongo-sanitize `preHandler`s (Fastify's `secure-json-parse` may cover most of mongo-sanitize) |
| 2.9 | Route conversion, 14 files → `fastify.route({method, url, preHandler})`. Order: `file` → `waiter` → `support.team` → `kitchen` → `auth` → `driver` → `public` → `accountant` → `user` → `cityzen` → `vendor` → `vendor_web` → `admin` |
| 2.10 | **Uploads:** one `handleUpload(request, field, opts)` promise helper with `@fastify/multer`; refactor 78 inline sites |
| 2.11 | **Exports:** `sendXlsx` / `sendCsv` / `sendFileDownload` helpers over `reply.raw`; replace ~230 blocks |
| 2.12 | Controllers: `res.status().json/.send` → `reply.code().send`; `res.redirect(303,u)` → `reply.redirect(u,303)` ⚠️ **verify v5 signature before bulk replace**; `req.connection` → `request.ip` (44×); `req.get`/`req.protocol` → `request.headers.host` / `request.protocol` |
| 2.13 | Views: `@fastify/view` for 13 `res.render` calls (only 3 templates have `${}` vars: `msg91.html`, `firebase.html`, `firebase_test.html`) |
| 2.14 | `config/morgan.js` → pino serializers + `onResponse`/`onError` hooks; move `res.locals.errorMessage` into log payload |
| 2.15 | `index.js`: `await fastify.ready()` → `socketIo(fastify.server)`; cron → `onReady`/`onClose` hooks |
| 2.16 | Route-manifest parity diff + full smoke suite |

**Internal order:** 2.1 → 2.2–2.4 → 2.5 spike → 2.6 → 2.7 → 2.8 → 2.9a (reply adapter) → 2.9b (shared route registrar + first file) → 2.9c ✅ (all 13 route files dual-registered) → 2.10 → 2.11 → 2.12 (hardest: `auth.controller`, `payment.initiation`) → 2.13–2.15 → 2.16.

**Exit criteria:** all routes identical, tests green, `express` removed from `package.json`.

> **2.1 done (commit on `main`).** Outcomes worth carrying forward:
> - `catchAsync` is now **identity** (`(fn) => fn`). Spiked first in `tests/express.promise.test.js`: Express 5 already forwards a rejected returned promise to the error middleware, and no unhandled rejection escapes, so the `Promise.resolve(...).catch(next)` shim was redundant. All ~1,477 wrapped handlers are already `(request, reply) => Promise` shaped for Fastify.
> - Duplicate `GET /v1/cityzen/search_customer/:name` deleted from `cityzen.route.js`. **Route count is now 1,925** (was 1,926); `manifest.meta.duplicates` must stay `[]`.
> - Gate result after both changes: route-manifest parity 0/0/0, offline smoke, DB probe and contract suite all green with **zero status or body-shape diffs**.

> **2.2-2.4 done (`src/fastify.ts` + `tests/fastify.parity.test.js`, 7 assertions).** The Fastify shell exists but serves no `/v1` traffic yet; `src/app.js` is still the entry. Corrections to the plan discovered while building it:
> - Package name is **`@fastify/compress`**, not `@fastify/compression` (the latter 404s).
> - **Express 5's default query parser is `simple`** (Node `querystring`), *not* `extended`/`qs` as Express 4 was. Fastify's default already matches - the `qs` override originally specced here would have been a regression.
> - Express parity requires four options beyond the specced list: `caseSensitive: false` and `ignoreTrailingSlash: true` (both now under `routerOptions` in Fastify 5.12), plus explicit `charset=utf-8` on the HTML route and a weak ETag from the same `etag` package Express uses.
> - `@fastify/compress` sets `Vary` from a **route-level** hook injected via `onRoute`, which runs after every instance-level `onSend`; the casing normalisation therefore had to be a route hook appended after it.
> - **Known benign diff:** Express pipes compressed output (chunked, no `content-length`), Fastify buffers it (has `content-length`). Fastify recomputes that header after hooks, so it cannot be normalised from application code - excluded in the parity test with a comment.

> **2.5 done - spike result: `validate.js` needs no changes at all** (`tests/validate.spike.test.js`, 4 assertions). The plan hedged on two risks and both are non-issues:
> - **Mutation works.** `request.query` is not a lazy getter - Fastify's `Request` constructor assigns `this.query = query` as a plain instance property, so `Object.assign(req.query, value.query)` mutates it in place and coerced types/defaults reach the controller. Same for `params` and `body`.
> - **Signature already matches.** Fastify invokes callback-style hooks as `(request, reply, done)`, so Express's `(req, res, next)` maps 1:1 positionally - and `done(new ApiError(400, msg))` yields a byte-identical 400 body to Express's `next(...)`.
> Consequence: all 118 Joi schemas are reused untouched, mounted as `preValidation` per route. Note the spike pins Fastify's behaviour - if an upgrade ever reintroduces a lazy query getter this test fails loudly.

> **2.6 done (`src/auth/fastifyAuth.ts` + `tests/auth.parity.test.js`, 18 assertions).** A deviation was considered and deliberately *not* taken - recorded here so nobody re-litigates it:
> - **The spike found Passport already works unchanged inside Fastify** (13/13 parity: both strategies, self-escape, 401/403). So the cheaper option was available.
> - **We followed the plan anyway.** Passport is an Express-shaped dependency (its `authenticate` middleware is written against `req`/`res`, `config/passport.js` exists only to feed it, and `app.js` needs `passport.initialize()`). Leaving it in means Phase 9 removes a legacy layer *and* a runtime swap at the same time, which is the worse sequencing. The plan's intent - a Fastify-native auth stack - stands.
> - **What is live now:** `@fastify/jwt` registered with `config.jwt.secret`; token *extraction* stays in `src/auth/fastifyAuth.ts` and reproduces passport-jwt's bundled `lib/auth_header.js` regex `(\S+)\s+(\S+)` **verbatim**, so `Bearer <jwt> trailing-junk` extracts the same credential both sides do. `appAuth`/`webAuth` are also exposed as Fastify decorators.
> - **Temporary duplication, knowingly accepted:** Express routes still run `passport`, Fastify routes run `@fastify/jwt`. Both are held byte-identical by `tests/auth.parity.test.js`, which fires every request at both servers and diffs status + body (missing/malformed/expired/forged/HS512/refresh/orphan tokens, `bearer` casing, `Basic` scheme, strategy mismatch, Forbidden, self-escape, and a double-execution guard). **Nothing may change on one side without that test changing in the same commit.**
> - **Delete when Phase 2.9 moves the last route:** `src/middlewares/auth.factory.js`, `src/config/passport.js`, and the `passport` / `passport-jwt` dependencies. The parity test then collapses to a single-server auth suite.

> **2.7 done (`src/plugins/authRateLimit.ts` + `tests/ratelimit.parity.test.js`, 4 assertions).** `express-rate-limit` → `@fastify/rate-limit@11.2.0`, scoped to `/v1/auth`, production only. Four behaviours `@fastify/rate-limit` does not have and had to be hand-closed:
> - **`skipSuccessfulRequests`.** `@fastify/rate-limit` has **zero** support for it (no `decrement` anywhere in the store interface, which is `incr(key, cb, timeWindow, max)` + `child()` only). The shim reuses express-rate-limit's own `MemoryStore` algorithm - `previous`/`current` maps, `decrement` as `if (totalHits > 0) totalHits--` - and refunds from an `onResponse` hook whenever `statusCode < 400`.
> - **`X-RateLimit-Reset` as an absolute epoch second.** The plugin emits *remaining seconds*; an `onSend` hook rewrites it from the shim store's `resetTimeOf(key)`. `Retry-After` already matches (both relative).
> - **The 429 body.** express-rate-limit's default is a bare **`text/html; charset=utf-8`** string - *not* JSON - so `errorResponseBuilder` throws a marker `RateLimitError` and `renderError()` in `src/fastify.ts` has a dedicated branch that returns `reply.code(429).type('text/html; charset=utf-8').send(MESSAGE)`.
> - **Path scoping.** `app.use('/v1/auth', authLimiter)` is `if (config.env === 'production')` in `app.js` (same block as `app.set('trust proxy', ...)`), so the limiter's `onRoute` only attaches `config.rateLimit` to `/^\/v1\/auth(\/|$)/` and the hook must be added **before** `app.register(rateLimit, ...)` (the plugin's `onRoute` reads `routeOptions.config?.rateLimit != null`).
>
> Two accepted deviations, both documented in the test rather than papered over:
> - **Express rate-limits 404s under `/v1/auth` and Fastify does not.** Express's limiter is a `app.use` path mount that runs *before* routing; `@fastify/rate-limit` is a per-route hook. Only unreachable paths differ - reachable routes are identical.
> - **The limiter sits at `preValidation`** (Fastify's `hook` option), so a body-parse error still wins over the 429. That matches Express: `bodyParser` runs before the `app.use('/v1/auth', authLimiter)` mount.
>
> Test plumbing worth remembering, because each of these bit once: **(a)** routes added from outside `app.js` are unreachable - `app.js` ends with a catch-all `app.use((req,res,next) => next(new ApiError(404,...)))` at index `length - 3`, so the probes are spliced into `expressApp.router.stack` at that index; **(b)** `morgan`'s two handlers are stubbed in the require cache *before* dynamic `import('../src/app')` (static imports hoist, and `vi.mock` does not work in this CJS codebase); **(c)** `fastify.inject` never sends `accept-encoding` while supertest always does.

> **Unrelated bug found while gating 2.7 - fixed here because it was about to poison 2.9.** Express's `compression` runs `vary(res, 'Accept-Encoding')` **before** its size check (`node_modules/compression/index.js:175`), but `@fastify/compress` only calls `setVaryHeader` **after** it has actually compressed (`node_modules/@fastify/compress/index.js:395/407`) and returns early for anything under `threshold`. So on **every** sub-threshold response - i.e. almost every JSON response in this API - Fastify was omitting `Vary: Accept-Encoding` entirely. The 2.2-2.4 gate never caught it because it only diffed full headers on `GET /`, whose body is over 1KB. Now fixed:
> - `compressible@2.0.18` promoted to a declared dependency (it is the exact module `compression` uses, so the compressible/not-compressible decision matches by construction), and `cacheControlNoTransformRegExp` copied verbatim from `compression/index.js:43`.
> - `normaliseVary()` in `src/fastify.ts` re-evaluates Express's two pre-checks (`shouldCompress` + `shouldTransform`), appends `Accept-Encoding`, then de-duplicates and title-cases. It is **idempotent** and registered twice: as an instance `onSend` (the only hook that runs for `setNotFoundHandler` and for errors raised before a route matches, neither of which has a route-level chain) and as a route hook appended after `@fastify/compress` (the only position that runs after it, whose own `setVaryHeader` is case-sensitive and would otherwise leave `Accept-Encoding, accept-encoding`).
> - `tests/fastify.parity.test.js` now diffs **all** headers on the 404 as well, so this cannot regress silently.

> **2.8 done (`src/fastify.ts` two instance `preValidation` hooks + `tests/sanitize.parity.test.js`, 8 assertions).** Both sanitizers from `app.js:178-196` are ported. Deviations from the plan, and three things the plan got wrong:
> - **`preValidation`, not `preHandler`.** The plan specced `preHandler`, which runs *after* `validate()`. Express's global middleware runs *before* the router, so `xss` and `mongoSanitize` must precede Joi - otherwise a value that `sanitize-html` rewrites is rejected by a schema that would have accepted the rewritten form. Fastify concatenates instance hooks ahead of route-level ones (`node_modules/fastify/lib/route.js:391-394`), which is exactly Express's global-then-router layout; the test proves it with 200-vs-400 discriminators rather than echoes.
> - **The two packages are reused, not hand-rolled.** Same call as `validate.js` in 2.5: both are pure functions over `req.body`/`req.query` and reuse gives byte-identical output, where a reimplementation of `sanitize-html` behaviour is a security regression waiting for a diff. Neither package depends on `express`, so the Phase 2 exit criterion (`express` removed from `package.json`) is untouched.
> - **Route params are NOT sanitized on either server.** Express calls `app.use(xss)` *before* the router, so `req.params` is still `{}` when both helpers run - the `req.params = sanitize(req.params)` and `mongoSanitize.sanitize(req.params)` lines in `app.js` are dead code. `express-xss-sanitizer` hardcodes `['body', 'params', 'headers']` and has no option to skip params, so Fastify blanks `request.params` around the middleware call and restores it. This preserves a **pre-existing security gap in the original app** rather than fixing it unilaterally: closing it means moving the middleware inside the Express router too, which is a Phase 9 decision taken against both sides at once.
>
> Two bugs found while gating:
> - **`express.urlencoded({ extended: true })` was never reproduced.** Express parses form bodies with `qs` (`body-parser/lib/types/urlencoded.js:103`, `allowPrototypes: true`, `depth: 32`, `arrayLimit: Math.max(100, paramCount)`, `parameterLimit: 1000`), but `@fastify/formbody@9` defaults to `fast-querystring`, which leaves `a[b]=1` as a flat `'a[b]'` key instead of nesting it. `qs` is now a declared dependency and `parseUrlencoded()` in `src/fastify.ts` mirrors body-parser's options (the constant `100` stands in for `Math.max(100, paramCount)` below 100 parameters).
> - **`__proto__` in JSON bodies diverges, deliberately left alone.** body-parser parses with plain `JSON.parse` (`body-parser/lib/types/json.js:72`) and `express-mongo-sanitize`'s regex `/^\$|\./` does not match `__proto__`, so **Express returns 200** with an own `__proto__` property. Fastify parses through `secure-json-parse` and **returns 400**, normalised to `Body is not valid JSON but content-type is set to 'application/json'`. Fastify is the stricter of the two; making Express match would be a behaviour change to a live server, so it is asserted as-is in the test. Same story for `constructor`.

> **2.9a done (`src/plugins/replyCompat.ts` + `tests/replycompat.parity.test.js`, 16 assertions).** 2.9 is route conversion, but the controllers that the converted routes call are still Express-shaped, so the adapter had to land first. Reconfirmed the coexistence decision: the shim is what lets each route file be converted **and behaviourally verified immediately**, rather than after a separate 2.12 controller rewrite. It is deleted in Phase 9.
>
> What the adapter installs, and why each one is non-trivial:
> - **`send`** — three separate rules, all read off the response rather than a flag because that is exactly Express's predicate. `string` with no `Content-Type` → `text/html; charset=utf-8` (Fastify would say `text/plain`); `string` with one → run it through `setCharset`, so `res.setHeader('Content-Type','text/csv')` + `res.send(...)` comes back as `text/csv; charset=utf-8` (`express/lib/utils.js:225`, copied verbatim); `null` → `''` with **no** `Content-Type` and a pre-computed weak ETag over `''`, because Fastify would otherwise answer the JSON literal `null`.
> - **`redirect`** — `res.format` via `accepts(...).types(['text','html'])`: browser `Accept` gets `text/html; charset=utf-8` + an escaped HTML body, `application/json` gets **no content-type and an empty body**, anything else gets `text/plain; charset=utf-8`. Always `vary.append(…, 'Accept')`, always `encodeUrl`, never an ETag (Express finishes redirects with `res.end`). Status-first argument order `(303, url)`; Fastify's own is `(url, code)`.
> - **`cookie`/`clearCookie`** — these two **cannot be decorated**: `@fastify/cookie` already owns those names, so `decorateReply` throws `FST_ERR_DEC_ALREADY_PRESENT`. They are patched onto `Reply.prototype` from a one-shot `onRequest` hook guarded by a `WeakSet`. Both are line-for-line Express ports because `@fastify/cookie` is wrong twice: `maxAge` is passed through as **milliseconds** (a 1-second cookie would live 1000 seconds) and `Path` defaults to `/` only in Express. `sameSite` is forwarded as an explicit `undefined` when the caller passed none, which is what defeats `Object.assign({ sameSite: 'lax' }, options)` inside the plugin.
> - **`json`, `setHeader`, `get`, `connection`** — `json` is Express's (`stringify` first, so `res.json('hi')` stays quoted); `setHeader` is Node's and Fastify's `reply.header` is the same operation; `get` is `req.header` with the `referer`/`referrer` alias and its two `TypeError`s; `connection` is a getter returning `raw.socket` — **`request.originalUrl` already exists in Fastify**, so it is *not* decorated (that was a probe mistake worth recording).
> - **Not ported, and why:** `download`/`end` (2.11), `render` (2.11), `format`/`attachment` (0 call sites), signed cookies (0 call sites, and the formats differ anyway).
>
> Accepted deviations, documented rather than papered over:
> - **`send()` with no argument** omits `content-length` (Express omits it too, Fastify sends `0`) — excluded from the diff like the compression `content-length` diff in 2.2-2.4.
> - **`set-cookie` shape** differs between supertest (array) and `fastify.inject` (string) — normalised in the diff, bytes are identical.
> - **`send(0|false|42)`** needs no shim at all: Express and Fastify already agree (`application/json`, identical length).
>
> Five dependencies promoted from transitive to declared (`accepts`, `encodeurl`, `escape-html`, `vary`, `content-type`) - all are already in `node_modules` as Express's own dependencies, so behaviour is shared by construction rather than approximated.

> **2.9b done (`src/routes/routeRegistrar.js` + `src/routes/v1/index.js` + `file.route.js`, 6 assertions).** The coexistence mechanism for 2.9 was not in the plan and had to be decided before the first file could move: `src/index.js` still boots Express and does not switch until 2.15, yet 2.9 rewrites the route files to Fastify's shape. Three options were on the table (shared `route()` registrar / flip the entry now with an Express bridge / literal dual blocks); the shared registrar was chosen, and the other two are recorded here so they are not re-proposed:
> - **Flip-entry+bridge** would have made production exercise Fastify from step one, but a raw `app(req,res)` bridge has to hand an unconsumed body back to Express, and helmet/cors/compression/sanitizers would have to be prevented from running twice. More machinery than a strangler migration needs.
> - **Dual blocks** write every route twice. The manifest diff would have caught path drift but not handler drift - exactly the failure mode the gate exists to prevent.
>
> How the registrar works:
> - **A converted file exports `{ register }`** - a function invoked *once per framework*, so declarations are re-evaluated rather than shared. An unconverted file still exports an `express.Router`, and `routes/v1/index.js` mounts both shapes the same way. That is what makes the conversion strictly one file at a time with no flag day.
> - **Express** gets `router[method](url, ...preHandler, handler)` - the same layers in the same order, so `tools/route-manifest.js` (which reads `handler.isAuth` / `handler.isValidate` off the arguments) reproduces the Phase 0 baseline. `manifest:check` stayed at 0/0/0 across this commit.
> - **Fastify** gets `app.route({ method, url: '/v1/<mount>' + url, preHandler, handler })`. `src/fastify.ts` calls `registerOnFastify(app, createFastifyAuth)`.
> - **`createAuth` is injected, not required.** `routeRegistrar.js` is plain CommonJS loaded on the Express boot path in production, where a `.ts` module cannot be resolved - so `src/auth/fastifyAuth.ts` must never be reachable from `routes/v1`.
>
> Three facts found while building it, each of which shaped the code:
> - **Fastify rejects `async` hooks of arity 3 at boot** (`FST_ERR_HOOK_INVALID_ASYNC_HANDLER`, `fastify/lib/route.js:318`). Express's `appAuth` is `async (req, res, next) => ...`, so it cannot be passed through - it is rebuilt via `createFastifyAuth(strategy)(...requiredRights)`. Conversion is deliberately **idempotent**, because the Fastify handler carries the same `isAuth`/`authStrategy`/`requiredRights` tags and re-running it produces the same handler rather than a passport closure inside a Fastify hook. `validate` is *sync* arity 3, so Fastify treats it as `(request, reply, done)` and it passes through untouched - the Phase 2.5 spike result.
> - **Route order is preserved by array order.** Fastify runs `preHandler` entries in sequence, so `appAuth` still precedes `validate` exactly as Express ran them. (Putting `validate` in `preValidation`, as 2.5 originally specced, would have inverted that and turned a 401 into a 400.)
> - **Controllers can be handed to Fastify untouched: none of them call `next`** (0 occurrences across `src/controllers/*.js`), and Fastify always invokes handlers as `handler(request, reply)` (`handle-request.js:203`). Combined with `catchAsync` being identity since 2.1, that is what makes the pass-through safe.
>
> Also worth recording: the whole route surface uses exactly **three middlewares** - `appAuth`, `webAuth`, `validate` - and **no multer at route level** (uploads live inside the controllers), so `file.route.js` did not need 2.10 first. And the repo's line-ending convention is per-file: the license header is CRLF, the body is LF; `git diff --check` fails if an edit rewrites header lines as LF or body lines as CRLF.
>
> Next: the remaining 12 files in plan order (`waiter` → `support.team` → `kitchen` → `auth` → …), then the Fastify-mode manifest (`--out tools/route-manifest.fastify.json`) as the global gate.

> **2.9c (1/12) done - `waiter.route.js`, 20 routes, via codemod.** The rewrite is fully mechanical (`router.get('/path', appAuth('x'), validate(S.y), C.f)` → `route({ method, url, preHandler, handler })`), and it has to run 1,907 more times, so it lives at `tools/codemod-route.js` (`npm run codemod:route -- src/routes/v1/<file>.route.js`, `--dry` prints instead of writing) rather than in a session script:
> - **A paren-matching scanner, not a regex.** `admin.route.js` is 154KB; a non-greedy regex stops at the first nested call followed by `);` and silently drops the rest of the file.
> - **Per-line endings are preserved.** This repo keeps each file's licence header in CRLF and its body in LF; a naive normalize flags 16 whitespace-only header lines in `git diff --check`.
> - It drops `const express = require('express')` only when `express` is used for nothing else, and re-emits the whole registration block indented two for the `register()` wrapper.
>
> The gate that matters here is **`manifest:check` staying 0/0/0**, not just "tests pass": the manifest records `auth` strategy, `rights`, `validated`, *and* the ordered `middleware` label list for every route, so a dropped, reordered or mis-wrapped `validate(...)` shows up as `changed` rather than passing silently. Combined with `tests/routeconv.parity.test.js` (now 9 assertions) that diffs behaviour on both servers, 98 tests are green.

> **2.9c complete (12/12) - all 1,925 routes now register on both servers.** The remaining files fell in plan order, each gated by `manifest:check` staying 0/0/0 and a behaviour assertion in `tests/routeconv.parity.test.js` (now 19 assertions, 107 tests total): `support.team` (22, first `webAuth` cookie case), `kitchen` (24), `auth` (80, first `validate`-only rejection without DB), `driver` (54), `public` (79, first single-line-per-line batch), `accountant` (87), `user` (103), `cityzen` (264), `vendor` (217) + `vendor_web` (230, same sub-path `/getMyProfile/:userId` under different strategies - the strongest mount-separation proof), `admin` (743). Tallies sum to exactly 1,925, and Fastify boots all of them with no duplicate-route or trailing-slash collisions. `routes/v1/index.js` no longer mounts a single `express.Router` - every file goes through the registrar; unconverted shape handling stays in place for safety but matches nothing.

---

### Phase 3 — Modularize the monolith *(still 1 process)*

| Step | Detail |
|---|---|
| 3.1 | Replace `services/index.js` + `models/index.js` barrels with explicit per-domain entry points: `src/domains/{orders,restaurant,identity,catalog,dining,delivery,wallet,payments,notifications,storage,settings}/index.ts` |
| 3.2 | ESLint `no-restricted-imports` boundary rule: no cross-domain imports except via a declared `exports` map |
| 3.3 | **Split `orders.service.js`** (15,785 LOC) into `orders/` by lifecycle: create, assign, status-transition, pricing, rating, export |
| 3.4 | **Split `restaurant.service.js`** (15,013 LOC) into `restaurant/` |
| 3.5 | Turn `user.service.js`'s 80-model delete-account cascade into a **saga** (list of per-domain cleanup steps) |
| 3.6 | Extract 6 shared kernels: `src/shared/{wallet,notifications,payments,storage,settings,auth}` |
| 3.7 | Assign cron ownership: scheduler calls domain functions, not services |

**Exit criteria:** `grep` shows zero cross-domain imports; lint rule enforces it.

---

### Phase 4 — Gateway + first extraction: **notifications**

| Step | Detail |
|---|---|
| 4.1 | `apps/gateway` (Fastify) — proxies `/v1` → monolith initially, `SERVICE_ROUTES` map for extracted paths |
| 4.2 | Docker Compose: `gateway`, `monolith`, `mongo`, `redis` |
| 4.3 | `apps/notifications` service: FCM + email + SMS + OTP + notification-list. Own logical DB `localwala_notifications` |
| 4.4 | Monolith calls notifications via HTTP internal client (replaces `require`) |
| 4.5 | Delete `fcm.notification.service.js` + email/SMS services from monolith |

*Why first: 7 direct consumers, no inbound domain dependencies, self-contained — cheapest proof that extraction works.*

**Exit criteria:** notifications fully external, `/v1/notifications/*` served via gateway, parity clean.

---

### Phase 5 — **storage** (media) service

`file.controller.js` + S3/Azure/GCS/local + multer helpers + `/storage/` static serving → `apps/media`. Own DB for `media`, `media.storage.setting`.

---

### Phase 6 — Extraction wave *(easiest → hardest)*

| # | Service | Owns | Logical DB |
|---|---|---|---|
| 1 | **catalog** | food, category, sub-category, addons, cuisine, campaigns | `localwala_catalog` |
| 2 | **settings** | 11 `*.settings` models, app pages, email templates, languages | `localwala_settings` (heavily Redis-cached) |
| 3 | **identity** | users, drivers, restaurants, waiters, kitchen owners, OTP, tokens, referrals | `localwala_identity` |
| 4 | **wallet** | wallet, transactions, withdrawals, disbursement, cash-in-hand, loyalty | `localwala_wallet` |
| 5 | **payments** | payment config, initiation, refunds, collect-cash | `localwala_payments` |
| 6 | **delivery** | driver, vehicle, shift, incentive, join requests, offline messages | `localwala_delivery` |
| 7 | **dining** | dining booking, campaigns, tables, POS/table orders | `localwala_dining` |
| 8 | **support** | chat rooms, complaints, feedback, support tickets | `localwala_support` |

**Per-extraction checklist:** new app → move domain code to TS → own DB → gateway route → parity diff → delete from monolith → deploy → next.

---

### Phase 7 — **orders** service (the monster)

Only after everything else is stable. Split into internal bounded contexts: order-create, order-lifecycle, order-pricing, order-review, refunds, POS. Introduce Redis cache for restaurant/user snapshots + domain events (`order.created`, `driver.assigned`, `payment.captured`) via Redis pub/sub.

---

### Phase 8 — Split databases *(last, highest risk)*

1. Move logical DBs → physical instances.
2. Denormalize the two hotspots at write time: `restaurants` (349 lookups), `users` (324 lookups) — snapshot `restaurantName`, `restaurantCommission`, `driverName` into the order document.
3. Replace remaining `$lookup`s:
   - **Denormalize at write** for display data (preferred — cuts the most joins)
   - **Query the owning service** + Redis cache for read paths
   - **Events for eventual consistency** when staleness is acceptable
4. Verify no cross-DB access remains.
5. Compose: single `mongo` → per-service containers.

**Exit criteria:** DB-per-service, no cross-collection queries, all 1,926 routes still parity-clean.

**Explicitly rejected:** polyglot persistence (stay on one MongoDB engine), event sourcing / CQRS (massive complexity for a CRUD food-delivery app).

---

### Phase 9 — Production hardening

CI (GitHub Actions: lint, typecheck, tests, route-manifest diff), per-service Dockerfiles, health/readiness endpoints, distributed tracing (OpenTelemetry), Grafana/Prometheus, secrets out of `.env` + `serviceAccountKey.json` into a vault, PM2 → container runtime.

---

## 4. TypeScript Strategy

| Decision | Choice | Rationale |
|---|---|---|
| Scope | **New code only** | Monolith is scheduled for deletion — don't type 211K LOC you're about to remove |
| tsconfig | `allowJs: true`, `checkJs: false`, `strict: true` | New files strict, old files ignored |
| Module system | **CommonJS** | Don't switch ESM + Fastify + TS simultaneously |
| Validation | **Keep 118 Joi schemas** in `preValidation` | Rewriting as JSON schemas = a 3rd rewrite |
| Build | `tsc` → `dist/`, `tsx` for dev | |

**Adoption curve:** 0% → ~15% after Phase 2 → grows each extraction → monolith dies as JS.

**Where TS pays off most:** Fastify's JSON-schema validation auto-generates `request.body` / `request.query` types; new services are typed from line 1.

**Rejected:** full conversion up front — 560 files / 211K LOC, 4–8 weeks of pure conversion, and it would be the *third* rewrite (JS→TS + Express→Fastify + mono→poly) simultaneously.

---

## 5. Risk Register

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| 1 | Zero tests / no git | **Critical** | Phase 0 is mandatory first |
| 2 | `catchAsync` → `next(err)` breaks every async error path | **Critical** | Fix before any Fastify code |
| 3 | Passport rewrite gates 1,767 routes | **Critical** | Port last in Phase 2, canary `/v1/auth` first |
| 4 | `res.redirect(code, url)` arg-order silent failure (111 sites) | High | Verify v5 signature; never blind-replace |
| 5 | Duplicate route hard-fails Fastify boot | High | Delete `cityzen.route.js:1092` first |
| 6 | 1,901 `$lookup` joins vs DB-per-service | High | Split DBs last; denormalize `restaurants`/`users` first |
| 7 | 78 inline multer callbacks | High | Single `handleUpload` helper |
| 8 | `request.query` lazy-getter vs `Object.assign` in `validate()` | High | **Spike early** — Phase 2 step 2.5 |
| 9 | `orders` + `restaurant` = 30,798 LOC of coupling | High | Phase 3 internal split before Phase 7 |
| 10 | Cron + socket.io global side effects | Med | `onReady`/`onClose`; gateway owns sockets |
| 11 | ~40 trailing-slash routes | Med | `ignoreTrailingSlash: true` |
| 12 | `.env` + `serviceAccountKey.json` committed | Med | Vault in Phase 9 |
| 13 | `BusinessSettings` read by 23 services | Med | Extract early + Redis cache |
| 14 | Scope creep / phases run in parallel | High | Golden rule: green before next |
| 15 | 6 export formats writing to `res` stream (~230 blocks) | High | Extract `sendXlsx`/`sendCsv` helpers once |
| 16 | `vendor` vs `vendor_web` duplicate 48 controllers | Med | Resolve in Phase 3 — one domain API, two channels |

---

## 6. Verification Checklist *(run at the end of every phase)*

```
□ npm run lint            passes
□ npm run typecheck       passes
□ npm test                all green
□ route-manifest diff     0 differences vs Phase 0 snapshot
□ 6 frontends             Admin + Customer + Deliveryman + Restaurant
                          + Kitchen + Waiter: login, browse, order,
                          deliver, pay, chat, track GPS — all work
□ payments                Stripe sandbox: full charge + refund cycle
□ exports                 XLSX + CSV download still streams
□ uploads                 image upload on 3 endpoints
□ cron                    scheduler fires, no double-run
□ sockets                 chat message + driver GPS live
□ performance             p95 latency within 10% of baseline
```

---

## 7. Timeline Estimate

| Phase | Effort | Risk |
|---|---|---|
| 0 — Safety net | 1–1.5 weeks | Low |
| 1 — TypeScript scaffolding | 2–3 days | Low |
| 2 — Fastify port | **3–4 weeks** | High |
| 3 — Modularize | **3–4 weeks** | Medium |
| 4 — Gateway + notifications | 1.5 weeks | Medium |
| 5 — Storage | 1 week | Low |
| 6 — 8 extractions | **6–8 weeks** | Medium |
| 7 — Orders | 2–3 weeks | High |
| 8 — DB split | **3–4 weeks** | **Highest** |
| 9 — Hardening | 1–2 weeks | Low |
| **Total** | **~20–25 weeks** | |

---

## 8. Immediate Next Actions

1. **`git init`** + initial commit (not a repo today)
2. Write `tools/route-manifest.js` → capture the 1,926-endpoint baseline
3. Stand up Vitest + Supertest smoke suite wired to `npm test`
4. **Spike:** Fastify `request.query` mutation vs `validate()` — this one answer de-risks Phase 2
5. Install `typescript` + `tsconfig.json` (`allowJs: true`)

---

## 9. What Does NOT Change

| Unchanged | Notes |
|---|---|
| All 1,926 endpoint paths + JSON shapes | gateway preserves `/v1` exactly |
| All business logic | orders, payments, dining, tiffin, POS, dispatch, wallet, payouts, cron |
| Auth | JWT web cookie + app bearer, roles/RBAC, rate limits |
| The 6 frontend apps | **not one line changes** |
| Chat + live GPS, FCM push, email/SMS, invoices, Excel/CSV exports | |
| MongoDB data, env vars | |
| User-visible app experience | same functionality, different plumbing |

| Changes | Before → After |
|---|---|
| Process | 1 Node (PM2) → N services |
| Code layout | flat `controllers/ + services/` → domain folders |
| HTTP layer | Express 5 → Fastify 5 |
| Cross-domain calls | direct `require()` → HTTP / gateway |
| Database | 1 shared Mongo → DB-per-service |
| Frontend calls | `api.host/v1/...` → unchanged (gateway) |
