import uuid
import warnings
from io import BytesIO
from pathlib import Path
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel, Field, field_validator
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.auth import get_current_admin
from app.database import get_db
from app.models import ImageSlot
from app.schemas import ImageSlotOut
from app.seed_data import IMAGE_SLOTS

router = APIRouter(prefix="/api/images", tags=["images"])
UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
IMAGE_SLOT_KEYS = {item[0] for item in IMAGE_SLOTS}
MAX_FILE_SIZE = 8 * 1024 * 1024
FORMATS = {".jpg": "JPEG", ".jpeg": "JPEG", ".png": "PNG", ".webp": "WEBP", ".gif": "GIF"}
Category = Literal["national", "public", "regional", "culture"]


class GalleryDetails(BaseModel):
    label: str = Field(min_length=1, max_length=200)
    alt_text: str = Field(default="", max_length=300)
    category: Category

    @field_validator("label", "alt_text", mode="before")
    @classmethod
    def trim_text(cls, value):
        return value.strip() if isinstance(value, str) else value


def managed_images():
    return or_(ImageSlot.slot_key.in_(IMAGE_SLOT_KEYS), and_(
        ImageSlot.page == "Gallery", ImageSlot.slot_key.startswith("gallery-upload-")
    ))


def find_slot(db, slot_key):
    slot = db.query(ImageSlot).filter(managed_images(), ImageSlot.slot_key == slot_key).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Unknown image slot")
    return slot


async def read_image(file):
    ext = Path(file.filename or "").suffix.lower()
    if ext not in FORMATS:
        raise HTTPException(status_code=400, detail="Only JPG, PNG, WEBP or GIF images are allowed")
    try:
        contents = await file.read(MAX_FILE_SIZE + 1)
    finally:
        await file.close()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="File too large (max 8 MB)")
    if not contents:
        raise HTTPException(status_code=400, detail="The image file is empty")
    try:
        with warnings.catch_warnings():
            warnings.simplefilter("error", Image.DecompressionBombWarning)
            with Image.open(BytesIO(contents)) as image:
                if image.format != FORMATS[ext]:
                    raise ValueError("Image format does not match filename")
                image.verify()
    except (UnidentifiedImageError, OSError, ValueError, SyntaxError, Image.DecompressionBombError, Image.DecompressionBombWarning):
        raise HTTPException(status_code=400, detail="Choose a valid image matching its file extension")
    return ext, contents


def slot_to_out(slot):
    return ImageSlotOut(slot_key=slot.slot_key, label=slot.label, page=slot.page,
        alt_text=slot.alt_text or "", category=slot.category,
        url=f"/uploads/{slot.file_path}", updated_at=slot.updated_at)


def save_file(db, slot, filename, contents):
    path = UPLOAD_DIR / filename
    try:
        path.write_bytes(contents)
        slot.file_path = filename
        db.add(slot)
        db.commit()
    except Exception:
        db.rollback()
        path.unlink(missing_ok=True)
        raise
    db.refresh(slot)
    return slot_to_out(slot)


@router.get("", response_model=list[ImageSlotOut])
def list_images(db: Session = Depends(get_db)):
    return [slot_to_out(slot) for slot in db.query(ImageSlot).filter(managed_images()).order_by(ImageSlot.page, ImageSlot.slot_key).all()]


@router.post("", response_model=ImageSlotOut, status_code=201)
async def add_image(
    label: str = Form(..., min_length=1, max_length=200),
    alt_text: str = Form(default="", max_length=300),
    category: Category = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    label = label.strip()
    if not label:
        raise HTTPException(status_code=400, detail="Enter a photo title")
    ext, contents = await read_image(file)
    key = f"gallery-upload-{uuid.uuid4().hex}"
    slot = ImageSlot(slot_key=key, label=label, alt_text=alt_text.strip(), page="Gallery", category=category)
    return save_file(db, slot, f"{key}{ext}", contents)


@router.get("/{slot_key}", response_model=ImageSlotOut)
def get_image(slot_key: str, db: Session = Depends(get_db)):
    return slot_to_out(find_slot(db, slot_key))


@router.put("/{slot_key}", response_model=ImageSlotOut)
def update_details(slot_key: str, payload: GalleryDetails, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    slot = find_slot(db, slot_key)
    if slot.page != "Gallery" or slot.slot_key == "gallery-cover":
        raise HTTPException(status_code=400, detail="Only gallery photo details can be edited here")
    slot.label = payload.label
    slot.alt_text = payload.alt_text
    slot.category = payload.category
    db.commit()
    db.refresh(slot)
    return slot_to_out(slot)


@router.post("/{slot_key}", response_model=ImageSlotOut)
async def replace_image(slot_key: str, file: UploadFile = File(...), db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    slot = find_slot(db, slot_key)
    ext, contents = await read_image(file)
    return save_file(db, slot, f"{slot_key}-{uuid.uuid4().hex}{ext}", contents)
