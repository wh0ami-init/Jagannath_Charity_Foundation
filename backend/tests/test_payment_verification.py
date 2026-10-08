"""HTTP verification/webhook tests with an isolated database and mocked provider."""
import asyncio
import hashlib
import hmac
import json
import unittest
from unittest.mock import Mock, patch
from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.database import Base, get_db
from app.models import Donation
from app.routers import payments


class PaymentVerificationTests(unittest.TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
        Base.metadata.create_all(self.engine)
        self.sessions = sessionmaker(bind=self.engine)
        with self.sessions() as db:
            db.add(Donation(amount_paise=10000, currency="INR", razorpay_order_id="order_test", status="pending"))
            db.commit()
        self.client = Mock()
        self.client.payment.fetch.return_value = {"id": "pay_test", "order_id": "order_test", "amount": 10000,
                                                 "currency": "INR", "status": "captured", "captured": True}
        self.client_patch = patch.object(payments, "get_razorpay_client", return_value=self.client)
        self.client_patch.start()
        self.config_patch = patch.multiple(payments.settings, razorpay_key_id="rzp_test_unit",
                                          razorpay_key_secret="unit-secret", razorpay_webhook_secret="webhook-secret")
        self.config_patch.start()
        self.app = FastAPI()
        self.app.include_router(payments.router)
        def database():
            with self.sessions() as db:
                yield db
        self.app.dependency_overrides[get_db] = database

    def tearDown(self):
        self.config_patch.stop()
        self.client_patch.stop()
        self.engine.dispose()

    def signature(self, body, secret):
        return hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()

    def verify_body(self):
        return {"razorpay_order_id": "order_test", "razorpay_payment_id": "pay_test",
                "razorpay_signature": self.signature(b"order_test|pay_test", "unit-secret")}

    def event(self, event="payment.captured"):
        return {"event": event, "payload": {"payment": {"entity": {"id": "pay_test", "order_id": "order_test"}}}}

    def request(self, path, value, signature=None, raw=None):
        body = raw if raw is not None else json.dumps(value).encode()
        headers = [(b"content-type", b"application/json")]
        if signature is not None:
            headers.append((b"x-razorpay-signature", signature.encode()))
        async def run():
            messages = []
            async def receive():
                return {"type": "http.request", "body": body, "more_body": False}
            async def send(message):
                messages.append(message)
            await self.app({"type": "http", "asgi": {"version": "3.0"}, "http_version": "1.1",
                            "method": "POST", "scheme": "http", "path": path, "raw_path": path.encode(),
                            "query_string": b"", "root_path": "", "headers": headers,
                            "server": ("test", 80), "client": ("test", 1234)}, receive, send)
            status = next(m["status"] for m in messages if m["type"] == "http.response.start")
            response = b"".join(m.get("body", b"") for m in messages if m["type"] == "http.response.body")
            return status, json.loads(response)
        return asyncio.run(run())

    def webhook(self, event="payment.captured"):
        body = json.dumps(self.event(event)).encode()
        return self.request("/api/payments/webhook", None, self.signature(body, "webhook-secret"), raw=body)

    def snapshot(self):
        with self.sessions() as db:
            row = db.query(Donation).one()
            return row.status, row.razorpay_payment_id, row.paid_at

    def test_verified_capture_updates_database(self):
        status, result = self.request("/api/payments/verify", self.verify_body())
        self.assertEqual(status, 200)
        self.assertEqual(result["status"], "paid")
        self.assertEqual(result["payment_id"], "pay_test")
        self.assertIsNotNone(result["paid_at"])

    def test_invalid_signature_is_rejected_before_provider_call(self):
        body = self.verify_body(); body["razorpay_signature"] = "0" * 64
        self.assertEqual(self.request("/api/payments/verify", body)[0], 400)
        self.client.payment.fetch.assert_not_called()
        self.assertEqual(self.snapshot(), ("pending", None, None))

    def test_unknown_order_and_malformed_ids_are_rejected(self):
        body = self.verify_body(); body["razorpay_order_id"] = "order_unknown"
        self.assertEqual(self.request("/api/payments/verify", body)[0], 404)
        body["razorpay_payment_id"] = "../invalid"
        self.assertEqual(self.request("/api/payments/verify", body)[0], 422)

    def test_signed_but_wrong_amount_is_rejected(self):
        self.client.payment.fetch.return_value["amount"] = 20000
        self.assertEqual(self.request("/api/payments/verify", self.verify_body())[0], 409)
        self.assertEqual(self.snapshot(), ("pending", None, None))

    def test_authorized_payment_stays_pending(self):
        self.client.payment.fetch.return_value.update(status="authorized", captured=False)
        self.assertEqual(self.request("/api/payments/verify", self.verify_body())[0], 409)
        self.assertEqual(self.snapshot(), ("pending", None, None))

    def test_webhook_then_verify_and_duplicate_webhook_are_idempotent(self):
        self.assertEqual(self.webhook()[0], 200)
        first = self.snapshot()
        self.assertEqual(self.webhook()[0], 200)
        self.assertEqual(self.request("/api/payments/verify", self.verify_body())[0], 200)
        self.assertEqual(self.snapshot(), first)
        self.assertEqual(self.client.payment.fetch.call_count, 1)

    def test_verify_then_order_paid_webhook_is_idempotent(self):
        self.assertEqual(self.request("/api/payments/verify", self.verify_body())[0], 200)
        first = self.snapshot()
        self.assertEqual(self.webhook("order.paid")[0], 200)
        self.assertEqual(self.snapshot(), first)

    def test_tampered_raw_webhook_is_rejected(self):
        body = json.dumps(self.event()).encode()
        signature = self.signature(body, "webhook-secret")
        self.assertEqual(self.request("/api/payments/webhook", None, signature, raw=body+b" ")[0], 400)
        self.assertEqual(self.snapshot(), ("pending", None, None))

    def test_webhook_requires_signature_and_configuration(self):
        self.assertEqual(self.request("/api/payments/webhook", self.event())[0], 400)
        with patch.object(payments.settings, "razorpay_webhook_secret", ""):
            self.assertEqual(self.webhook()[0], 503)

    def test_failed_event_does_not_downgrade_paid_donation(self):
        self.webhook()
        first = self.snapshot()
        status, result = self.webhook("payment.failed")
        self.assertEqual(status, 200)
        self.assertTrue(result["ignored"])
        self.assertEqual(self.snapshot(), first)

    def test_invalid_json_missing_entity_and_oversized_body(self):
        for raw in [b"not json", b"[]", b'{"event":"payment.captured","payload":null}']:
            with self.subTest(raw=raw):
                self.assertEqual(self.request("/api/payments/webhook", None,
                    self.signature(raw, "webhook-secret"), raw=raw)[0], 400)
        self.assertEqual(self.request("/api/payments/webhook", None, raw=b"x"*(1024*1024+1))[0], 413)

    def test_provider_failure_can_be_retried(self):
        self.client.payment.fetch.side_effect = RuntimeError("network")
        self.assertEqual(self.webhook()[0], 502)
        self.assertEqual(self.snapshot(), ("pending", None, None))
        self.client.payment.fetch.side_effect = None
        self.assertEqual(self.webhook()[0], 200)

    def test_non_ascii_webhook_signature_is_rejected(self):
        self.assertEqual(self.request("/api/payments/webhook", self.event(), signature="\u00e9")[0], 400)
        self.client.payment.fetch.assert_not_called()
        self.assertEqual(self.snapshot(), ("pending", None, None))
