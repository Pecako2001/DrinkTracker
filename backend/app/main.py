from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from . import models, schemas, crud
from .database import engine, Base, get_db
from fastapi.middleware.cors import CORSMiddleware

Base.metadata.create_all(bind=engine)

app = FastAPI()

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