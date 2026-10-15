import hashlib
import hmac
import json
import re
import secrets
from datetime import timedelta

import razorpay
from fastapi import APIRouter, Depends, HTTPException, Request

from uuid import uuid4
from pydantic import BaseModel, Field, field_validator

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.database import get_db
from app.models import Donation, DonationEmailCode, utcnow

from app.config import settings
from app.payment_status import confirm_captured_payment
from app.ratelimit import limit_payment_orders, donation_email_ip_limiter, client_ip, too_many_requests
from app.donation_mail import send_verification_code, send_donation_receipt
from starlette.concurrency import run_in_threadpool

router  = APIRouter(
    prefix="/api/payments",
    tags=["payments"],
)

def get_razorpay_client():
    return razorpay.client.Client(
        auth=(
            settings.razorpay_key_id,
            settings.razorpay_key_secret,
        )

    )

# create a order request model
class CreateOrderRequest(BaseModel):
    verification_token: str = Field(min_length=32, max_length=128)


class EmailCodeRequest(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    email: str = Field(min_length=5, max_length=254)
    phone: str = Field(default="", max_length=40)
    address: str = Field(default="", max_length=500)
    amount_rupees: int = Field(strict=True, ge=1, le=1000000)
    cause: str = Field(default="Where most needed", max_length=160)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        value = value.strip().lower()
        if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", value):
            raise ValueError("Enter a valid email address")
        return value


class VerifyEmailCodeRequest(BaseModel):
    email: str = Field(min_length=5, max_length=254)
    code: str = Field(pattern=r"^[0-9]{6}$")


@router.get("/mode")
def payment_mode():
    prefix = "rzp_test_" if settings.razorpay_mode == "test" else "rzp_live_"
    configured = settings.razorpay_key_id.startswith(prefix) and bool(settings.razorpay_key_secret)
    email_configured = bool(settings.smtp_host and settings.smtp_from_email)
    return {"mode": settings.razorpay_mode, "configured": configured and email_configured,
            "payment_configured": configured, "email_configured": email_configured,
            "amount_fixed": settings.razorpay_mode == "test", "test_amount_rupees": 100}


def _code_hash(email: str, code: str) -> str:
    return hmac.new(settings.jwt_secret.encode(), f"donation-email|{email}|{code}".encode(), hashlib.sha256).hexdigest()


def _token_hash(token: str) -> str:
    return hmac.new(settings.jwt_secret.encode(), f"donation-token|{token}".encode(), hashlib.sha256).hexdigest()


def _limit_email(request: Request, email: str) -> None:
    wait = donation_email_ip_limiter.check_and_hit(f"{client_ip(request)}:{email}")
    if wait:
        raise too_many_requests(wait, "email verification requests")


@router.post("/email/send-code", status_code=202)
def send_donor_email_code(payload: EmailCodeRequest, request: Request, db: Session = Depends(get_db)):
    _limit_email(request, payload.email)
    if not settings.smtp_host or not settings.smtp_from_email:
        raise HTTPException(status_code=503, detail="Donation email delivery is not configured")
    now = utcnow()
    db.query(DonationEmailCode).filter(DonationEmailCode.expires_at < now).delete(synchronize_session=False)
    code = f"{secrets.randbelow(1_000_000):06d}"
    row = DonationEmailCode(
        email=payload.email, donor_name=payload.name.strip(), donor_phone=payload.phone.strip(),
        donor_address=payload.address.strip(), amount_rupees=payload.amount_rupees,
        cause=payload.cause.strip(), code_hash=_code_hash(payload.email, code),
        expires_at=now + timedelta(minutes=10),
    )
    db.add(row)
    db.commit()
    try:
        send_verification_code(payload.email, code)
    except Exception:
        db.delete(row)
        db.commit()
        raise HTTPException(status_code=502, detail="Could not send the verification email. Please try again.") from None
    return {"sent": True, "expires_in_seconds": 600}


@router.post("/email/verify-code")
def verify_donor_email_code(payload: VerifyEmailCodeRequest, request: Request, db: Session = Depends(get_db)):
    email = payload.email.strip().lower()
    _limit_email(request, email)
    now = utcnow()
    row = db.query(DonationEmailCode).filter(
        DonationEmailCode.email == email, DonationEmailCode.used_at.is_(None),
    ).order_by(DonationEmailCode.created_at.desc()).first()
    expires = row.expires_at.replace(tzinfo=now.tzinfo) if row else now
    if row is None or expires < now or row.attempts >= 5:
        raise HTTPException(status_code=400, detail="That code has expired or is invalid. Request a new code.")
    row.attempts += 1
    if not hmac.compare_digest(row.code_hash, _code_hash(email, payload.code)):
        db.commit()
        raise HTTPException(status_code=400, detail="That code is incorrect. Please try again.")
    token = secrets.token_urlsafe(32)
    row.verification_token_hash = _token_hash(token)
    row.verified_at = now
    db.commit()
    return {"verified": True, "verification_token": token, "amount_rupees": row.amount_rupees}


@router.post(
    "/create-order",
    status_code=201,
    dependencies=[Depends(limit_payment_orders)],
)
def create_order(
    payload: CreateOrderRequest,
    db: Session = Depends(get_db),
):
    expected_prefix = "rzp_test_" if settings.razorpay_mode == "test" else "rzp_live_"
    if not settings.razorpay_key_id.startswith(expected_prefix) or not settings.razorpay_key_secret:
        raise HTTPException(
            status_code=503,
            detail=f"Razorpay {settings.razorpay_mode} credentials are not configured",
        )

    now = utcnow()
    verified = db.query(DonationEmailCode).filter_by(
        verification_token_hash=_token_hash(payload.verification_token),
    ).first()
    verified_at = verified.verified_at.replace(tzinfo=now.tzinfo) if verified and verified.verified_at else None
    if (verified is None or verified.used_at is not None or verified_at is None
            or (now - verified_at).total_seconds() > 900):
        raise HTTPException(status_code=400, detail="Verify your email again before continuing.")
    if settings.razorpay_mode == "test" and verified.amount_rupees != 100:
        raise HTTPException(status_code=400, detail="Test Mode donations are fixed at ₹100.")

    claimed = db.query(DonationEmailCode).filter(
        DonationEmailCode.id == verified.id,
        DonationEmailCode.used_at.is_(None),
    ).update({DonationEmailCode.used_at: now}, synchronize_session=False)
    if claimed != 1:
        db.rollback()
        raise HTTPException(status_code=400, detail="That verified email session was already used. Please verify your email again.")
    db.commit()

    amount_paise = verified.amount_rupees * 100
    client = get_razorpay_client()

    try:
        order = client.order.create({
            "amount": amount_paise,
            "currency": "INR",
            "receipt": f"donation_{uuid4().hex[:24]}",
        }, timeout=10)
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Could not create a payment order. Please try again.",
        ) from None

    # Save the new order in our database.
    donation = Donation(
        amount_paise=order["amount"],
        currency=order["currency"],
        razorpay_order_id=order["id"],
        status="pending",
        donor_name=verified.donor_name,
        donor_email=verified.email,
        donor_phone=verified.donor_phone,
        donor_address=verified.donor_address,
        cause=verified.cause,
    )

    try:
        db.add(donation)
        db.delete(verified)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="The payment order was created, but could not be saved.",
        ) from None

    return {
        "order_id": order["id"],
        "amount": order["amount"],
        "currency": order["currency"],
        "key_id": settings.razorpay_key_id,
        "mode": settings.razorpay_mode,
    }

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str = Field(pattern=r"^order_[A-Za-z0-9]+$", max_length=100)
    razorpay_payment_id: str = Field(pattern=r"^pay_[A-Za-z0-9]+$", max_length=100)
    razorpay_signature: str = Field(pattern=r"^[a-f0-9]{64}$")


