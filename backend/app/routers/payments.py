import hashlib
import hmac
import json
import re
import unicodedata
from datetime import datetime, timezone
from typing import Literal

import razorpay
from fastapi import APIRouter, Depends, HTTPException, Request

from uuid import uuid4
from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.database import get_db
from app.models import Donation, RecurringDonation, utcnow

from app.config import settings
from app.payment_status import confirm_captured_payment
from app.ratelimit import limit_payment_orders
from app.auth import get_current_admin
from starlette.concurrency import run_in_threadpool

DONATION_CAUSES = {
    "Education & literacy", "Health & family welfare", "Youth skills & sport",
    "Women's livelihoods", "Environment & land", "Solar housing & clean energy",
    "Where most needed",
}

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

class DonorDetailsRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    name: str = Field(min_length=1, max_length=150)
    email: EmailStr
    phone: str = Field(min_length=1, max_length=40)
    address: str = Field(default="", max_length=500)
    cause: str = Field(default="Where most needed", max_length=160)

    @field_validator("name")
    @classmethod
    def validate_name(cls, value: str) -> str:
        value = unicodedata.normalize("NFC", value)
        if len(value) < 2 or any(unicodedata.category(char) in {"Cc", "Cs"} for char in value):
            raise ValueError("Enter a valid name using at least 2 characters")
        return value

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: EmailStr) -> str:
        return str(value).lower()

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, value: str) -> str:
        value = value.strip()
        digits = re.sub(r"\D", "", value)
        if (not re.fullmatch(r"\+?[0-9][0-9\s().-]*", value)
                or not 10 <= len(digits) <= 15):
            raise ValueError("Enter a valid mobile number with 10 to 15 digits")
        return value

    @field_validator("address")
    @classmethod
    def normalize_address(cls, value: str) -> str:
        value = unicodedata.normalize("NFC", value).replace("\r\n", "\n").replace("\r", "\n")
        if any(unicodedata.category(char) == "Cc" and char not in "\n\t" for char in value):
            raise ValueError("Address contains unsupported control characters")
        return value

    @field_validator("cause")
    @classmethod
    def validate_cause(cls, value: str) -> str:
        value = value.strip()
        if value not in DONATION_CAUSES:
            raise ValueError("Select a valid donation cause")
        return value


class CreateOrderRequest(DonorDetailsRequest):
    amount_rupees: int = Field(strict=True, ge=1, le=1000000)


class CreateSubscriptionRequest(DonorDetailsRequest):
    amount_rupees: int = Field(strict=True, ge=100, le=1000000)
    consent: Literal[True]


@router.get("/mode")
def payment_mode():
    prefix = "rzp_test_" if settings.razorpay_mode == "test" else "rzp_live_"
    configured = settings.razorpay_key_id.startswith(prefix) and bool(settings.razorpay_key_secret)
    return {"mode": settings.razorpay_mode, "configured": configured,
            "payment_configured": configured,
            "subscriptions_configured": configured and bool(settings.razorpay_webhook_secret),
            "amount_fixed": settings.razorpay_mode == "test", "test_amount_rupees": 100}


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

    if settings.razorpay_mode == "test" and payload.amount_rupees != 100:
        raise HTTPException(status_code=400, detail="Test Mode donations are fixed at ₹100.")
    amount_paise = payload.amount_rupees * 100
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
        donor_name=payload.name,
        donor_email=payload.email,
        donor_phone=payload.phone,
        donor_address=payload.address,
        cause=payload.cause,
    )

    try:
        db.add(donation)
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


