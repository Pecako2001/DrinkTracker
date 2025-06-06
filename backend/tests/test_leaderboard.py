import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, and_
from sqlalchemy.orm import sessionmaker
import os
import sys

# Ensure backend/app is in path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))
from sqlalchemy.pool import StaticPool
from datetime import timedelta
import types
from unittest import mock

# Stub mollie client to avoid optional dependency in tests
mollie = types.ModuleType("mollie")
api_mod = types.ModuleType("api")
client_mod = types.ModuleType("client")
client_mod.Client = object
api_mod.client = client_mod
mollie.api = api_mod
sys.modules.setdefault("mollie", mollie)
sys.modules.setdefault("mollie.api", api_mod)
sys.modules.setdefault("mollie.api.client", client_mod)

test_engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

with mock.patch("sqlalchemy.create_engine", lambda *a, **k: test_engine):
    from app.main import (
        app,
        get_db,
        get_date_range_this_month,
        get_date_range_last_month,
        get_date_range_this_year,
        get_date_range_last_year,
    )
    from app import models
    from app.database import Base


def create_test_app():
    TestingSessionLocal = sessionmaker(
        bind=test_engine, autoflush=False, autocommit=False
    )
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    def override_get_db():
        db = TestingSessionLocal()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    return client, TestingSessionLocal


def setup_test_data(SessionLocal):
    with SessionLocal() as db:
        alice = models.Person(name="Alice")
        bob = models.Person(name="Bob")
        charlie = models.Person(name="Charlie")
        db.add_all([alice, bob, charlie])
        db.commit()
        db.refresh(alice)
        db.refresh(bob)
        db.refresh(charlie)

        start_month, _ = get_date_range_this_month()
        start_year, _ = get_date_range_this_year()
        start_last_month, _ = get_date_range_last_month()
        start_last_year, _ = get_date_range_last_year()

        events = [
            models.DrinkEvent(
                person_id=alice.id, timestamp=start_month + timedelta(days=1)
            ),
            models.DrinkEvent(
                person_id=alice.id, timestamp=start_month + timedelta(days=2)
            ),
            models.DrinkEvent(
                person_id=bob.id, timestamp=start_month + timedelta(days=3)
            ),
            models.DrinkEvent(
                person_id=alice.id, timestamp=start_year + timedelta(days=1)
            ),
            models.DrinkEvent(
                person_id=alice.id, timestamp=start_last_month + timedelta(days=1)
            ),
            models.DrinkEvent(
                person_id=bob.id, timestamp=start_last_year + timedelta(days=1)
            ),
        ]
        db.add_all(events)
        db.commit()


@pytest.fixture
def client_session():
    client, SessionLocal = create_test_app()
    setup_test_data(SessionLocal)
    yield client
    app.dependency_overrides.clear()


def test_monthly_leaderboard(client_session):
    client = client_session
    resp = client.get("/stats/monthly_leaderboard")
    assert resp.status_code == 200
    data = sorted(resp.json(), key=lambda x: x["name"])
    assert data == [
        {"id": 1, "name": "Alice", "drinks": 2},
        {"id": 2, "name": "Bob", "drinks": 1},
        {"id": 3, "name": "Charlie", "drinks": 0},
    ]


def test_yearly_leaderboard(client_session):
    client = client_session
    resp = client.get("/stats/yearly_leaderboard")
    assert resp.status_code == 200
    data = sorted(resp.json(), key=lambda x: x["name"])
    assert data == [
        {"id": 1, "name": "Alice", "drinks": 4},
        {"id": 2, "name": "Bob", "drinks": 1},
        {"id": 3, "name": "Charlie", "drinks": 0},
    ]
