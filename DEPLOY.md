# Despliegue — Repostería Famoso (Raspberry Pi)

Todo se autohospeda en el Pi (`patio`) con Docker Compose. Cada app publica un
**puerto directo** en el Pi (configurable por env para evitar choques con otros
servicios del homelab); el túnel/NPM apuntan a la **IP del Pi + ese puerto**.

| Subdominio | App | Puerto en el Pi (`.env.prod`) |
|------------|-----|-------------------------------|
| `reposteriafamoso.com` | público | `PUBLIC_PORT` (def. `4321`) |
| `panel.reposteriafamoso.com` | admin | `ADMIN_PORT` (def. `8082`) |
| `api.reposteriafamoso.com` | API | `API_PORT` (def. `3001`) |

> El panel usa **`panel.`** (o el subdominio que prefieras) porque `admin.` suele
> estar ocupado por la UI de Nginx Proxy Manager. El subdominio no vive en el
> código — lo defines en el túnel/NPM; solo asegúrate de que `ADMIN_API_URL`
> apunte a tu API.

Postgres queda **solo en la red interna** (nunca se publica).

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
nano .env.prod            # secretos (Postgres, JWT, R2, ADMIN_API_URL) y puertos

docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

La API aplica las **migraciones** automáticamente al arrancar (`prisma migrate deploy`).

**Crear el primer admin** (interactivo):

```bash
docker compose -f docker-compose.prod.yml exec api pnpm db:seed
```

Verifica (usa los puertos de tu `.env.prod`):

```bash
docker compose -f docker-compose.prod.yml ps      # todos "healthy"
curl http://localhost:3001/api/health             # API   (API_PORT)
curl -I http://localhost:4321/                     # público (PUBLIC_PORT)
curl -I http://localhost:8082/                     # admin  (ADMIN_PORT)
```

## 3. Exponer con Cloudflare Tunnel (+ NPM opcional)

Cada app escucha en `IP-del-Pi:<puerto>`. Dos formas de exponer:

**A) Túnel directo** (más simple, sin NPM para estos 3):
En Cloudflare (Zero Trust → Networks → Tunnels → tu túnel → **Public Hostnames**),
agrega uno por subdominio, apuntando al servicio local:
- `reposteriafamoso.com` → `http://<IP-del-Pi>:4321`
- `panel.reposteriafamoso.com` → `http://<IP-del-Pi>:8082`
- `api.reposteriafamoso.com` → `http://<IP-del-Pi>:3001`

**B) Vía NPM** (si quieres su SSL/reglas): crea un *Proxy Host* por subdominio
(`Forward` a `<IP-del-Pi>:<puerto>`), y el túnel apunta a NPM.

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
