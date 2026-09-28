/**
 * LocalWala – Local Commerce & Delivery Platform
 * (NodeJS, MongoDB, Angular & Flutter)
 *
 * Copyright © 2026 WeWorkLocal Private Limited
 * https://weworklocal.in/
 *
 * WeWorkLocal Private Limited
 * This source code is confidential.
 *
 * Ownership Fingerprint:
 * LWL|WWL|2026|LOCALWALA|NODE
 */

const mongoConnectionStatus = require('../config/mongoConnectionStatus');

/**
 * The `GET /` landing page.
 *
 * Extracted from app.js so the Express app and the Fastify app under
 * construction (src/fastify.ts) serve byte-identical HTML - it is the one
 * route both servers own during the strangler migration, which makes it the
 * cheapest end-to-end parity check we have.
 *
 * @returns {string} full HTML document
 */
const buildHealthPage = () => {
  const isConnected = mongoConnectionStatus.status;
  const message = isConnected ? 'API is Working Fine!' : 'API is Down!';
  const subMessage = isConnected
    ? 'All systems are operational and your API is responding correctly.'
    : `Error: ${mongoConnectionStatus.error || 'API cannot connect to the database.'}`;
  const bgColor = isConnected ? '#e6ffed' : '#ffe6e6';
  const textColor = isConnected ? '#2e7d32' : '#c62828';

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>LocalWala API</title>
      <style>
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background-color: ${bgColor};
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          text-align: center;
        }
        .card {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          max-width: 500px;
          width: 90%;
        }
        h1 {
          color: ${textColor};
          margin-bottom: 10px;
        }
        p {
          color: #555;
          font-size: 16px;
        }
        .footer {
          margin-top: 20px;
          font-size: 12px;
          color: #777;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>${message}</h1>
        <p>${subMessage}</p>
        <div class="footer">
          Server Time: ${new Date().toLocaleString()}
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { buildHealthPage };
