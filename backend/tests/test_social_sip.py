import os
import sys
import pytest
import conftest
conftest.set_env_vars()
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import datetime, timedelta

# Ensure backend/app is in path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

pytestmark = pytest.mark.usefixtures("env_vars")

from app.main import app, get_db
from app.models import Base, Person, DrinkEvent

engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


client = TestClient(app)


def test_social_sip_score():
    app.dependency_overrides[get_db] = override_get_db
    db = TestingSessionLocal()
    alice = Person(name="Alice")
    bob = Person(name="Bob")
    charlie = Person(name="Charlie")
    db.add_all([alice, bob, charlie])
    db.commit()
    db.refresh(alice)
    db.refresh(bob)
    db.refresh(charlie)
    alice_id = alice.id
    bob_id = bob.id

    base_time = datetime.utcnow()
    events = [
        DrinkEvent(person_id=alice.id, timestamp=base_time),
        DrinkEvent(person_id=bob.id, timestamp=base_time + timedelta(minutes=1)),
        DrinkEvent(person_id=alice.id, timestamp=base_time + timedelta(minutes=2)),
        DrinkEvent(person_id=charlie.id, timestamp=base_time + timedelta(minutes=10)),
    ]
    db.add_all(events)
    db.commit()
    db.close()

    resp = client.get(f"/users/{alice_id}/buddies")
    assert resp.status_code == 200
    data = resp.json()
    assert len(data) == 1
    assert data[0]["id"] == bob_id
    assert data[0]["count"] == 2
    app.dependency_overrides.clear()

