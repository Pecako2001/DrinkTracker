from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models, schemas
from fastapi import HTTPException
from uuid import uuid4
from decimal import Decimal
from mollie.api.client import Client as MollieClient
import os


def get_persons(db: Session):
    """Return all persons sorted by name for deterministic ordering."""
    return db.query(models.Person).order_by(models.Person.name.asc()).all()

def create_person(db: Session, person: schemas.PersonCreate):
    db_person = models.Person(
        name=person.name,
        avatar_url=person.avatarUrl,
        nickname=person.nickname,
    )
    db.add(db_person)
    db.commit()
    db.refresh(db_person)
    return db_person


def delete_person(db: Session, person_id: int):
    db.query(models.Person).filter(models.Person.id == person_id).delete()
    db.commit()


def record_drink(db: Session, person_id: int):
    person = get_person(db, person_id)
    if not person:
        return None
    person.balance = person.balance - Decimal("1.00")
    person.total_drinks += 1
    ev = models.DrinkEvent(person_id=person_id)
    db.add(ev)
    db.commit()
    db.refresh(person)
    return person


def undo_last_drink(db: Session, person_id: int):
    """Revert the most recent drink event for a user."""
    person = get_person(db, person_id)
    if not person or person.total_drinks <= 0:
        return None

    last_event = (
        db.query(models.DrinkEvent)
        .filter(models.DrinkEvent.person_id == person_id)
        .order_by(models.DrinkEvent.id.desc())
        .first()
    )
    if not last_event:
        return None

    person.balance += Decimal("1.00")
    person.total_drinks -= 1
    db.delete(last_event)
    db.commit()
    db.refresh(person)
    return person


# crud.py
def update_user_balance(
    db: Session, user_id: int, new_balance: float, new_total_drinks: int | None = None
):
    person = get_person(db, user_id)
    if not person:
        return None
    person.balance = new_balance
    if new_total_drinks is not None:
        person.total_drinks = new_total_drinks
    db.commit()
    db.refresh(person)
    return person

def update_user_avatar(db: Session, user_id: int, avatar_url: str):
    person = get_person(db, user_id)
    if not person:
        return None
    person.avatar_url = avatar_url
    db.commit()
    db.refresh(person)
    return person

def update_user_nickname(db: Session, user_id: int, nickname: str | None):
    person = get_person(db, user_id)
    if not person:
        return None
    person.nickname = nickname
    db.commit()
    db.refresh(person)
    return person

def get_person(db: Session, person_id: int):
    return db.query(models.Person).filter(models.Person.id == person_id).first()


def create_payment(db: Session, payment: schemas.PaymentCreate):
    # Simulate creating a payment without Mollie
    payment_obj = models.Payment(
        mollie_id=f"simulated-{uuid4().hex}",
        person_id=payment.user_id,
        amount=Decimal(str(payment.amount)),
        status="completed",
    )
    db.add(payment_obj)

    # Directly update balance as if paid
    person = get_person(db, payment.user_id)
    if not person:
        raise HTTPException(status_code=404, detail="User not found")

    person.balance += Decimal(str(payment.amount))
    db.commit()
    db.refresh(payment_obj)

    # Simulate redirect URL
    return "http://localhost:3000/?success=true"


def drinks_per_hour(db: Session, user_ids: list[int]):
    """Return count of drinks grouped by hour for each given user."""
    if not user_ids:
        return {}

    results = (
        db.query(
            models.DrinkEvent.person_id.label("person_id"),
            func.extract("hour", models.DrinkEvent.timestamp).label("hour"),
            func.count(models.DrinkEvent.id).label("count"),
        )
        .filter(models.DrinkEvent.person_id.in_(user_ids))
        .group_by(models.DrinkEvent.person_id, "hour")
        .all()
    )

    data = {uid: [0] * 24 for uid in user_ids}
    for row in results:
        data[row.person_id][int(row.hour)] = int(row.count)
    return data

