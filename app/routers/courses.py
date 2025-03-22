from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any, Optional, Dict
from fastapi.responses import JSONResponse

from app.schemas.schemas import Course, CourseCreate, DependencyResolution
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
        "is_core": created_course.is_core,
        "level": created_course.level,
        "prerequisites": [p.course_id for p in created_course.prerequisites] if created_course.prerequisites else [],
        "categories": [c.name for c in created_course.categories] if created_course.categories else [],
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
            "is_core": course.is_core,
            "level": course.level,
            "prerequisites": [p.course_id for p in course.prerequisites] if course.prerequisites else [],
            "categories": [c.name for c in course.categories] if course.categories else [],
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
        "is_core": db_course.is_core,
        "level": db_course.level,
        "prerequisites": [p.course_id for p in db_course.prerequisites] if db_course.prerequisites else [],
        "categories": [c.name for c in db_course.categories] if db_course.categories else [],
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
        "is_core": updated_course.is_core,
        "level": updated_course.level,
        "prerequisites": [p.course_id for p in updated_course.prerequisites] if updated_course.prerequisites else [],
        "categories": [c.name for c in updated_course.categories] if updated_course.categories else [],
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

@router.get("/search/", response_model=List[Course])
def search_courses(
    query: str,
    search_by: Optional[str] = "all",  # all, title, description, instructor, department, course_id, category
    db: Session = Depends(get_db)
):
    """
    Search for courses based on various criteria.
    - query: The search term
    - search_by: Field to search in (all, title, description, instructor, department, course_id, category)
    """
    courses = course_crud.search_courses(db, query=query, search_by=search_by)
    
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
            "is_core": course.is_core,
            "level": course.level,
            "prerequisites": [p.course_id for p in course.prerequisites] if course.prerequisites else [],
            "categories": [c.name for c in course.categories] if course.categories else [],
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

@router.get("/by-category/{category_name}", response_model=List[Course])
def get_courses_by_category(
    category_name: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all courses in a specific category"""
    courses = course_crud.get_courses_by_category(db, category_name=category_name, skip=skip, limit=limit)
    
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
            "is_core": course.is_core,
            "level": course.level,
            "prerequisites": [p.course_id for p in course.prerequisites] if course.prerequisites else [],
            "categories": [c.name for c in course.categories] if course.categories else [],
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

@router.get("/core/", response_model=List[Course])
def get_core_courses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all core courses"""
    courses = course_crud.get_core_courses(db, skip=skip, limit=limit)
    
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
            "is_core": course.is_core,
            "level": course.level,
            "prerequisites": [p.course_id for p in course.prerequisites] if course.prerequisites else [],
            "categories": [c.name for c in course.categories] if course.categories else [],
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

@router.get("/by-level/{level}", response_model=List[Course])
def get_courses_by_level(
    level: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all courses at a specific level"""
    courses = course_crud.get_courses_by_level(db, level=level, skip=skip, limit=limit)
    
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
            "is_core": course.is_core,
            "level": course.level,
            "prerequisites": [p.course_id for p in course.prerequisites] if course.prerequisites else [],
            "categories": [c.name for c in course.categories] if course.categories else [],
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

@router.get("/{course_id}/dependencies", response_model=Dict[str, Any])
def get_course_dependencies(course_id: str, db: Session = Depends(get_db)):
    """Get the dependency tree for a course"""
    # First check if course exists
    db_course = course_crud.get_course(db, course_id=course_id)
    if db_course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Resolve dependencies
    dependencies = course_crud.resolve_dependencies(db, course_id=course_id)
    
    return {
        "course_id": db_course.course_id,
        "title": db_course.title,
        "prerequisites": dependencies or []
    }

@router.post("/{course_id}/check-prerequisites", response_model=Dict[str, Any])
def check_prerequisites(
    course_id: str,
    completed_courses: List[str],
    db: Session = Depends(get_db)
):
    """Check if all prerequisites for a course have been met"""
    # First check if course exists
    db_course = course_crud.get_course(db, course_id=course_id)
    if db_course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Check prerequisites
    result = course_crud.check_prerequisites_met(db, course_id=course_id, completed_courses=completed_courses)
    
    return result 