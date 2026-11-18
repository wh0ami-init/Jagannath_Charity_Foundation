"""Startup must stay bounded and preserve administrator changes across restarts."""
import os
from pathlib import Path
from tempfile import TemporaryDirectory
import unittest
from unittest.mock import patch

from sqlalchemy import create_engine, event, select
from sqlalchemy.orm import Session

with patch.dict(os.environ, {
    "DATABASE_URL": "sqlite://",
    "JWT_SECRET": "startup-test-secret-at-least-thirty-two-characters",
    "ENVIRONMENT": "development",
}):
    from app.database import Base
    from app.models import ImageSlot, DeletedGallerySeed, SiteContent
    from app import startup


class StartupTests(unittest.TestCase):
    def test_bulk_startup_preserves_uploads_deletions_and_content(self):
        engine = create_engine("sqlite://")
        Base.metadata.create_all(engine)
        selects = []
        event.listen(engine, "before_cursor_execute", lambda conn, cursor, sql, params, context, many:
                     selects.append(sql) if sql.lstrip().upper().startswith("SELECT") else None)
        with TemporaryDirectory() as directory:
            root = Path(directory)
            seeds, uploads = root / "seeds", root / "uploads"
            seeds.mkdir()
            uploads.mkdir()
            (seeds / "portrait.jpg").write_bytes(b"seed-photo")
            (uploads / "custom.jpg").write_bytes(b"administrator-photo")
            slots = [(f"person-{i}", f"Person {i}", "Team", "Portrait", "portrait.jpg") for i in range(100)]
            content = [(f"text-{i}", "Title", "Home", "Default") for i in range(100)]
            with patch.object(startup, "SEED_IMAGES_DIR", seeds), patch.object(startup, "UPLOAD_DIR", uploads), \
                 patch.object(startup, "IMAGE_SLOTS", slots), patch.object(startup, "SITE_CONTENT", content), Session(engine) as db:
                db.add(ImageSlot(slot_key="person-0", label="Custom", page="Team", file_path="custom.jpg"))
                db.add(DeletedGallerySeed(slot_key="person-1"))
                db.add(SiteContent(content_key="text-0", label="Title", page="Home", value="Edited"))
                db.commit()
                selects.clear()
                startup.ensure_image_slots(db)
                startup.ensure_site_content(db)
                self.assertEqual(len(selects), 3)
                self.assertEqual((uploads / "custom.jpg").read_bytes(), b"administrator-photo")
                self.assertFalse((uploads / "person-1.jpg").exists())
                self.assertEqual(db.scalar(select(SiteContent).where(SiteContent.content_key == "text-0")).value, "Edited")
                selects.clear()
                with patch.object(startup.shutil, "copy", wraps=startup.shutil.copy) as copy:
                    startup.ensure_image_slots(db)
                    startup.ensure_site_content(db)
                    self.assertEqual(len(selects), 3)
                    copy.assert_not_called()
                (uploads / "person-2.jpg").unlink()
                (seeds / "portrait.jpg").write_bytes(b"updated-seed-photo")
                startup.ensure_image_slots(db)
                self.assertEqual((uploads / "person-2.jpg").read_bytes(), b"updated-seed-photo")
                self.assertEqual((uploads / "person-3.jpg").read_bytes(), b"updated-seed-photo")
                self.assertEqual((uploads / "custom.jpg").read_bytes(), b"administrator-photo")
        engine.dispose()
