# Repostería Famoso — Web

Vitrina/foro de la panadería familiar (`reposteriafamoso.com`). **No es e-commerce**:
solo se exhibe el pan y se publica contenido. Monorepo con dos portales sobre un
backend común.

## Estructura

```
apps/
  api/      NestJS + Prisma + PostgreSQL — sirve a ambos frontends
  admin/    SPA React 19 + Vite — panel privado (invite-only)
  public/   Astro SSR (adapter Cloudflare) — blog/foro público
packages/
  types/    DTOs, tipos y helper de fechas (Luxon) compartidos
  ui/       componentes React compartidos (PostCard, ProductCard)
```

## Requisitos

- Node ≥ 22, pnpm (vía `corepack`), Docker (para Postgres local).

## Arranque (desarrollo)

```bash
corepack enable pnpm      # activa pnpm sin instalación global
pnpm install
cp .env.example .env

pnpm db:up                # levanta Postgres en Docker
pnpm db:migrate           # aplica migraciones
pnpm db:seed              # crea la fila singleton de Settings

pnpm dev                  # arranca las tres apps (turbo)
```

Healthcheck: `GET http://localhost:3000/api/health` → `{ status, db, time }`.

## Convenciones (no negociables)

- **Fechas:** nunca `new Date()`. Siempre Luxon vía `@rf/types` (`now`, `nowISO`,
  `toMexico`). Cruzan la API como ISO 8601 UTC; se presentan en `America/Mexico_City`.
- **Vigencia de posts:** filtrada en la query, sin cron (ver `isPostVisible`).
- **Auth:** invite-only, JWT access + refresh (refresh revocable en DB), bcrypt.
- **Imágenes:** sharp → variantes WebP → Cloudflare R2 (nunca en DB ni disco).
- **Prisma:** única fuente de verdad; cambios vía migraciones versionadas.

## Estado

Fase 1 (fundaciones) completa. Fases 2-5 pendientes (ver skill del proyecto).