@router.post(
    "/subscriptions/create",
    status_code=201,
    dependencies=[Depends(limit_payment_orders)],
)
def create_recurring_donation(
    payload: CreateSubscriptionRequest,
    db: Session = Depends(get_db),
):
    expected_prefix = "rzp_test_" if settings.razorpay_mode == "test" else "rzp_live_"
    if not settings.razorpay_key_id.startswith(expected_prefix) or not settings.razorpay_key_secret:
        raise HTTPException(status_code=503, detail=f"Razorpay {settings.razorpay_mode} credentials are not configured")
    if not settings.razorpay_webhook_secret:
        raise HTTPException(status_code=503, detail="Razorpay subscription webhooks are not configured")
    if settings.razorpay_mode == "test" and payload.amount_rupees != 100:
        raise HTTPException(status_code=400, detail="Test Mode monthly AutoPay is fixed at ₹100.")

    client = get_razorpay_client()
    amount_paise = payload.amount_rupees * 100
    try:
        plan = client.plan.create({
            "period": "monthly",
            "interval": 1,
            "item": {
                "name": "Jagannath Foundation monthly donation",
                "amount": amount_paise,
                "currency": "INR",
                "description": f"Monthly donation for {payload.cause}",
            },
        }, timeout=10)
        expire_by = int(datetime.now(timezone.utc).timestamp()) + 7 * 24 * 60 * 60
        subscription = client.subscription.create({
            "plan_id": plan["id"],
            "total_count": 1200,
            "quantity": 1,
            "customer_notify": True,
            "expire_by": expire_by,
        }, timeout=10)
        if (not isinstance(subscription.get("id"), str)
                or not subscription["id"].startswith("sub_")
                or subscription.get("plan_id") != plan["id"]):
            raise ValueError("Razorpay returned an invalid subscription")
    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Could not prepare AutoPay. Check that Razorpay Subscriptions is enabled for this account and try again.",
        ) from None

    recurring = RecurringDonation(
        razorpay_subscription_id=subscription["id"],
        razorpay_plan_id=plan["id"],
        amount_paise=amount_paise,
        currency="INR",
        status=subscription.get("status", "created"),
        donor_name=payload.name,
        donor_email=str(payload.email),
        donor_phone=payload.phone,
        donor_address=payload.address,
        cause=payload.cause,
        consented_at=utcnow(),
    )
    try:
        db.add(recurring)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        try:
            client.subscription.cancel(subscription["id"], {"cancel_at_cycle_end": False}, timeout=10)
        except Exception:
            pass
        raise HTTPException(status_code=500, detail="AutoPay was created but could not be saved. Please contact the Foundation before retrying.") from None

    return {
        "subscription_id": recurring.razorpay_subscription_id,
        "amount": amount_paise,
        "currency": recurring.currency,
        "key_id": settings.razorpay_key_id,
        "mode": settings.razorpay_mode,
    }


class VerifySubscriptionRequest(BaseModel):
    razorpay_payment_id: str = Field(pattern=r"^pay_[A-Za-z0-9]+$", max_length=100)
    razorpay_subscription_id: str = Field(pattern=r"^sub_[A-Za-z0-9]+$", max_length=100)
    razorpay_signature: str = Field(pattern=r"^[a-f0-9]{64}$")


