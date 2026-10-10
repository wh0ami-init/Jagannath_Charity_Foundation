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
from app.models import ImageSlot, DeletedGallerySeed
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
    slot = db.query(ImageSlot).filter(managed_images(), ImageSlot.deleted_at.is_(None), ImageSlot.slot_key == slot_key).first()
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
    previous_filename = slot.file_path if slot.id is not None else None
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
    if previous_filename:
        # Replacements use versioned filenames so a failed database commit never
        # leaves a slot pointing at a missing image. Once committed, remove stale
        # versions that are not shared by another slot to prevent disk growth.
        upload_root = UPLOAD_DIR.resolve()
        candidates = {
            UPLOAD_DIR / previous_filename,
            *UPLOAD_DIR.glob(f"{slot.slot_key}-*"),
            *UPLOAD_DIR.glob(f"{slot.slot_key}.*"),
        }
        shared_names = {
            stored_name
            for (stored_name,) in db.query(ImageSlot.file_path)
            .filter(ImageSlot.id != slot.id)
            .all()
        }
        for candidate in candidates:
            if (
                candidate.name != filename
                and candidate.name not in shared_names
                and candidate.resolve().parent == upload_root
                and candidate.is_file()
            ):
                try:
                    candidate.unlink()
                except OSError:
                    # The image update already committed; a stale file is safe
                    # to leave behind if the filesystem temporarily refuses it.
                    pass
    return slot_to_out(slot)


@router.get("", response_model=list[ImageSlotOut])
def list_images(db: Session = Depends(get_db)):
    return [slot_to_out(slot) for slot in db.query(ImageSlot).filter(managed_images(), ImageSlot.deleted_at.is_(None)).order_by(ImageSlot.page, ImageSlot.slot_key).all()]


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


@router.delete("/{slot_key}", status_code=204)
def delete_image(slot_key: str, db: Session = Depends(get_db), _admin=Depends(get_current_admin)):
    """Permanently remove the gallery row and its unshared uploaded files."""
    slot = find_slot(db, slot_key)
    if slot.page != "Gallery" or slot.slot_key == "gallery-cover":
        raise HTTPException(status_code=400, detail="Only gallery photos can be deleted")
    upload_root = UPLOAD_DIR.resolve()
    current = (UPLOAD_DIR / slot.file_path).resolve()
    if current.parent != upload_root:
        raise HTTPException(status_code=400, detail="Invalid stored image path")
    # Include earlier replacements belonging to this same photo.
    candidates = {current, *UPLOAD_DIR.glob(f"{slot_key}-*"), *UPLOAD_DIR.glob(f"{slot_key}.*")}
    shared_names = {name for (name,) in db.query(ImageSlot.file_path).filter(ImageSlot.id != slot.id).all()}
    files = [path for path in candidates if path.resolve().parent == upload_root
             and path.name not in shared_names and path.is_file()]
    backups = {path: path.read_bytes() for path in files}
    removed = []
    try:
        if slot_key in IMAGE_SLOT_KEYS and db.get(DeletedGallerySeed, slot_key) is None:
            db.add(DeletedGallerySeed(slot_key=slot_key))
        db.delete(slot)
        for path in files:
            path.unlink()
            removed.append(path)
        db.commit()
    except Exception:
        db.rollback()
        for path in removed:
            path.write_bytes(backups[path])
        raise
