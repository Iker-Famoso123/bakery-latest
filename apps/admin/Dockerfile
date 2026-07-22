# ── Builder ────────────────────────────────────────────────
FROM node:22-slim AS builder
# URL de la API para producción (se hornea en el bundle en tiempo de build).
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL
RUN corepack enable
WORKDIR /repo

COPY .npmrc pnpm-workspace.yaml package.json pnpm-lock.yaml turbo.json tsconfig.base.json ./
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
COPY apps/api/package.json ./apps/api/
COPY apps/admin/package.json ./apps/admin/
COPY apps/public/package.json ./apps/public/
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm --filter=@rf/types build \
 && pnpm --filter=@rf/ui build \
 && pnpm --filter=@rf/admin build

# ── Runtime (estático con nginx) ───────────────────────────
FROM nginx:1.27-alpine AS runtime
COPY apps/admin/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /repo/apps/admin/dist /usr/share/nginx/html
EXPOSE 80
