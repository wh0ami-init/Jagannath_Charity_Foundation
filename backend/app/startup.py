import filecmp
import shutil
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models import ImageSlot, SiteContent, DeletedGallerySeed
from app.seed_data import IMAGE_SLOTS, SITE_CONTENT

BASE_DIR = Path(__file__).resolve().parent.parent
SEED_IMAGES_DIR = BASE_DIR / "seed_images"
UPLOAD_DIR = BASE_DIR / "uploads"


def ensure_image_slots(db: Session):
    UPLOAD_DIR.mkdir(exist_ok=True)
    slot_keys = [slot[0] for slot in IMAGE_SLOTS]
    deleted_keys = set(db.scalars(select(DeletedGallerySeed.slot_key).where(
        DeletedGallerySeed.slot_key.in_(slot_keys)
    )).all())
    existing_slots = {slot.slot_key: slot for slot in db.scalars(
        select(ImageSlot).where(ImageSlot.slot_key.in_(slot_keys))
    ).all()}
    for slot_key, label, page, alt_text, seed_filename in IMAGE_SLOTS:
        if slot_key in deleted_keys:
            continue
        existing = existing_slots.get(slot_key)
        seed_path = SEED_IMAGES_DIR / seed_filename
        if existing:
            if existing.deleted_at is not None:
                continue
            expected_filename = f"{slot_key}{seed_path.suffix.lower()}"
            current_upload = UPLOAD_DIR / existing.file_path
            legacy_logo = slot_key == "site-logo" and existing.file_path in {
                "site-logo.png",
                "site-logo.svg",
            }
            is_seeded_slot = (
                existing.file_path in {expected_filename, "placeholder.jpg"}
                or legacy_logo
            )
            upload_is_missing = not current_upload.is_file()

            # Restore a seed image for placeholders, seeded slots, and uploads
            # missing from a fresh deployment. Keep valid administrator uploads.
            if seed_path.is_file() and (is_seeded_slot or upload_is_missing):
                destination = UPLOAD_DIR / expected_filename
                if not destination.is_file() or not filecmp.cmp(seed_path, destination, shallow=False):
                    shutil.copy(seed_path, destination)
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
    existing_content = {row.content_key: row for row in db.scalars(
        select(SiteContent).where(SiteContent.content_key.in_([item[0] for item in SITE_CONTENT]))
    ).all()}
    obsolete_defaults = {
        ("notice_title", "A campus shaped by its place"),
        ("notice_body", "Set in Gangtok, Sikkim, our university community brings together local perspective and a wider outlook."),
    }
    for content_key, label, page, value in SITE_CONTENT:
        existing = existing_content.get(content_key)
        if existing:
            if (content_key, existing.value) in obsolete_defaults:
                existing.value = value
                existing.label = label
                existing.page = page
            continue
        db.add(SiteContent(content_key=content_key, label=label, page=page, value=value))
    db.commit()
