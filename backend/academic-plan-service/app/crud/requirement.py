from sqlalchemy.orm import Session
from app.models.Requirement import Requirement
from app.schemas.requirement import RequirementCreate

def create_requirements(db: Session, requirement: RequirementCreate):
    # Create multiple requirements for the given course codes
    db_requirements = [
        Requirement(
            program=requirement.program,
            type=requirement.type,
            course_code=course_code
        )
        for course_code in requirement.course_codes
    ]
    db.add_all(db_requirements)
    db.commit()
    return db_requirements

def get_all_requirements(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Requirement).offset(skip).limit(limit).all()

