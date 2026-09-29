# LocalWala gateway - Phase 4.1.
#
# Separate context from the monolith on purpose. The gateway is the first
# separately deployable unit, and giving it its own image is what proves it can
# be built and shipped without the monolith's source. It shares the repository
# and the dependency tree, but the build context is apps/gateway and the image
# contains only the gateway.
#
# The gateway is TypeScript run through tsx, for the same reason as the
# monolith: there is no build step that emits the JavaScript, so the image runs
# the source.
FROM node:24-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copied from the repository root because the lockfile lives there; the context
# is set on the compose service, not here.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY apps/gateway ./apps/gateway

ENV NODE_ENV=production
ENV PORT=3100
# Where the monolith is, from inside the compose network. Defaults here match
# docker-compose.yml so the image also runs standalone with an override.
ENV MONOLITH_URL=http://monolith:3000

EXPOSE 3100

HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:3100/').then(r=>process.exit(r.status<500?0:1)).catch(()=>process.exit(1))"

# Started through the shared dependency tree via tsx: the gateway has no bin of
# its own, because it lives in the same repository and the same node_modules.
CMD ["npm", "run", "gateway:start"]
