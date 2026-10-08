from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text

from app.config import settings
from app.database import Base, engine, SessionLocal
from app.routers import auth, images, content, submissions
from app.startup import ensure_image_slots, ensure_site_content

Base.metadata.create_all(bind=engine)

if "site_content" in inspect(engine).get_table_names():
    content_columns = {column["name"] for column in inspect(engine).get_columns("site_content")}
    if "page" not in content_columns:
        with engine.begin() as connection:
            connection.execute(text("ALTER TABLE site_content ADD COLUMN page VARCHAR(60) NOT NULL DEFAULT 'Home'"))

if "category" not in {column["name"] for column in inspect(engine).get_columns("image_slots")}:
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE image_slots ADD COLUMN category VARCHAR(24) NULL"))

if "deleted_at" not in {column["name"] for column in inspect(engine).get_columns("image_slots")}:
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE image_slots ADD COLUMN deleted_at DATETIME NULL"))

app = FastAPI(title="Jagannath Foundation - Site API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    expose_headers=["Retry-After"],
    allow_headers=["Content-Type", "X-CSRF-Token"],
)


@app.middleware("http")
async def add_security_headers(request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    if request.url.path.startswith("/api/auth"):
        response.headers["Cache-Control"] = "no-store"
    if settings.environment.lower() == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response


UPLOAD_DIR = Path(__file__).resolve().parent.parent / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIR)), name="uploads")

app.include_router(auth.router)
app.include_router(images.router)
app.include_router(content.router)
app.include_router(submissions.router)


@app.on_event("startup")
def on_startup():
    db = SessionLocal()
    try:
        ensure_image_slots(db)
        ensure_site_content(db)
    finally:
        db.close()


@app.get("/api/health")
def health():
    return {"status": "ok"}
