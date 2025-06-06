"""Collection of FastAPI routers."""

from . import users, payments, stats

__all__ = [
    "users",
    "payments",
    "stats",
]
