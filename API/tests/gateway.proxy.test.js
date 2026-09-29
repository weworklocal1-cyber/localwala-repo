/**
 * Phase 4.1 - the gateway must be indistinguishable from the monolith.
 *
 * A proxy is the first thing in this project that changes the request path, so
 * this is the gate that matters. The claim being tested is not "the gateway
 * works" but "a client cannot tell the difference", which is a much stronger
 * and more falsifiable claim: for the same request, the two servers must agree
 * on status, on the headers a client can observe, and on the body bytes.
 *
 * Every case here is a way a proxy silently loses fidelity. An empty body, a
 * 500, a redirect, a query string, a path that does not exist, and a POST with
 * a JSON body that must arrive with its bytes intact - because a body
 * re-serialised through JSON.parse/stringify is equal as JSON and different as
 * bytes, which is exactly the kind of difference nobody notices until a
 * signature is computed over it.
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import { buildGateway } from '../apps/gateway/src/server.js';
import { resolveTarget } from '../apps/gateway/src/service-routes.js';
import { filterRequestHeaders, filterResponseHeaders } from '../apps/gateway/src/server.js';

const monolith = Fastify({ logger: false });
monolith.removeAllContentTypeParsers();
monolith.addContentTypeParser('*', { parseAs: 'buffer' }, (_r, body, done) => done(null, body));

// A stand-in for the monolith: the gateway's job is to relay whatever this
// says, byte for byte. Using the real app here would couple this gate to the
// database, and a failure would not say whether the gateway or the app broke.
monolith.all('/*', async (request, reply) => {
  const url = request.raw.url || '/';
  // A hop-by-hop header, set deliberately. RFC 9110 section 7.6.1 says these
  // describe a single hop and must not be forwarded, and the only way to know
  // the gateway honours that is for the upstream to send one.
  reply.header('connection', 'keep-alive');
  reply.header('x-custom', 'kept');
  if (url.startsWith('/v1/missing')) {
    return reply.code(404).send({ success: false, code: 404, message: 'Not Found' });
  }
  if (url.startsWith('/v1/boom')) {
    return reply.code(500).send({ success: false, code: 500, message: 'kaboom' });
  }
  if (url.startsWith('/v1/redirect')) {
    return reply.redirect('/v1/elsewhere', 302);
  }
  if (url.startsWith('/v1/empty')) {
    return reply.code(204).send();
  }
  if (url.startsWith('/v1/echo')) {
    return reply.code(200).header('content-type', 'application/json').send({
      method: request.method,
      url,
      query: request.query,
      body: request.body ? request.body.toString('utf8') : null,
    });
  }
  return reply.code(200).header('content-type', 'text/plain').send(`plain:${url}`);
});

let gateway;
let monolithUrl;
let gatewayUrl;

/** Header names a client can observe and that must survive the proxy. */
const OBSERVABLE = ['content-type', 'location', 'x-custom', 'cache-control'];

async function call(base, url, options = {}) {
  const res = await fetch(new URL(url, base), {
    redirect: 'manual',
    ...options,
  });
  return {
    status: res.status,
    headers: Object.fromEntries(
      OBSERVABLE.filter((h) => res.headers.has(h)).map((h) => [h, res.headers.get(h)])
    ),
    body: Buffer.from(await res.arrayBuffer()),
  };
}

beforeAll(async () => {
  await monolith.listen({ port: 0, host: '127.0.0.1' });
  monolithUrl = `http://127.0.0.1:${monolith.server.address().port}`;
  gateway = buildGateway({ monolithBase: monolithUrl, logger: false });
  await gateway.listen({ port: 0, host: '127.0.0.1' });
  gatewayUrl = `http://127.0.0.1:${gateway.server.address().port}`;
});

afterAll(async () => {
  await gateway?.close();
  await monolith.close();
});

describe('Phase 4.1 - the gateway is transparent', () => {
  const cases = [
    { name: 'a plain GET', url: '/v1/plain', options: {} },
    { name: 'a path with query parameters', url: '/v1/echo?a=1&b=two&empty=', options: {} },
    { name: 'a 404 from the monolith', url: '/v1/missing/thing', options: {} },
    { name: 'a 500 from the monolith', url: '/v1/boom', options: {} },
    { name: 'a 302 redirect', url: '/v1/redirect', options: {} },
    { name: 'a 204 with no body', url: '/v1/empty', options: {} },
    { name: 'an unknown path', url: '/nothing/here', options: {} },
    {
      name: 'a POST with a JSON body',
      url: '/v1/echo',
      options: {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ b: 2, a: 1, nested: { z: [1, 2] } }),
      },
    },
    {
      name: 'a POST with a text body',
      url: '/v1/echo',
      options: {
        method: 'POST',
        headers: { 'content-type': 'text/plain' },
        body: '  spaced   text  ',
      },
    },
    {
      name: 'a PUT with a query string',
      url: '/v1/echo?id=7',
      options: { method: 'PUT', headers: { 'content-type': 'application/json' }, body: '{"x":1}' },
    },
    { name: 'a DELETE', url: '/v1/echo', options: { method: 'DELETE' } },
  ];

  it.each(cases)('agrees with the monolith on $name', async ({ url, options }) => {
    const direct = await call(monolithUrl, url, options);
    const proxied = await call(gatewayUrl, url, options);
    expect(proxied.status, `status for ${url}`).toBe(direct.status);
    expect(proxied.headers, `headers for ${url}`).toEqual(direct.headers);
    expect(
      proxied.body.equals(direct.body),
      `body for ${url}\n  direct:  ${direct.body.toString('utf8').slice(0, 200)}\n  proxied: ${proxied.body.toString('utf8').slice(0, 200)}`
    ).toBe(true);
  });

  it('forwards the request body with its bytes intact', async () => {
    // A body re-serialised through JSON.parse/stringify is equal as JSON and
    // different as bytes. Sending the keys out of order proves the gateway did
    // not parse and re-emit it.
    const raw = '{"zebra":1,"apple":2,"mango":{"nested":3}}';
    const res = await call(gatewayUrl, '/v1/echo', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: raw,
    });
    const echoed = JSON.parse(res.body.toString('utf8')).body;
    expect(echoed).toBe(raw);
  });

  it('reports a bad path in the request URL as-is', async () => {
    const res = await call(gatewayUrl, '/v1/echo?path=%2Fslashy%2F&enc=%20%2B');
    expect(JSON.parse(res.body.toString('utf8')).url).toBe('/v1/echo?path=%2Fslashy%2F&enc=%20%2B');
  });
});

