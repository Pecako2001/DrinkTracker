from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, schemas, crud
from .database import engine, Base, get_db
import os
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime, timedelta

if os.getenv("TESTING") != "1":
    Base.metadata.create_all(bind=engine)

app = FastAPI()

class UpdateUser(BaseModel):
    balance: float

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
def create_user(person: schemas.PersonCreate, db: Session = Depends(get_db)):
    return crud.create_person(db, person)

@app.delete("/users/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    crud.delete_person(db, user_id)
    return {"ok": True}

@app.post("/users/{user_id}/drinks", response_model=schemas.Person)
def add_drink(user_id: int, db: Session = Depends(get_db)):
    person = crud.record_drink(db, user_id)
    if not person:
        raise HTTPException(status_code=404, detail="User not found")
    return person

@app.post("/payments/topup")
def top_up(payment: schemas.PaymentCreate, db: Session = Depends(get_db)):
    url = crud.create_payment(db, payment)
    return {"checkoutUrl": url}

@app.get("/payments", response_model=list[schemas.Payment])
def list_payments(db: Session = Depends(get_db)):
    return db.query(models.Payment).all()

@app.patch("/users/{user_id}")
def update_user(user_id: int, update: UpdateUser, db: Session = Depends(get_db)):
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
    end = now.replace(year=now.year - 1, month=12, day=31, hour=23, minute=59, second=59)
    return start, end

def get_date_range_last_30_days():
    now = datetime.utcnow()
    end = now
    start = now - timedelta(days=30)
    return start, end

@app.get("/stats/drinks_this_month")
def drinks_this_month(db: Session = Depends(get_db)):
    start, end = get_date_range_this_month()
    return db.query(models.DrinkEvent).filter(models.DrinkEvent.timestamp >= start, models.DrinkEvent.timestamp < end).count()

@app.get("/stats/drinks_last_month")
def drinks_last_month(db: Session = Depends(get_db)):
    start, end = get_date_range_last_month()
    return db.query(models.DrinkEvent).filter(models.DrinkEvent.timestamp >= start, models.DrinkEvent.timestamp < end).count()

@app.get("/stats/drinks_this_year")
def drinks_this_year(db: Session = Depends(get_db)):
    start, end = get_date_range_this_year()
    return db.query(models.DrinkEvent).filter(models.DrinkEvent.timestamp >= start, models.DrinkEvent.timestamp <= end).count()

@app.get("/stats/drinks_last_year")
def drinks_last_year(db: Session = Depends(get_db)):
    start, end = get_date_range_last_year()
    return db.query(models.DrinkEvent).filter(models.DrinkEvent.timestamp >= start, models.DrinkEvent.timestamp <= end).count()


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
