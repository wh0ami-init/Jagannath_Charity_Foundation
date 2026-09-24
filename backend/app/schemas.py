from datetime import datetime
from pydantic import BaseModel


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
