import os
import dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from .database import engine, Base, get_db
from .auth import router as auth_router
from .routers import users, payments, stats

dotenv.load_dotenv()

if os.getenv("TESTING") != "1":
    Base.metadata.create_all(bind=engine)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(users.router)
app.include_router(payments.router)
app.include_router(stats.router)

avatars_dir = os.path.join(os.path.dirname(__file__), "avatars")
os.makedirs(avatars_dir, exist_ok=True)
app.mount("/avatars", StaticFiles(directory=avatars_dir), name="avatars")

# Re-export utilities for backwards compatibility
from .routers.stats import (
    get_date_range_this_month,
    get_date_range_last_month,
    get_date_range_this_year,
    get_date_range_last_year,
    longest_hydration_streaks,
    _subtract_months,
)

__all__ = [
    "app",
    "get_db",
    "get_date_range_this_month",
    "get_date_range_last_month",
    "get_date_range_this_year",
    "get_date_range_last_year",
    "longest_hydration_streaks",
    "_subtract_months",
]
