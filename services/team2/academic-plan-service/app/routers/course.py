from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.course import Course, CourseCreate
from app.crud.course import create_course, get_course, get_all_courses, delete_course
from app.core.database import get_db

router = APIRouter()

@router.post("/", response_model=Course)
def create_course_route(course: CourseCreate, db: Session = Depends(get_db)):
    return create_course(db, course)

@router.get("/{course_id}", response_model=Course)
def read_course(course_id: int, db: Session = Depends(get_db)):
    db_course = get_course(db, course_id)
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    return db_course

@router.get("/", response_model=list[Course])
def read_all_courses(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    return get_all_courses(db, skip=skip, limit=limit)

@router.delete("/{course_id}", response_model=Course)
def delete_course_route(course_id: int, db: Session = Depends(get_db)):
    db_course = delete_course(db, course_id)
    if not db_course:
        raise HTTPException(status_code=404, detail="Course not found")
    return db_course