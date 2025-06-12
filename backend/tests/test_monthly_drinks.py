from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from datetime import datetime
import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

os.environ.setdefault("POSTGRES_USER", "test")
os.environ.setdefault("POSTGRES_PASSWORD", "test")
os.environ.setdefault("POSTGRES_DB", "test")
os.environ.setdefault("POSTGRES_HOST", "localhost")
os.environ.setdefault("POSTGRES_PORT", "5432")
os.environ["TESTING"] = "1"

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


def test_monthly_drinks():
    app.dependency_overrides[get_db] = override_get_db
    with TestingSessionLocal() as db:
        user = Person(name="Test")
        db.add(user)
        db.commit()
        db.refresh(user)
        user_id = user.id
        base = datetime.utcnow().replace(day=15, hour=0, minute=0, second=0, microsecond=0)
        events = [
            DrinkEvent(person_id=user.id, timestamp=base),
            DrinkEvent(person_id=user.id, timestamp=_subtract_months(base, 1)),
            DrinkEvent(person_id=user.id, timestamp=_subtract_months(base, 7)),
        ]
        db.add_all(events)
        db.commit()
        user_id = user.id

    resp = client.get(f"/users/{user_id}/monthly_drinks")
    assert resp.status_code == 200
    data = resp.json()
    months = {row["month"]: row["count"] for row in data}
    assert months[base.strftime("%Y-%m")] == 1
    assert months[_subtract_months(base, 1).strftime("%Y-%m")] == 1
    assert _subtract_months(base, 7).strftime("%Y-%m") not in months
    app.dependency_overrides.clear()
