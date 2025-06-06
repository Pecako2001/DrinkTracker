#!/bin/bash
set -euo pipefail

# Usage: ./backup_db.sh [remote_name] [remote_path]
# remote_name: rclone remote name (e.g., gdrive or onedrive)
# remote_path: directory path on the remote (default: DrinkTrackerBackups)

REMOTE_NAME="${1:-gdrive}"
REMOTE_PATH="${2:-DrinkTrackerBackups}"

DB_NAME="${POSTGRES_DB:-drinktracker}"
DB_USER="${POSTGRES_USER:-postgres}"
DB_PASSWORD="${POSTGRES_PASSWORD:-postgres}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="db_backup_${TIMESTAMP}.sql.gz"

export PGPASSWORD="$DB_PASSWORD"
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_FILE"

# Upload to remote using rclone
rclone copy "$BACKUP_FILE" "$REMOTE_NAME:$REMOTE_PATH/"
rm "$BACKUP_FILE"

# Keep only the two most recent backups on the remote
BACKUPS=$(rclone lsf "$REMOTE_NAME:$REMOTE_PATH" --format=p | sort -r)
COUNT=0
for file in $BACKUPS; do
    COUNT=$((COUNT+1))
    if [ $COUNT -gt 2 ]; then
        rclone deletefile "$REMOTE_NAME:$REMOTE_PATH/$file"
    fi
done
