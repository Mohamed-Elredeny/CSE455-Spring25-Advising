from sqlalchemy.orm import Session
from app.models.semester import Semester
from app.schemas.semester import SemesterCreate
from sqlalchemy.orm import joinedload
from app.schemas.semester import Semester as SemesterSchema

def create_semester(db: Session, semester: SemesterCreate):
    db_semester = Semester(name=semester.name, academic_plan_id=semester.academic_plan_id)
    db.add(db_semester)
    db.commit()
    db.refresh(db_semester)
    return db_semester

def get_semester(db: Session, semester_id: int):
    return db.query(Semester).filter(Semester.id == semester_id).first()

def get_all_semesters(db: Session, skip: int = 0, limit: int = 10):
    # Use joinedload to eagerly load the courses relationship
    semesters = db.query(Semester).options(joinedload(Semester.courses)).offset(skip).limit(limit).all()
    # Convert SQLAlchemy objects to Pydantic models
    return [SemesterSchema.from_orm(semester) for semester in semesters]

def delete_semester(db: Session, semester_id: int):
    db_semester = db.query(Semester).filter(Semester.id == semester_id).first()
    if db_semester:
        db.delete(db_semester)
        db.commit()
    return db_semester