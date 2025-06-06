from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import sys
import os

# Ensure backend/app is in path
sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

# Provide dummy env vars so database module can be imported
os.environ.setdefault("POSTGRES_USER", "test")
os.environ.setdefault("POSTGRES_PASSWORD", "test")
os.environ.setdefault("POSTGRES_DB", "test")
os.environ.setdefault("POSTGRES_HOST", "localhost")
os.environ.setdefault("POSTGRES_PORT", "5432")
os.environ["TESTING"] = "1"

from app.main import app, get_db
from app.models import Base, Person, DrinkEvent

SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def test_user_stats_last_30_days():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    # create user and events
    user = Person(name="Test")
    db.add(user)
    db.commit()
    db.refresh(user)
    user_id = user.id

    # within last 30 days
    event_recent = DrinkEvent(person_id=user.id, timestamp=datetime.utcnow() - timedelta(days=5))
    # older than 30 days
    event_old = DrinkEvent(person_id=user.id, timestamp=datetime.utcnow() - timedelta(days=40))
    db.add_all([event_recent, event_old])
    db.commit()
    db.close()

    response = client.get(f"/users/{user_id}/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["drinks_last_30_days"] == 1
    assert "favorite_drink" in data


def test_chug_of_fame():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    alice = Person(name="Alice2")
    bob = Person(name="Bob2")
    db.add_all([alice, bob])
    db.commit()
    db.refresh(alice)
    db.refresh(bob)
    alice_id = alice.id
    bob_id = bob.id

    events = [
        DrinkEvent(person_id=alice.id, timestamp=datetime(2024, 1, 1, 10, 0, 0)),
        DrinkEvent(person_id=alice.id, timestamp=datetime(2024, 1, 1, 10, 0, 20)),
        DrinkEvent(person_id=bob.id, timestamp=datetime(2024, 1, 1, 9, 0, 0)),
        DrinkEvent(person_id=bob.id, timestamp=datetime(2024, 1, 1, 9, 0, 30)),
    ]
    db.add_all(events)
    db.commit()
    db.close()

    resp = client.get("/stats/chug_of_fame")
    assert resp.status_code == 200
    data = resp.json()
    assert data[0]["id"] == alice_id
    assert data[0]["fastest_seconds"] == 20
    assert data[1]["id"] == bob_id
    assert data[1]["fastest_seconds"] == 30
