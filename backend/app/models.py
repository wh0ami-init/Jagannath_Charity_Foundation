from datetime import datetime, timezone
from decimal import Decimal

from sqlalchemy import Boolean, DateTime, Integer, Numeric, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class ImageSlot(Base):
    """A stable, administrator-editable image location on the public site."""

    __tablename__ = "image_slots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    slot_key: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    label: Mapped[str] = mapped_column(String(200), nullable=False)
    page: Mapped[str] = mapped_column(String(60), nullable=False)
    alt_text: Mapped[str | None] = mapped_column(String(300), default="")
    category: Mapped[str | None] = mapped_column(String(24), nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    file_path: Mapped[str] = mapped_column(String(400), nullable=False)
    updated_at: Mapped[datetime | None] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)


class AdminUser(Base):
    __tablename__ = "admin_users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    username: Mapped[str] = mapped_column(String(80), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(200), nullable=False)


class SiteContent(Base):
    __tablename__ = "site_content"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    content_key: Mapped[str] = mapped_column(String(120), unique=True, index=True, nullable=False)
    label: Mapped[str] = mapped_column(String(200), nullable=False)
    page: Mapped[str] = mapped_column(String(60), nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False)


class FormSubmission(Base):
    __tablename__ = "form_submissions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    kind: Mapped[str] = mapped_column(String(24), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(150), nullable=False, default="")
    email: Mapped[str] = mapped_column(String(254), nullable=False, index=True)
    phone: Mapped[str] = mapped_column(String(40), nullable=False, default="")
    subject: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    message: Mapped[str] = mapped_column(Text, nullable=False, default="")
    district: Mapped[str] = mapped_column(String(120), nullable=False, default="")
    skill: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    amount: Mapped[Decimal | None] = mapped_column(Numeric(12, 2), nullable=True)
    cause: Mapped[str] = mapped_column(String(160), nullable=False, default="")
    consent_given: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, nullable=False, index=True)


class DeletedGallerySeed(Base):
    """IDs of removed seed photos, preventing automatic re-creation."""

    __tablename__ = "deleted_gallery_seeds"

    slot_key: Mapped[str] = mapped_column(String(120), primary_key=True)


class Donation(Base):
    __tablename__ = "donations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)

    # Store money in paise: Rs100 = 10000 paise.
    amount_paise: Mapped[int] = mapped_column(Integer, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="INR")
    razorpay_order_id: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)
    razorpay_payment_id: Mapped[str | None] = mapped_column(String(100), unique=True, nullable=True)
    razorpay_subscription_id: Mapped[str | None] = mapped_column(String(100), nullable=True, index=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    donor_name: Mapped[str] = mapped_column(String(150), nullable=False, default="")
    donor_email: Mapped[str] = mapped_column(String(254), nullable=False, default="")
    donor_phone: Mapped[str] = mapped_column(String(40), nullable=False, default="")
    donor_address: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    cause: Mapped[str] = mapped_column(String(160), nullable=False, default="")
    receipt_email_sent_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    refund_amount_paise: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    refunded_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utcnow)
    paid_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class RecurringDonation(Base):
    __tablename__ = "recurring_donations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    razorpay_subscription_id: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    razorpay_plan_id: Mapped[str] = mapped_column(String(100), nullable=False)
    authorization_payment_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    amount_paise: Mapped[int] = mapped_column(Integer, nullable=False)
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="INR")
    status: Mapped[str] = mapped_column(String(24), nullable=False, default="created", index=True)
    donor_name: Mapped[str] = mapped_column(String(150), nullable=False)
    donor_email: Mapped[str] = mapped_column(String(254), nullable=False)
    donor_phone: Mapped[str] = mapped_column(String(40), nullable=False)
    donor_address: Mapped[str] = mapped_column(String(500), nullable=False, default="")
    cause: Mapped[str] = mapped_column(String(160), nullable=False, default="Where most needed")
    consented_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utcnow, index=True)
    updated_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=utcnow, onupdate=utcnow)
