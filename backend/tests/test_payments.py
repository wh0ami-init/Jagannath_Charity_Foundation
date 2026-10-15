"""Payment order checks using an in-memory database and mocked Razorpay."""
import os
import unittest
from unittest.mock import Mock, patch

from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import sessionmaker

with patch.dict(os.environ, {
    "DATABASE_URL": "sqlite://",
    "JWT_SECRET": "payment-test-secret-at-least-32-characters",
    "ENVIRONMENT": "development",
}):
    from app.database import Base
    from app.models import Donation
    from app.routers import payments
from app.ratelimit import limit_payment_orders, payment_order_ip_limiter


class PaymentOrderTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://")
        Base.metadata.create_all(self.engine)
        self.db = sessionmaker(bind=self.engine)()
        self.client = Mock()
        self.client.plan.create.return_value = {"id": "plan_unit_test"}
        self.client.subscription.create.return_value = {
            "id": "sub_unit_test", "plan_id": "plan_unit_test", "status": "created",
        }
        self.client.order.create.return_value = {
            "id": "order_unit_test", "amount": 10000, "currency": "INR",
        }
        self.client_patch = patch.object(payments, "get_razorpay_client", return_value=self.client)
        self.client_patch.start()
        self.settings_patch = patch.multiple(
            payments.settings, razorpay_key_id="rzp_test_unit", razorpay_key_secret="unit-secret",
            razorpay_webhook_secret="webhook-unit-secret",
        )
        self.settings_patch.start()

    def tearDown(self):
        self.db.close()
        self.engine.dispose()
        self.settings_patch.stop()
        self.client_patch.stop()

    def create(self):
        request = payments.CreateOrderRequest(
            name="A Donor", email="donor@example.org", phone="+91 98765 43210",
            amount_rupees=100, cause="Where most needed",
        )
        return payments.create_order(request, self.db)

    def test_order_is_saved_pending_and_secret_is_not_returned(self):
        result = self.create()
        donation = self.db.query(Donation).one()
        self.assertEqual(donation.amount_paise, 10000)
        self.assertEqual(donation.currency, "INR")
        self.assertEqual(donation.razorpay_order_id, result["order_id"])
        self.assertEqual(donation.status, "pending")
        self.assertIsNone(donation.razorpay_payment_id)
        self.assertIsNone(donation.paid_at)
        self.assertEqual(set(result), {"order_id", "amount", "currency", "key_id", "mode"})
        sent = self.client.order.create.call_args.args[0]
        self.assertEqual(sent["amount"], 10000)
        self.assertEqual(sent["currency"], "INR")
        self.assertLessEqual(len(sent["receipt"]), 40)

    def test_invalid_amounts_are_rejected(self):
        for value in [0, -1, 10001, 1.5, "100", True]:
            with self.subTest(value=value), self.assertRaises(ValidationError):
                payments.CreateOrderRequest(amount_rupees=value)
        self.client.order.create.assert_not_called()

    def test_donor_details_are_normalized_and_validated(self):
        payload = payments.CreateOrderRequest(
            name="  José Donor  ", email="  DONOR@EXAMPLE.ORG  ",
            phone="+91 98765 43210", amount_rupees=100,
        )
        self.assertEqual(payload.name, "José Donor")
        self.assertEqual(payload.email, "donor@example.org")
        for fields in [
            {"name": "A", "email": "donor@example.org", "phone": "+91 98765 43210", "amount_rupees": 100},
            {"name": "A Donor", "email": "bad-address", "phone": "+91 98765 43210", "amount_rupees": 100},
            {"name": "A Donor", "email": "donor@example.org", "phone": "12345", "amount_rupees": 100},
            {"name": "A Donor", "email": "donor@example.org", "phone": "+91 98765 43210", "amount_rupees": 100, "unexpected": "value"},
        ]:
            with self.subTest(fields=fields), self.assertRaises(ValidationError):
                payments.CreateOrderRequest(**fields)

    def test_recurring_donation_creates_a_plan_and_pending_mandate(self):
        request = payments.CreateSubscriptionRequest(
            name="A Donor", email="donor@example.org", phone="+91 98765 43210",
            amount_rupees=100, cause="Where most needed", consent=True,
        )
        result = payments.create_recurring_donation(request, self.db)
        recurring = self.db.query(payments.RecurringDonation).one()
        self.assertEqual(recurring.razorpay_subscription_id, "sub_unit_test")
        self.assertEqual(recurring.amount_paise, 10000)
        self.assertEqual(recurring.status, "created")
        self.assertEqual(result["subscription_id"], "sub_unit_test")
        plan = self.client.plan.create.call_args.args[0]
        self.assertEqual(plan["period"], "monthly")
        self.assertEqual(plan["item"]["amount"], 10000)
        self.assertEqual(self.client.subscription.create.call_args.args[0]["total_count"], 1200)

    def test_recurring_requires_explicit_consent_and_webhook_secret(self):
        fields = {
            "name": "A Donor", "email": "donor@example.org", "phone": "+91 98765 43210",
            "amount_rupees": 100,
        }
        with self.assertRaises(ValidationError):
            payments.CreateSubscriptionRequest(**fields)
        request = payments.CreateSubscriptionRequest(**fields, consent=True)
        with patch.object(payments.settings, "razorpay_webhook_secret", ""):
            with self.assertRaises(HTTPException) as caught:
                payments.create_recurring_donation(request, self.db)
        self.assertEqual(caught.exception.status_code, 503)
        self.client.plan.create.assert_not_called()

    def test_live_keys_are_rejected(self):
        with patch.object(payments.settings, "razorpay_key_id", "rzp_live_unit"):
            with self.assertRaises(HTTPException) as caught:
                self.create()
        self.assertEqual(caught.exception.status_code, 503)
        self.client.order.create.assert_not_called()

    def test_missing_secret_is_rejected(self):
        with patch.object(payments.settings, "razorpay_key_secret", ""):
            with self.assertRaises(HTTPException) as caught:
                self.create()
        self.assertEqual(caught.exception.status_code, 503)
        self.client.order.create.assert_not_called()

    def test_provider_failure_leaves_no_donation(self):
        self.client.order.create.side_effect = RuntimeError("provider failure")
        with self.assertRaises(HTTPException) as caught:
            self.create()
        self.assertEqual(caught.exception.status_code, 502)
        self.assertEqual(self.db.query(Donation).count(), 0)

    def test_database_failure_rolls_back(self):
        with patch.object(self.db, "commit", side_effect=SQLAlchemyError("commit failure")):
            with self.assertRaises(HTTPException) as caught:
                self.create()
        self.assertEqual(caught.exception.status_code, 500)
        self.assertEqual(self.db.query(Donation).count(), 0)

    def test_payment_order_requests_are_rate_limited_per_ip(self):
        key = "payment-order-test-ip"
        payment_order_ip_limiter.reset(key)
        try:
            with patch("app.ratelimit.client_ip", return_value=key):
                for _ in range(payment_order_ip_limiter.limit):
                    limit_payment_orders(Mock())
                with self.assertRaises(HTTPException) as caught:
                    limit_payment_orders(Mock())
            self.assertEqual(caught.exception.status_code, 429)
        finally:
            payment_order_ip_limiter.reset(key)


if __name__ == "__main__":
    unittest.main()
