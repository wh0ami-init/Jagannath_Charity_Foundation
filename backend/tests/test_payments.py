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


class PaymentOrderTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://")
        Base.metadata.create_all(self.engine)
        self.db = sessionmaker(bind=self.engine)()
        self.client = Mock()
        self.client.order.create.return_value = {
            "id": "order_unit_test", "amount": 10000, "currency": "INR",
        }
        self.client_patch = patch.object(payments, "get_razorpay_client", return_value=self.client)
        self.client_patch.start()
        self.settings_patch = patch.multiple(
            payments.settings, razorpay_key_id="rzp_test_unit", razorpay_key_secret="unit-secret",
        )
        self.settings_patch.start()

    def tearDown(self):
        self.db.close()
        self.engine.dispose()
        self.settings_patch.stop()
        self.client_patch.stop()

    def create(self):
        return payments.create_order(payments.CreateOrderRequest(amount_rupees=100), self.db)

    def test_order_is_saved_pending_and_secret_is_not_returned(self):
        result = self.create()
        donation = self.db.query(Donation).one()
        self.assertEqual(donation.amount_paise, 10000)
        self.assertEqual(donation.currency, "INR")
        self.assertEqual(donation.razorpay_order_id, result["order_id"])
        self.assertEqual(donation.status, "pending")
        self.assertIsNone(donation.razorpay_payment_id)
        self.assertIsNone(donation.paid_at)
        self.assertEqual(set(result), {"order_id", "amount", "currency", "key_id"})
        sent = self.client.order.create.call_args.args[0]
        self.assertEqual(sent["amount"], 10000)
        self.assertEqual(sent["currency"], "INR")
        self.assertLessEqual(len(sent["receipt"]), 40)

    def test_invalid_amounts_are_rejected(self):
        for value in [0, -1, 10001, 1.5, "100", True]:
            with self.subTest(value=value), self.assertRaises(ValidationError):
                payments.CreateOrderRequest(amount_rupees=value)
        self.client.order.create.assert_not_called()

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


if __name__ == "__main__":
    unittest.main()
