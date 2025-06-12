import os
from pathlib import Path
from unittest import mock

import pytest

import app.backup_scheduler as bs

pytestmark = pytest.mark.usefixtures("env_vars")


def test_run_backup_invokes_script(env_vars):
    with mock.patch.object(bs.subprocess, "run") as run:
        bs.run_backup()
        script = Path(__file__).resolve().parents[2] / "scripts" / "backup_db.sh"
        run.assert_called_once_with([str(script), "gdrive", "DrinkTrackerBackups"], check=True)


def test_start_backup_scheduler_adds_job(env_vars):
    with mock.patch.object(bs, "scheduler") as sched:
        os.environ.pop("DISABLE_BACKUPS", None)
        bs.start_backup_scheduler()
        sched.add_job.assert_called()
        sched.start.assert_called_once()

