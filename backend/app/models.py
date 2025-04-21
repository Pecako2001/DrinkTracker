from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from .database import Base

class Person(Base):
    __tablename__ = "persons"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    balance = Column(Numeric(10,2), default=0)
    total_drinks = Column(Integer, default=0)
    drinks = relationship("DrinkEvent", back_populates="person")
    payments = relationship("Payment", back_populates="person")

class DrinkEvent(Base):
    __tablename__ = "drink_events"
    id = Column(Integer, primary_key=True, index=True)
    person_id = Column(Integer, ForeignKey("persons.id"))
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    person = relationship("Person", back_populates="drinks")

class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    mollie_id = Column(String, unique=True, nullable=False)
    person_id = Column(Integer, ForeignKey("persons.id"))
    amount = Column(Numeric(10,2), nullable=False)
    status = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    person = relationship("Person", back_populates="payments")