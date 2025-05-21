from sqlalchemy.orm import Session
from app.models.Requirement import Requirement
from app.schemas.requirement import RequirementCreate, RequirementUpdate

def create_requirements(db: Session, requirement: RequirementCreate):
    db_requirement = Requirement(
        program=requirement.program,
        total_hours=requirement.total_hours,
        num_core_courses=requirement.num_core_courses,
        num_elective_courses=requirement.num_elective_courses
    )
    db.add(db_requirement)
    db.commit()
    db.refresh(db_requirement)
    return db_requirement

def get_all_requirements(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Requirement).offset(skip).limit(limit).all()

def update_requirement(db: Session, requirement_id: int, req_update: RequirementUpdate):
    db_req = db.query(Requirement).filter(Requirement.id == requirement_id).first()
    if not db_req:
        return None
    db_req.total_hours = req_update.total_hours
    db_req.num_core_courses = req_update.num_core_courses
    db_req.num_elective_courses = req_update.num_elective_courses
    db.commit()
    db.refresh(db_req)
    return db_req

def delete_requirement(db: Session, requirement_id: int):
    db_req = db.query(Requirement).filter(Requirement.id == requirement_id).first()
    if not db_req:
        return None
    db.delete(db_req)
    db.commit()
    return db_req