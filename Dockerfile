# Produkčný image – Next.js standalone (vyžaduje output: 'standalone' v next.config.ts)
# Build a spustenie: pozri DEPLOY.md

FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat
ENV NEXT_TELEMETRY_DISABLED=1

# 1) závislosti
FROM base AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN npm install -g pnpm@12.21.0 && pnpm install --frozen-lockfile

# 2) build (DB ani tajomstvá sa pri builde nepoužívajú – len zástupné hodnoty)
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV PAYLOAD_SECRET=build-only-placeholder \
    DATABASE_URL=postgres://build:build@127.0.0.1:5432/build
RUN npm install -g pnpm@12.21.0 && pnpm run build

# 3) runtime
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# nahrané obrázky (Payload Media) – v compose je to perzistentný zväzok
RUN mkdir -p /app/media && chown nextjs:nodejs /app/media

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/health > /dev/null || exit 1

CMD ["node", "server.js"]
