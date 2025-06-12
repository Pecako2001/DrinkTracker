import os
import subprocess
from pathlib import Path
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()


def run_backup() -> None:
    """Run the backup script with configured settings."""
    script_path = Path(__file__).resolve().parents[2] / "scripts" / "backup_db.sh"
    remote = os.getenv("BACKUP_REMOTE_NAME", "gdrive")
    remote_path = os.getenv("BACKUP_REMOTE_PATH", "DrinkTrackerBackups")
    subprocess.run([str(script_path), remote, remote_path], check=True)


def start_backup_scheduler() -> None:
    """Start a daily backup job at midnight unless disabled."""
    if os.getenv("DISABLE_BACKUPS") == "1":
        return
    scheduler.add_job(run_backup, "cron", hour=0, minute=0)
    scheduler.start()


def shutdown_backup_scheduler() -> None:
    """Shutdown the scheduler if running."""
    if scheduler.running:
        scheduler.shutdown()
