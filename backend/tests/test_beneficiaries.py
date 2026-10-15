"""Beneficiary application privacy and public-directory behavior."""
from datetime import date, timedelta
from unittest import TestCase

from pydantic import ValidationError
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base
from app.routers.beneficiaries import create_beneficiary_application, list_public_beneficiaries
from app.schemas import BeneficiaryApplicationCreate


def application_payload(**changes):
    data = {
        "full_name": "Private Applicant Name",
        "gender": "Prefer not to say",
        "date_of_birth": date(1990, 1, 1),
        "phone": "+91 98765 43210",
        "email": "",
        "beneficiary_category": "Education",
        "reason": "Requesting help with education expenses.",
        "consent": True,
    }
    data.update(changes)
    return BeneficiaryApplicationCreate(**data)


class BeneficiaryApplicationTests(TestCase):
    def setUp(self):
        self.engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
        Base.metadata.create_all(self.engine)
        self.sessions = sessionmaker(bind=self.engine)
        self.db = self.sessions()

    def tearDown(self):
        self.db.close()
        self.engine.dispose()

    def test_private_application_is_stored_but_not_publicly_listed(self):
        result = create_beneficiary_application(application_payload(), self.db)
        self.assertTrue(result["received"])
        self.assertFalse(result["listed"])
        self.assertEqual(list_public_beneficiaries(self.db), [])

    def test_opted_in_profile_is_listed_without_private_application_fields(self):
        payload = application_payload(public_listing=True, public_display_name="A. Learner")
        result = create_beneficiary_application(payload, self.db)
        self.assertTrue(result["listed"])
        profiles = list_public_beneficiaries(self.db)
        self.assertEqual(len(profiles), 1)
        self.assertEqual(profiles[0]["display_name"], "A. Learner")
        self.assertEqual(profiles[0]["category"], "Education")
        self.assertNotIn("phone", profiles[0])
        self.assertNotIn("email", profiles[0])
        self.assertNotIn("full_name", profiles[0])

    def test_listing_needs_explicit_display_name_and_consent(self):
        with self.assertRaises(ValidationError):
            application_payload(public_listing=True)
        with self.assertRaises(ValidationError):
            application_payload(consent=False)
        with self.assertRaises(ValidationError):
            application_payload(date_of_birth=date.today() + timedelta(days=1))

