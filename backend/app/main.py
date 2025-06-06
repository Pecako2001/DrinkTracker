from fastapi import FastAPI, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from typing import Any
from sqlalchemy import func, and_
from . import models, schemas, crud
from .database import engine, Base, get_db
import os
import subprocess
import threading
import time
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import List
from .auth import router as auth_router, get_current_admin
import dotenv
from . import database
from uuid import uuid4

dotenv.load_dotenv()

if os.getenv("TESTING") != "1":
    Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(auth_router)

avatars_dir = os.path.join(os.path.dirname(__file__), "avatars")
os.makedirs(avatars_dir, exist_ok=True)
app.mount("/avatars", StaticFiles(directory=avatars_dir), name="avatars")


def perform_backup(db: Session, remote_name: str, remote_path: str):
    script = os.path.join(
        os.path.dirname(os.path.dirname(__file__)), "scripts", "backup_db.sh"
    )
    try:
        subprocess.run([script, remote_name, remote_path], check=True)
        crud.create_backup_log(db, True, None)
    except subprocess.CalledProcessError as e:
        crud.create_backup_log(db, False, str(e))


def schedule_backups():
    if os.getenv("ENABLE_BACKUPS") != "1":
        return
    remote_name = os.getenv("BACKUP_REMOTE_NAME", "gdrive")
    remote_path = os.getenv("BACKUP_REMOTE_PATH", "DrinkTrackerBackups")
    hour = int(os.getenv("BACKUP_HOUR", "2"))

    def worker():
        while True:
            now = datetime.utcnow()
            run_at = now.replace(hour=hour, minute=0, second=0, microsecond=0)
            if run_at <= now:
                run_at += timedelta(days=1)
            time.sleep((run_at - now).total_seconds())
            with database.SessionLocal() as db:
                perform_backup(db, remote_name, remote_path)

    threading.Thread(target=worker, daemon=True).start()


schedule_backups()

class UpdateUser(BaseModel):
    balance: float
    total_drinks: int | None = None



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get(
    "/users",
    response_model=list[schemas.PersonOut],
    response_model_by_alias=False,
)
def read_users(db: Session = Depends(get_db)):
    persons = crud.get_persons(db)
    for p in persons:
        # Print whichever columns you care about:
        print(f"id={p.id}  name={p.name}  avatar_url={p.avatar_url}  balance={p.balance}  total_drinks={p.total_drinks}")
    return persons


@app.post("/users", response_model=schemas.Person)
def create_user(
    person: schemas.PersonCreate,
    db: Session = Depends(get_db),
    admin: None = Depends(get_current_admin),
):
    return crud.create_person(db, person)


@app.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: None = Depends(get_current_admin),
):
    crud.delete_person(db, user_id)
    return {"ok": True}


@app.post("/users/{user_id}/drinks", response_model=schemas.Person)
def add_drink(user_id: int, db: Session = Depends(get_db)):
    person = crud.record_drink(db, user_id)
    if not person:
        raise HTTPException(status_code=404, detail="User not found")
    return person


@app.post("/payments/topup")
def top_up(
    payment: schemas.PaymentCreate,
    db: Session = Depends(get_db),
):
    url = crud.create_payment(db, payment)
    return {"checkoutUrl": url}


@app.get("/payments", response_model=list[schemas.Payment])
def list_payments(
    db: Session = Depends(get_db),
    admin: None = Depends(get_current_admin),
):
    return db.query(models.Payment).all()


@app.patch("/users/{user_id}")
def update_user(
    user_id: int,
    update: UpdateUser,
    db: Session = Depends(get_db),
    admin: None = Depends(get_current_admin),
):
    person = crud.update_user_balance(db, user_id, update.balance)
    if not person:
        raise HTTPException(status_code=404, detail="User not found")
    return person

class UpdateNickname(BaseModel):
    nickname: str | None


@app.patch("/users/{user_id}/nickname", response_model=schemas.Person)
def update_nickname(
    user_id: int,
    update: UpdateNickname,
    db: Session = Depends(get_db),
    admin: None = Depends(get_current_admin),
):
    person = crud.update_user_nickname(db, user_id, update.nickname)
    if not person:
        raise HTTPException(status_code=404, detail="User not found")
    return person

