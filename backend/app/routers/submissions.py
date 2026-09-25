from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.auth import get_current_admin
from app.database import get_db
from app.models import FormSubmission
from app.schemas import SubmissionCreate, SubmissionOut

router = APIRouter(prefix="/api/submissions", tags=["submissions"])


@router.post("", status_code=201)
def submit_form(payload: SubmissionCreate, db: Session = Depends(get_db)):
    if not payload.consent:
        raise HTTPException(status_code=400, detail="Consent is required to submit this form")
    if payload.website:
        return {"received": True}

    submission = FormSubmission(
        kind=payload.kind,
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        subject=payload.subject,
        message=payload.message,
        district=payload.district,
        skill=payload.skill,
        amount=payload.amount,
        cause=payload.cause,
        consent_given=True,
    )
    db.add(submission)
    db.commit()
    db.refresh(submission)
    return {"received": True, "id": submission.id}


@router.get("", response_model=list[SubmissionOut])
def list_submissions(
    limit: int = Query(default=200, ge=1, le=500),
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    return db.query(FormSubmission).order_by(FormSubmission.created_at.desc()).limit(limit).all()


@router.delete("/{submission_id}", status_code=204)
def delete_submission(
    submission_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    submission = db.query(FormSubmission).filter(FormSubmission.id == submission_id).first()
    if not submission:
        raise HTTPException(status_code=404, detail="Submission not found")
    db.delete(submission)
    db.commit()
