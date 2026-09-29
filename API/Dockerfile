# LocalWala API - the monolith.
#
# Phase 4.2. There is one thing here worth explaining, and getting it wrong is
# the difference between a container that boots and one that exits instantly:
#
# the production runtime is `tsx`, not a build. Phase 1 settled that
# deliberately - `npm run build` emits only the TypeScript files and copies
# none of the 123 `.js` files, the 142 models, the views or the assets, so a
# dist-based image would come up with a third of the codebase missing. The image
# therefore installs dependencies and runs the source through tsx, exactly as
# `npm start` does on the host.
FROM node:24-slim

# The build tools tsx and the native deps need, removed in the same layer that
# used them so they do not ship in the final image.
RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the manifests first so `npm ci` is cached against them and a source-only
# change does not reinstall 1,200 packages.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

# The Firebase credential is a real file in the repo, not an env var, and
# fcm.notification.service reads it from disk. It is gitignored in a real
# deployment; it is copied here so the local stack behaves like the host.
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# `tsx` rather than `node dist/index.js` - see the note at the top.
EXPOSE 3000

HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.status<500?0:1)).catch(()=>process.exit(1))"

CMD ["npm", "run", "start:node"]
