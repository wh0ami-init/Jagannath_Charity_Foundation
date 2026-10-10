import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import Depends, HTTPException, Request, Response, status
from jose import jwt, JWTError
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import AdminUser

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
_DUMMY_PASSWORD_HASH = pwd_context.hash("not-a-real-user-password")

SESSION_COOKIE = "jf_admin_session"
CSRF_HEADER = "x-csrf-token"
SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}


def _auth_version(password_hash: str) -> str:
    """Return a keyed fingerprint so credential rotation revokes old sessions."""
    return hmac.new(
        settings.jwt_secret.encode(), password_hash.encode(), hashlib.sha256
    ).hexdigest()


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def hash_password(plain: str) -> str:
    if len(plain.encode("utf-8")) > 72:
        raise ValueError("Password must be at most 72 bytes")
    return pwd_context.hash(plain)


def create_access_token(username: str, password_hash: str) -> tuple[str, str]:
    """Returns (jwt, csrf_token). The CSRF token is also embedded in the JWT."""
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.access_token_expire_minutes)
    csrf = secrets.token_urlsafe(32)
    payload = {
        "sub": username,
        "exp": expire,
        "csrf": csrf,
        "auth_version": _auth_version(password_hash),
    }
    return jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm), csrf


def set_session_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=SESSION_COOKIE,
        value=token,
        max_age=settings.access_token_expire_minutes * 60,
        httponly=True,
        secure=settings.cookie_secure_value,
        samesite=settings.cookie_samesite_value,
        path="/api",
    )


def clear_session_cookie(response: Response) -> None:
    response.delete_cookie(
        key=SESSION_COOKIE,
        path="/api",
        httponly=True,
        secure=settings.cookie_secure_value,
        samesite=settings.cookie_samesite_value,
    )


def get_current_admin(request: Request, db: Session = Depends(get_db)) -> AdminUser:
    credentials_error = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
    )
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        raise credentials_error
    try:
        payload = jwt.decode(token, settings.jwt_secret, algorithms=[settings.jwt_algorithm])
    except JWTError:
        raise credentials_error
    username = payload.get("sub")
    csrf = payload.get("csrf")
    if not username or not csrf:
        raise credentials_error

    # Cookies are sent automatically by browsers, so state-changing requests must also
    # prove they came from our frontend by echoing the CSRF token (other sites cannot read it).
    if request.method not in SAFE_METHODS:
        sent = request.headers.get(CSRF_HEADER, "")
        if not hmac.compare_digest(sent.encode(), str(csrf).encode()):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="CSRF token missing or invalid")

    user = db.query(AdminUser).filter(AdminUser.username == username).first()
    token_version = payload.get("auth_version")
    if (
        user is None
        or not isinstance(token_version, str)
        or not hmac.compare_digest(token_version, _auth_version(user.password_hash))
    ):
        raise credentials_error
    request.state.csrf_token = csrf
    return user
