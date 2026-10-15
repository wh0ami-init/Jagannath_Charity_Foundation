import json
from uuid import uuid4

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import FormSubmission
from app.ratelimit import limit_form_submissions
from app.schemas import BeneficiaryApplicationCreate

router = APIRouter(prefix="/api/beneficiaries", tags=["beneficiaries"])


@router.post("/applications", status_code=201, dependencies=[Depends(limit_form_submissions)])
def create_beneficiary_application(payload: BeneficiaryApplicationCreate, db: Session = Depends(get_db)):
    if payload.website:
        return {"received": True, "listed": False}

    private_details = payload.model_dump(mode="json", exclude={"website", "consent"})
    public_details = None
    if payload.public_listing:
        public_details = {
            "id": uuid4().hex,
            "display_name": payload.public_display_name,
            "category": payload.other_category if payload.beneficiary_category == "Other" else payload.beneficiary_category,
        }
    message = json.dumps(
        {"application": private_details, "public_listing": public_details},
        ensure_ascii=False,
        separators=(",", ":"),
    )

    submission = FormSubmission(
        kind="beneficiary",
        name=payload.full_name,
        email=payload.email,
        phone=payload.phone,
        subject="Beneficiary support application",
        message=message,
        district=payload.district,
        consent_given=True,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return {"received": True, "listed": bool(public_details), "id": submission.id}


@router.get("")
def list_public_beneficiaries(db: Session = Depends(get_db)):
    submissions = (
        db.query(FormSubmission)
        .filter(FormSubmission.kind == "beneficiary")
        .order_by(FormSubmission.created_at.desc())
        .limit(500)
        .all()
    )
    profiles = []
    for submission in submissions:
        try:
            data = json.loads(submission.message)
            listing = data.get("public_listing")
            if listing and listing.get("display_name") and listing.get("category"):
                profiles.append({
                    "id": listing["id"],
                    "display_name": listing["display_name"],
                    "category": listing["category"],
                    "status": "active",
                })
        except (json.JSONDecodeError, AttributeError, TypeError, KeyError):
            continue
    return profiles
