from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal


class PersonBase(BaseModel):
    name: str
    avatarUrl: str | None = Field(default=None, alias="avatar_url")
    nickname: str | None = None

class PersonCreate(PersonBase):
    pass


class Person(PersonBase):
    id: int
    balance: float
    total_drinks: int

    class Config:
        orm_mode = True
        allow_population_by_field_name = True


class PersonOut(BaseModel):
    id: int
    name: str
    avatarUrl: str | None = Field(default=None, alias="avatar_url")
    nickname: str | None = None
    balance: Decimal
    total_drinks: int

    class Config:
        orm_mode = True
        allow_population_by_field_name = True


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
    person_id: int 
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

class PersonOut(BaseModel):
    id: int
    name: str
    avatarUrl: Optional[str] = Field(None, alias="avatar_url")
    nickname: Optional[str] = None
    balance: Decimal
    total_drinks: int

    class Config:
        orm_mode = True
        fields = {
            "avatarUrl": "avatar_url",
        }