from sqlalchemy.orm import Session
from app.models.course import Course
from app.schemas.course import CourseCreate


def create_course(db: Session, course: CourseCreate):
    db_course = Course(
        course_id=course.course_id,  
        title=course.title,
        credits=course.credits,
        description=course.description,
        instructor=course.instructor,  
        department=course.department,  
        is_core=course.is_core,        
        level=course.level,            
        semester_id=course.semester_id
    )
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

def get_course(db: Session, course_id: str):  
    return db.query(Course).filter(Course.course_id == course_id).first()

def get_all_courses(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Course).offset(skip).limit(limit).all()

def delete_course(db: Session, course_id: int):
    db_course = db.query(Course).filter(Course.id == course_id).first()
    if db_course:
        db.delete(db_course)
        db.commit()
    return db_course