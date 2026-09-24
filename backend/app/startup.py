import shutil
from pathlib import Path

from sqlalchemy.orm import Session

from app.auth import hash_password
from app.config import settings
from app.models import AdminUser, ImageSlot
from app.seed_data import IMAGE_SLOTS

BASE_DIR = Path(__file__).resolve().parent.parent
SEED_IMAGES_DIR = BASE_DIR / "seed_images"
UPLOAD_DIR = BASE_DIR / "uploads"


def ensure_admin_user(db: Session):
    existing = db.query(AdminUser).filter(AdminUser.username == settings.admin_username).first()
    if existing:
        return
    admin = AdminUser(
        username=settings.admin_username,
        password_hash=hash_password(settings.admin_password),
    )
    db.add(admin)
    db.commit()
    print(f"[startup] Created admin user '{settings.admin_username}' "
          f"(password from ADMIN_PASSWORD in .env -- change it after first login)")


def ensure_image_slots(db: Session):
    UPLOAD_DIR.mkdir(exist_ok=True)
    for slot_key, label, page, alt_text, seed_filename in IMAGE_SLOTS:
        existing = db.query(ImageSlot).filter(ImageSlot.slot_key == slot_key).first()
        if existing:
            continue

        seed_path = SEED_IMAGES_DIR / seed_filename
        dest_filename = f"{slot_key}{seed_path.suffix.lower()}"
        dest_path = UPLOAD_DIR / dest_filename

        if seed_path.exists():
            shutil.copy(seed_path, dest_path)
        else:
            # No seed file bundled -- slot is created empty; admin uploads later
            dest_filename = "placeholder.jpg"

        db.add(ImageSlot(
            slot_key=slot_key,
            label=label,
            page=page,
            alt_text=alt_text,
            file_path=dest_filename,
        ))
    db.commit()
    print(f"[startup] Ensured {len(IMAGE_SLOTS)} image slots exist")
