#!/usr/bin/env bash
# Denná záloha: databáza (pg_dump) + nahrané obrázky. Cron napr.:
#   30 2 * * * /opt/skolenie-se/deploy/backup.sh >> /var/log/skolenie-backup.log 2>&1
set -euo pipefail

APP_DIR=/opt/skolenie-se
BACKUP_DIR="$APP_DIR/backups"
KEEP_DAYS=14
TS=$(date +%F_%H%M)

mkdir -p "$BACKUP_DIR"
cd "$APP_DIR"

docker compose --env-file .env.production -f docker-compose.prod.yml exec -T db \
  pg_dump -U payload -d skolenie_se -Fc > "$BACKUP_DIR/db_$TS.dump"

docker run --rm -v skolenie-se_media:/m:ro -v "$BACKUP_DIR":/b alpine \
  tar czf "/b/media_$TS.tgz" -C /m .

find "$BACKUP_DIR" -type f \( -name 'db_*.dump' -o -name 'media_*.tgz' \) -mtime +"$KEEP_DAYS" -delete

echo "$(date '+%F %T') záloha OK: db_$TS.dump, media_$TS.tgz"
