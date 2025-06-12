from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
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


def test_user_stats_last_30_days():
    app.dependency_overrides[get_db] = override_get_db
    with TestingSessionLocal() as db:
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

    response = client.get(f"/users/{user_id}/stats")
    assert response.status_code == 200
    data = response.json()
    assert data["drinks_last_30_days"] == 1
    assert "favorite_drink" in data
    app.dependency_overrides.clear()
