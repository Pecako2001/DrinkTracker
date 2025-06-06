from pydantic import BaseModel
from datetime import datetime
from decimal import Decimal


class PersonBase(BaseModel):
    name: str


class PersonCreate(PersonBase):
    pass


class Person(PersonBase):
    id: int
    balance: float
    total_drinks: int

    class Config:
        orm_mode = True


class DrinkEvent(BaseModel):
    id: int
    person_id: int
    timestamp: datetime

    class Config:
        orm_mode = True


class PaymentCreate(BaseModel):
    user_id: int
    amount: float


class Payment(BaseModel):
    id: int
    mollie_id: str
    person_id: int  # ✅ Must match your SQLAlchemy model
    amount: Decimal
    status: str
    created_at: datetime

    class Config:
        orm_mode = True


class BuddyScore(BaseModel):
    buddy_id: int
    buddy_name: str
    score: int

    class Config:
        orm_mode = True
