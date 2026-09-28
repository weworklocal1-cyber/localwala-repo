# Razorpay Native SDK Migration — Production Assessment & Implementation Plan

## Executive Summary

The current Razorpay integration uses a **server-side web redirect flow** loaded inside a Flutter WebView. This is a legacy web pattern forced into a mobile app. It works functionally but causes measurable user drop-off at checkout, generates avoidable support tickets, and is not how any modern Indian consumer app handles payments.

This document lays out the exact changes required to move to Razorpay's native Flutter SDK, what is affected, what is not, and the security requirements for the backend verification endpoint.

---

## Current State (Pre-Migration)

### Architecture

```
Flutter App (WebView)
  → GET /v1/public/payments/makePayment/:id
  → Backend calls Razorpay: POST /v1/payment_links/
  → Backend receives short_url
  → Backend: res.redirect(SEE_OTHER, short_url)
  → WebView loads razorpay.com hosted checkout page
  → User pays on Razorpay's page
  → Razorpay redirects to: /v1/public/payments/paid_success/:id?razorpay_payment_id=...
  → Backend verifies: GET /v1/payments/{payment_id} → checks status === 'captured'
  → Backend updates DB, redirects to /payments/payment_processed
  → Flutter WebView detects URL change → shows success modal
```

### Key Characteristics

- No Razorpay Flutter SDK in the app (`pubspec.yaml` contains only `webview_flutter`)
- All payment UI is hosted on Razorpay's domain, not inside the app
- Backend handles the entire payment orchestration via HTTP redirects
- Verification reads from `req.query` (URL query parameters from the redirect)
- Success/failure detection is based on WebView URL monitoring

### Problems

1. **UX conversion loss:** Blank WebView → external domain load → redirect back is a multi-second sequence with visible gaps. Industry data shows 2–5x higher abandonment vs native SDK checkout.
2. **WebView fragility:** URL-based callback detection is sensitive to WebView behavior across OS versions, network conditions, and Razorpay page changes.
3. **No native UPI/GPay/PhonePe surface:** These options exist inside Razorpay's hosted page but are not exposed as native in-app options. Users cannot see or select them from within the app's own UI flow.
4. **Not industry standard:** Every major Indian consumer app (Swiggy, Zomato, BigBasket, Zepto) uses native SDK checkout or UPI deep links. The current web redirect approach is a web-era pattern retained in the mobile app.

---

## Target State (Post-Migration)

### Architecture

```
Flutter App
  → POST /v1/users/payments/initiate/  (creates payment intent in DB)
  → GET /v1/public/payments/makePayment/:id
  → Backend calls Razorpay: POST /v1/orders/
  → Backend returns JSON: { order_id, key, amount, currency, name }
  → Flutter calls Razorpay SDK: razorpay.open(options)
  → Native bottom sheet opens in-app (cards, UPI, GPay, PhonePe, net banking)
  → User pays → Razorpay SDK fires onPaymentSuccess callback to Flutter
  → Flutter POSTs { razorpay_payment_id, razorpay_order_id, razorpay_signature }
    to backend verification endpoint
  → Backend: HMAC-SHA256 signature verification + GET /v1/payments/{id} status check + order_id match
  → Backend updates DB, returns success
  → Flutter shows success modal (same modal, no change)
```

### Key Characteristics

- Razorpay Flutter SDK renders the checkout UI as a native bottom sheet inside the app
- Backend creates a Razorpay Order (not Payment Link) and returns JSON instead of redirecting
- Flutter SDK sends payment callback data in the POST request body
- Backend verifies using HMAC signature + API status check + order_id match
- UPI, GPay, PhonePe all appear as tappable options inside the native sheet

---

## Backend Route Change

**File:** `API/src/routes/v1/public.route.js`

The `paid_success` endpoint must accept both GET (legacy browser redirect from other gateways) and POST (new SDK flow from Flutter):

```js
router.route('/payments/paid_success/:id')
  .get(PaymentInitiationController.successPayment)
  .post(PaymentInitiationController.successPayment);
```

Keeping both methods preserves backward compatibility for other gateways (Stripe, PayPal, etc.) that still use browser redirects through the same endpoint.

