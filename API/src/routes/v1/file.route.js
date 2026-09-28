/**
 * LocalWala – Local Commerce & Delivery Platform
 * (NodeJS, MongoDB, Angular & Flutter)
 *
 * Copyright © 2026 WeWorkLocal Private Limited
 * https://weworklocal.in/
 *
 * WeWorkLocal Private Limited
 *
 * This source code is confidential.
 * Unauthorized copying, redistribution, resale, publication,
 * modification, or use of this source code in any public or
 * commercial repository is strictly prohibited.
 *
 * Ownership Fingerprint:
 * LWL|WWL|2026|LOCALWALA|NODE
 *
 * Phase 2.9 - converted route file. Declarations are now Fastify's
 * `route({ method, url, preHandler, handler })`, replayed onto both servers
 * by src/routes/routeRegistrar.js.
 */

const appAuth = require('../../middlewares/appAuth');
const webAuth = require('../../middlewares/webAuth');
const FileController = require('../../controllers/file.controller');

module.exports.register = function register(route) {
  route({
    method: 'POST',
    url: '/uploadImage',
    preHandler: [appAuth('uploadImage')],
    handler: FileController.uploadImage,
  });
  route({
    method: 'POST',
    url: '/web_upload_image',
    preHandler: [webAuth('uploadImage')],
    handler: FileController.uploadImage,
  });
};
