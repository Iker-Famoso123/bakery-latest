# Despliegue — Repostería Famoso (Raspberry Pi)

Todo se autohospeda en el Pi (`patio`) con Docker Compose, expuesto por
**Cloudflare Tunnel → Nginx Proxy Manager (NPM)** en tres subdominios:

| Subdominio | Servicio | Puerto host |
|------------|----------|-------------|
| `reposteriafamoso.com` | Astro (público) | `4321` |
| `admin.reposteriafamoso.com` | Admin (nginx) | `8080` |
| `api.reposteriafamoso.com` | NestJS (API) | `3000` |

Postgres queda **solo en la red interna** (no se expone al exterior).

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

docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

La API aplica las **migraciones** automáticamente al arrancar (`prisma migrate deploy`).

**Crear el primer admin** (interactivo):

```bash
docker compose -f docker-compose.prod.yml exec api pnpm db:seed
```

Verifica:

```bash
curl http://localhost:3000/api/health     # {"status":"ok","db":"up",...}
curl -I http://localhost:4321/            # 200 (público)
curl -I http://localhost:8080/            # 200 (admin)
```

## 3. Exponer con Cloudflare Tunnel + NPM

1. **Cloudflare Tunnel** (en el Pi o como contenedor `cloudflared`):
   - Crea un túnel en el dashboard de Cloudflare (Zero Trust → Networks → Tunnels).
   - Ruta pública: apunta los tres hostnames al **NPM** (p. ej. `http://npm:80` o la IP del Pi).
2. **Nginx Proxy Manager** → crea un *Proxy Host* por subdominio:
   - `reposteriafamoso.com` → `rf-public:4321`
   - `admin.reposteriafamoso.com` → `rf-admin:80`
   - `api.reposteriafamoso.com` → `rf-api:3000`
   - Para que NPM alcance los contenedores por nombre, ponlos en la **misma red Docker** que NPM (o usa la IP del Pi + el puerto host de la tabla de arriba).

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