@router.post("/subscriptions/verify")
def verify_recurring_donation(payload: VerifySubscriptionRequest, db: Session = Depends(get_db)):
    require_payment_credentials()
    recurring = db.query(RecurringDonation).filter_by(
        razorpay_subscription_id=payload.razorpay_subscription_id,
    ).first()
    if recurring is None:
        raise HTTPException(status_code=404, detail="AutoPay setup not found")
    signed = f"{payload.razorpay_payment_id}|{recurring.razorpay_subscription_id}".encode()
    expected = hmac.new(settings.razorpay_key_secret.encode(), signed, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, payload.razorpay_signature):
        raise HTTPException(status_code=400, detail="Invalid AutoPay authorization signature")
    try:
        subscription = get_razorpay_client().subscription.fetch(recurring.razorpay_subscription_id, timeout=10)
    except Exception:
        raise HTTPException(status_code=502, detail="Could not confirm AutoPay authorization with Razorpay") from None
    if (subscription.get("id") != recurring.razorpay_subscription_id
            or subscription.get("plan_id") != recurring.razorpay_plan_id
            or subscription.get("status") not in {"authenticated", "active"}):
        raise HTTPException(status_code=409, detail="Razorpay has not confirmed this mandate yet")
    recurring.authorization_payment_id = payload.razorpay_payment_id
    recurring.status = subscription["status"]
    db.commit()
    return {"subscription_id": recurring.razorpay_subscription_id, "status": recurring.status,
            "amount_paise": recurring.amount_paise, "currency": recurring.currency}

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
    if event["event"] in {"payment.refunded", "refund.processed"}:
        require_payment_credentials()
        try:
            client = get_razorpay_client()
            if event["event"] == "refund.processed":
                refund = event["payload"]["refund"]["entity"]
                refund_id = refund["id"]
                payment_id = refund["payment_id"]
                if not isinstance(refund_id, str) or not isinstance(payment_id, str):
                    raise ValueError()
                verified_refund = client.refund.fetch(refund_id, timeout=10)
                if (verified_refund.get("id") != refund_id or verified_refund.get("payment_id") != payment_id
                        or verified_refund.get("status") != "processed"):
                    raise ValueError()
            else:
                entity = event["payload"]["payment"]["entity"]
                payment_id = entity["id"]
                if not isinstance(payment_id, str):
                    raise ValueError()
            payment = client.payment.fetch(payment_id, timeout=10)
            order_id = payment.get("order_id")
            refunded = payment.get("amount_refunded")
            if (payment.get("id") != payment_id or payment.get("order_id") != order_id
                    or payment.get("status") not in {"captured", "refunded"}
                    or payment.get("captured") is not True
                    or type(refunded) is not int or refunded < 1):
                raise ValueError()
            donation = db.query(Donation).filter_by(razorpay_payment_id=payment_id).first()
            if donation is None:
                donation = db.query(Donation).filter_by(razorpay_order_id=order_id).first()
            if donation is None:
                return {"received": True, "ignored": True}
            if (donation.razorpay_order_id != order_id or refunded > donation.amount_paise
                    or payment.get("amount") != donation.amount_paise or payment.get("currency") != donation.currency):
                raise ValueError()
            if donation.razorpay_payment_id not in (None, payment_id):
                raise ValueError()
            donation.razorpay_payment_id = payment_id
            donation.paid_at = donation.paid_at or utcnow()
            donation.refund_amount_paise = max(donation.refund_amount_paise, refunded)
            donation.status = "refunded" if donation.refund_amount_paise == donation.amount_paise else "partially_refunded"
            donation.refunded_at = donation.refunded_at or utcnow()
            db.commit()
            return {"received": True, "status": donation.status}
        except (KeyError, TypeError, ValueError, AttributeError):
            db.rollback()
            raise HTTPException(status_code=409, detail="Refund could not be matched to a confirmed donation") from None
        except Exception:
            db.rollback()
            raise HTTPException(status_code=502, detail="Could not verify refund status with Razorpay") from None
    subscription_events = {
        "subscription.authenticated", "subscription.activated", "subscription.charged",
        "subscription.pending", "subscription.halted", "subscription.cancelled",
        "subscription.paused", "subscription.resumed", "subscription.completed",
    }
    if event["event"] in subscription_events:
        require_payment_credentials()
        try:
            subscription_entity = event["payload"]["subscription"]["entity"]
            subscription_id = subscription_entity["id"]
            if not isinstance(subscription_id, str):
                raise ValueError()
        except (KeyError, TypeError, ValueError):
            raise HTTPException(status_code=400, detail="Webhook subscription details are missing") from None
        recurring = db.query(RecurringDonation).filter_by(
            razorpay_subscription_id=subscription_id,
        ).first()
        if recurring is None:
            return {"received": True, "ignored": True}
        try:
            client = get_razorpay_client()
            current = client.subscription.fetch(subscription_id, timeout=10)
            current_status = current.get("status")
            if current.get("id") != subscription_id or current.get("plan_id") != recurring.razorpay_plan_id:
                raise ValueError()
            if current_status not in {"created", "authenticated", "active", "pending", "halted", "paused", "cancelled", "completed", "expired"}:
                raise ValueError()
            recurring.status = current_status
            payment_entity = event.get("payload", {}).get("payment", {}).get("entity")
            if event["event"] in {"subscription.activated", "subscription.charged"} and isinstance(payment_entity, dict):
                payment_id = payment_entity.get("id")
                if not isinstance(payment_id, str):
                    raise ValueError()
                existing = db.query(Donation.id).filter_by(razorpay_payment_id=payment_id).first()
                if existing is None:
                    payment = client.payment.fetch(payment_id, timeout=10)
                    if (payment.get("id") != payment_id or payment.get("status") != "captured"
                            or payment.get("captured") not in (True, 1, "1")
                            or payment.get("amount") != recurring.amount_paise
                            or payment.get("currency") != recurring.currency):
                        raise ValueError()
                    paid_at = payment.get("created_at")
                    db.add(Donation(
                        amount_paise=recurring.amount_paise,
                        currency=recurring.currency,
                        razorpay_payment_id=payment_id,
                        razorpay_subscription_id=subscription_id,
                        status="paid",
                        donor_name=recurring.donor_name,
                        donor_email=recurring.donor_email,
                        donor_phone=recurring.donor_phone,
                        donor_address=recurring.donor_address,
                        cause=recurring.cause,
                        paid_at=datetime.fromtimestamp(paid_at, tz=timezone.utc) if isinstance(paid_at, int) else utcnow(),
                    ))
            db.commit()
            return {"received": True, "status": recurring.status}
        except (KeyError, TypeError, ValueError, AttributeError):
            db.rollback()
            raise HTTPException(status_code=409, detail="Subscription event could not be matched to a verified payment") from None
        except Exception:
            db.rollback()
            raise HTTPException(status_code=502, detail="Could not verify subscription status with Razorpay") from None
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
    if db.query(Donation.id).filter_by(razorpay_order_id=order_id).first() is None:
        return {"received": True, "ignored": True}
    donation = confirm_captured_payment(db, order_id, payment_id, client=get_razorpay_client())
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


