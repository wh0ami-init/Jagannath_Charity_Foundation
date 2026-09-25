from datetime import datetime
import re
from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class ImageSlotOut(BaseModel):
    slot_key: str
    label: str
    page: str
    alt_text: str
    url: str
    updated_at: datetime

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    username: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class SubmissionCreate(BaseModel):
    kind: Literal["contact", "volunteer", "pledge", "newsletter"]
    name: str = Field(default="", max_length=150)
    email: str = Field(max_length=254)
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
    def valid_email(cls, value: str) -> str:
        value = value.strip()
        if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", value):
            raise ValueError("Enter a valid email address")
        return value

    @field_validator("name", "phone", "subject", "message", "district", "skill", "cause")
    @classmethod
    def trim_text(cls, value: str) -> str:
        return value.strip()


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

    class Config:
        from_attributes = True