---

## Backend Controller Changes

**File:** `API/src/controllers/payment.initiation.controller.js`

Two functions change: `makePayment()` and `successPayment()`. Add `const crypto = require('crypto');` at the top of the file.

### `makePayment()` — Razorpay branch

**Before:** Calls `POST /v1/payment_links/`, gets `short_url`, does `res.redirect(SEE_OTHER, short_url)`.

**After:** Calls `POST /v1/orders/`, gets `order.id`, returns JSON:

```js
} else if (payData !== null && payData.slug === 'razorpay') {
  if (payData !== null && payData.credentials !== null && payData.credentials.key !== null) {
    try {
      const orderData = {
        amount: Math.round(parseFloat(amountToPay) * 100),
        currency: 'INR',
        receipt: req.params.id,
        payment_capture: 1,
      };
      const razorpayOrder = await superagent
        .post('https://api.razorpay.com/v1/orders')
        .auth(payData.credentials.key, payData.credentials.secret)
        .send(orderData);
      if (razorpayOrder !== null && razorpayOrder.body !== null && razorpayOrder.body.id !== null) {
        res.status(200).json({
          order_id: razorpayOrder.body.id,
          key: payData.credentials.key,
          amount: razorpayOrder.body.amount,
          currency: razorpayOrder.body.currency,
          name: appFullName,
        });
      } else {
        res.status(400).json({ success: false, message: 'Failed to create order' });
      }
    } catch (error) {
      res.status(400).json({ success: false, message: 'Order creation failed' });
    }
  } else {
    res.status(400).json({ success: false, message: 'Missing Razorpay credentials' });
  }
}
```

### `successPayment()` — Razorpay branch

**Before:** Handles only GET requests from browser redirect. Reads `req.query.razorpay_payment_id`. Verifies via `GET /v1/payments/{id}` and checks `status === 'captured'`. Redirects to `redirectURL` or `failedCallBackURL`.

**After:** Handles both POST (SDK flow) and GET (legacy browser redirect flow).

