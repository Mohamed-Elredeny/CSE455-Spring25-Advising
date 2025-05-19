import uuid
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.plan_sharing import PlanSharing, AccessLevel
from fastapi import HTTPException
from app.models.academic_plan import AcademicPlan

def create_shareable_link(db: Session, academic_plan_id: int, access_level: AccessLevel, expiration_days: int = None):
    # Check if the academic plan exists
    academic_plan = db.query(AcademicPlan).filter(AcademicPlan.id == academic_plan_id).first()
    if not academic_plan:
        raise HTTPException(status_code=404, detail="Academic Plan not found")

    # Generate a unique shareable link
    shareable_link = str(uuid.uuid4())
    expiration_date = None
    if expiration_days:
        expiration_date = datetime.utcnow() + timedelta(days=expiration_days)

    # Create the PlanSharing record
    plan_sharing = PlanSharing(
        academic_plan_id=academic_plan_id,
        shareable_link=shareable_link,
        access_level=access_level,
        expiration_date=expiration_date
    )
    db.add(plan_sharing)
    db.commit()
    db.refresh(plan_sharing)
    return plan_sharing


def get_shared_plan(db: Session, shareable_link: str):
    plan_sharing = db.query(PlanSharing).filter(PlanSharing.shareable_link == shareable_link).first()
    if not plan_sharing:
        raise HTTPException(status_code=404, detail="Shared plan not found")
    if plan_sharing.expiration_date and plan_sharing.expiration_date < datetime.utcnow():
        raise HTTPException(status_code=403, detail="Shared link has expired")
    return plan_sharing.academic_plan