@app.post("/users/{user_id}/avatar", response_model=schemas.Person)
async def upload_avatar(user_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    user = crud.get_person(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    ext = os.path.splitext(file.filename)[1]
    filename = f"{user_id}_{uuid4().hex}{ext}"
    filepath = os.path.join(avatars_dir, filename)
    with open(filepath, "wb") as buffer:
        buffer.write(await file.read())
    avatar_url = f"/avatars/{filename}"
    crud.update_user_avatar(db, user_id, avatar_url)
    return crud.get_person(db, user_id)

@app.get("/users/{user_id}", response_model=schemas.Person)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_person(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


def get_date_range_this_month():
    now = datetime.utcnow()
    start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    next_month = start.replace(day=28) + timedelta(days=4)
    end = next_month.replace(day=1)
    return start, end


def get_date_range_last_month():
    now = datetime.utcnow()
    start_this_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    end = start_this_month
    start = (start_this_month - timedelta(days=1)).replace(day=1)
    return start, end


def get_date_range_this_year():
    now = datetime.utcnow()
    start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
    end = now.replace(month=12, day=31, hour=23, minute=59, second=59)
    return start, end


def get_date_range_last_year():
    now = datetime.utcnow()
    start = now.replace(year=now.year - 1, month=1, day=1, hour=0, minute=0, second=0)
    end = now.replace(
        year=now.year - 1, month=12, day=31, hour=23, minute=59, second=59
    )
    return start, end

def get_date_range_last_30_days():
    now = datetime.utcnow()
    end = now
    start = now - timedelta(days=30)
    return start, end

@app.get("/stats/drinks_this_month")
def drinks_this_month(db: Session = Depends(get_db)):
    start, end = get_date_range_this_month()
    return (
        db.query(models.DrinkEvent)
        .filter(models.DrinkEvent.timestamp >= start, models.DrinkEvent.timestamp < end)
        .count()
    )


@app.get("/stats/drinks_last_month")
def drinks_last_month(db: Session = Depends(get_db)):
    start, end = get_date_range_last_month()
    return (
        db.query(models.DrinkEvent)
        .filter(models.DrinkEvent.timestamp >= start, models.DrinkEvent.timestamp < end)
        .count()
    )


@app.get("/stats/drinks_this_year")
def drinks_this_year(db: Session = Depends(get_db)):
    start, end = get_date_range_this_year()
    return (
        db.query(models.DrinkEvent)
        .filter(
            models.DrinkEvent.timestamp >= start, models.DrinkEvent.timestamp <= end
        )
        .count()
    )


@app.get("/stats/drinks_last_year")
def drinks_last_year(db: Session = Depends(get_db)):
    start, end = get_date_range_last_year()
    return (
        db.query(models.DrinkEvent)
        .filter(
            models.DrinkEvent.timestamp >= start, models.DrinkEvent.timestamp <= end
        )
        .count()
    )


@app.get("/stats/monthly_leaderboard")
def monthly_leaderboard(db: Session = Depends(get_db)):
    start, end = get_date_range_this_month()
    results = (
        db.query(
            models.Person.id,
            models.Person.name,
            func.count(models.DrinkEvent.id).label("drinks"),
        )
        .outerjoin(
            models.DrinkEvent,
            and_(
                models.DrinkEvent.person_id == models.Person.id,
                models.DrinkEvent.timestamp >= start,
                models.DrinkEvent.timestamp < end,
            ),
        )
        .group_by(models.Person.id)
        .all()
    )
    return [{"id": r.id, "name": r.name, "drinks": int(r.drinks)} for r in results]


@app.get("/stats/yearly_leaderboard")
def yearly_leaderboard(db: Session = Depends(get_db)):
    start, end = get_date_range_this_year()
    results = (
        db.query(
            models.Person.id,
            models.Person.name,
            func.count(models.DrinkEvent.id).label("drinks"),
        )
        .outerjoin(
            models.DrinkEvent,
            and_(
                models.DrinkEvent.person_id == models.Person.id,
                models.DrinkEvent.timestamp >= start,
                models.DrinkEvent.timestamp <= end,
            ),
        )
        .group_by(models.Person.id)
        .all()
    )
    return [{"id": r.id, "name": r.name, "drinks": int(r.drinks)} for r in results]


@app.get("/stats/longest_hydration_streaks")
def longest_hydration_streaks(limit: int = 10, db: Session = Depends(get_db)):
    return crud.get_longest_hydration_streaks(db, limit)



@app.get("/users/{user_id}/stats")
def user_stats(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_person(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    start, end = get_date_range_last_30_days()
    drinks_count = (
        db.query(models.DrinkEvent)
        .filter(
            models.DrinkEvent.person_id == user_id,
            models.DrinkEvent.timestamp >= start,
            models.DrinkEvent.timestamp <= end,
        )
        .count()
    )
    return {"drinks_last_30_days": drinks_count, "favorite_drink": "Beer"}


@app.get("/insights/peak_thirst_hours")
def peak_thirst_hours(user_ids: str, db: Session = Depends(get_db)):
    """Return drink counts grouped by hour for specified users."""
    try:
        ids = [int(u) for u in user_ids.split(",") if u]
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user_ids")
    data = crud.drinks_per_hour(db, ids)
    results = [{"user_id": uid, "hours": data.get(uid, [0] * 24)} for uid in ids]
    return results

@app.get("/users/{user_id}/buddies")
def user_buddies(user_id: int, db: Session = Depends(get_db)):
    """Return how often other users drink within 5 minutes of the given user."""
    user = crud.get_person(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    events = (
        db.query(models.DrinkEvent.timestamp)
        .filter(models.DrinkEvent.person_id == user_id)
        .all()
    )

    buddy_counts: dict[int, dict[str, Any]] = {}
    for (timestamp,) in events:
        start = timestamp - timedelta(minutes=5)
        end = timestamp + timedelta(minutes=5)
        buddies = (
            db.query(models.Person.id, models.Person.name)
            .join(models.DrinkEvent)
            .filter(
                models.DrinkEvent.person_id != user_id,
                models.DrinkEvent.timestamp >= start,
                models.DrinkEvent.timestamp <= end,
            )
            .all()
        )
        for b_id, b_name in buddies:
            if b_id not in buddy_counts:
                buddy_counts[b_id] = {"id": b_id, "name": b_name, "count": 0}
            buddy_counts[b_id]["count"] += 1

    return sorted(buddy_counts.values(), key=lambda x: x["count"], reverse=True)


@app.get("/users/{user_id}/social_sip_scores", response_model=list[schemas.BuddyScore])
def social_sip_scores(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_person(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_social_sip_scores(db, user_id)


def _subtract_months(dt: datetime, months: int) -> datetime:
    """Return dt shifted back by given months preserving day where possible."""
    year = dt.year
    month = dt.month - months
    while month <= 0:
        month += 12
        year -= 1
    return dt.replace(year=year, month=month)


@app.get("/users/{user_id}/monthly_drinks")
def monthly_drinks(user_id: int, db: Session = Depends(get_db)):
    """Return drink counts per month for the last six months for a user."""
    user = crud.get_person(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    start = _subtract_months(
        datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0),
        5,
    )
    rows = (
        db.query(
            func.to_char(func.date_trunc("month", models.DrinkEvent.timestamp), "YYYY-MM").label("month"),
            func.count(models.DrinkEvent.id).label("count"),
        )
        .filter(models.DrinkEvent.person_id == user_id, models.DrinkEvent.timestamp >= start)
        .group_by("month")
        .order_by("month")
        .all()
    )
    return [
        {"userId": user_id, "month": r.month, "count": int(r.count)}
        for r in rows
    ]


@app.get("/backups", response_model=list[schemas.BackupLog])
def list_backups(
    db: Session = Depends(get_db),
    admin: None = Depends(get_current_admin),
):
    return crud.get_backups(db)


@app.post("/backups/run")
def run_backup(
    remote_name: str = os.getenv("BACKUP_REMOTE_NAME", "gdrive"),
    remote_path: str = os.getenv("BACKUP_REMOTE_PATH", "DrinkTrackerBackups"),
    db: Session = Depends(get_db),
    admin: None = Depends(get_current_admin),
):
    perform_backup(db, remote_name, remote_path)
    return {"ok": True}
