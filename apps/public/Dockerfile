# ── Builder ────────────────────────────────────────────────
FROM node:22-slim AS builder
RUN corepack enable
WORKDIR /repo

COPY .npmrc pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json tsconfig.base.json ./
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
COPY apps/api/package.json ./apps/api/
COPY apps/admin/package.json ./apps/admin/
COPY apps/public/package.json ./apps/public/
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter=@rf/types build \
 && pnpm --filter=@rf/ui build \
 && pnpm --filter=@rf/public build

# ── Runtime ────────────────────────────────────────────────
FROM node:22-slim AS runtime
ENV NODE_ENV=production HOST=0.0.0.0 PORT=4321
WORKDIR /repo
COPY --from=builder /repo /repo
WORKDIR /repo/apps/public

EXPOSE 4321
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://localhost:4321/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "./dist/server/entry.mjs"]
