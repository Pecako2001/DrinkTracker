import os, sys
import pytest
import conftest
conftest.set_env_vars()
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import datetime

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

pytestmark = pytest.mark.usefixtures("env_vars")

from app.main import app, get_db, _subtract_months
from app.models import Base, Person, DrinkEvent

engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    with TestingSessionLocal() as db:
        yield db

client = TestClient(app)


def test_monthly_totals_multi():
    app.dependency_overrides[get_db] = override_get_db
    with TestingSessionLocal() as db:
        alice = Person(name="Alice")
        bob = Person(name="Bob")
        db.add_all([alice, bob])
        db.commit()
        db.refresh(alice)
        db.refresh(bob)
        base = datetime.utcnow().replace(day=15, hour=0, minute=0, second=0, microsecond=0)
        events = [
            DrinkEvent(person_id=alice.id, timestamp=base),
            DrinkEvent(person_id=bob.id, timestamp=base),
            DrinkEvent(person_id=bob.id, timestamp=_subtract_months(base, 1)),
        ]
        db.add_all(events)
        db.commit()
        alice_id = alice.id
        bob_id = bob.id

    resp = client.get(f"/insights/monthly_totals", params={"user_ids": f"{alice_id},{bob_id}"})
    assert resp.status_code == 200
    data = resp.json()
    months = {row["month"] for row in data}
    assert len(months) == 6
    # counts
    counts = {(row["userId"], row["month"]): row["count"] for row in data}
    assert counts[(alice_id, base.strftime("%Y-%m"))] == 1
    assert counts[(bob_id, base.strftime("%Y-%m"))] == 1
    assert counts[(bob_id, _subtract_months(base, 1).strftime("%Y-%m"))] == 1
    app.dependency_overrides.clear()
