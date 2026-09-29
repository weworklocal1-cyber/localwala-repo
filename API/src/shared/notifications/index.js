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
 * Phase 3.6a: the notifications shared kernel.
 *
 * Push (Firebase) and transactional email are called by settings, restaurant
 * and orders alike, which is what made them the single largest source of
 * cross-domain edges: seven of the twenty-five remaining ones, from two files.
 * Pulling them into a kernel under src/shared/ is what lets those edges reach
 * zero, because a shared kernel is exempt as an import *target* - see
 * tools/domain-inventory.js and tools/eslint-rules/domain-boundary.cjs.
 *
 * The kernel keeps `notifications` as its home domain for classification, so
 * the services barrel and the generated facades still line up; only the
 * import is exempt.
 */
const fcmNotificationService = require('./fcm.notification.service');
const emailConfigService = require('./email.config.service');

module.exports = {
  ...fcmNotificationService,
  ...emailConfigService,
};
