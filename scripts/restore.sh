#!/usr/bin/env bash
#
# Restaura un backup cifrado a la base. Un backup sin restaurar es solo una
# esperanza — corre esto de vez en cuando contra una base de prueba.
#
#   scripts/restore.sh reposteria-20260713T030000Z.sql.gz.gpg            # archivo local
#   scripts/restore.sh reposteria-20260713T030000Z.sql.gz.gpg --from-r2 # lo baja de R2
set -euo pipefail

FILE="${1:?Uso: restore.sh <archivo.sql.gz.gpg> [--from-r2]}"
PG_CONTAINER="${PG_CONTAINER:-rf-postgres}"
DB_USER="${POSTGRES_USER:-rf}"
DB_NAME="${POSTGRES_DB:-reposteria}"
PASSPHRASE_FILE="${PASSPHRASE_FILE:-$HOME/rf-backups/passphrase}"
RCLONE_REMOTE="${RCLONE_REMOTE:-r2:reposteria-backups}"
TMP_DIR="${TMP_DIR:-$HOME/rf-backups/out}"
mkdir -p "$TMP_DIR"

if [[ "${2:-}" == "--from-r2" ]]; then
  echo "→ Descargando $FILE de R2"
  rclone copy "$RCLONE_REMOTE/$FILE" "$TMP_DIR"
  FILE="$TMP_DIR/$FILE"
fi

echo "⚠️  Se sobrescribirá la base '$DB_NAME'. Ctrl+C para cancelar…"
sleep 3

gpg --batch --yes --decrypt --passphrase-file "$PASSPHRASE_FILE" "$FILE" \
  | gunzip \
  | docker exec -i "$PG_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME"

echo "✔ Restauración completa desde $FILE"
