#!/bin/bash
set -euo pipefail

# Usage: ./install_backup_cron.sh [remote_name] [remote_path] [hour]
# Sets up a daily cron job to run backup_db.sh automatically.

REMOTE_NAME="${1:-gdrive}"
REMOTE_PATH="${2:-DrinkTrackerBackups}"
HOUR="${3:-0}"

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
CRON_ENTRY="0 ${HOUR} * * * ${SCRIPT_DIR}/backup_db.sh ${REMOTE_NAME} ${REMOTE_PATH} >/dev/null 2>&1"

# Remove any existing backup_db.sh entries then install new one
(crontab -l 2>/dev/null | grep -v backup_db.sh; echo "$CRON_ENTRY") | crontab -

echo "Installed cron job: $CRON_ENTRY"

