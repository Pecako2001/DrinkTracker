import os
import sys
import pytest
from passlib.context import CryptContext


def set_env_vars():
    os.environ.setdefault("POSTGRES_USER", "test")
    os.environ.setdefault("POSTGRES_PASSWORD", "test")
    os.environ.setdefault("POSTGRES_DB", "test")
    os.environ.setdefault("POSTGRES_HOST", "localhost")
    os.environ.setdefault("POSTGRES_PORT", "5432")
    os.environ.setdefault("TESTING", "1")
    os.environ.setdefault("ADMIN_SECRET_KEY", "testsecret")

    sys.path.append(os.path.join(os.path.dirname(__file__), ".."))

    if "ADMIN_PASSWORD_HASH" not in os.environ:
        pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
        os.environ["ADMIN_PASSWORD_HASH"] = pwd_context.hash("admin")

    return os.environ


@pytest.fixture(scope="session")
def env_vars():
    return set_env_vars()
