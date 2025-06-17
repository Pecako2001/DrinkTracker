import os
import sys
import pytest
import conftest
conftest.set_env_vars()
from fastapi import FastAPI, Depends
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
import sqlalchemy
from sqlalchemy.orm import sessionmaker

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

pytestmark = pytest.mark.usefixtures("env_vars")

from app.database import Base, get_db
from app import crud, schemas


@pytest.fixture
def client():
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=sqlalchemy.pool.StaticPool,
    )
    TestingSessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    Base.metadata.create_all(bind=engine)

    app = FastAPI()

    def override_get_db():
        with TestingSessionLocal() as db:
            yield db

    app.dependency_overrides[get_db] = override_get_db

    @app.post("/users", response_model=schemas.Person, response_model_by_alias=False)
    def create_user(person: schemas.PersonCreate, db=Depends(get_db)):
        return crud.create_person(db, person)

    @app.get("/users", response_model=list[schemas.Person], response_model_by_alias=False)
    def read_users(db=Depends(get_db)):
        return crud.get_persons(db)

    return TestClient(app)


def test_create_user_with_avatar_and_nickname(client):
    resp = client.post(
        "/users",
        json={"name": "Alice", "avatar_url": "http://example.com/a.png", "nickname": "Al"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["avatarUrl"] == "http://example.com/a.png"
    assert data["nickname"] == "Al"

    resp = client.get("/users")
    assert resp.status_code == 200
    users = resp.json()
    assert any(u["avatarUrl"] == "http://example.com/a.png" and u["nickname"] == "Al" for u in users)


def test_create_user_without_optional_fields(client):
    resp = client.post("/users", json={"name": "Bob"})
    assert resp.status_code == 200
    data = resp.json()
    assert data["avatarUrl"] is None
    assert data["nickname"] is None


def test_users_sorted_by_name(client):
    client.post("/users", json={"name": "Charlie"})
    client.post("/users", json={"name": "Alice"})
    client.post("/users", json={"name": "Bob"})

    resp = client.get("/users")
    assert resp.status_code == 200
    names = [u["name"] for u in resp.json()]
    assert names == sorted(names)