def require_payment_credentials():
    expected_prefix = "rzp_test_" if settings.razorpay_mode == "test" else "rzp_live_"
    if not settings.razorpay_key_id.startswith(expected_prefix) or not settings.razorpay_key_secret:
        raise HTTPException(status_code=503, detail=f"Razorpay {settings.razorpay_mode} credentials are not configured")


def donation_result(donation):
    return {"order_id": donation.razorpay_order_id, "payment_id": donation.razorpay_payment_id,
            "status": donation.status, "paid_at": donation.paid_at,
            "donor_name": donation.donor_name, "donor_email": donation.donor_email,
            "donor_phone": donation.donor_phone, "donor_address": donation.donor_address,
            "amount_paise": donation.amount_paise, "cause": donation.cause,
            "receipt_number": f"JF-{donation.paid_at.year}-{donation.id:06d}" if donation.paid_at else None}


def deliver_receipt_email(donation, db: Session) -> None:
    if donation.receipt_email_sent_at is not None:
        return
    send_donation_receipt(donation)
    donation.receipt_email_sent_at = utcnow()
    db.commit()


@router.post("/verify")
def verify_payment(payload: VerifyPaymentRequest, db: Session = Depends(get_db)):
    require_payment_credentials()
    donation = db.query(Donation).filter_by(razorpay_order_id=payload.razorpay_order_id).first()
    if donation is None:
        raise HTTPException(status_code=404, detail="Donation order not found")
    # Use the order ID saved on the server when constructing the signature.
    signed = f"{donation.razorpay_order_id}|{payload.razorpay_payment_id}".encode()
    expected = hmac.new(settings.razorpay_key_secret.encode(), signed, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, payload.razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid payment signature")
    donation = confirm_captured_payment(db, donation.razorpay_order_id,
                                        payload.razorpay_payment_id, client=get_razorpay_client())
    if donation.receipt_email_sent_at is None:
        try:
            deliver_receipt_email(donation, db)
        except Exception:
            db.rollback()
            raise HTTPException(status_code=502, detail="Payment confirmed, but the receipt email could not be sent. Please retry confirmation.") from None
    return donation_result(donation)


def process_webhook(body: bytes, signature: str, db: Session):
    if not settings.razorpay_webhook_secret:
        raise HTTPException(status_code=503, detail="Payment webhook is not configured")
    expected = hmac.new(settings.razorpay_webhook_secret.encode(), body, hashlib.sha256).hexdigest()
    if not re.fullmatch(r"[a-f0-9]{64}", signature) or not hmac.compare_digest(expected, signature):
        raise HTTPException(status_code=400, detail="Invalid webhook signature")
    try:
        event = json.loads(body)
    except (ValueError, UnicodeDecodeError):
        raise HTTPException(status_code=400, detail="Invalid webhook body") from None
    if not isinstance(event, dict) or not isinstance(event.get("event"), str):
        raise HTTPException(status_code=400, detail="Invalid webhook event")
    # Failed attempts can be retried for the same order. Never downgrade a paid
    # donation when an older failure/authorization event arrives out of order.
    if event["event"] not in {"payment.captured", "order.paid"}:
        return {"received": True, "ignored": True}
    require_payment_credentials()
    try:
        entity = event["payload"]["payment"]["entity"]
        order_id, payment_id = entity["order_id"], entity["id"]
        if not isinstance(order_id, str) or not isinstance(payment_id, str):
            raise ValueError()
    except (KeyError, TypeError, ValueError):
        raise HTTPException(status_code=400, detail="Webhook payment details are missing") from None
    # Signed events are still checked against Razorpay's current payment facts.
    # Idempotency is based on the stored order/payment pair, not an unsigned header.
    donation = confirm_captured_payment(db, order_id, payment_id, client=get_razorpay_client())
    if donation.receipt_email_sent_at is None:
        try:
            deliver_receipt_email(donation, db)
        except Exception:
            db.rollback()
            raise HTTPException(status_code=503, detail="Payment was confirmed, but receipt delivery failed; Razorpay should retry this webhook.") from None
    return {"received": True, "status": donation.status}


@router.post("/webhook")
async def payment_webhook(request: Request, db: Session = Depends(get_db)):
    body = bytearray()
    async for chunk in request.stream():
        body.extend(chunk)
        if len(body) > 1024 * 1024:
            raise HTTPException(status_code=413, detail="Webhook body too large")
    signature = request.headers.get("x-razorpay-signature", "")
    return await run_in_threadpool(process_webhook, bytes(body), signature, db)
