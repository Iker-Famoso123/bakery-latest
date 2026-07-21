# Despliegue — Repostería Famoso (Raspberry Pi)

Todo se autohospeda en el Pi (`patio`) con Docker Compose. **No se publican
puertos al host** (evita choques con otros servicios del homelab): NPM alcanza
los contenedores por nombre a través de una red Docker compartida (`proxy`).

| Subdominio | NPM apunta a (nombre:puerto interno) |
|------------|--------------------------------------|
| `reposteriafamoso.com` | `rf-public:4321` |
| `admin.reposteriafamoso.com` | `rf-admin:80` |
| `api.reposteriafamoso.com` | `rf-api:3000` |

Postgres queda **solo en la red interna** (nunca se expone).

---

## 1. Requisitos en el Pi

```bash
# Docker + Compose plugin
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # re-loguéate después

# Utilidades de backup
sudo apt-get install -y gnupg rclone
```

## 2. Configurar y levantar

```bash
git clone <repo> reposteria && cd reposteria
cp .env.prod.example .env.prod
nano .env.prod            # rellena secretos (Postgres, JWT, R2, ADMIN_API_URL)

# Red compartida con NPM (una sola vez):
docker network create proxy 2>/dev/null || true
docker network connect proxy <contenedor-de-NPM>   # p. ej. nginx-proxy-manager

docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

La API aplica las **migraciones** automáticamente al arrancar (`prisma migrate deploy`).

**Crear el primer admin** (interactivo):

```bash
docker compose -f docker-compose.prod.yml exec api pnpm db:seed
```

Verifica (no hay puertos publicados; se comprueba por estado y por dentro):

```bash
docker compose -f docker-compose.prod.yml ps          # todos "healthy"
docker exec rf-api node -e "fetch('http://localhost:3000/api/health').then(r=>r.text()).then(console.log)"
```

## 3. Exponer con Cloudflare Tunnel + NPM

1. **Nginx Proxy Manager** → un *Proxy Host* por subdominio (Forward por **nombre de
   contenedor**, gracias a la red `proxy` compartida):
   - `reposteriafamoso.com` → `rf-public` : `4321`
   - `admin.reposteriafamoso.com` → `rf-admin` : `80`
   - `api.reposteriafamoso.com` → `rf-api` : `3000`
   - Activa SSL (Let's Encrypt) y "Block Common Exploits" en cada uno.
2. **Cloudflare Tunnel** (Zero Trust → Networks → Tunnels): agrega los tres
   *Public Hostnames* apuntando a tu **NPM** (`http://<NPM>:80`). El túnel crea el DNS.

> **CORS:** el admin y la API están en subdominios distintos, así que la API
> debe permitir el origen del admin. Ya trae `enableCors()`; si quieres cerrarlo
> a un origen específico, se ajusta en `apps/api/src/main.ts`.

## 4. Imágenes en R2 (dominio propio)

Cuando `media.reposteriafamoso.com` esté **Active** en R2 (Custom Domains),
deja `R2_PUBLIC_URL=https://media.reposteriafamoso.com` en `.env.prod` y
reconstruye la API. Genera un **token de R2 dedicado a producción** (aparte del
de desarrollo) para poder revocar cada entorno por separado.

## 5. Backups (cron diario)

```bash
# rclone: configura un remote 'r2' (S3-compatible) apuntando a tu bucket de backups
rclone config    # tipo: s3 → provider: Cloudflare R2 → tus claves R2

# passphrase de cifrado, protegida
mkdir -p ~/rf-backups && openssl rand -base64 32 > ~/rf-backups/passphrase
chmod 600 ~/rf-backups/passphrase

# probar
POSTGRES_USER=rf POSTGRES_DB=reposteria ./scripts/backup.sh

# agendar 3am diario
crontab -e
# 0 3 * * * cd /home/pi/reposteria && POSTGRES_USER=rf POSTGRES_DB=reposteria ./scripts/backup.sh >> ~/rf-backups/backup.log 2>&1
```

- **Rotación:** 30 días (local y en R2), configurable con `RETENTION_DAYS`.
- **Prueba de restauración** (¡hazla periódicamente!):
  ```bash
  ./scripts/restore.sh reposteria-<STAMP>.sql.gz.gpg --from-r2
  ```
- Regla 3-2-1: idealmente, una copia secundaria fuera de R2.

## 6. Monitoreo básico

- Cada contenedor tiene **healthcheck**; revisa con `docker compose ps` (estado `healthy`).
- Cloudflare Tunnel ya te avisa si el origen cae.
- Opcional: un [Uptime Kuma](https://github.com/louislam/uptime-kuma) apuntando a
  `https://api.reposteriafamoso.com/api/health` para alertas por Telegram/WhatsApp.

## Operación diaria

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod logs -f api
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build   # tras un git pull
docker compose -f docker-compose.prod.yml ps
```
