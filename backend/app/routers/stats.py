from datetime import datetime, timedelta
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func, and_
from sqlalchemy.orm import Session

from .. import models, schemas, crud
from ..database import get_db

router = APIRouter()


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


def _subtract_months(dt: datetime, months: int) -> datetime:
    """Return dt shifted back by given months preserving day where possible."""
    year = dt.year
    month = dt.month - months
    while month <= 0:
        month += 12
        year -= 1
    return dt.replace(year=year, month=month)


@router.get("/stats/drinks_this_month")
def drinks_this_month(db: Session = Depends(get_db)) -> int:
    """Return number of drinks recorded this month."""
    start, end = get_date_range_this_month()
    return (
        db.query(models.DrinkEvent)
        .filter(models.DrinkEvent.timestamp >= start, models.DrinkEvent.timestamp < end)
        .count()
    )


@router.get("/stats/drinks_last_month")
def drinks_last_month(db: Session = Depends(get_db)) -> int:
    """Return number of drinks recorded last month."""
    start, end = get_date_range_last_month()
    return (
        db.query(models.DrinkEvent)
        .filter(models.DrinkEvent.timestamp >= start, models.DrinkEvent.timestamp < end)
        .count()
    )


@router.get("/stats/drinks_this_year")
def drinks_this_year(db: Session = Depends(get_db)) -> int:
    """Return number of drinks recorded this year."""
    start, end = get_date_range_this_year()
    return (
        db.query(models.DrinkEvent)
        .filter(
            models.DrinkEvent.timestamp >= start, models.DrinkEvent.timestamp <= end
        )
        .count()
    )


@router.get("/stats/drinks_last_year")
def drinks_last_year(db: Session = Depends(get_db)) -> int:
    """Return number of drinks recorded last year."""
    start, end = get_date_range_last_year()
    return (
        db.query(models.DrinkEvent)
        .filter(
            models.DrinkEvent.timestamp >= start, models.DrinkEvent.timestamp <= end
        )
        .count()
    )


@router.get("/stats/monthly_leaderboard")
def monthly_leaderboard(db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    """Return drink counts per user for the current month."""
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


@router.get("/stats/yearly_leaderboard")
def yearly_leaderboard(db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    """Return drink counts per user for the current year."""
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


@router.get("/stats/longest_hydration_streaks")
def longest_hydration_streaks(
    limit: int = 10, db: Session = Depends(get_db)
) -> list[dict[str, int | str]]:
    """Return users with the longest drink streaks."""
    return crud.get_longest_hydration_streaks(db, limit)


@router.get("/users/{user_id}/stats")
def user_stats(user_id: int, db: Session = Depends(get_db)) -> dict[str, Any]:
    """Return drink stats for the last 30 days for one user."""
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


@router.get("/insights/peak_thirst_hours")
def peak_thirst_hours(
    user_ids: str, db: Session = Depends(get_db)
) -> list[dict[str, Any]]:
    """Return drink counts grouped by hour for specified users."""
    try:
        ids = [int(u) for u in user_ids.split(",") if u]
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid user_ids")
    data = crud.drinks_per_hour(db, ids)
    results = [{"user_id": uid, "hours": data.get(uid, [0] * 24)} for uid in ids]
    return results


@router.get("/users/{user_id}/monthly_drinks")
def monthly_drinks(user_id: int, db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    """Return drink counts per month for the last six months for a user."""
    user = crud.get_person(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    start = _subtract_months(
        datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0),
        5,
    )
    dialect = db.bind.dialect.name if db.bind else ""
    if dialect == "sqlite":
        month_expr = func.strftime("%Y-%m", models.DrinkEvent.timestamp)
    else:
        month_expr = func.to_char(
            func.date_trunc("month", models.DrinkEvent.timestamp),
            "YYYY-MM",
        )

    rows = (
        db.query(
            month_expr.label("month"),
            func.count(models.DrinkEvent.id).label("count"),
        )
        .filter(
            models.DrinkEvent.person_id == user_id, models.DrinkEvent.timestamp >= start
        )
        .group_by("month")
        .order_by("month")
        .all()
    )
    return [{"userId": user_id, "month": r.month, "count": int(r.count)} for r in rows]


@router.get(
    "/users/{user_id}/social_sip_scores", response_model=list[schemas.BuddyScore]
)
def social_sip_scores(
    user_id: int, db: Session = Depends(get_db)
) -> list[dict[str, int | str]]:
    """Return the top drinking buddies for a user."""
    user = crud.get_person(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return crud.get_social_sip_scores(db, user_id)
