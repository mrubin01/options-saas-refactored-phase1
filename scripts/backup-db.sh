#!/bin/bash
set -euo pipefail

BACKUP_DIR="$HOME/options-saas/backups"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
FILENAME="optionstacker_${TIMESTAMP}.sql.gz"
RETENTION_DAYS=30

mkdir -p "$BACKUP_DIR"

docker exec optionstacker-production-db-1 \
    pg_dump -U optionstacker optionstacker \
    | gzip > "$BACKUP_DIR/$FILENAME"

find "$BACKUP_DIR" -name "optionstacker_*.sql.gz" -mtime +$RETENTION_DAYS -delete

echo "[$(date)] Backup completed: $FILENAME ($(du -h "$BACKUP_DIR/$FILENAME" | cut -f1))"
