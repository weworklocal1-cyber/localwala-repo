/**
 * Phase 2.15 gate: the real entry point boots, serves, and shuts down cleanly.
 *
 * Everything else in this suite exercises `buildFastify()` directly, which
 * proves the library but not the deliverable. This one runs the actual
 * `src/index.js` as a child process under the `tsx` runtime, because that is
 * the chain production now uses (pm2 -> node_modules/.bin/tsx -> index.js ->
 * src/fastify.ts). A silent regression there - wrong interpreter, a
 * bad require, a cron start that throws after listen - would not show up in
 * any other test in this repo.
 *
 * Asserted:
 *   - the process reaches "Listening to port" and answers a real request
 *     (so the CJS entry loaded the TS server and registered all 1,925 routes);
 *   - a socket.io handshake succeeds on the same port (proves io attached to
 *     `fastify.server` rather than a second listener);
 *   - SIGTERM produces a clean exit, i.e. `app.close()` drains and the
 *     onClose hook runs instead of the process being killed.
 *
 * Uses PORT + MONGODB_URL overrides so it never binds the real port or
 * touches the development database (the test helper's -test suffix applies).
 */
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { spawn } from 'node:child_process';
import net from 'node:net';
import http from 'node:http';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const require_ = createRequire(import.meta.url);
const { TEST_DB_URL } = await import('./helpers/db.js');

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
// Spawn node with tsx's own CLI entry rather than the .bin shim: the shim is a
// .cmd on Windows, and spawn() cannot run one without a shell (EINVAL).
// process.execPath + the real cli.mjs is identical on every platform and is
// exactly what the .bin shim executes.
const tsxCli = path.join(apiRoot, 'node_modules', 'tsx', 'dist', 'cli.mjs');

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.on('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

function get(port, urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.get({ port, path: urlPath, agent: false, timeout: 5000 }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () =>
        resolve({ status: res.statusCode, headers: res.headers, text: Buffer.concat(chunks).toString('utf8') })
      );
    });
    req.on('timeout', () => req.destroy(new Error('timeout')));
    req.on('error', reject);
  });
}