@router.get("/admin/donations")
def admin_donations(limit: int = 500, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    if not 1 <= limit <= 1000:
        raise HTTPException(status_code=422, detail="Limit must be between 1 and 1000")
    rows = db.query(Donation).order_by(Donation.created_at.desc()).limit(limit).all()
    return [{"id": row.id, "amount_paise": row.amount_paise, "currency": row.currency,
             "status": row.status, "donor_name": row.donor_name, "donor_email": row.donor_email,
             "donor_phone": row.donor_phone, "donor_address": row.donor_address,
             "cause": row.cause, "order_id": row.razorpay_order_id,
             "payment_id": row.razorpay_payment_id, "created_at": row.created_at,
             "subscription_id": row.razorpay_subscription_id,
             "paid_at": row.paid_at,
             "refund_amount_paise": row.refund_amount_paise, "refunded_at": row.refunded_at}
            for row in rows]


@router.get("/admin/subscriptions")
def admin_subscriptions(limit: int = 500, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    if not 1 <= limit <= 1000:
        raise HTTPException(status_code=422, detail="Limit must be between 1 and 1000")
    rows = db.query(RecurringDonation).order_by(RecurringDonation.created_at.desc()).limit(limit).all()
    return [{"id": row.id, "subscription_id": row.razorpay_subscription_id,
             "plan_id": row.razorpay_plan_id, "amount_paise": row.amount_paise,
             "currency": row.currency, "status": row.status,
             "donor_name": row.donor_name, "donor_email": row.donor_email,
             "donor_phone": row.donor_phone, "cause": row.cause,
             "created_at": row.created_at, "updated_at": row.updated_at}
            for row in rows]
