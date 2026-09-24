import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session

from app.auth import get_current_admin
from app.database import get_db
from app.models import ImageSlot
from app.schemas import ImageSlotOut

router = APIRouter(prefix="/api/images", tags=["images"])

UPLOAD_DIR = Path(__file__).resolve().parent.parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp", ".gif"}
MAX_FILE_SIZE = 8 * 1024 * 1024  # 8 MB


def slot_to_out(slot: ImageSlot) -> ImageSlotOut:
    return ImageSlotOut(
        slot_key=slot.slot_key,
        label=slot.label,
        page=slot.page,
        alt_text=slot.alt_text or "",
        url=f"/uploads/{slot.file_path}",
        updated_at=slot.updated_at,
    )


@router.get("", response_model=list[ImageSlotOut])
def list_images(db: Session = Depends(get_db)):
    """Public endpoint. The frontend loads this once and renders every
    dynamic image from it, keyed by slot_key."""
    slots = db.query(ImageSlot).order_by(ImageSlot.page, ImageSlot.slot_key).all()
    return [slot_to_out(s) for s in slots]


@router.get("/{slot_key}", response_model=ImageSlotOut)
def get_image(slot_key: str, db: Session = Depends(get_db)):
    slot = db.query(ImageSlot).filter(ImageSlot.slot_key == slot_key).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Unknown image slot")
    return slot_to_out(slot)


@router.post("/{slot_key}", response_model=ImageSlotOut)
async def replace_image(
    slot_key: str,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    """Admin-only. Uploads a new file for an existing slot key and updates
    the DB row so every page picks up the new image immediately."""
    slot = db.query(ImageSlot).filter(ImageSlot.slot_key == slot_key).first()
    if not slot:
        raise HTTPException(status_code=404, detail="Unknown image slot")

    ext = Path(file.filename or "").suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only jpg, jpeg, png, webp or gif files are allowed")

    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 8MB)")

    new_filename = f"{slot_key}-{uuid.uuid4().hex[:8]}{ext}"
    with open(UPLOAD_DIR / new_filename, "wb") as f:
        f.write(contents)

    slot.file_path = new_filename
    db.commit()
    db.refresh(slot)
    return slot_to_out(slot)
