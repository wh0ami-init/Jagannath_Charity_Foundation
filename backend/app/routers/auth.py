from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.auth import (
    _DUMMY_PASSWORD_HASH,
    clear_session_cookie,
    create_access_token,
    get_current_admin,
    set_session_cookie,
    verify_password,
)
from app.database import get_db
from app.models import AdminUser
from app.ratelimit import client_ip, login_ip_limiter, login_user_limiter, too_many_requests
from app.schemas import LoginRequest, SessionResponse

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=SessionResponse)
def login(payload: LoginRequest, request: Request, response: Response, db: Session = Depends(get_db)):
    # Rate limits run before the (slow) bcrypt check so blocked requests stay cheap.
    wait = login_ip_limiter.check_and_hit(client_ip(request))
    if wait:
        raise too_many_requests(wait, "login attempts")
    user_key = payload.username.strip().lower()
    wait = login_user_limiter.retry_after(user_key)
    if wait:
        raise too_many_requests(wait, "failed login attempts for this account")

    user = db.query(AdminUser).filter(AdminUser.username == payload.username).first()
    password_hash = user.password_hash if user else _DUMMY_PASSWORD_HASH
    password_matches = verify_password(
        payload.password if len(payload.password.encode("utf-8")) <= 72 else "invalid-password-length",
        password_hash,
    )
    if not user or not password_matches:
        login_user_limiter.hit(user_key)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid username or password")

    login_user_limiter.reset(user_key)
    token, csrf = create_access_token(user.username, user.password_hash)
    set_session_cookie(response, token)
    return SessionResponse(username=user.username, csrf_token=csrf)


@router.post("/logout", status_code=204)
def logout(response: Response):
    clear_session_cookie(response)


@router.get("/me", response_model=SessionResponse)
def me(request: Request, current=Depends(get_current_admin)):
    return SessionResponse(username=current.username, csrf_token=request.state.csrf_token)
