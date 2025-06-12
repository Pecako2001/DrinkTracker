from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.orm import Session
from typing import Any
from uuid import uuid4
from datetime import timedelta
import os

from .. import crud, schemas, models
from ..database import get_db
from ..auth import get_current_admin

router = APIRouter()

avatars_dir = os.path.join(os.path.dirname(__file__), "..", "avatars")
os.makedirs(avatars_dir, exist_ok=True)


class UpdateUser(BaseModel):
    balance: float
    total_drinks: int | None = None


class UpdateNickname(BaseModel):
    nickname: str | None


@router.get(
    "/users",
    response_model=list[schemas.PersonOut],
    response_model_by_alias=False,
)
def read_users(db: Session = Depends(get_db)):
    return crud.get_persons(db)


@router.post("/users", response_model=schemas.Person)
def create_user(
    person: schemas.PersonCreate,
    db: Session = Depends(get_db),
    admin: None = Depends(get_current_admin),
):
    return crud.create_person(db, person)


@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    admin: None = Depends(get_current_admin),
):
    crud.delete_person(db, user_id)
    return {"ok": True}


@router.post("/users/{user_id}/drinks", response_model=schemas.Person)
def add_drink(user_id: int, db: Session = Depends(get_db)):
    person = crud.record_drink(db, user_id)
    if not person:
        raise HTTPException(status_code=404, detail="User not found")
    return person


@router.post("/users/{user_id}/drinks/undo", response_model=schemas.Person)
def undo_drink(user_id: int, db: Session = Depends(get_db)):
    person = crud.undo_last_drink(db, user_id)
    if not person:
        raise HTTPException(status_code=404, detail="User or drink not found")
    return person


@router.patch("/users/{user_id}")
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


@router.patch("/users/{user_id}/nickname", response_model=schemas.Person)
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


@router.post("/users/{user_id}/avatar", response_model=schemas.Person)
async def upload_avatar(
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    user = crud.get_person(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # Remove previous avatar file if it exists
    old_avatar = user.avatar_url
    if old_avatar and old_avatar.startswith("/avatars/"):
        old_path = os.path.join(avatars_dir, os.path.basename(old_avatar))
        if os.path.exists(old_path):
            os.remove(old_path)

    ext = os.path.splitext(file.filename)[1]
    filename = f"{user_id}_{uuid4().hex}{ext}"
    filepath = os.path.join(avatars_dir, filename)
    with open(filepath, "wb") as buffer:
        buffer.write(await file.read())
    avatar_url = f"/avatars/{filename}"
    crud.update_user_avatar(db, user_id, avatar_url)
    return crud.get_person(db, user_id)


@router.get("/users/{user_id}", response_model=schemas.Person)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_person(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.get("/users/{user_id}/buddies")
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