```js
// successPayment() - Razorpay branch
const payData = paymentInfo.payments.payments;

if (req.method === 'POST') {
  // SDK flow: Flutter app sends payment details in request body
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

  // 1. HMAC-SHA256 signature verification
  const generatedSignature = crypto
    .createHmac('sha256', payData.credentials.secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (razorpay_signature !== generatedSignature) {
    return res.status(400).json({ success: false, message: 'Invalid signature' });
  }

  // 2. Confirm capture status and order match via Razorpay API
  try {
    const verifyLink = `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`;
    const verifyResponse = await superagent
      .get(verifyLink)
      .auth(payData.credentials.key, payData.credentials.secret);

    if (!verifyResponse.body || verifyResponse.body.status !== 'captured') {
      return res.status(400).json({ success: false, message: 'Payment not captured' });
    }

    if (verifyResponse.body.order_id !== razorpay_order_id) {
      return res.status(400).json({ success: false, message: 'Order mismatch' });
    }

    // 3. All checks passed — mark paid and run business logic
    await paymentInitiationService.updatePaymentsInfo(req.params.id, {
      status: 'paid',
      payResponse: verifyResponse.body,
    });

    if (paymentInfo.payments.paymentFrom === 'wallet') {
      // ... existing wallet credit logic (unchanged)
    } else if (paymentInfo.payments.paymentFrom === 'order') {
      // ... existing order creation logic (unchanged)
    } else if (paymentInfo.payments.paymentFrom === 'tiffinsubscription') {
      // ... existing subscription logic (unchanged)
    } else if (paymentInfo.payments.paymentFrom === 'booking') {
      // ... existing booking logic (unchanged)
    } else if (paymentInfo.payments.paymentFrom === 'restaurant_register') {
      // ... existing restaurant register logic (unchanged)
    } else if (paymentInfo.payments.paymentFrom === 'renew_subscription') {
      await subscriberService.renewSubscription(paymentInfo.payments.subscribeId);
    }

    return res.status(200).json({ success: true, message: 'Payment verified' });

  } catch (error) {
    return res.status(400).json({ success: false, message: 'Verification failed' });
  }

} else {
  // Legacy GET flow (browser redirect) — existing logic, unchanged
  const queryItems = pick(req.query, ['razorpay_payment_id']);
  if (queryItems && queryItems.razorpay_payment_id) {
    try {
      const captureLink = `https://api.razorpay.com/v1/payments/${queryItems.razorpay_payment_id}`;
      const razorPayData = await superagent
        .get(captureLink)
        .auth(payData.credentials.key, payData.credentials.secret);

      if (razorPayData.body && razorPayData.body.status === 'captured') {
        await paymentInitiationService.updatePaymentsInfo(req.params.id, {
          status: 'paid',
          payResponse: razorPayData.body,
        });
        // ... all existing business logic unchanged
        // ... res.redirect(SEE_OTHER, redirectURL);
      } else {
        // ... res.redirect(SEE_OTHER, failedCallBackURL);
      }
    } catch (error) {
      // ... res.redirect(SEE_OTHER, failedCallBackURL);
    }
  } else {
    // ... res.redirect(SEE_OTHER, failedCallBackURL);
  }
}
```

The `else` block preserves the existing GET/redirect logic exactly as it runs today. Other gateways (Stripe, PayPal, Paystack, etc.) have their own separate branches outside this Razorpay block and are unaffected.

---

## Scope of Changes

### Files That Change

| # | Layer | File | Change |
|---|---|---|---|
| 1 | Backend | `API/src/controllers/payment.initiation.controller.js` | Replace Razorpay branch in `makePayment()`: call `POST /v1/orders/`, return JSON. Rewrite Razorpay branch in `successPayment()`: `req.method === 'POST'` reads `req.body` with HMAC + order_id/amount verification; `req.method === 'GET'` preserves existing redirect logic. Add `crypto` require at top. |
| 2 | Backend | `API/src/routes/v1/public.route.js` | Add `.post()` handler alongside existing `.get()` for `/payments/paid_success/:id` |
| 3 | Flutter | `Customer_app/pubspec.yaml` | Add `razorpay_flutter: ^2.0.0` dependency |
| 4 | Flutter | `Customer_app/lib/main.dart` | Initialize Razorpay SDK instance, register `EVENT_PAYMENT_SUCCESS`, `EVENT_PAYMENT_ERROR`, `EVENT_EXTERNAL_WALLET` listeners |
| 5 | Flutter | `Customer_app/lib/app/presentation/pages/cart/make_payments/make_payments_view.dart` | Remove WebView code. Add Razorpay SDK open call + success/error/external-wallet handlers. |
| 6 | Flutter | `Customer_app/lib/app/presentation/pages/account/wallet/add_wallet_money/make_wallet_payments/make_wallet_payments_view.dart` | Same as above |
| 7 | Flutter | `Customer_app/lib/app/presentation/pages/dining/restaurant_pre_booking_table/make_dining_booking_payments/make_dining_booking_payments_view.dart` | Same as above |
| 8 | Flutter | `Customer_app/lib/app/presentation/pages/home/food_subcriptions_info/make_payments_subscription_package/make_payments_subscription_package_view.dart` | Same as above |
| 9 | Flutter | `Customer_app/lib/app/presentation/pages/account/restaurant_register_request/restaurant_register_request_make_payment/restaurant_register_request_make_payment_view.dart` | Same as above |

**Total: 9 files across 2 layers (backend: 2 files, Flutter: 7 files)**

### Files That Do Not Change

| Category | Files |
|---|---|
| Admin panel | All 10 gateway config components under `Admin_panel/.../payment-settings/config/` |
| Backend models | `payment.initiation.model.js`, `payment.config.model.js` |
| Backend services | `payment.initiation.service.js`, `payment.config.service.js`, `wallet.service.js`, `transaction.service.js` |
| Backend routes | `user.route.js`, `admin.route.js` — endpoint paths unchanged |
| Backend validations | `payment.initiation.validation.js`, `payment.config.validation.js` |
| Other gateway branches in controller | All `else if` blocks for stripe, paypal, paystack, instamojo, flutterwave, cashfree, xendit, paytm, cod |
| Flutter wallet repository | `wallet_repository.dart` — same API calls |
| Flutter API endpoints config | `api_endpoints.dart` — same URL strings |
| Flutter modals | `payment_success_modal_view.dart` — same screen shown on success |
| Flutter blocs | Business logic for handling success state is unchanged |

---

## Security Requirements for Backend Verification

The `successPayment()` Razorpay POST branch must implement all three checks before marking any payment as paid:

### 1. HMAC-SHA256 Signature Verification (Mandatory)

Razorpay computes `signature = HMAC-SHA256(key_secret, order_id + "|" + payment_id)`. The backend must recompute and compare:

```js
const generatedSignature = crypto
  .createHmac('sha256', payData.credentials.secret)
  .update(`${razorpay_order_id}|${razorpay_payment_id}`)
  .digest('hex');

