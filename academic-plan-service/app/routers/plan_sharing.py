from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.crud.plan_sharing import create_shareable_link
from app.models.plan_sharing import AccessLevel
from app.crud.plan_sharing import get_shared_plan
from app.models.academic_plan import AcademicPlan

router = APIRouter()

@router.post("/academic-plans/{academic_plan_id}/share", response_model=dict)
def share_plan(academic_plan_id: int, access_level: AccessLevel, expiration_days: int = None, db: Session = Depends(get_db)):
    shared_link = create_shareable_link(db, academic_plan_id, access_level, expiration_days)
    return {"shareable_link": shared_link.shareable_link}



@router.get("/academic-plans/shared/{shareable_link}", response_model=AcademicPlan)
def access_shared_plan(shareable_link: str, db: Session = Depends(get_db)):
    return get_shared_plan(db, shareable_link)