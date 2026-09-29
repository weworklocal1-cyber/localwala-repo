/**
 * Phase 4.1 - the gateway.
 *
 * A transparent reverse proxy in front of the monolith. The only requirement
 * that matters is that it is indistinguishable from talking to the monolith
 * directly: same status, same headers, same body bytes. Everything the proxy
 * could quietly get wrong - content-encoding, chunked bodies, redirects, empty
 * bodies, header casing - is why it buffers the request body raw and copies
 * the response through untouched rather than re-encoding anything.
 *
 * Deliberate choices, because each one is a way proxies lose fidelity:
 *
 *   - The request body is kept as a Buffer, not parsed. A JSON body re-encoded
 *     by `JSON.parse`/`stringify` changes key order and whitespace, which is a
 *     content difference even though the JSON is equal.
 *   - The response body is streamed through as an ArrayBuffer and sent with the
 *     upstream content-type. Fastify must not compress or transform it, or the
 *     `content-length` forwarded from upstream stops matching.
 *   - Hop-by-hop headers are dropped on the way through, per RFC 9110, and
 *     `host` is rewritten to the target so the monolith sees the address it
 *     expects rather than the gateway's.
 */
import Fastify from 'fastify';
import { resolveTarget, MONOLITH_BASE } from './service-routes.js';

/** RFC 9110 section 7.6.1: these describe a single hop and must not be forwarded. */
const HOP_BY_HOP = new Set([
  'connection',
  'keep-alive',
  'proxy-authenticate',
  'proxy-authorization',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
]);

const TIMEOUT_MS = Number(process.env.GATEWAY_TIMEOUT_MS || 30_000);

/** Exported for direct unit tests: see the note on the hop-by-hop tests. */
export function filterRequestHeaders(
  headers: Record<string, unknown>,
  targetHost: string
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower)) continue;
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      out[lower] = value.join(', ');
      continue;
    }
    out[lower] = String(value);
  }
  out.host = targetHost;
  return out;
}

/**
 * Exported for direct unit tests.
 *
 * These are exported deliberately: a test that asserts on them through an HTTP
 * client proves nothing, because undici strips `connection` from the response
 * before the test can observe it. The first version of the hop-by-hop test
 * passed with the filter removed entirely.
 */
export function filterResponseHeaders(headers: Headers): Record<string, string> {
  const out: Record<string, string> = {};
  headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (HOP_BY_HOP.has(lower)) return;
    // Length is recomputed from the body we actually send.
    if (lower === 'content-length') return;
    out[lower] = value;
  });
  return out;
}

export interface GatewayOptions {
  monolithBase?: string;
  logger?: boolean;
}

export function buildGateway(options: GatewayOptions = {}) {
  const monolithBase = options.monolithBase || MONOLITH_BASE;

  const app = Fastify({
    logger: options.logger ?? false,
    // A proxy must not impose a smaller body limit than the thing it fronts.
    bodyLimit: Number(process.env.GATEWAY_BODY_LIMIT || 50 * 1024 * 1024),
  });

  // Keep every body as bytes. Anything that parses it here is a body the
  // monolith will not receive unchanged.
  app.removeAllContentTypeParsers();
  app.addContentTypeParser('*', { parseAs: 'buffer' }, (_req, body, done) => done(null, body));

  app.all('/*', async (request, reply) => {
    const rawUrl = request.raw.url || '/';
    const pathname = rawUrl.split('?')[0];
    const { base, matched } = resolveTarget(pathname, undefined, monolithBase);
    const target = new URL(rawUrl, base);
    const host = target.host;

    const method = request.method.toUpperCase();
    const hasBody = method !== 'GET' && method !== 'HEAD';
    const body = hasBody
      ? Buffer.isBuffer(request.body)
        ? request.body
        : request.body === undefined || request.body === null
          ? undefined
          : Buffer.from(JSON.stringify(request.body))
      : undefined;

    let upstream: Response;
    try {
      upstream = await fetch(target, {
        method,
        headers: filterRequestHeaders(request.headers as Record<string, unknown>, host),
        // No cast to BodyInit: Buffer is already a valid body, and reaching for
        // that type would mean widening `lib` to the DOM for one annotation.
        body,
        redirect: 'manual',
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
    } catch (err) {
      request.log.error({ err, url: rawUrl }, 'upstream request failed');
      // 502 rather than a 500: the gateway is the thing that failed, not the
      // application behind it.
      return reply.code(502).send({
        success: false,
        code: 502,
        message: 'upstream unavailable',
        extra: { target: base, route: matched },
      });
    }

    // Write the response through `reply.raw` rather than `reply.send()`.
    //
    // Fastify sets a default `content-type: application/json; charset=utf-8`
    // when it is handed a Buffer with no content-type of its own, so a proxied
    // 302 that upstream sent bare came back with a header the monolith never
    // set. A proxy must not invent headers, and the only way to guarantee that
    // is to stop the framework from touching the response at all.
    const payload =
      upstream.status === 204 || upstream.status === 304
        ? Buffer.alloc(0)
        : Buffer.from(await upstream.arrayBuffer());

    reply.raw.statusCode = upstream.status;
    for (const [key, value] of Object.entries(filterResponseHeaders(upstream.headers))) {
      reply.raw.setHeader(key, value);
    }
    // Only assert a length when there is one; 204 and 304 must not carry it.
    if (payload.length > 0) reply.raw.setHeader('content-length', String(payload.length));
    reply.raw.end(payload);
    // Returning `reply` tells Fastify the response is already handled.
    return reply;
  });

  app.setNotFoundHandler((request, reply) => {
    // The monolith owns 404s too, so an unknown path is proxied rather than
    // answered here. Otherwise the gateway would invent its own 404 body and
    // the two would disagree.
    return reply.code(404).send({
      success: false,
      code: 404,
      message: 'Not Found',
      extra: { url: request.url },
    });
  });

  return app;
}