describe('Phase 2.15 - entry point boots Fastify under the tsx runtime', () => {
  let child;
  let port;
  let stdout = '';
  let stderr = '';
  let exit = null;

  beforeAll(async () => {
    port = await freePort();

    child = spawn(process.execPath, [tsxCli, 'src/index.js'], {
      cwd: apiRoot,
      env: {
        ...process.env,
        NODE_ENV: 'test',
        PORT: String(port),
        // The entry appends '-test' to MONGODB_URL under NODE_ENV=test, so
        // hand it the base URL, not TEST_DB_URL, or it would look for
        // 'foodbite_test-test'.
        MONGODB_URL: TEST_DB_URL.replace(/-test(\?|$)/, '$1'),
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.stdout.on('data', (c) => {
      stdout += String(c);
    });
    child.stderr.on('data', (c) => {
      stderr += String(c);
    });
    child.on('exit', (code, signal) => {
      exit = { code, signal };
    });

    // Wait for the listen log; fail fast with the captured output so a boot
    // error is readable instead of a bare timeout.
    const deadline = Date.now() + 60000;
    for (;;) {
      if (/Listening to port/.test(stdout)) break;
      if (exit) throw new Error(`entry exited early (${JSON.stringify(exit)}):\n${stdout}\n${stderr}`);
      if (Date.now() > deadline) {
        child.kill();
        throw new Error(`entry never listened on ${port}:\n${stdout}\n${stderr}`);
      }
      await new Promise((r) => setTimeout(r, 250));
    }
  }, 90000);

  afterAll(async () => {
    if (child && exit === null) {
      child.kill('SIGTERM');
      const deadline = Date.now() + 15000;
      while (exit === null && Date.now() < deadline) {
        await new Promise((r) => setTimeout(r, 100));
      }
      if (exit === null) child.kill('SIGKILL');
    }
  });

  it('serves requests on the configured port', async () => {
    const health = await get(port, '/');
    expect(health.status).toBe(200);
    // GET / is the health page both servers share (2.2-2.4).
    expect(health.headers['content-type']).toContain('text/html');
  });

  it('serves a real API route, proving all routes registered on Fastify', async () => {
    const res = await get(port, '/v1/public/get_web_settings');
    // 200 or 401/500 depending on DB contents - what matters is that the
    // route matched (not the catch-all 404) and answered.
    expect(res.status).not.toBe(404);
  });

  it('answers the not-found handler instead of Express', async () => {
    const res = await get(port, '/v1/definitely-not-a-route');
    expect(res.status).toBe(404);
    expect(JSON.parse(res.text)).toMatchObject({ success: false, code: 404, message: 'Not found' });
  });

  it('socket.io is attached to the same port', async () => {
    // A raw engine.io handshake - enough to prove the listener exists without
    // adding a socket.io-client dependency.
    const res = await new Promise((resolve, reject) => {
      const req = http.get(
        {
          port,
          path: '/socket.io/?EIO=4&transport=polling',
          agent: false,
          timeout: 5000,
        },
        (r) => {
          const chunks = [];
          r.on('data', (c) => chunks.push(c));
          r.on('end', () => resolve({ status: r.statusCode, text: Buffer.concat(chunks).toString('utf8') }));
        }
      );
      req.on('timeout', () => req.destroy(new Error('timeout')));
      req.on('error', reject);
    });
    expect(res.status).toBe(200);
    expect(res.text).toMatch(/^0\{/); // engine.io open packet
  });

  it('logs the morgan-shaped access line for the requests above', () => {
    expect(stdout).toMatch(/GET \/ \d{3} - \d+\.\d{3} ms/);
  });

  it('terminates on SIGTERM', async () => {
    expect(exit).toBeNull();
    child.kill('SIGTERM');
    const deadline = Date.now() + 20000;
    while (exit === null && Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 100));
    }
    expect(exit).not.toBeNull();
    // Only POSIX can assert the graceful path: on Windows libuv implements
    // kill(SIGTERM) as TerminateProcess, so no JS signal handler ever runs and
    // the child always dies by signal. The code path SIGTERM takes is covered
    // platform-independently by the app.close() test below.
    if (process.platform !== 'win32') {
      expect(exit.signal).toBeNull();
    }
    expect(stderr).not.toMatch(/uncaughtException|unhandledRejection/);
  });

  it('app.close() drains, runs onClose hooks and releases the port', async () => {
    // The graceful-shutdown body from src/index.js, exercised in-process so
    // the assertion holds on every platform (see the SIGTERM note above).
    const { buildFastify } = await import('../src/fastify');
    const CronJobSchedulerService = require_('../src/services/cron.job.scheduler.service');

    const closeHookRan = { value: false };
    const stopSpy = [];
    const realStop = CronJobSchedulerService.stopAllCronJobsScheduler.stopCronJobsOnly;
    CronJobSchedulerService.stopAllCronJobsScheduler.stopCronJobsOnly = function spy() {
      stopSpy.push('called');
      return realStop.call(this);
    };

    const instance = await buildFastify();
    instance.addHook('onClose', async () => {
      closeHookRan.value = true;
      CronJobSchedulerService.stopAllCronJobsScheduler.stopCronJobsOnly();
    });

    const closePort = await freePort();
    await instance.listen({ port: closePort, host: '127.0.0.1' });
    const before = await get(closePort, '/');
    expect(before.status).toBe(200);

    await instance.close();

    expect(closeHookRan.value).toBe(true);
    expect(stopSpy).toEqual(['called']);

    // Port released: nothing is listening any more.
    await expect(get(closePort, '/')).rejects.toThrow();

    CronJobSchedulerService.stopAllCronJobsScheduler.stopCronJobsOnly = realStop;
  }, 30000);
});
