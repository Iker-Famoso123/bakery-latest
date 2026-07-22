# ── Builder ────────────────────────────────────────────────
FROM node:22-slim AS builder
RUN corepack enable
WORKDIR /repo

# Manifests primero para aprovechar la caché de capas
COPY .npmrc pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json tsconfig.base.json ./
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
COPY apps/api/package.json ./apps/api/
COPY apps/admin/package.json ./apps/admin/
COPY apps/public/package.json ./apps/public/
RUN pnpm install --frozen-lockfile

# Código + build de @rf/types y la API + cliente Prisma
COPY . .
# openssl antes de generar: Prisma debe detectar el mismo target (openssl-3.0.x)
# que el runtime, o el query engine no carga. Va aquí (no en el builder base)
# para no invalidar la caché del install.
# Prisma primero: nest build (tsc) necesita los tipos de @prisma/client.
RUN apt-get update \
 && apt-get install -y --no-install-recommends openssl \
 && rm -rf /var/lib/apt/lists/* \
 && pnpm --filter=@rf/types build \
 && pnpm --filter=@rf/api exec prisma generate \
 && pnpm --filter=@rf/api build

# ── Runtime ────────────────────────────────────────────────
FROM node:22-slim AS runtime
RUN corepack enable \
 && apt-get update \
 && apt-get install -y --no-install-recommends openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
WORKDIR /repo
COPY --from=builder /repo /repo
WORKDIR /repo/apps/api

EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=25s --retries=3 \
  CMD node -e "fetch('http://localhost:3000/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Aplica migraciones pendientes y arranca la API
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/main.js"]