describe('Phase 4.1 - SERVICE_ROUTES decides where a path goes', () => {
  const monolithBase = 'http://monolith:3000';
  const serviceBase = 'http://notifications:3010';

  it('sends everything to the monolith when the map is empty', () => {
    const t = resolveTarget('/v1/orders/1', [], monolithBase);
    expect(t).toEqual({ base: monolithBase, matched: null });
  });

  it('sends a claimed prefix to its service', () => {
    const routes = [{ prefix: '/v1/notifications', base: serviceBase }];
    expect(resolveTarget('/v1/notifications/send', routes, monolithBase)).toEqual({
      base: serviceBase,
      matched: '/v1/notifications',
    });
  });

  it('matches on whole segments, not string prefixes', () => {
    // The bug this prevents: `/v1/order` claiming `/v1/orders/1`, which would
    // silently route an un-extracted path to a service that does not have it.
    const routes = [{ prefix: '/v1/order', base: serviceBase }];
    expect(resolveTarget('/v1/orders/1', routes, monolithBase).base).toBe(monolithBase);
    expect(resolveTarget('/v1/order/1', routes, monolithBase).base).toBe(serviceBase);
  });

  it('prefers the longest matching prefix', () => {
    const routes = [
      { prefix: '/v1/orders', base: 'http://a' },
      { prefix: '/v1/orders/lookup', base: 'http://b' },
    ];
    expect(resolveTarget('/v1/orders/lookup/x', routes, monolithBase).base).toBe('http://b');
    expect(resolveTarget('/v1/orders/1', routes, monolithBase).base).toBe('http://a');
  });

  it('prefers the longest prefix however the routes are ordered', () => {
    // The shorter prefix is declared LAST on purpose. Longest-match and
    // last-match agree in the test above, so that one cannot tell them apart;
    // here they disagree, and only longest-match gets it right.
    const routes = [
      { prefix: '/v1/orders/lookup', base: 'http://b' },
      { prefix: '/v1/orders', base: 'http://a' },
    ];
    expect(resolveTarget('/v1/orders/lookup/x', routes, monolithBase).base).toBe('http://b');
    expect(resolveTarget('/v1/orders/1', routes, monolithBase).base).toBe('http://a');
  });

  it('does not forward a hop-by-hop header the upstream sent', () => {
    // Asserted on the filter, not through the HTTP client. The first version of
    // this test went through `fetch` and passed with the filter removed
    // entirely, because undici strips `connection` from a response before the
    // test can see it - a test that passes either way is not a test.
    const upstream = new Headers({
      connection: 'keep-alive',
      'keep-alive': 'timeout=5',
      'transfer-encoding': 'chunked',
      'x-custom': 'kept',
      'content-length': '999',
      'content-type': 'text/plain',
    });
    const out = filterResponseHeaders(upstream);
    expect(out.connection).toBeUndefined();
    expect(out['keep-alive']).toBeUndefined();
    expect(out['transfer-encoding']).toBeUndefined();
    expect(out['x-custom']).toBe('kept');
    // content-length is recomputed from the body actually sent, so forwarding
    // upstream's would be a lie whenever the body was transformed.
    expect(out['content-length']).toBeUndefined();
    expect(out['content-type']).toBe('text/plain');
  });

  it('drops hop-by-hop headers in the request direction and rewrites host', () => {
    const out = filterRequestHeaders(
      {
        'content-type': 'application/json',
        Connection: 'keep-alive',
        'Transfer-Encoding': 'chunked',
        'X-Forwarded-For': '1.2.3.4',
      },
      'monolith:3000'
    );
    expect(out.connection).toBeUndefined();
    expect(out['transfer-encoding']).toBeUndefined();
    expect(out['content-type']).toBe('application/json');
    expect(out['x-forwarded-for']).toBe('1.2.3.4');
    // The monolith must see the address it expects, not the gateway's.
    expect(out.host).toBe('monolith:3000');
  });

  it('falls back to the monolith when a service has no base URL', () => {
    // A half-finished extraction must not turn into a 404 in production.
    const routes = [{ prefix: '/v1/notifications', base: '' }];
    expect(resolveTarget('/v1/notifications/send', routes, monolithBase).base).toBe(monolithBase);
  });
});
