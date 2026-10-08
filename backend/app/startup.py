import shutil
from pathlib import Path

from sqlalchemy.orm import Session

from app.models import ImageSlot, SiteContent, DeletedGallerySeed
from app.seed_data import IMAGE_SLOTS, SITE_CONTENT

BASE_DIR = Path(__file__).resolve().parent.parent
SEED_IMAGES_DIR = BASE_DIR / "seed_images"
UPLOAD_DIR = BASE_DIR / "uploads"


def ensure_image_slots(db: Session):
    UPLOAD_DIR.mkdir(exist_ok=True)
    for slot_key, label, page, alt_text, seed_filename in IMAGE_SLOTS:
        if db.get(DeletedGallerySeed, slot_key) is not None:
            continue
        existing = db.query(ImageSlot).filter(ImageSlot.slot_key == slot_key).first()
        seed_path = SEED_IMAGES_DIR / seed_filename
        if existing:
            if existing.deleted_at is not None:
                continue
            expected_filename = f"{slot_key}{seed_path.suffix.lower()}"
            current_upload = UPLOAD_DIR / existing.file_path
            is_seeded_slot = existing.file_path in {expected_filename, "placeholder.jpg"}
            upload_is_missing = not current_upload.is_file()

            # Restore a seed image for placeholders, seeded slots, and uploads
            # missing from a fresh deployment. Keep valid administrator uploads.
            if seed_path.is_file() and (is_seeded_slot or upload_is_missing):
                shutil.copy(seed_path, UPLOAD_DIR / expected_filename)
                existing.file_path = expected_filename
            continue

        dest_filename = f"{slot_key}{seed_path.suffix.lower()}"
        dest_path = UPLOAD_DIR / dest_filename

        if seed_path.exists():
            shutil.copy(seed_path, dest_path)
        else:
            # Create the slot without an image; an administrator can upload one.
            dest_filename = "placeholder.jpg"

        db.add(ImageSlot(
            slot_key=slot_key,
            label=label,
            page=page,
            alt_text=alt_text,
            file_path=dest_filename,
        ))
    db.commit()


def ensure_site_content(db: Session):
    obsolete_defaults = {
        ("notice_title", "A campus shaped by its place"),
        ("notice_body", "Set in Gangtok, Sikkim, our university community brings together local perspective and a wider outlook."),
    }
    for content_key, label, page, value in SITE_CONTENT:
        existing = db.query(SiteContent).filter(SiteContent.content_key == content_key).first()
        if existing:
            if (content_key, existing.value) in obsolete_defaults:
                existing.value = value
                existing.label = label
                existing.page = page
            continue
        db.add(SiteContent(content_key=content_key, label=label, page=page, value=value))
    db.commit()
