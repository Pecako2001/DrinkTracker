from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Any
from sqlalchemy import func, and_
from . import models, schemas, crud
from .database import engine, Base, get_db
import os
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import List
from .auth import router as auth_router, get_current_admin
import dotenv

dotenv.load_dotenv()

if os.getenv("TESTING") != "1":
    Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(auth_router)



class UpdateUser(BaseModel):
    balance: float
    total_drinks: int | None = None



app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/users", response_model=list[schemas.Person])
def read_users(db: Session = Depends(get_db)):
    return crud.get_persons(db)


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
