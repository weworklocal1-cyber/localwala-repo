/**
 * LocalWala - Local Commerce & Delivery Platform
 * (NodeJS, MongoDB, Angular & Flutter)
 *
 * Copyright (c) 2026 WeWorkLocal Private Limited
 * https://weworklocal.in/
 *
 * WeWorkLocal Private Limited
 * This source code is confidential.
 *
 * Ownership Fingerprint:
 * LWL|WWL|2026|LOCALWALA|NODE
 *
 * Phase 3.6b: the subscription shared kernel.
 *
 * Vendor subscriptions are bought by restaurants, renewed on a schedule and
 * read by the restaurant's own export and identity buckets - which is why
 * "subscriber" sat in the orders domain and produced four cross-domain edges
 * from two restaurant files. The code has nothing to do with the order
 * lifecycle; it is a subscription ledger, so it belongs in a kernel.
 *
 * Its home domain stays `orders` (the filename prefixes still resolve there),
 * so the services barrel and the generated facades are unchanged. Only the
 * import is exempt - see tools/domain-inventory.js.
 */
const subscriberService = require('./subscriber.service.js');
const subscriptionService = require('./subscription.service.js');

module.exports = {
  ...subscriberService,
  ...subscriptionService,
};
