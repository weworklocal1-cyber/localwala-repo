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

**Internal order:** 2.1 → 2.2–2.4 → 2.5 spike → 2.6 → 2.7 → 2.8 → 2.9a (reply adapter) → 2.9b (shared route registrar + first file) → 2.9c ✅ (all 13 route files dual-registered) → 2.10 ✅ (uploads) → 2.11 ✅ (exports) → 2.12 ✅ (controllers) → 2.13 ✅ (views) → 2.14 ✅ (logging) → 2.15 ✅ (entry point) → 2.16 ✅ (Fastify manifest parity).

**Exit criteria:** all routes identical ✅ (2.16 — both manifests, 0/0/0), tests green ✅. `express` removed from `package.json` ⛔ **deferred to Phase 9** — `src/app.js` is the parity baseline the suites load, so it cannot go until the parity architecture is retired. What *is* proven today is that a production boot loads no Express at all (`tests/production-graph.test.js`); see the 2.16 note.

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

> **2.10 done (`src/utils/handleUpload.js` + multipart parser in `src/fastify.ts` + `tests/upload.parity.test.js`, 6 assertions).** Recon first: one shared factory (`middlewares/upload.js`), 78 call sites all shaped `upload.single('file'|'fileName')(req, res, cb)` *inside* controllers, no `req.files`, no other upload libraries. Three deviations from the plan, each evidence-driven:
> - **No `@fastify/multer` - it does not exist.** The plan's package name 404s (same lesson as `@fastify/compression` in 2.2); the community `fastify-multer` is 4-years-abandoned, Fastify 3 era, and reimplements multer with its own error class, which would break every controller's `err instanceof multer.MulterError` check (including the `LIMIT_FILE_SIZE` wording). Instead the *same* multer instance runs on both servers: Express over the live request (today's call, untouched), Fastify over a replay of the stashed bytes through a `Readable` wearing the real headers.
> - **Callback signature kept, not promisified.** The 78 callbacks map errors differently per site (`LIMIT_FILE_SIZE` wording vs `if (!err)` shapes); flattening them is the 2.12 controller rewrite's job. Each site changed exactly one line (`tools/codemod-upload.js`), verified with zero leftovers of `uploadMiddleware`/`upload.single(`.
> - **Multipart parser yields `undefined`, not `{}`.** Probed Express first: `express.json()` skips multipart and leaves `req.body` undefined, and `pick()` drops undefined values, so Joi never sees a body. The parser (`/^multipart\/.*/` as a **RegExp** - Fastify only honours `'*'` or RegExp for wildcards, a string silently 415s) buffers with `parseAs: 'buffer'`, stashes on `request.raw`, returns `undefined`. `bodyLimit` stays 5MB so multer's own `LIMIT_FILE_SIZE` always fires first; past 5MB Fastify 413s where Express 400s (accepted, pathological input).
>
> Parity is byte equality, not echoes: good upload (file shape + buffer + fields), fileFilter rejection message, missing file, oversize `MulterError`, disk-storage shape minus the random filename (written files unlinked), plus `POST /v1/file/uploadImage` multipart proving Fastify no longer 415s and still 401s first. 113 tests green, manifest 0/0/0, lint 0 errors, `tsc` clean.

> **2.11 done (`src/utils/download.js` + `tests/download.parity.test.js`, 4 assertions).** Recon: three export shapes - CSV via `res.setHeader` + `res.send` (needs nothing; the 2.9a adapter already makes it identical, ETag included, pinned by test), `res.download` ×110 (101 with filename+callback, 8 callback-only, 1 bare; all callbacks identical `if (!err)` unlink), and `await workbook.xlsx.write(res); res.end();` ×110 (all paired, all pre-setting both headers, workbook variable always `workbook`). Two helpers, one codemod (`tools/codemod-download.js`), zero leftovers:
> - **`sendFileDownload` mirrors `send`'s header rules line for line** (`send/index.js` `setHeader`): Content-Disposition *always* comes from the filename argument - `res.download` passes it through send's options, overwriting pre-set (probed: pre-set `filename=export.json` goes out as `filename="cities.json"`) - while Content-Type/Accept-Ranges/Cache-Control/Last-Modified/ETag respect pre-set and fall back to `mime.contentType(ext)`, `bytes`, `public, max-age=0`, `stat.mtime`, `etag(stat)`. Both servers read the *same* file, so even the stat-etag matches - the whole header block is compared. `content-disposition` + `mime-types` promoted from transitive to declared.
> - **`sendXlsx` streams through a `PassThrough` handed to `reply.send`**, never hijacking: every `onSend` hook (helmet, cors, vary) still runs, and `xlsx` is not in the compressible database on either side (same `compressible` module), so both stream chunked. xlsx embeds timestamps, so bodies compare by length plus parsed sheet values - fetched over real HTTP, because `inject` utf8-mangles binary bodies (a test-harness loss, not a server difference).
> - **Both helpers return promises that settle after their callbacks, and every site awaits.** Found the hard way: a fire-and-forget `res.send` from an async Fastify handler loses the race - Fastify answers an empty 200 first (proven with a `setTimeout` probe). The same race made the first upload/download parity runs pass by timing luck; the awaits make them deterministic. `node --check` over every touched file proves each site sits in an async function.
>
> Staging honesty for 2.12: all 110 download sites sit directly in handler flow, so they work on Fastify today. Upload callbacks that answer from *event-deferred* handlers (GCS/Azure/S3 `finish` events in `file.controller.js`) still need the 2.12 controller flattening - awaiting covers everything the callback itself awaits. 117 tests green, manifest 0/0/0, lint 0 errors, `tsc` clean.

> **2.12 done (adapter `secure` + GCS flatten + `tests/controller.parity.test.js`, 4 assertions).** Reframing first: the rewrites this step originally listed (`res.status().json` → `reply.code().send`, redirect arg order, `req.connection` → `request.ip`, `req.get` → headers) are **moot - the 2.9a adapter already covers every one**, so no controller is rewritten for syntax. What 2.12 actually is: a complete audit of the controller request surface plus the one async flow that was genuinely broken. Audit results, all verified against `node_modules` source rather than assumed:
> - **`res.*` (controllers): 7 methods total.** `send`/`setHeader`/`status`/`cookie`/`clearCookie`/`redirect` via the adapter; `download`/`end` via 2.11 helpers (0 bare remnants); `render` ×13 belongs to 2.13.
> - **`req.*`: everything covered.** `protocol`/`ip`/`socket` exist natively on FastifyRequest *with the same trust-proxy semantics* (forwarded headers honoured from trusted hops only; `trustProxy` configured identically in `src/fastify.ts:244` and `src/app.js:205`), `get`/`connection` via the adapter, and `secure` - the single missing getter (`this.protocol === 'https'`, verbatim from Express) - added this step with its `fastify.d.ts` declaration.
> - **No timers, no `new Promise`, no `sendMail`, no `req.files` in any controller; services touch neither `req` nor `res`; `res.locals` only flows through `middlewares/error.js` → `morgan` (2.14's problem).**
> - **Exactly one fire-and-forget response in the whole codebase**: the GCS `blobStream` `finish`/`error` handlers in `file.controller.js` (Azure uses awaited `uploadData`, S3 uses awaited `s3.send`). Flattened to `await new Promise` over the stream events with byte-identical success/failure bodies; the 109 other download sites and all 78 upload callbacks already answer inside awaited flow.
> - **The "hardest" controllers verified, not just eyeballed**: `getClientIp` / `isSecureRequest` / the 7 `` `${req.protocol}://${req.get('host')}` `` link builders (auth + payment.initiation) are evaluated verbatim in probes, proxied (fully deterministic, including the subtle `secure: true` + `protocol: 'http'` split the helpers really produce untrusted) and direct. 121 tests green, manifest 0/0/0, lint 0 errors, `tsc` clean.

> **2.13 done (`src/utils/renderView.js` + `tests/view.parity.test.js`, 4 assertions).** All 13 `res.render` calls live in two controllers (auth 10, payment.initiation 3): `other/msg91`/`firebase`/`firebase_test` with `{ locals }`, the rest static. Deliberately NOT `@fastify/view` - a second substitution implementation to hold byte-identical against the first. Both servers run the *same* `es6Renderer` function instead (Express through `res.render`, untouched; Fastify by calling it directly), so output matches by construction and the 13 sites changed one token each (`tools/codemod-render.js`). Two engine quirks read off its source: without a callback it *crashes* on missing files instead of erroring (Express always passes one, so the helper does too), and with a callback it also rejects its returned promise (swallowed, or every missing template logs an unhandled rejection). The helper additionally replicates Express's view-lookup failure verbatim (`Failed to lookup view "…" in views directory "…"` with app.js's exact mixed-slash spelling), which the engine alone would report as bare ENOENT.
>
> The step also caught a live production bug outside views: **`@fastify/compress@9.2.0`'s async path answers empty bodies under gzip headers past ~4KB** (boundary bisected at exactly 4096/4097 bytes; proven on vanilla Fastify, 9.2.0 is latest). Any gzipped JSON/HTML response over that size - admin listings, exports - would have been empty in production. Fixed with `syncThreshold: 64MB` in `src/fastify.ts` (sync gzip only runs on compressible bodies over 1KB; xlsx never compresses on either server). Regression net: an 8KB download fetched gzipped in `tests/download.parity.test.js`.
>
> Test-harness lessons worth keeping: `inject` utf8-mangles binary (xlsx and gzip bodies must go over real `listen` + `http.get`), `accept-encoding` must be set explicitly on inject (supertest always sends gzip/deflate), and keep-alive sockets hang `server.close()` (`agent: false` + `closeAllConnections`). 126 tests green, manifest 0/0/0, lint 0 errors, `tsc` clean.

> **2.14 done (`src/plugins/requestLog.ts` + `tests/logging.parity.test.js`, 4 assertions).** Winston stays the request-log sink: an `onResponse` hook writes morgan's exact shape (`:method :url :status - :response-time ms`, production `:remote-addr` prefix, `- message: …` suffix on errors) into the same logger, and Fastify's own `incoming request` / `request completed` pino lines are off (different format, different sink - keeping both would double-log every request). `renderError` stashes the final message on the request for the hook - the `res.locals.errorMessage` move, on the main error path only, matching Express where the 429 branch leaves it unset. Two API notes: top-level `disableRequestLogging` warns FSTDEP023 since 5.12, so the supported `logController: new LogController({ disableRequestLogging: true })` form is used (`request.log` itself keeps working); `reply.elapsedTime` feeds `:response-time` with morgan's 3 decimals.
>
> Test mechanics worth recording: the main app disables morgan in test env, so the Express baseline is a mini-app mounting the *real* morgan handlers and the *real* error pipeline; winston is stubbed at the method level, which works because the TS side shares this file's module instance (proven by experiment after a detour through stream capture - winston writes via `console._stdout`, not `process.stdout.write`, so that approach can never see it); and both morgan (finish listener) and the hook can fire after the client resolves, so assertions poll. 130 tests green, manifest 0/0/0, lint 0 errors, `tsc` clean.

> **2.15 done - the entry point boots Fastify.** `src/index.js` no longer requires `src/app.js`; it connects to Mongo, then `buildFastify()` → `app.listen()` → socket.io on `fastify.server` → cron. `tests/entry.boot.test.js` (7 assertions) runs the **real entry as a child process under tsx**, which is the only test in the repo that would catch a broken interpreter or a CJS→TS require. Four decisions worth recording:
> - **TypeScript runtime in production was an open question and is now settled: `tsx` is a real dependency and pm2 launches `node_modules/.bin/tsx src/index.js`.** A `dist/` build was rejected on evidence - `npm run build` emits only the 8 TS files (no JS, no assets) and **123** `__dirname` references would resolve wrong from `dist/`, so it would have meant copying `templates/`, `public/` and `fcm_keys/` or rewriting every path. Keeping `__dirname` at `src/` leaves all 123 untouched. **Operational note:** tsx must survive `npm ci --omit=dev`, and the `build` script is now *not* the deploy path.
> - **A latent outage avoided:** `app.listen` defaults to host `localhost`, while the old `server.listen(port)` bound every interface - omitting it would have made the API unreachable from outside the box. Now passed as `'0.0.0.0'` explicitly.
> - **Cron moved out of `app.js`, where it started on `require`** - so it also ran inside the test suite and the manifest tool, and had no matching shutdown. It now starts after `listen` and stops in an `onClose` hook. The pre-existing `stopAllCronJobsScheduler.stopCronJob()` is the *failure-recovery* path and deliberately deletes the `CronJobScheduler` collection, so calling it on shutdown would have wiped scheduler history on every restart; a non-destructive `stopCronJobsOnly()` was added and is what `onClose` calls.
> - **`app.close()` replaces `server.close()`** in the shutdown handlers (drains in-flight requests, runs `onClose`, then closes the http server), with a rejection arm so a failed close still exits rather than leaving a half-dead pm2 process.
>
> Also removed the now-unused `CronJobSchedulerService` import from `app.js` to keep the lint warning count at its established 6. Two harness findings: `spawn` cannot run the Windows `tsx.cmd` shim without a shell (`EINVAL`) - the test spawns `process.execPath` + `node_modules/tsx/dist/cli.mjs`, which is what the shim executes and is identical on every platform; and `kill('SIGTERM')` on Windows is `TerminateProcess`, so no JS handler runs, which is why the graceful-close path is asserted in-process (`app.close()` runs the hook, calls the cron stop and releases the port) and the signal test only asserts a clean exit on POSIX. **137 tests / 20 files**, manifest 0/0/0, lint 0 errors, `tsc` clean.

> **2.16 done - the Fastify route manifest, and the exit criterion audited. Phase 2 complete.** `tools/route-manifest.js --engine fastify` (npm scripts `manifest:fastify`, `manifest:fastify:save`, `manifest:fastify:check`) now emits an entry-identical manifest, so the *same* `diffManifests()` compares the two servers directly: **1,925 vs 1,925 routes, 0 added / 0 removed / 0 changed** - which covers auth strategy, rights, `validated` and the full ordered middleware chain, not just paths. Four things it took to get there:
> - **A bare `Fastify()` plus `registerOnFastify`, not `buildFastify()`** - the honest analogue of the Express side, which also only instruments route registration. Calling `buildFastify()` would drag helmet/cors/compression/static/jwt into a route inventory. `app.ready()` is awaited, so Fastify itself validates all 1,925 routes (duplicate detection, param syntax): a route Fastify would refuse to boot is a manifest failure, not a silent omission.
> - **1,017 phantom HEAD routes.** Fastify auto-exposes HEAD for every GET (`exposeHeadRoutes`, default true), so the first run reported 2,942. These are bookkeeping, not endpoints: Express serves HEAD *through* its GET routes, and the wire behaviour is identical (both answer `HEAD /v1/public/get_web_settings` with the same 400 and same headers). They are excluded from the diff, printed as a `note` line so the exclusion is visible rather than silent, and **asserted** - the tool now throws if `autoHeadRoutes !== getRoutes`, so a future change that stops Fastify serving HEAD somewhere Express still does cannot pass quietly.
> - **`routeOptions.exposeHeadRoute` is not usable to identify them** - Fastify only puts that flag in the internal route context, not in `onRoute`'s options (checked empirically; the first version of the assertion read `undefined` and the count check caught it). Method is sufficient, because the route surface declares no HEAD verb of its own.
> - **Methods must be uppercase to match the baseline** - `keyOf()` is `` `${method} ${path}` ``, so casing is part of the comparison; the baseline stores `GET`, and the first run showed 1,925 added *and* 1,925 removed purely from casing.
>
> **The exit criterion "express removed from package.json" is deliberately not met, and here is exactly why.** It is the only Phase 2 criterion not satisfied, and it is blocked on the parity architecture rather than on effort: `src/app.js` is the behavioural baseline that proves this whole phase, and the parity suites load it. So the criterion is deferred to Phase 9, where the plan already retires `routeRegistrar` and `auth.factory`. What *was* achievable today was made true and is now guarded by `tests/production-graph.test.js` (10 assertions): **a real production bootstrap loads no Express at all.** Two lazy-load fixes got it there - `express` moved inside a `getExpressRouter()` in `src/routes/v1/index.js` (production only ever calls `registerOnFastify`; only `app.js` and the Express manifest want the tree) and `passport` moved inside the middleware body in `auth.factory.js` (the 13 route files import `appAuth`/`webAuth` to build their tables, but on Fastify the registrar rebuilds each as a `@fastify/jwt` handler, so passport was loaded and never used). A static require-graph walk was tried first and **discarded**: it cannot distinguish a lazy `require()` from an eager one, so it reported express as reachable after the fix. The test therefore boots the real entry's bootstrap in a child process under `tsx` and inspects its own `require.cache` - absence from the cache is stronger evidence than any grep. It also pins the three packages that *are* deliberately production: `express-es6-template-engine` (2.13) and the two sanitizers (2.8, reused so behaviour matches by construction).
>
> **Phase 2 is complete.** 147 tests / 21 files, both manifests PARITY OK, lint 0 errors, `tsc` clean, `git diff --check` clean.

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

> **3.1a done - the domain inventory and generated facades (`tools/domain-inventory.js`, `src/domains/*/index.ts`, 5 assertions).** The plan's 3.1 says "replace the barrels with per-domain entry points", but nothing in the repo said which of the 275 modules belonged to which domain, so that was measured before anything moved. Four findings changed the shape of the phase:
> - **Risk #9 is about size, not entanglement.** `orders.service.js` and `restaurant.service.js` really are 15,785 + 15,013 LOC, but at module level each has only **11** internal neighbours and `orders -> restaurant` is the *only* direct edge between them. Nothing about splitting them is risky; the risk is that they are large and 16 files depend on them.
> - **The real coupling is the barrels.** 2,568 internal edges, of which **131** are "module reaches another domain's code through `require('../models')`" - one import hands a service all 142 models. That is load-time coupling with no domain meaning, and it is what 3.1 actually removes. The honest headline is **22 direct cross-domain edges** versus 131 barrel-mediated ones.
> - **So the boundary is published first, files move later.** `tools/domain-inventory.js` holds the classification as data (prefix rules plus a justified `overrides` list for the 51 modules no rule can catch - pluralised, abbreviated, and the upstream misspelling `bussiness.settings.model.js`) and *measures* the edge graph from source rather than declaring it. `npm run domain:write` generates `src/domains/<domain>/index.ts` from it, `npm run domain:check` fails if a generated file drifts, and the tool exits non-zero on any unclassified module - because "zero cross-domain imports" is unfalsifiable if a module has no domain. 275/275 classified, 0 unclassified.
> - **The facades are drop-in.** They re-export the *same names the barrels export today* (read out of `services/index.js` / `models/index.js`, not guessed - the first attempt derived names from filenames and produced four duplicate identifiers that `tsc` caught). `tests/domain-inventory.test.js` asserts the union of facade export names equals the union of barrel export names, so moving a consumer is a one-line change.
>
> Nothing is rewired yet: the barrels are untouched and no consumer imports a facade, so this step is additive and reversible. 3.2 can now add the `no-restricted-imports` rule with the 22 real edges as an explicit, documented allowlist that 3.3/3.4 drain to zero - which is the only way that rule can pass at all, since 3.2 as written would otherwise fail on edges that exist by design. **152 tests / 22 files**, both manifests PARITY OK, `domain:check` in sync, lint 0 errors, `tsc` clean, `git diff --check` clean.

> **3.1b done - `catalog` restored (11 domains, not 10).** 3.1a flagged that the plan lists 11 domains and `catalog` had come out empty. Rather than leave a permanently empty domain, the menu/catalogue modules (`food*`, `category`, `sub.category`, `cuisine`, `addons`, `banners`, `vendor.category*`, coupons) moved into a real `catalog` domain of 26 modules - it is a genuine extraction in Phase 6, and reclassifying is zero-risk data in the inventory rather than a code change. Two modules (`banners`) surfaced as unclassified when `restaurant` was trimmed and were added to `catalog`, which is where they belong. The `no-unused-vars`-style discipline of the tool paid for itself here: had the domain list been hand-maintained in a document, `catalog` would have quietly stayed empty.

> **3.2 done - the domain boundary rule (`tools/eslint-rules/domain-boundary.cjs`, 11 assertions).** ESLint's own `no-restricted-imports` **cannot** express this: it matches patterns globally, so "A may not import B" would also stop B importing itself, and it has no idea which domain the file being linted is in. A custom rule computes both sides with the same classification the inventory uses (the tool is now importable, `require.main`-guarded, so the two cannot disagree). Three design points:
> - **The allowlist is generated, not curated.** `tools/domain-boundary-allowlist.json` holds the 22 cross-domain edges that exist today, produced from the measured graph, so it can never be wider than reality. `domain:allowlist:check` **fails** if a *new* edge appears (route it through a facade, or add it deliberately and justify it) and merely *reports* stale entries as progress to be regenerated - so 3.3/3.4 shrink it and the list cannot quietly accumulate dead entries.
> - **The rule is proven to fail, not just to pass.** Five cases write real violating files into `src/services` and `src/domains`, run the real eslint, and assert the message appears - a boundary rule that never fires is indistinguishable from no rule, because it looks green. Writing those tests found three genuine bugs in the rule itself:
>   1. **It never fired at all.** It only visited `ImportDeclaration`, but this codebase is CommonJS - `require('./x')` is a `CallExpression`. A rule that matches nothing while reporting success is worse than no rule.
>   2. **It could not resolve a facade.** `resolveRelative` tried `index.js` but the generated facades are `index.ts`, so every facade-to-facade import resolved to `null` and was skipped. Fixed in the inventory, which means the edge graph now sees those edges too.
>   3. **It inspected the specifier, not the resolved path**, for the `domains/` prefix - but a facade imports a sibling domain as `../catalog`, which contains no mention of "domains" at all. `export * from` / `export {}` re-exports cross a boundary exactly as imports do and are now covered too.
>
> **What the rule does not yet do, deliberately:** forbid importing the `services`/`models` barrels. 131 edges go through them and removing those is the consumer migration, not a switch that can be turned on without breaking the build - it lands with that migration, and the inventory counts those edges separately so the target is measurable. Files outside the governed set (controllers, routes, utils) are skipped: a rule that failed on every controller would be disabled within a day. **158 tests / 22 files**, both manifests PARITY OK, `domain:check` in sync (11 domains, 275/275), lint 0 errors, `tsc` clean, `git diff --check` clean.
>
> **3.3 started - `orders.service.js` analytics kernel split out** (`services/orders.analytics.internal.js`, 1,033 lines). Before moving anything the file was measured, because a 15,785-line file cannot be read: **99 local functions, 86 exported, no module-level `let`/`var`, and exactly 1 of the 86 exported functions calls another.** No shared mutable state means the split is mechanical rather than a refactor. The eight `*EarningBreakdown` queries were chosen first because they are **not in the public surface** - nothing a consumer can see changes - and they form one clean cluster (`adminDashboard`/`accountantDashboard` own four, `cityzenDashboard` owns the other four).
>
> `tools/split-orders.js` is a cut-and-paste, not a refactoring: it copies the function text **verbatim** and derives which imports the moved text needs by scanning it. `--verify` proves the move is byte-identical against the pre-split file in git, so "nothing changed but the file layout" is checked rather than assumed. Three things it refused to let through:
> - **Unused imports are a regression here.** Lint is held at exactly 6 warnings, and a leftover import is a new one. `../models` is a **single destructured require of 31 names**; passing the block wholesale into the new file would have imported 26 names it never uses, and dropping the block wholesale would have removed names still used by the 86 remaining functions. The tool works per **name**.
> - **Contiguous requires are not one require.** The import block is 14 separate requires on 14 consecutive lines. A rewrite that treated a contiguous run of require-shaped lines as one unit silently merged all 14 - and would have either pruned nothing or deleted 13 imports. `tests/orders-split.test.js` pins the count at 14 and I confirmed the tests actually go red (4 mutations: unused import, deleted require, a moved query put back, kernel import removed).
> - **A module no barrel re-exports has no public name.** This is where 3.2's inventory caught the split: `buildFacades` fell back to a *derived* name for any module missing from both barrels, so the new internal kernel leaked 8 names into `src/domains/orders/index.ts` and broke the "every barrel name re-exported exactly once" invariant. The fallback was **dead code** - all 275 modules were in a barrel - and it is gone. Such modules are now reported as `internal (not re-exported by any barrel)` and excluded from the facade.
>
> Still to do in 3.3: the remaining lifecycle buckets (create, assign, status-transition, pricing, rating, export) named above, which is most of the file. **164 tests / 23 files**, both manifests PARITY OK, `domain:check` in sync, allowlist unchanged at 22 edges, lint 0 errors / 6 warnings, `tsc` clean, `git diff --check` clean.
>
> **3.3 complete - all 99 functions placed, `orders.service.js` is 15,796 -> 129 lines.** The taxonomy is a **verified partition**, not prose: `node tools/split-orders.js --taxonomy` fails unless all 99 names (86 exported + 13 internal) are placed exactly once. The plan named six buckets; the measured surface does not fit six - there are analytics dashboards, refunds and bulk reads with no home among them, and inventing a "misc" bucket is how a 15k-line file stays a 15k-line file. So it is **eight**: `create`, `assign`, `status-transition`, `query`, `dashboard`, `refund`, `export`, `pricing`, plus the analytics kernel from the first slice. Review/rewards sit in `query` because the only rating-shaped exports are reads, not a lifecycle stage. Every bucket is a *pure move* - nothing outside a bucket calls its functions - so no cross-bucket wiring was needed.
>
> The tool is table-driven from the start of this step. The first slice hard-coded one list of names, and eight near-copies of careful code is how the invariants quietly stop holding. Each bucket now goes through the same verified path, and `orders.service.js` is a **generated facade**: 8 requires, then the original 86-name export block untouched, so the public surface cannot drift.
>
> **The bug that mattered was an aliased import.** `http-status` is imported as `const { status: httpStatus } = require('http-status')`. Recording the local name and re-emitting it produced `const { httpStatus } = ...` - a binding that **exists and is `undefined`**. ESLint cannot see it: no `no-undef`, 0 errors, and the warning count stayed at 6. Twelve endpoints returned **500 on `httpStatus.NOT_FOUND`** while every static gate was green. Only `tests/db.probe.test.js` caught it, which is the argument for keeping a live-database probe in the suite. The splitter now carries the original *spec text*, and a test asserts it - confirmed to go red when the alias is removed.
>
> Three more design mistakes worth recording, because each looked like it worked:
> - **Pruning the source pass by pass is wrong.** A require was dropped as soon as no *surviving* function used it - but a later bucket's functions are still surviving at that moment and need it, so `checkArrayNotEmpty` was deleted by the query pass and the dashboard pass had no declaration left to copy. The whole file is now rebuilt in one step from the pristine original, which makes bucket order irrelevant and the output deterministic (verified by hashing two independent runs).
> - **Contiguous requires are not one require.** The import block is 14 separate requires on 14 consecutive lines; treating a run of require-shaped lines as one unit merged all 14, and pruning it would have deleted 13 imports.
> - **A binding can only be declared once.** A require block re-detected while being rewritten reintroduced `Restaurant` twice, producing a file that would not parse.
>
> **The allowlist went 22 -> 23 edges, and no new dependency was created.** Six entries changed only their `from` path, because the callers moved from `orders.service.js` into the bucket that owns them. The extra edge is `orders.assign.internal.js -> restaurant.service.js`: the same single `orders -> restaurant` dependency, now visible from two modules since the callers split across `assign` and `status`. The count is honest rather than flattering, which is the point of generating it.
>
> `tests/orders-split.test.js` pins the invariants that outlive the split - surface unchanged, taxonomy a partition, no unused import anywhere, imports verbatim, private helpers out of the facade - and I confirmed four mutations turn it red (alias dropped, private helper re-exported, bucket require removed, public name dropped). **164 tests / 23 files**, both manifests PARITY OK, `domain:check` in sync, allowlist 23 edges, lint 0 errors / 6 warnings, `tsc` clean, `git diff --check` clean.
>
> **3.4 complete - `restaurant.service.js` split into 8 buckets, 15,215 -> 133 lines.** Measured first, and the measurement changed the design: **111 exported names, 3 private helpers, no module-level mutable state, but 14 exported functions that call another exported function.** Orders was a pure move everywhere; restaurant is not. `getRestaurantById` is the hub - **twelve** functions call it - so it lives in `identity` next to all of them rather than being scattered by name similarity.
>
> The taxonomy is data in `tools/taxonomies/restaurant.js`, and the orders tool became `tools/split-service.js`, driven by `tools/taxonomies/<service>.js`. Copying 700 lines per service would have been how the invariants quietly stopped holding; with a taxonomy file, a new service is one data change and no code.
>
> **Cross-bucket edges are explicit, and only three of them.** `updateUserCityLocation` is genuinely shared - identity and discovery both write through it - so it went to a `shared` kernel both import, rather than being copied into two buckets as a silent behaviour fork. `wallet` imports `getRestaurantById` from `identity`; the rest are self-contained. The tool *reports* them (`--plan` prints them per bucket) so they are reviewable rather than emergent.
>
> **A private name is now published only if another bucket actually calls it, derived rather than declared.** The orders analytics kernel and the restaurant shared kernel both publish a name that is not part of the public surface, while the orders status bucket keeps five helpers nobody else uses. Hand-maintaining that distinction put `updateUserCityLocation` in a module that exported nothing - one new unused-import warning. The tool computes it from the cross-bucket calls.
>
> **Two matcher bugs, both of which had been lying in wait for the orders split too:**
> - **A word-boundary match cannot tell code from a comment.** `// await emailConfigService.sendExpiredPackageBlockedEmail(...)` counted as a use, so the vendor bucket shipped an import nothing referenced. Only full-line comments are now dropped, deliberately: the opposite error - dropping an import that is genuinely needed - is a 500, so imports stay conservative and only comments are treated precisely.
> - **A word-boundary match cannot tell a function from a method.** `subscriptionService.getById(param.subscription)` in the export bucket looked like a call to identity's `getById`, producing a cross-bucket import that was never used. Dot-qualified references are now excluded - but **only** for cross-bucket and publish detection, never for the original's own imports, because the failure modes are not symmetric: an extra cross-bucket import is one warning, a missing one is a runtime 500.
> - And a third: `Object.keys()` on a `Map` returns nothing, so the first run reported **zero** cross-bucket edges while the recon showed four. A green result from a broken code path is the same failure as a rule that never fires.
>
> **The allowlist went 23 -> 25 edges and created no new dependency.** Checked by comparing `(fromDomain, toDomain, target)` before and after, not by eyeballing the diff: `restaurant -> orders (subscriber.service)` and `restaurant -> orders (subscription.service)` each went from 1 file to 2, because `identity` and `export` both need them. Zero new domain pairs. The count went up, which is the honest consequence of splitting one file into eight.
>
> `tests/service-split.test.js` replaces the orders-only test and is now **driven by the taxonomy modules**, so it covers every service that has one - 20 assertions across orders and restaurant. It pins what outlives the split: surface matches the taxonomy, each name defined once, private names out of the facade and published only when called, aliases spelled with their alias, no unused import anywhere, cross-bucket calls always imported. Five mutations turn it red, including the alias and a removed cross-bucket require. It deliberately does **not** assert byte-identity: that needs the pre-split file, so it stays in `--verify`, which is only meaningful before the commit. **178 tests / 23 files**, both manifests PARITY OK, `domain:check` in sync, allowlist 25 edges, lint 0 errors / 6 warnings, `tsc` clean, `git diff --check` clean.

> **Before starting 3.5/3.6: the exit criterion is not reachable as written, and 3.6 is mostly not boundary work.** Two facts, both measured rather than reasoned:
>
> - **Routing an edge through a domain facade does not remove it.** The 3.2 rule resolves `src/domains/<d>/index.ts` and treats a facade-to-facade import as **another cross-domain edge** - there is a test asserting exactly that. So "route it through a facade in src/domains/<d>", which is what the rule's own error message tells you to do, would not make `grep` show zero. The only way an edge reaches zero is for the shared code to **leave the domain graph entirely** by moving to `src/shared/*`, which is outside the inventory's governed set. That is what 3.6 is for, which makes 3.6 - not 3.5 - the step that moves the exit metric.
> - **All 146 "barrel" edges are to `models/index.js`; there are zero service-barrel imports left.** 3.1a reported 131 and called them "load-time coupling with no domain meaning", which is still true, but the number has grown with the splits and none of them is a domain boundary. They are a legitimate cleanup - a service loading all 142 models to use one - and a poor use of the remaining Phase 3 effort, because draining them cannot move the exit criterion. They stay deferred, exactly as 3.2 deferred them.
>
> Grouping the 25 cross-domain edges **by target**, because a shared kernel is defined by what it absorbs:
>
> | target | edges | modules reached | kernel that would absorb it |
> |---|---|---|---|
> | notifications | **7** | `fcm.notification.service` (6), `email.config.service` (1) | `shared/notifications` - **in 3.6** |
> | orders | 6 | `subscriber.service` (2), `subscription.service` (2), `cart.item.service`, `orders.service` | **`shared/subscription` - not in 3.6** |
> | restaurant | 6 | `restaurant.service` (5), `restaurant.order.review.service` (1) | 5 are the facade itself; **no kernel** |
> | identity | 3 | `driver.service`, `otp.verification.service`, `otp.web.verification.model` | `shared/auth` covers 2 of 3 - **in 3.6** |
> | wallet | 2 | `restaurant.cash.in.hand.service`, `deliveryman.cash.in.hand.service` | `shared/wallet` - **in 3.6** |
> | catalog | 1 | `food.order.review.service` | **`shared/review` - not in 3.6** |
>
> So of 3.6's six named kernels, **`payments`, `storage` and `settings` absorb zero cross-domain edges** - they are domain-internal refactors that cannot move the exit criterion - while the two kernels that would finish the job, `subscription`/billing for 4 edges and `review` for 2, are **not in the plan at all**. Corrected 3.6: **`shared/notifications` (7), `shared/subscription` (4), `shared/auth` (2), `shared/review` (2), `shared/wallet` (2)** - 17 of 25. The remaining 8 are genuine couplings to keep in the allowlist: 5 into the `restaurant` facade, `orders -> driver.service`, `identity -> cart.item.service`, and 2 into the `orders` facade.
>
> I also checked whether some of the 25 are **misclassification** rather than real violations, since that would be far cheaper than extracting anything. `subscriber.service` and `subscription.service` are filed under `orders` by an **explicit prefix in `DOMAINS`**, not by accident, and they sit alongside `user.purchased.tiffin.subscription` - so the grouping is defensible. Reclassifying them to make the count look better would be exactly the flattering metric this work has avoided, so they stay as they are.
>
> **Recommended order: `shared/notifications` first** - 7 of 25 edges from a single file, already named in the plan, and a genuinely shared concern, since push notifications are called by settings, restaurant and orders alike. Then `shared/subscription` and `shared/review`, which the plan is missing. 3.5 and 3.7 are worth doing, but neither moves the exit criterion, so they follow rather than lead.
>
> **3.6b - 3.6e done. All five corrected kernels extracted. Cross-domain edges 25 -> 8, and the exit criterion is in reach.** Each was a separate commit, each gated: `shared/subscription` 18 -> 14 (`subscriber.service`, `subscription.service`), `shared/wallet` 14 -> 12 (`restaurant.cash.in.hand.service`, `deliveryman.cash.in.hand.service`), `shared/review` and `shared/auth` 12 -> 8 (`food.order.review.service`, `restaurant.order.review.service`, `otp.verification.service`, `otp.web.verification.model`).
>
> The first two were done by hand and each one had to be debugged, so from the third the extraction is **data plus one tool**: a kernel is a small JSON file in `tools/kernels/` and `tools/extract-kernel.js` does the move. That is the same lesson 3.3/3.4 taught about the service splits, arriving again one phase later.
>
> **Bugs the tool had to absorb, each of which a one-off script would have re-introduced for the next kernel:**
> - **Sibling requires.** Fixing only `require('../...')` left `restaurant.cash.in.hand.service.js` pointing at `./restaurant.service`, which after the move resolves inside the kernel directory where nothing lives. The kernel index would not load at all.
> - **Dotted filenames.** Deriving a local name by stripping `.js` produced `const restaurant.cash.in.handService`, a syntax error. The same class of bug twice, in two tools.
> - **A specifier shape it had not seen before.** The rewrite handled `require('./x')` and missed `require('../models/otp.web.verification.model')`, leaving a dangling require. **19 test files failed on MODULE_NOT_FOUND** while the barrel-to-facade test still passed - a shape no assertion was watching, because the inventory was happy and the app could not boot. The rewrite now matches the specifier's basename and rebuilds the path, and the tool **verifies the move by resolving every remaining specifier** rather than assuming it. The first version of that check matched basenames instead, and flagged the *correctly* rewired importers: verifying something other than what could go wrong is its own kind of green.
> - **Extensionless.** The rebuilt specifiers carried `.js`, and `readBarrelExports` appends `.js` itself, so it resolved `...service.js.js`, matched nothing, and four names dropped silently out of their facades.
> - **A flattened kernel index is not equivalent to a binding.** `restaurant.cash.in.hand` and `deliveryman.cash.in.hand` both export `saveCashInHand` and `clearCashInHand`, so `...restaurant, ...deliveryman` published the deliveryman functions under the restaurant's names and reported nothing. Kernels publish module bindings, the shape `services/index.js` uses, and the tool refuses to generate an index with two members sharing a name.
>
> **Two structural fixes the extractions forced:**
> - **A model inside a kernel needs a default import in the facade, not a namespace one.** `renderFacade` decided by path prefix and a `shared/` member fell outside both groups, so `auth`'s model would have been re-exported as a namespace wrapper. The test is now path OR filename (`*.model.js`) - filename alone would have silently flipped `models/food.order.review.js`, the one model not named that way.
> - **The inventory's OVERRIDES are keyed by path, so extraction silently dropped the classification.** `otp.verification.service` and `otp.web.verification.model` matched no filename prefix and became `unclassified` the moment they moved, which fails the inventory and drops the name out of its facade. Overrides are now keyed by basename as well, which survives a move. Both spellings are kept for files that are not moving, because renaming a key is only equivalent when the basename is unique: the first attempt at that edit dropped `guest.user.info` out of the identity facade, and `domain:check` is what caught it.
>
> `shared/review` has **no single home domain** - a food review is `catalog`, a restaurant review is `restaurant`, because it is one idea with two implementations rather than two halves of a domain. Each member keeps its own and the exemption is path-based, so both edges cleared without inventing a thirteenth domain.
>
> **The 8 that remain are the genuine couplings, and no kernel can remove them:** four into the `restaurant` facade (`order.settings`, `orders.assign`, `orders.status`, `cron.job.scheduler`), `orders -> driver.service`, `identity -> cart.item.service` via `coupon.service`, `settings -> orders` via the cron scheduler, and `wallet -> restaurant`, where the cash-in-hand ledger credits the restaurant wallet and so needs `restaurant.service`. Each is a real dependency on real data, so the allowlist is the right home for them. **The exit criterion should therefore be restated**: not "`grep` shows zero cross-domain imports", but "every cross-domain import is either gone or allowlisted with a reason" - and the rule enforces that today, which is the part of the criterion that was actually achievable. 3.5 and 3.7 are worth doing, but neither moves the exit criterion, so they follow rather than lead.

> **3.6a done - `shared/notifications` extracted. Cross-domain edges 25 -> 18, from two files.** `fcm.notification.service.js` (4,184 lines) and `email.config.service.js` (1,694 lines) moved to `src/shared/notifications/`, with a kernel `index.js` re-exporting all 55 names. Seven importers rewired - one line each, and `services/index.js` still publishes both names, so no consumer of the barrel changes.
>
> **A shared kernel needs two things, and getting only one is silently useless:**
> - **A home domain, so the barrel-to-facade mapping still lines up.** A kernel is still classified, into the domain its directory is named for. Without that, `unclassified` would grow and the generated facades would silently stop exporting `fcmNotificationService` and `emailConfigService` - the test caught exactly that.
> - **An import exemption, or the move changes nothing.** The kernel keeps `notifications` as its domain, so without an exemption the edges would simply be re-measured as `orders -> notifications`. A shared kernel is cross-cutting *by construction* - that is why it was pulled out - so `orders -> shared/notifications` is the intended shape. The exemption lives in `build()` and, mirrored, in the lint rule, so the measurement and the enforcement cannot drift.
>
> The exemption is **one-directional**: a kernel may be imported by anyone, but it may not itself reach into a business domain - the direction a shared kernel rots in. Both directions have a probe test, and I confirmed removing any one of the three exemptions (lint rule, inventory, home-domain classification) turns the suite red. An exemption nothing tests is an exemption that quietly stops applying.
>
> **Two bugs the move exposed, both in code that had been correct for three steps:**
> - **`readBarrelExports` only matched `require('./x')`** and rebuilt the key as `services/x.js`. The barrel wrote `require("../shared/notifications/...")`, which the pattern did not match at all, so the two names vanished from every facade. It now resolves the specifier against the barrel's own directory and keys by the SRC-relative path, which is how `nodes` is keyed.
> - **`renderFacade` grouped members as services vs models**, and a `shared/` member fell into neither, so it was dropped silently. The grouping is now "namespace import" vs "default import" - a kernel is a service, so it takes the namespace form. Three groupings were never the distinction; the import shape was.
>
> **Moving legacy code changed its lint config bucket.** `src/services/**` carries `'no-useless-assignment': 'off'`, a pre-existing accommodation for the service layer. The moment the two files changed directory they surfaced **81** errors, none of them caused by the move. The exemption now covers `src/shared/**` too, with the reasoning recorded in the config: the exemption follows the code, and it is not a blanket waiver for new shared code. Shared files also joined the boundary rule, which is why the one-directional check above is enforceable.
>
> Line endings needed care: the moved files must be **pure LF** (`git diff --check` reads a CR as trailing whitespace on an added line) while the eight rewired files must **keep whatever HEAD had** - CRLF headers on the legacy services, LF on the buckets generated in 3.4. Matching each file to its committed form keeps the diff at one line per file. A whole-file rewrite through PowerShell also silently took an unrelated trailing blank line with it, so the rewiring is a substring replace with a per-file byte delta.
>
> **183 tests / 23 files**, both manifests PARITY OK, `domain:check` in sync, allowlist **18 edges**, lint 0 errors / 6 warnings, `tsc` clean, `git diff --check` clean.

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
