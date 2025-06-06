import os
from fastapi.testclient import TestClient
from jose import jwt
from passlib.context import CryptContext

os.environ["ADMIN_SECRET_KEY"] = "testsecret"
os.environ.setdefault("POSTGRES_USER", "test")
os.environ.setdefault("POSTGRES_PASSWORD", "test")
os.environ.setdefault("POSTGRES_DB", "test")
os.environ.setdefault("POSTGRES_HOST", "localhost")
os.environ.setdefault("POSTGRES_PORT", "5432")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed = pwd_context.hash("admin")
os.environ["ADMIN_PASSWORD_HASH"] = hashed

from fastapi import FastAPI
from app.auth import router

app = FastAPI()
app.include_router(router)

client = TestClient(app)


def test_login_success():
    resp = client.post("/auth/login", json={"password": "admin"})
    assert resp.status_code == 200
    token = resp.json()["access_token"]
    payload = jwt.decode(token, "testsecret", algorithms=["HS256"])
    assert payload["sub"] == "admin"


def test_login_failure():
    resp = client.post("/auth/login", json={"password": "wrong"})
    assert resp.status_code == 401
