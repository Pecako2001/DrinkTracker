import os
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from passlib.context import CryptContext
from pydantic import BaseModel

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
ALGORITHM = "HS256"
SECRET_KEY = os.getenv("ADMIN_SECRET_KEY", "change_me")
ACCESS_TOKEN_EXPIRE_MINUTES = 60

router = APIRouter()

class LoginRequest(BaseModel):
    password: str

@router.post("/auth/login")
def login(req: LoginRequest):
    hashed = os.getenv("ADMIN_PASSWORD_HASH")
    if not hashed or not pwd_context.verify(req.password, hashed):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    exp = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    token = jwt.encode({"sub": "admin", "exp": exp}, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token}

security = HTTPBearer()

def get_current_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        payload = jwt.decode(credentials.credentials, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("sub") != "admin":
            raise JWTError()
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid credentials")
