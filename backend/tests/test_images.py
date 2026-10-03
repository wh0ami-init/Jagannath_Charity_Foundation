"""Image API checks using a temporary database and upload directory.

Run from backend: python -m unittest discover -s tests -v
"""
import asyncio
from io import BytesIO
from PIL import Image
import json
import os
from pathlib import Path
import unittest
from unittest.mock import patch
from uuid import uuid4

from fastapi import FastAPI
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

with patch.dict(os.environ, {"DATABASE_URL": "sqlite://", "JWT_SECRET": "image-api-test-secret-at-least-32-characters", "ENVIRONMENT": "development"}):
    from app.auth import create_access_token
    from app.database import Base, get_db
    from app.models import AdminUser, ImageSlot
    from app.routers import images


image_buffer = BytesIO()
Image.new("RGB", (2, 2), "green").save(image_buffer, format="PNG")
PHOTO = image_buffer.getvalue()


class ImageApiTests(unittest.TestCase):
    def setUp(self):
        self.directory = Path(__file__).resolve().parent / f"image-test-{uuid4().hex}"
        self.directory.mkdir()
        self.upload_patch = patch.object(images, "UPLOAD_DIR", self.directory)
        self.upload_patch.start()
        self.engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
        Base.metadata.create_all(self.engine)
        self.sessions = sessionmaker(bind=self.engine)
        with self.sessions() as db:
            db.add(AdminUser(username="tester", password_hash="unused"))
            db.add(ImageSlot(slot_key="site-logo", label="Logo", page="Global", file_path="original.png"))
            db.commit()
        self.app = FastAPI()
        self.app.include_router(images.router)

        def test_db():
            with self.sessions() as db:
                yield db

        self.app.dependency_overrides[get_db] = test_db
        self.token = create_access_token("tester")

    def tearDown(self):
        self.engine.dispose()
        self.upload_patch.stop()
        for file in self.directory.iterdir():
            file.unlink()
        self.directory.rmdir()

    def request(self, method, path, *, fields=None, file=None, authenticated=False, json_body=None):
        headers = []
        body = b""
        if fields is not None or file is not None:
            boundary = "image-test-boundary"
            for key, value in (fields or {}).items():
                body += (f'--{boundary}\r\nContent-Disposition: form-data; name="{key}"\r\n\r\n{value}\r\n').encode()
            if file is not None:
                filename, content = file
                body += (f'--{boundary}\r\nContent-Disposition: form-data; name="file"; filename="{filename}"\r\nContent-Type: application/octet-stream\r\n\r\n').encode()
                body += content + b"\r\n"
            body += f"--{boundary}--\r\n".encode()
            headers.append((b"content-type", f"multipart/form-data; boundary={boundary}".encode()))
        if json_body is not None:
            body = json.dumps(json_body).encode()
            headers.append((b"content-type", b"application/json"))
        if authenticated:
            headers.append((b"authorization", f"Bearer {self.token}".encode()))
        headers.append((b"content-length", str(len(body)).encode()))

        async def run():
            messages = []

            async def receive():
                return {"type": "http.request", "body": body, "more_body": False}

            async def send(message):
                messages.append(message)

            await self.app({
                "type": "http", "asgi": {"version": "3.0"}, "http_version": "1.1",
                "method": method, "scheme": "http", "path": path,
                "raw_path": path.encode(), "query_string": b"", "root_path": "",
                "headers": headers, "server": ("test", 80), "client": ("test", 1234),
            }, receive, send)
            status = next(message["status"] for message in messages if message["type"] == "http.response.start")
            response = b"".join(message.get("body", b"") for message in messages if message["type"] == "http.response.body")
            return status, json.loads(response) if response else None

        return asyncio.run(run())

    def test_replacement_requires_admin(self):
        status, _ = self.request("POST", "/api/images/site-logo", file=("photo.png", PHOTO))
        self.assertEqual(status, 401)
        self.assertEqual(list(self.directory.iterdir()), [])

    def test_existing_image_can_be_replaced(self):
        status, result = self.request("POST", "/api/images/site-logo", file=("photo.png", PHOTO), authenticated=True)
        self.assertEqual(status, 200)
        self.assertEqual(result["slot_key"], "site-logo")
        self.assertEqual((self.directory / Path(result["url"]).name).read_bytes(), PHOTO)

    def test_invalid_uploads_leave_existing_image_unchanged(self):
        for filename, content in [("photo.png", b"not an image"), ("photo.svg", PHOTO), ("photo.png", b""), ("photo.png", b"x" * (images.MAX_FILE_SIZE + 1))]:
            with self.subTest(filename=filename, size=len(content)):
                status, _ = self.request("POST", "/api/images/site-logo", file=(filename, content), authenticated=True)
                self.assertEqual(status, 413 if len(content) > images.MAX_FILE_SIZE else 400)
                self.assertEqual(list(self.directory.iterdir()), [])
                with self.sessions() as db:
                    self.assertEqual(db.query(ImageSlot).filter_by(slot_key="site-logo").one().file_path, "original.png")

    def test_unknown_slot_returns_not_found(self):
        status, _ = self.request("POST", "/api/images/missing", file=("photo.png", PHOTO), authenticated=True)
        self.assertEqual(status, 404)

    def add_photo(self, **changes):
        fields = {"label": "New community event", "alt_text": "Community gathering", "category": "regional"}
        fields.update(changes)
        return self.request("POST", "/api/images", fields=fields, file=("photo.png", PHOTO), authenticated=True)

    def test_add_list_and_retrieve_photo(self):
        status, photo = self.add_photo()
        self.assertEqual(status, 201)
        self.assertEqual(photo["page"], "Gallery")
        self.assertEqual(photo["category"], "regional")
        self.assertEqual(photo["alt_text"], "Community gathering")
        self.assertTrue(photo["slot_key"].startswith("gallery-upload-"))
        self.assertEqual(self.request("GET", "/api/images/" + photo["slot_key"])[0], 200)
        self.assertEqual(len(self.request("GET", "/api/images")[1]), 2)
        with self.sessions() as db:
            self.assertEqual(db.query(ImageSlot).filter_by(slot_key=photo["slot_key"]).one().label, photo["label"])

    def test_creation_requires_admin(self):
        status, _ = self.request("POST", "/api/images", fields={"label": "Test", "category": "culture"}, file=("photo.png", PHOTO))
        self.assertEqual(status, 401)
        self.assertEqual(list(self.directory.iterdir()), [])

    def test_invalid_details_are_rejected(self):
        for fields in [{"label": "  "}, {"label": "x" * 201}, {"alt_text": "x" * 301}, {"category": "invalid"}]:
            with self.subTest(fields=fields):
                self.assertIn(self.add_photo(**fields)[0], (400, 422))
        self.assertEqual(list(self.directory.iterdir()), [])
        self.assertEqual(len(self.request("GET", "/api/images")[1]), 1)

    def test_optional_description_and_duplicate_titles(self):
        first = self.add_photo(alt_text="")[1]
        second = self.add_photo(alt_text="")[1]
        self.assertEqual(first["alt_text"], "")
        self.assertNotEqual(first["slot_key"], second["slot_key"])

    def test_edit_details_and_replace_keep_metadata(self):
        photo = self.add_photo()[1]
        path = "/api/images/" + photo["slot_key"]
        details = {"label": " Updated title ", "alt_text": "New description", "category": "public"}
        self.assertEqual(self.request("PUT", path, json_body=details)[0], 401)
        status, edited = self.request("PUT", path, json_body=details, authenticated=True)
        self.assertEqual(status, 200)
        self.assertEqual(edited["label"], "Updated title")
        self.assertEqual(edited["url"], photo["url"])
        status, replaced = self.request("POST", path, file=("replacement.png", PHOTO), authenticated=True)
        self.assertEqual(status, 200)
        self.assertEqual(replaced["alt_text"], "New description")
        self.assertEqual(replaced["category"], "public")
        self.assertNotEqual(replaced["url"], photo["url"])

    def test_details_cannot_edit_other_sections_or_cover(self):
        with self.sessions() as db:
            db.add(ImageSlot(slot_key="gallery-cover", page="Gallery", label="Cover", file_path="cover.png"))
            db.commit()
        for key in ["site-logo", "gallery-cover"]:
            status, _ = self.request("PUT", "/api/images/" + key, json_body={"label": "Wrong", "category": "culture"}, authenticated=True)
            self.assertEqual(status, 400)

    def test_failed_commit_removes_new_file(self):
        with patch("sqlalchemy.orm.Session.commit", side_effect=RuntimeError("Database unavailable")):
            with self.assertRaises(RuntimeError):
                self.add_photo()
        self.assertEqual(list(self.directory.iterdir()), [])

    def test_startup_preserves_added_photo_and_edited_seed_details(self):
        from app import startup
        photo = self.add_photo()[1]
        with self.sessions() as db:
            seed = ImageSlot(slot_key="gallery-kalam", label="Edited seed title", alt_text="Edited description", page="Gallery", category="culture", file_path="gallery-kalam.png")
            db.add(seed)
            db.commit()
            with patch.object(startup, "UPLOAD_DIR", self.directory), patch.object(startup, "SEED_IMAGES_DIR", self.directory), patch.object(startup, "IMAGE_SLOTS", [("gallery-kalam", "Original", "Gallery", "Original description", "missing.png")]):
                startup.ensure_image_slots(db)
        self.assertEqual(self.request("GET", "/api/images/" + photo["slot_key"])[1]["alt_text"], "Community gathering")
        self.assertEqual(self.request("GET", "/api/images/gallery-kalam")[1]["label"], "Edited seed title")


if __name__ == "__main__":
    unittest.main()
