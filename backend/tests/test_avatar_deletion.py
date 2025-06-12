import os
import sys
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

# Provide dummy env vars
os.environ.setdefault("POSTGRES_USER", "test")
os.environ.setdefault("POSTGRES_PASSWORD", "test")
os.environ.setdefault("POSTGRES_DB", "test")
os.environ.setdefault("POSTGRES_HOST", "localhost")
os.environ.setdefault("POSTGRES_PORT", "5432")
os.environ["TESTING"] = "1"

from app.main import app, get_db
from app.models import Base, Person
from app.routers import users as users_router

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


def clear_avatars():
    for f in os.listdir(users_router.avatars_dir):
        os.remove(os.path.join(users_router.avatars_dir, f))


def test_avatar_update_deletes_old_file():
    app.dependency_overrides[get_db] = override_get_db
    clear_avatars()
    with TestingSessionLocal() as db:
        user = Person(name="Test")
        db.add(user)
        db.commit()
        db.refresh(user)
        user_id = user.id

    # first upload
    resp = client.post(
        f"/users/{user_id}/avatar",
        files={"file": ("a1.png", b"first", "image/png")},
    )
    assert resp.status_code == 200
    first_url = resp.json()["avatar_url"]
    first_path = os.path.join(users_router.avatars_dir, os.path.basename(first_url))
    assert os.path.exists(first_path)

    # second upload
    resp = client.post(
        f"/users/{user_id}/avatar",
        files={"file": ("a2.png", b"second", "image/png")},
    )
    assert resp.status_code == 200
    second_url = resp.json()["avatar_url"]
    second_path = os.path.join(users_router.avatars_dir, os.path.basename(second_url))
    assert os.path.exists(second_path)
    assert not os.path.exists(first_path)
    app.dependency_overrides.clear()
