from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.auth import get_current_admin
from app.database import get_db
from app.models import SiteContent
from app.seed_data import SITE_CONTENT

router = APIRouter(prefix="/api/content", tags=["content"])
CONTENT_KEYS = {item[0] for item in SITE_CONTENT}


class ContentUpdate(BaseModel):
    value: str = Field(max_length=12000)


@router.get("")
def list_content(db: Session = Depends(get_db)):
    return {
        row.content_key: {"label": row.label, "page": row.page, "value": row.value}
        for row in db.query(SiteContent).filter(SiteContent.content_key.in_(CONTENT_KEYS)).order_by(SiteContent.page, SiteContent.id).all()
    }


@router.put("/{content_key}")
def update_content(
    content_key: str,
    payload: ContentUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(get_current_admin),
):
    if content_key not in CONTENT_KEYS:
        raise HTTPException(status_code=404, detail="Unknown content field")
    row = db.query(SiteContent).filter(SiteContent.content_key == content_key).first()
    if not row:
        raise HTTPException(status_code=404, detail="Unknown content field")
    row.value = payload.value.strip()
    db.commit()
    return {"key": row.content_key, "value": row.value}
