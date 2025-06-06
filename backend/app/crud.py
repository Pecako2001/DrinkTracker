from sqlalchemy.orm import Session
from . import models, schemas
from fastapi import HTTPException
from decimal import Decimal
import uuid
from mollie.api.client import Client as MollieClient
import os

def get_persons(db: Session):
    return db.query(models.Person).all()

def get_person(db: Session, person_id: int):
    return db.query(models.Person).filter(models.Person.id == person_id).first()

def create_person(db: Session, person: schemas.PersonCreate):
    db_person = models.Person(
        name=person.name,
        avatar_url=person.avatar_url,
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

# crud.py
def update_user_balance(db: Session, user_id: int, new_balance: float):
    person = get_person(db, user_id)
    if not person:
        return None
    person.balance = new_balance
    db.commit()
    db.refresh(person)
    return person

def get_person(db: Session, person_id: int):
    return db.query(models.Person).filter(models.Person.id == person_id).first()

def create_payment(db: Session, payment: schemas.PaymentCreate):
    # Simulate creating a payment without Mollie
    payment_obj = models.Payment(
        mollie_id=f"simulated-{uuid.uuid4().hex}",
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
