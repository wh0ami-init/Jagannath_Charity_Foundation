from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, DateTime, Text, Numeric, Boolean

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


class SiteContent(Base):
    __tablename__ = "site_content"

    id = Column(Integer, primary_key=True, index=True)
    content_key = Column(String(120), unique=True, index=True, nullable=False)
    label = Column(String(200), nullable=False)
    page = Column(String(60), nullable=False)
    value = Column(Text, nullable=False)


class FormSubmission(Base):
    __tablename__ = "form_submissions"

    id = Column(Integer, primary_key=True, index=True)
    kind = Column(String(24), nullable=False, index=True)
    name = Column(String(150), nullable=False, default="")
    email = Column(String(254), nullable=False, index=True)
    phone = Column(String(40), nullable=False, default="")
    subject = Column(String(200), nullable=False, default="")
    message = Column(Text, nullable=False, default="")
    district = Column(String(120), nullable=False, default="")
    skill = Column(String(200), nullable=False, default="")
    amount = Column(Numeric(12, 2), nullable=True)
    cause = Column(String(160), nullable=False, default="")
    consent_given = Column(Boolean, nullable=False, default=True)
    created_at = Column(DateTime, default=utcnow, nullable=False, index=True)
