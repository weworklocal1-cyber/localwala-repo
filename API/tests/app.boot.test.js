import { describe, it, expect } from 'vitest';
import request from 'supertest';

// The boot-time cron side effect is neutralised in tests/setup.js.
const app = (await import('../src/app')).default;

describe('application boot', () => {
  it('imports src/app.js without throwing', () => {
    expect(app).toBeTruthy();
    expect(typeof app.listen).toBe('function');
  });

  it('serves the health page at /', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('LocalWala API');
    // health page reflects MongoDB connectivity - either state is valid
    expect(res.text).toMatch(/API is Working Fine!|API is Down!/);
  });

  it('returns the JSON 404 contract for an unknown API path', async () => {
    const res = await request(app).get('/v1/definitely-not-a-route');
    expect(res.status).toBe(404);
    expect(res.body).toMatchObject({
      code: expect.any(Number),
      message: 'Not found',
    });
  });

  it('does not expose X-Powered-By', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });

  it('applies security headers', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-frame-options']).toBe('DENY');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
});
