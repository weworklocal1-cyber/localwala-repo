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
 */

/**
 * Phase 2.15: the entry point now boots Fastify instead of Express.
 *
 * `src/app.js` is no longer required here: every route file registers through
 * `registerOnFastify` (Phase 2.9b) and the whole reply surface runs on the
 * Fastify side (Phase 2.9a-2.14). What changed structurally, and why:
 *
 *   - `app.listen` instead of `http.createServer(app)`. The host is passed
 *     explicitly as '0.0.0.0' because Node's bare `server.listen(port)` binds
 *     every interface while Fastify's default is 'localhost' - omitting it
 *     would make the API unreachable from outside the box.
 *   - socket.io attaches to `fastify.server` (the same http.Server Fastify
 *     already owns), so it is not a second listener on the port.
 *   - The cron scheduler moved out of `src/app.js`, where it ran on `require`
 *     (so also during tests and the manifest tool) and could never be
 *     stopped. It now starts after `listen` and stops on `onClose` - via
 *     `stopCronJobsOnly()`, because the pre-existing `stopCronJob()` is the
 *     failure-recovery path and deliberately deletes the scheduler collection.
 *
 * This file stays CommonJS. Loading `src/fastify.ts` needs the `tsx` runtime,
 * which is why it is a real dependency and pm2 launches through
 * `node_modules/.bin/tsx` (see ecosystem.config.json).
 */
const mongoose = require('mongoose');
const socketIo = require('socket.io');
const config = require('./config/config');
const logger = require('./config/logger');
const mongoConnectionStatus = require('./config/mongoConnectionStatus');
const CronJobSchedulerService = require('./services/cron.job.scheduler.service');

let app;
let io;

// Manual random string generator (replaces crypto)
const generateRandomId = (length = 16) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

mongoose
  .connect(config.mongoose.url, config.mongoose.options)
  .then(async () => {
    mongoConnectionStatus.status = true;
    mongoConnectionStatus.error = null;
    logger.info('Connected to MongoDB');

    // Boot Fastify. Required lazily so that a Mongo failure exits before any
    // plugin registers (matching the previous connect-then-listen order).
    const { buildFastify } = require('./fastify');
    app = await buildFastify();

    // Phase 2.15 - cron starts once the server is actually accepting traffic,
    // and is stopped again on close. See the note in src/services/
    // cron.job.scheduler.service.js for why the non-destructive stop is used.
    app.addHook('onClose', async () => {
      CronJobSchedulerService.stopAllCronJobsScheduler.stopCronJobsOnly();
    });

    await app.listen({ port: config.port, host: '0.0.0.0' });
    await CronJobSchedulerService.startCronJobScheduler.startCronJob();
    logger.info('Listening to port ' + config.port);

    // Initialize Socket.io on the server Fastify already owns.
    io = socketIo(app.server, {
      cors: {
        origin: config.cors.origins,
        methods: ['GET', 'POST'],
        credentials: true,
      },
    });

    io.on('connection', (socket) => {
      logger.info(`New Socket Connection: ${socket.id}`);

      // --- Chat Logic ---
      socket.on('joinRoom', ({ chatRoomId }) => {
        socket.join(chatRoomId);
      });

      socket.on(
        'sendMessage',
        ({ chatRoomId, senderId, message, role, senderFirstName, senderLastName, senderCover }) => {
          const randomId = generateRandomId(16); // Hardcoded logic used here
          const currentDate = new Date().toISOString();

          const newMessage = {
            senderId,
            message,
            role,
            randomId,
            currentDate,
            messageType: 'text',
            senderFirstName,
            senderLastName,
            senderCover,
          };
          io.to(chatRoomId).emit('receiveMessage', newMessage);
        }
      );

      // --- Live Location Logic ---
      socket.on('joinLiveLocation', ({ driverId }) => {
        socket.join(driverId);
      });

      socket.on('sendLocation', ({ driverId, latitude, longitude }) => {
        const newLocation = { driverId, latitude, longitude };
        io.to(driverId).emit('receiveLocation', newLocation);
      });

      socket.on('disconnect', () => {
        logger.info(`Socket Disconnected: ${socket.id}`);
      });
    });
  })
  .catch((error) => {
    mongoConnectionStatus.status = false;
    mongoConnectionStatus.error = error.message;
    logger.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  });

// MongoDB Event Listeners
mongoose.connection.on('disconnected', () => {
  mongoConnectionStatus.status = false;
  mongoConnectionStatus.error = 'MongoDB disconnected';
});

mongoose.connection.on('error', (error) => {
  mongoConnectionStatus.status = false;
  mongoConnectionStatus.error = error.message;
});

// Graceful Shutdown
//
// `app.close()` replaces `server.close()`: it drains in-flight requests, runs
// the onClose hook (which stops the cron scheduler) and then closes the http
// server. The rejection arm matters - a close that fails must still exit,
// otherwise pm2 would leave a half-dead process behind.
const exitHandler = () => {
  if (app) {
    app.close().then(
      () => {
        logger.info('Server closed');
        process.exit(1);
      },
      () => {
        process.exit(1);
      }
    );
  } else {
    process.exit(1);
  }
};

process.on('uncaughtException', (error) => {
  logger.error(error);
  exitHandler();
});

process.on('unhandledRejection', (error) => {
  logger.error(error);
  exitHandler();
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM received');
  if (app) {
    app.close();
  }
});
