"""Payment-state tests: isolated SQLite, mocked provider, no real payments."""
import unittest
from unittest.mock import Mock, patch

from fastapi import HTTPException
from sqlalchemy import create_engine
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import sessionmaker

from app.database import Base
from app.models import Donation
from app.payment_status import confirm_captured_payment


class PaymentStatusTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://")
        Base.metadata.create_all(self.engine)
        self.db = sessionmaker(bind=self.engine)()
        self.db.add(Donation(amount_paise=10000, currency="INR", razorpay_order_id="order_test", status="pending"))
        self.db.commit()
        self.client = Mock()
        self.payment = {"id": "pay_test", "order_id": "order_test", "amount": 10000,
                        "currency": "INR", "status": "captured", "captured": True}
        self.client.payment.fetch.return_value = self.payment

    def tearDown(self):
        self.db.close()
        self.engine.dispose()

    def confirm(self, order="order_test", payment="pay_test"):
        return confirm_captured_payment(self.db, order, payment, client=self.client)

    def assert_pending(self):
        self.db.expire_all()
        row = self.db.query(Donation).filter_by(razorpay_order_id="order_test").one()
        self.assertEqual(row.status, "pending")
        self.assertIsNone(row.razorpay_payment_id)
        self.assertIsNone(row.paid_at)

    def test_capture_saves_payment_id_status_and_confirmation_time(self):
        row = self.confirm()
        self.client.payment.fetch.assert_called_once_with("pay_test", timeout=10)
        self.assertEqual(row.status, "paid")
        self.assertEqual(row.razorpay_payment_id, "pay_test")
        self.assertIsNotNone(row.paid_at)

    def test_duplicate_confirmation_keeps_first_timestamp(self):
        first_time = self.confirm().paid_at
        self.assertEqual(self.confirm().paid_at, first_time)
        self.assertEqual(self.db.query(Donation).count(), 1)

    def test_wrong_order_amount_currency_or_payment_id_does_not_mark_paid(self):
        for field, value in [("order_id", "order_other"), ("amount", 1), ("currency", "USD"), ("id", "pay_other"), ("amount", "10000")]:
            with self.subTest(field=field, value=value):
                self.client.payment.fetch.return_value = {**self.payment, field: value}
                with self.assertRaises(HTTPException) as caught:
                    self.confirm()
                self.assertEqual(caught.exception.status_code, 409)
                self.assert_pending()

    def test_authorized_failed_and_refunded_payments_are_not_marked_paid(self):
        for status in ["authorized", "created", "failed", "refunded"]:
            self.client.payment.fetch.return_value = {**self.payment, "status": status}
            with self.subTest(status=status), self.assertRaises(HTTPException):
                self.confirm()
            self.assert_pending()
        self.client.payment.fetch.return_value = {**self.payment, "captured": False}
        with self.assertRaises(HTTPException):
            self.confirm()
        self.assert_pending()

    def test_unknown_order_does_not_call_provider(self):
        with self.assertRaises(HTTPException) as caught:
            self.confirm(order="order_missing")
        self.assertEqual(caught.exception.status_code, 404)
        self.client.payment.fetch.assert_not_called()

    def test_provider_failure_keeps_pending(self):
        self.client.payment.fetch.side_effect = RuntimeError("unavailable")
        with self.assertRaises(HTTPException) as caught:
            self.confirm()
        self.assertEqual(caught.exception.status_code, 502)
        self.assert_pending()

    def test_commit_failure_rolls_back_all_payment_fields(self):
        with patch.object(self.db, "commit", side_effect=SQLAlchemyError("failed")):
            with self.assertRaises(HTTPException) as caught:
                self.confirm()
        self.assertEqual(caught.exception.status_code, 500)
        self.assert_pending()

    def test_different_payment_cannot_overwrite_paid_donation(self):
        first_time = self.confirm().paid_at
        self.client.payment.fetch.return_value = {**self.payment, "id": "pay_other"}
        with self.assertRaises(HTTPException) as caught:
            self.confirm(payment="pay_other")
        self.assertEqual(caught.exception.status_code, 409)
        row = self.db.query(Donation).one()
        self.assertEqual(row.razorpay_payment_id, "pay_test")
        self.assertEqual(row.paid_at, first_time)

    def test_payment_id_cannot_be_reused_for_another_donation(self):
        self.confirm()
        self.db.add(Donation(amount_paise=10000, currency="INR", razorpay_order_id="order_other", status="pending"))
        self.db.commit()
        self.client.payment.fetch.return_value = {**self.payment, "order_id": "order_other"}
        with self.assertRaises(HTTPException):
            self.confirm(order="order_other")
        self.assertEqual(self.db.query(Donation).filter_by(razorpay_order_id="order_other").one().status, "pending")


if __name__ == "__main__":
    unittest.main()
