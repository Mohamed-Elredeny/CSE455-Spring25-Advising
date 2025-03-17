from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any
from fastapi.responses import JSONResponse

from app.schemas.schemas import Course, CourseCreate
from app.crud import course as course_crud
from app.database.database import get_db

router = APIRouter(
    prefix="/courses",
    tags=["courses"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=Course, status_code=status.HTTP_201_CREATED)
def create_course(course: CourseCreate, db: Session = Depends(get_db)):
    db_course = course_crud.create_course(db=db, course=course)
    # Fetch the created course
    created_course = course_crud.get_course(db, course_id=db_course.course_id)
    
    # Manually convert course to clean response format
    course_dict = {
        "course_id": created_course.course_id,
        "title": created_course.title,
        "description": created_course.description,
        "instructor": created_course.instructor,
        "credits": created_course.credits,
        "department": created_course.department,
        "prerequisites": [p.course_id for p in created_course.prerequisites] if created_course.prerequisites else [],
        "sections": [{
            "id": s.id,
            "section_id": s.section_id,
            "instructor": s.instructor,
            "schedule_day": s.schedule_day,
            "schedule_time": s.schedule_time,
            "capacity": s.capacity,
            "course_id": s.course_id
        } for s in created_course.sections] if created_course.sections else []
    }
    
    return course_dict

@router.get("/", response_model=List[Course])
def read_courses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    courses = course_crud.get_courses(db, skip=skip, limit=limit)
    
    # Manually convert courses to clean response format
    response_courses = []
    for course in courses:
        course_dict = {
            "course_id": course.course_id,
            "title": course.title,
            "description": course.description,
            "instructor": course.instructor,
            "credits": course.credits,
            "department": course.department,
            "prerequisites": [p.course_id for p in course.prerequisites] if course.prerequisites else [],
            "sections": [{
                "id": s.id,
                "section_id": s.section_id,
                "instructor": s.instructor,
                "schedule_day": s.schedule_day,
                "schedule_time": s.schedule_time,
                "capacity": s.capacity,
                "course_id": s.course_id
            } for s in course.sections] if course.sections else []
        }
        response_courses.append(course_dict)
    
    return response_courses

@router.get("/{course_id}", response_model=Course)
def read_course(course_id: str, db: Session = Depends(get_db)):
    db_course = course_crud.get_course(db, course_id=course_id)
    if db_course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Manually convert course to clean response format
    course_dict = {
        "course_id": db_course.course_id,
        "title": db_course.title,
        "description": db_course.description,
        "instructor": db_course.instructor,
        "credits": db_course.credits,
        "department": db_course.department,
        "prerequisites": [p.course_id for p in db_course.prerequisites] if db_course.prerequisites else [],
        "sections": [{
            "id": s.id,
            "section_id": s.section_id,
            "instructor": s.instructor,
            "schedule_day": s.schedule_day,
            "schedule_time": s.schedule_time,
            "capacity": s.capacity,
            "course_id": s.course_id
        } for s in db_course.sections] if db_course.sections else []
    }
    
    return course_dict

@router.put("/{course_id}", response_model=Course)
def update_course(course_id: str, course: CourseCreate, db: Session = Depends(get_db)):
    db_course = course_crud.update_course(db, course_id=course_id, course_data=course)
    if db_course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Get updated course and convert to clean response format
    updated_course = course_crud.get_course(db, course_id=course_id)
    course_dict = {
        "course_id": updated_course.course_id,
        "title": updated_course.title,
        "description": updated_course.description,
        "instructor": updated_course.instructor,
        "credits": updated_course.credits,
        "department": updated_course.department,
        "prerequisites": [p.course_id for p in updated_course.prerequisites] if updated_course.prerequisites else [],
        "sections": [{
            "id": s.id,
            "section_id": s.section_id,
            "instructor": s.instructor,
            "schedule_day": s.schedule_day,
            "schedule_time": s.schedule_time,
            "capacity": s.capacity,
            "course_id": s.course_id
        } for s in updated_course.sections] if updated_course.sections else []
    }
    
    return course_dict

@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_course(course_id: str, db: Session = Depends(get_db)):
    success = course_crud.delete_course(db, course_id=course_id)
    if not success:
        raise HTTPException(status_code=404, detail="Course not found")
    return {"detail": "Course deleted successfully"} 