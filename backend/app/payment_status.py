"""Internal payment persistence, for future verified callbacks and webhooks.

No public endpoint is exposed here. The caller supplies the server-side Razorpay
client; payment facts are fetched from Razorpay, never accepted from a browser.
"""
import re

from fastapi import HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.models import Donation, utcnow


def confirm_captured_payment(db: Session, order_id: str, payment_id: str, *, client) -> Donation:
    """Save the first confirmed captured payment; repeated calls are harmless.

    paid_at records when this backend first confirmed capture (UTC), not the
    payment creation timestamp. Refund handling will be a separate workflow.
    Use a dedicated request/session: this function commits or rolls back it.
    """
    if not re.fullmatch(r"order_[A-Za-z0-9]+", order_id or "") or not re.fullmatch(r"pay_[A-Za-z0-9]+", payment_id or ""):
        raise HTTPException(status_code=400, detail="Invalid payment or order ID")
    try:
        donation = db.query(Donation).filter_by(razorpay_order_id=order_id).first()
        if donation is None:
            raise HTTPException(status_code=404, detail="Donation order not found")
        if donation.status == "paid" and donation.razorpay_payment_id == payment_id:
            return donation
        try:
            payment = client.payment.fetch(payment_id, timeout=10)
        except Exception:
            raise HTTPException(status_code=502, detail="Could not confirm the payment with Razorpay") from None

        if not isinstance(payment, dict) or (
            payment.get("id") != payment_id
            or payment.get("order_id") != donation.razorpay_order_id
            or type(payment.get("amount")) is not int
            or payment.get("amount") != donation.amount_paise
            or payment.get("currency") != donation.currency
        ):
            raise HTTPException(status_code=409, detail="Payment does not match this donation")
        if payment.get("status") != "captured" or payment.get("captured") is not True:
            raise HTTPException(status_code=409, detail="Payment has not been captured")

        if donation.status == "paid" and donation.razorpay_payment_id == payment_id:
            return donation
        if donation.status != "pending" or donation.razorpay_payment_id not in (None, payment_id):
            raise HTTPException(status_code=409, detail="Donation already has a different payment or status")

        # Conditional update prevents competing callbacks from overwriting a
        # payment ID or changing the first-confirmed timestamp.
        updated = db.query(Donation).filter(
            Donation.id == donation.id,
            Donation.status == "pending",
            Donation.razorpay_payment_id.is_(None),
        ).update({
            Donation.razorpay_payment_id: payment_id,
            Donation.status: "paid",
            Donation.paid_at: utcnow(),
        }, synchronize_session=False)
        if updated != 1:
            donation_id = donation.id
            db.rollback()
            current = db.query(Donation).filter_by(id=donation_id).one()
            if current.status == "paid" and current.razorpay_payment_id == payment_id:
                return current
            raise HTTPException(status_code=409, detail="Donation changed; please check its payment status again")
        db.commit()
        db.refresh(donation)
        return donation
    except HTTPException:
        db.rollback()
        raise
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not save the payment status") from None
