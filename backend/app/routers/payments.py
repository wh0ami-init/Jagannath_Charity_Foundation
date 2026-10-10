import hashlib
import hmac
import json
import re

import razorpay
from fastapi import APIRouter, Depends, HTTPException, Request

from uuid import uuid4
from pydantic import BaseModel, Field

from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.database import get_db
from app.models import Donation

from app.config import settings
from app.payment_status import confirm_captured_payment
from app.ratelimit import limit_payment_orders
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
    amount_rupees: int = Field(strict=True, ge=1, le=10000)


@router.post(
    "/create-order",
    status_code=201,
    dependencies=[Depends(limit_payment_orders)],
)
def create_order(
    payload: CreateOrderRequest,
    db: Session = Depends(get_db),
):
    # Keep this learning version restricted to test credentials.
    if (
        not settings.razorpay_key_id.startswith("rzp_test_")
        or not settings.razorpay_key_secret
    ):
        raise HTTPException(
            status_code=503,
            detail="Razorpay test credentials are not configured",
        )

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
    }

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str = Field(pattern=r"^order_[A-Za-z0-9]+$", max_length=100)
    razorpay_payment_id: str = Field(pattern=r"^pay_[A-Za-z0-9]+$", max_length=100)
    razorpay_signature: str = Field(pattern=r"^[a-f0-9]{64}$")


def require_test_credentials():
    if not settings.razorpay_key_id.startswith("rzp_test_") or not settings.razorpay_key_secret:
        raise HTTPException(status_code=503, detail="Razorpay test credentials are not configured")


def donation_result(donation):
    return {"order_id": donation.razorpay_order_id, "payment_id": donation.razorpay_payment_id,
            "status": donation.status, "paid_at": donation.paid_at}


@router.post("/verify")
def verify_payment(payload: VerifyPaymentRequest, db: Session = Depends(get_db)):
    require_test_credentials()
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
    if event["event"] not in {"payment.captured", "order.paid"}:
        return {"received": True, "ignored": True}
    require_test_credentials()
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
