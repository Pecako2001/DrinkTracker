import pytest
import conftest
conftest.set_env_vars()
from fastapi.testclient import TestClient
from jose import jwt

pytestmark = pytest.mark.usefixtures("env_vars")

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