from datetime import date
def get_longest_hydration_streaks(db: Session, limit: int = 10):
    """Return users with the longest consecutive-day drink streaks."""
    from collections import defaultdict
    from datetime import timedelta

    rows = (
        db.query(
            models.DrinkEvent.person_id,
            func.date(models.DrinkEvent.timestamp).label("day"),
        )
        .group_by(models.DrinkEvent.person_id, func.date(models.DrinkEvent.timestamp))
        .order_by(models.DrinkEvent.person_id, func.date(models.DrinkEvent.timestamp))
        .all()
    )

    days_by_user: dict[int, list[date]] = defaultdict(list)
    for user_id, day in rows:
        if isinstance(day, str):
            day = date.fromisoformat(day)
        days_by_user[user_id].append(day)

    streaks: list[tuple[int, int]] = []
    for user_id, days in days_by_user.items():
        days_sorted = sorted(days)
        longest = 0
        current = 0
        prev_day = None
        for d in days_sorted:
            if prev_day is not None and d == prev_day + timedelta(days=1):
                current += 1
            else:
                current = 1
            longest = max(longest, current)
            prev_day = d
        streaks.append((user_id, longest))

    id_to_name = {
        p.id: p.name for p in db.query(models.Person.id, models.Person.name).all()
    }

    sorted_streaks = sorted(streaks, key=lambda x: x[1], reverse=True)[:limit]
    return [
        {"id": uid, "name": id_to_name.get(uid, ""), "streak": streak}
        for uid, streak in sorted_streaks
    ]

# def create_payment(db: Session, payment: schemas.PaymentCreate):
#     mollie_api_key = os.getenv("MOLLIE_API_KEY")
#     mollie = MollieClient()
#     mollie.set_api_key(mollie_api_key)

#     # store placeholder in your DB
#     payment_obj = models.Payment(
#         mollie_id="pending",
#         person_id=payment.user_id,
#         amount=payment.amount,
#         status="created",
#     )
#     db.add(payment_obj)
#     db.commit()
#     db.refresh(payment_obj)

#     # create Mollie payment
#     mollie_payment = mollie.payments.create({
#         "amount": {"currency": "EUR", "value": f"{payment.amount:.2f}"},
#         "description": f"Top up for user {payment.user_id}",
#         "redirectUrl": os.getenv("FRONTEND_URL", "http://localhost:3000") + "/",
#     })
#     # update your DB with real Mollie ID
#     payment_obj.mollie_id = mollie_payment.id
#     db.commit()

#     return mollie_payment.get_checkout_url()


def get_social_sip_scores(
    db: Session, user_id: int, limit: int = 5, window_minutes: int = 5
):
    """Return top drinking buddies for a user within the given time window."""
    from datetime import timedelta

    events = (
        db.query(models.DrinkEvent.timestamp)
        .filter(models.DrinkEvent.person_id == user_id)
        .all()
    )

    counts: dict[int, int] = {}
    window = timedelta(minutes=window_minutes)

    for (ts,) in events:
        start = ts - window
        end = ts + window
        others = (
            db.query(models.DrinkEvent.person_id)
            .filter(models.DrinkEvent.person_id != user_id)
            .filter(models.DrinkEvent.timestamp >= start)
            .filter(models.DrinkEvent.timestamp <= end)
            .all()
        )
        for (pid,) in others:
            counts[pid] = counts.get(pid, 0) + 1

    sorted_buddies = sorted(counts.items(), key=lambda x: x[1], reverse=True)[:limit]
    results = []
    for buddy_id, score in sorted_buddies:
        name = (
            db.query(models.Person.name).filter(models.Person.id == buddy_id).scalar()
        )
        results.append({"buddy_id": buddy_id, "buddy_name": name, "score": score})

    return results


def create_backup_log(db: Session, success: bool, message: str | None = None):
    log = models.BackupLog(success=success, message=message)
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def get_backups(db: Session, limit: int = 20):
    return (
        db.query(models.BackupLog)
        .order_by(models.BackupLog.timestamp.desc())
        .limit(limit)
        .all()
    )
