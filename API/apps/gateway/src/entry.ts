/**
 * The gateway's process entry point.
 *
 * Separate from `server.ts` so the server stays importable - the parity test
 * builds and drives it in-process - while this file is only ever run as a
 * process, by `npm run gateway:start` and by the container.
 *
 * The shutdown path matters as much as the start path: the gateway holds no
 * state, but an unclean exit leaves in-flight requests cut off mid-response,
 * so SIGTERM/SIGINT stop accepting and let in-flight work drain.
 */
import { buildGateway } from './server.js';
import { SERVICE_ROUTES, MONOLITH_BASE } from './service-routes.js';

const port = Number(process.env.PORT || 3100);
const host = process.env.HOST || '0.0.0.0';

const app = buildGateway({ logger: true });

async function main() {
  await app.listen({ port, host });
  app.log.info(
    { monolith: MONOLITH_BASE, routes: SERVICE_ROUTES.length },
    'gateway listening'
  );
}

for (const signal of ['SIGTERM', 'SIGINT'] as const) {
  process.on(signal, () => {
    app.log.info({ signal }, 'draining');
    app
      .close()
      .then(() => process.exit(0))
      // A close that hangs must not hold the container open forever.
      .then(() => setTimeout(() => process.exit(1), 10_000).unref());
  });
}

main().catch((err) => {
  app.log.error(err, 'gateway failed to start');
  process.exit(1);
});