if (razorpay_signature !== generatedSignature) {
  return res.status(400).json({ success: false, message: 'Invalid signature' });
}
```

This cryptographically binds the payment to the specific order. Without this check, an attacker could POST a valid `payment_id` from one order against a different order's success endpoint.

### 2. Capture Status Confirmation (Mandatory)

After signature passes, call Razorpay's API to confirm the payment is actually captured:

```js
const verifyResponse = await superagent
  .get(`https://api.razorpay.com/v1/payments/${razorpay_payment_id}`)
  .auth(payData.credentials.key, payData.credentials.secret);

if (verifyResponse.body.status !== 'captured') {
  return res.status(400).json({ success: false, message: 'Payment not captured' });
}
```

### 3. Order ID Match (Mandatory)

Confirm the captured payment belongs to the order that was created for this transaction:

```js
if (verifyResponse.body.order_id !== razorpay_order_id) {
  return res.status(400).json({ success: false, message: 'Order mismatch' });
}
```

The `order_id` check protects against IDOR-style attacks. All three checks must pass before calling `updatePaymentsInfo`.

### What the Flutter App Sends

The Razorpay SDK `onPaymentSuccess` callback provides:
- `response.paymentId` → mapped to `razorpay_payment_id`
- `response.orderId` → mapped to `razorpay_order_id`
- `response.signature` → mapped to `razorpay_signature`

These three values must be sent in the **POST request body** to the backend verification endpoint.

---

## What the User Sees After Migration

| Payment Method | Behavior |
|---|---|
| Cards | Card form fields appear inside native bottom sheet |
| Net Banking | Bank list inside bottom sheet |
| UPI | UPI ID input + QR inside bottom sheet |
| Google Pay | Tapping opens GPay app briefly, returns to app on success |
| PhonePe | Tapping opens PhonePe app briefly, returns to app on success |
| Wallets | Razorpay wallet options inside bottom sheet |

All of the above are surfaced by the Razorpay SDK automatically. No separate PhonePe or GPay integration code is needed — they appear as options within the Razorpay checkout sheet.

---

## Backward Compatibility

- The `makePayment()` endpoint path (`GET /v1/public/payments/makePayment/:id`) does not change
- The `paid_success` endpoint now accepts both GET and POST on the same path — existing browser redirects from other gateways continue to work
- The old web redirect flow for other gateways (Stripe, PayPal, etc.) is untouched
- Admin panel Razorpay config entry (key, key_secret, environment, status) is unchanged
- No database migration is required
- The Flutter app depends on the new JSON response format from `makePayment()`, so the backend must be deployed before the app store update

---

## Known Gap (v2 Hardening, Not a Blocker)

This migration does **not** implement webhook handling or idempotency. If the app crashes or loses connection after Razorpay captures payment but before the POST reaches the backend, that order will silently remain unpaid despite money having moved. This requires manual reconciliation against the Razorpay dashboard until a webhook endpoint is added in a future release.

---

## Implementation Order

```
1. Backend: deploy controller and route changes (Backend files: 2)
2. Flutter: add dependency, update 5 payment screens, initialize SDK (Flutter files: 7)
3. QA: test all 5 payment screens, verify gateway isolation, test signature failure case
```

No parallel tracks — backend must go first because the Flutter app depends on the new JSON response format from `makePayment()`.
