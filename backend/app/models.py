from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, DateTime

from app.database import Base


def utcnow():
    return datetime.now(timezone.utc)


class ImageSlot(Base):
    """
    Every editable image on the public site is a "slot": a stable key
    (e.g. 'home-hero-1', 'team-samarendra-patra') that the frontend asks
    for by name. The admin panel lets the VC replace the file behind any
    slot key without touching code or redeploying.
    """
    __tablename__ = "image_slots"

    id = Column(Integer, primary_key=True, index=True)
    slot_key = Column(String(120), unique=True, index=True, nullable=False)
    label = Column(String(200), nullable=False)       # human-readable name shown in admin
    page = Column(String(60), nullable=False)          # which page it belongs to, for grouping in admin UI
    alt_text = Column(String(300), default="")
    file_path = Column(String(400), nullable=False)    # relative path served from /uploads/...
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)


class AdminUser(Base):
    __tablename__ = "admin_users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(80), unique=True, index=True, nullable=False)
    password_hash = Column(String(200), nullable=False)
