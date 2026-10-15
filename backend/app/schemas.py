import re
from datetime import date, datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field, ValidationInfo, field_validator, model_validator


class ImageSlotOut(BaseModel):
    slot_key: str
    label: str
    page: str
    alt_text: str
    category: Literal["national", "public", "regional", "culture"] | None = None
    url: str
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=80)
    password: str = Field(min_length=1, max_length=128)


class SessionResponse(BaseModel):
    username: str
    csrf_token: str


class SubmissionCreate(BaseModel):
    kind: Literal["contact", "volunteer", "pledge", "newsletter", "service", "beneficiary"]
    name: str = Field(default="", max_length=150)
    email: str = Field(default="", max_length=254)
    phone: str = Field(default="", max_length=40)
    subject: str = Field(default="", max_length=200)
    message: str = Field(default="", max_length=4000)
    district: str = Field(default="", max_length=120)
    skill: str = Field(default="", max_length=200)
    amount: Decimal | None = Field(default=None, ge=0, le=9999999999)
    cause: str = Field(default="", max_length=160)
    consent: bool
    website: str = Field(default="", max_length=200)

    @field_validator("email")
    @classmethod
    def valid_email(cls, value: str, info: ValidationInfo) -> str:
        value = value.strip()
        if not value and info.data.get("kind") == "beneficiary":
            return value
        if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", value):
            raise ValueError("Enter a valid email address")
        return value

    @model_validator(mode="after")
    def require_email_outside_beneficiary_applications(self):
        if self.kind != "beneficiary" and not self.email:
            raise ValueError("Enter a valid email address")
        return self

    @field_validator("name", "phone", "subject", "message", "district", "skill", "cause")
    @classmethod
    def trim_text(cls, value: str) -> str:
        return value.strip()


class BeneficiaryApplicationCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=150)
    gender: Literal["Female", "Male", "Other", "Prefer not to say"]
    date_of_birth: date | None = None
    father_name: str = Field(default="", max_length=150)
    caste_category: str = Field(default="", max_length=60)
    phone: str = Field(min_length=7, max_length=15)
    email: str = Field(default="", max_length=254)
    address: str = Field(default="", max_length=700)
    state: str = Field(default="", max_length=100)
    district: str = Field(default="", max_length=120)
    beneficiary_category: Literal[
        "Education", "Healthcare", "Livelihood", "Food and essentials", "Community support", "Other"
    ]
    other_category: str = Field(default="", max_length=120)
    reason: str = Field(min_length=10, max_length=1600)
    consent: bool
    public_listing: bool = False
    public_display_name: str = Field(default="", max_length=80)
    website: str = Field(default="", max_length=200)

    @field_validator("email")
    @classmethod
    def valid_optional_email(cls, value: str) -> str:
        value = value.strip()
        if value and not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", value):
            raise ValueError("Enter a valid email address")
        return value

    @field_validator("phone")
    @classmethod
    def valid_phone(cls, value: str) -> str:
        value = value.strip()
        if not re.fullmatch(r"[+0-9() -]{7,15}", value) or sum(ch.isdigit() for ch in value) < 7:
            raise ValueError("Enter a valid phone number")
        return value

    @field_validator("full_name", "father_name", "caste_category", "address", "state", "district", "other_category", "reason", "public_display_name")
    @classmethod
    def trim_beneficiary_text(cls, value: str) -> str:
        return value.strip()

    @model_validator(mode="after")
    def validate_application_consent_and_fields(self):
        if not self.consent:
            raise ValueError("Consent is required to submit this application")
        if self.date_of_birth and self.date_of_birth > date.today():
            raise ValueError("Date of birth cannot be in the future")
        if self.beneficiary_category == "Other" and len(self.other_category) < 2:
            raise ValueError("Please specify the type of support you need")
        if self.public_listing and len(self.public_display_name) < 2:
            raise ValueError("Enter the display name to show in the public beneficiary list")
        return self


class SubmissionOut(BaseModel):
    id: int
    kind: str
    name: str
    email: str
    phone: str
    subject: str
    message: str
    district: str
    skill: str
    amount: Decimal | None
    cause: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
