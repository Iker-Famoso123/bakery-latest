#!/usr/bin/env bash
#
# Backup diario de la base: pg_dump → gzip → gpg (AES256) → R2 (rclone).
# Rotación a RETENTION_DAYS días, local y remota.
#
# Config por variables de entorno (con valores por defecto para el Pi):
set -euo pipefail

PG_CONTAINER="${PG_CONTAINER:-rf-postgres}"
DB_USER="${POSTGRES_USER:-rf}"
DB_NAME="${POSTGRES_DB:-reposteria}"
PASSPHRASE_FILE="${PASSPHRASE_FILE:-$HOME/rf-backups/passphrase}" # archivo chmod 600
RCLONE_REMOTE="${RCLONE_REMOTE:-r2:reposteria-backups}"
TMP_DIR="${TMP_DIR:-$HOME/rf-backups/out}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"

STAMP="$(date -u +%Y%m%dT%H%M%SZ)" # UTC
FILE="reposteria-${STAMP}.sql.gz.gpg"
mkdir -p "$TMP_DIR"

echo "→ Dump + cifrado: $FILE"
docker exec "$PG_CONTAINER" pg_dump -U "$DB_USER" "$DB_NAME" \
  | gzip \
  | gpg --batch --yes --symmetric --cipher-algo AES256 \
      --passphrase-file "$PASSPHRASE_FILE" -o "$TMP_DIR/$FILE"

echo "→ Subida a R2: $RCLONE_REMOTE"
rclone copy "$TMP_DIR/$FILE" "$RCLONE_REMOTE" --no-traverse

echo "→ Rotación (> ${RETENTION_DAYS} días)"
find "$TMP_DIR" -name 'reposteria-*.sql.gz.gpg' -mtime +"$RETENTION_DAYS" -delete
rclone delete "$RCLONE_REMOTE" --min-age "${RETENTION_DAYS}d" \
  --include 'reposteria-*.sql.gz.gpg' || true

echo "✔ Backup completo: $FILE"
