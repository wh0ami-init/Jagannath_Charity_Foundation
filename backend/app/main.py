from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import inspect, text

from app.config import settings
from app.database import Base, engine, SessionLocal
from app.routers import auth, beneficiaries, images, content, submissions, payments
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

# Additive donation schema update: the original payments table predates donor
# details and receipt delivery. Keep existing payment history intact.
donation_columns = {column["name"] for column in inspect(engine).get_columns("donations")}
donation_additions = {
    "donor_name": "VARCHAR(150) NOT NULL DEFAULT ''",
    "donor_email": "VARCHAR(254) NOT NULL DEFAULT ''",
    "donor_phone": "VARCHAR(40) NOT NULL DEFAULT ''",
    "donor_address": "VARCHAR(500) NOT NULL DEFAULT ''",
    "cause": "VARCHAR(160) NOT NULL DEFAULT ''",
    "receipt_email_sent_at": "DATETIME NULL",
    "refund_amount_paise": "INTEGER NOT NULL DEFAULT 0",
    "refunded_at": "DATETIME NULL",
    "razorpay_subscription_id": "VARCHAR(100) NULL",
}
for column_name, column_definition in donation_additions.items():
    if column_name not in donation_columns:
        with engine.begin() as connection:
            connection.execute(text(f"ALTER TABLE donations ADD COLUMN {column_name} {column_definition}"))

donation_indexes = {index["name"] for index in inspect(engine).get_indexes("donations")}
if "ix_donations_razorpay_subscription_id" not in donation_indexes:
    with engine.begin() as connection:
        connection.execute(text(
            "CREATE INDEX ix_donations_razorpay_subscription_id "
            "ON donations (razorpay_subscription_id)"
        ))

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
app.include_router(beneficiaries.router)
app.include_router(payments.router)


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
