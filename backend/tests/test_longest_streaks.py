import types
import sys
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from unittest import mock
import pytest

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
    from app.main import app, get_db
    from app import models
    from app.database import Base
    from app.main import longest_hydration_streaks


def create_test_app():
    TestingSessionLocal = sessionmaker(bind=test_engine, autoflush=False, autocommit=False)
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)

    def override_get_db():
        with TestingSessionLocal() as db:
            yield db

    app.dependency_overrides[get_db] = override_get_db
    client = TestClient(app)
    return client, TestingSessionLocal

from fastapi.testclient import TestClient


def setup_test_data(SessionLocal):
    with SessionLocal() as db:
        alice = models.Person(name="Alice")
        bob = models.Person(name="Bob")
        db.add_all([alice, bob])
        db.commit()
        db.refresh(alice)
        db.refresh(bob)

        start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) - timedelta(days=5)
        events = [
            models.DrinkEvent(person_id=alice.id, timestamp=start),
            models.DrinkEvent(person_id=alice.id, timestamp=start + timedelta(days=1)),
            models.DrinkEvent(person_id=alice.id, timestamp=start + timedelta(days=2)),
            models.DrinkEvent(person_id=bob.id, timestamp=start + timedelta(days=1)),
            models.DrinkEvent(person_id=bob.id, timestamp=start + timedelta(days=3)),
        ]
        db.add_all(events)
        db.commit()


@pytest.fixture
def client_session():
    client, SessionLocal = create_test_app()
    setup_test_data(SessionLocal)
    yield client
    app.dependency_overrides.clear()


def test_longest_hydration_streaks(client_session):
    client = client_session
    resp = client.get("/stats/longest_hydration_streaks")
    assert resp.status_code == 200
    data = resp.json()
    assert data[0]["name"] == "Alice" and data[0]["streak"] == 3
