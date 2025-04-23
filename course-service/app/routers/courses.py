from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any, Optional, Dict
from fastapi.responses import JSONResponse
import logging

from app.schemas.schemas import Course, CourseCreate, DependencyResolution
from app.crud import course as course_crud
from app.database.database import get_db
from app.utils.error_handling import create_error_response, ResourceNotFoundError, ValidationFailedError, DuplicateResourceError
from app.utils.catalog_client import CatalogClient

# Configure logger
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/courses",
    tags=["courses"],
    responses={
        404: {"description": "Not found", "model": Dict[str, Any]},
        422: {"description": "Validation error", "model": Dict[str, Any]},
        409: {"description": "Conflict", "model": Dict[str, Any]},
        500: {"description": "Internal server error", "model": Dict[str, Any]}
    },
)

@router.post("/", response_model=Course, status_code=status.HTTP_201_CREATED, 
             responses={
                 409: {"description": "Course already exists", 
                       "content": {"application/json": {"example": create_error_response(409, "Course already exists", {"course_id": "CS101"})}}},
                 422: {"description": "Validation error"}
             })
def create_course(course: CourseCreate, db: Session = Depends(get_db)):
    """
    Create a new course
    
    - **course_id**: Unique identifier for the course
    - **title**: Title of the course
    - **description**: Description of the course
    - **instructor**: Course instructor name
    - **credits**: Number of credits
    - **department**: Department offering the course
    - **is_core**: Whether it's a core course
    - **level**: Course level (100, 200, etc.)
    - **prerequisites**: List of prerequisite course IDs
    - **categories**: List of category names
    - **sections**: List of sections for this course
    """
    try:
        # Check if course already exists
        existing_course = course_crud.get_course(db, course_id=course.course_id)
        if existing_course:
            logger.warning(f"Attempted to create duplicate course with ID: {course.course_id}")
            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                content=create_error_response(
                    status_code=status.HTTP_409_CONFLICT,
                    message=f"Course with ID {course.course_id} already exists",
                    details={"course_id": course.course_id}
                )
            )
            
        db_course = course_crud.create_course(db=db, course=course)
        
        # Fetch the created course
        created_course = course_crud.get_course(db, course_id=db_course.course_id)
        if not created_course:
            logger.error(f"Failed to retrieve newly created course: {course.course_id}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content=create_error_response(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    message="Failed to retrieve newly created course",
                    details={"course_id": course.course_id}
                )
            )
        
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
    except Exception as e:
        logger.error(f"Error creating course: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=create_error_response(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message="Failed to create course",
                details={"error": str(e)}
            )
        )

@router.get("/", response_model=List[Course])
def read_courses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """
    Get all courses with pagination
    
    - **skip**: Number of records to skip
    - **limit**: Maximum number of records to return
    """
    try:
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
    except Exception as e:
        logger.error(f"Error fetching courses: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=create_error_response(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message="Failed to fetch courses",
                details={"error": str(e)}
            )
        )

@router.get("/{course_id}", response_model=Course, 
           responses={
               404: {"description": "Course not found", 
                     "content": {"application/json": {"example": create_error_response(404, "Course not found", {"course_id": "UNKNOWN101"})}}}
           })
def read_course(course_id: str, db: Session = Depends(get_db)):
    """
    Get a specific course by ID
    
    - **course_id**: ID of the course to retrieve
    """
    try:
        db_course = course_crud.get_course(db, course_id=course_id)
        if db_course is None:
            logger.warning(f"Course not found: {course_id}")
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content=create_error_response(
                    status_code=status.HTTP_404_NOT_FOUND,
                    message="Course not found",
                    details={"course_id": course_id}
                )
            )
        
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
    except Exception as e:
        logger.error(f"Error fetching course {course_id}: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=create_error_response(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message=f"Failed to fetch course {course_id}",
                details={"error": str(e)}
            )
        )

@router.put("/{course_id}", response_model=Course,
           responses={
               404: {"description": "Course not found"},
               422: {"description": "Validation error"}
           })
def update_course(course_id: str, course: CourseCreate, db: Session = Depends(get_db)):
    """
    Update a course
    
    - **course_id**: ID of the course to update
    - **course**: Updated course data
    """
    try:
        # Check if course exists first
        existing_course = course_crud.get_course(db, course_id=course_id)
        if not existing_course:
            logger.warning(f"Attempted to update non-existent course: {course_id}")
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content=create_error_response(
                    status_code=status.HTTP_404_NOT_FOUND,
                    message=f"Course with ID {course_id} not found",
                    details={"course_id": course_id}
                )
            )
            
        # Update the course
        db_course = course_crud.update_course(db, course_id=course_id, course_data=course)
        if db_course is None:
            logger.error(f"Failed to update course: {course_id}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content=create_error_response(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    message=f"Failed to update course {course_id}",
                    details={"course_id": course_id}
                )
            )
        
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
    except Exception as e:
        logger.error(f"Error updating course {course_id}: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=create_error_response(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message=f"Failed to update course {course_id}",
                details={"error": str(e)}
            )
        )

@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT,
              responses={
                  404: {"description": "Course not found"}
              })
def delete_course(course_id: str, db: Session = Depends(get_db)):
    """
    Delete a course
    
    - **course_id**: ID of the course to delete
    """
    try:
        # Check if course exists first
        existing_course = course_crud.get_course(db, course_id=course_id)
        if not existing_course:
            logger.warning(f"Attempted to delete non-existent course: {course_id}")
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content=create_error_response(
                    status_code=status.HTTP_404_NOT_FOUND,
                    message=f"Course with ID {course_id} not found",
                    details={"course_id": course_id}
                )
            )
            
        success = course_crud.delete_course(db, course_id=course_id)
        if not success:
            logger.error(f"Failed to delete course: {course_id}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content=create_error_response(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    message=f"Failed to delete course {course_id}",
                    details={"course_id": course_id}
                )
            )
        
        return JSONResponse(
            status_code=status.HTTP_204_NO_CONTENT,
            content=None
        )
    except Exception as e:
        logger.error(f"Error deleting course {course_id}: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=create_error_response(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message=f"Failed to delete course {course_id}",
                details={"error": str(e)}
            )
        )

@router.get("/search/", response_model=List[Course])
def search_courses(
    query: str,
    search_by: Optional[str] = "all",  # all, title, description, instructor, department, course_id, category
    db: Session = Depends(get_db)
):
    """
    Search for courses based on various criteria.
    
    - **query**: The search term
    - **search_by**: Field to search in (all, title, description, instructor, department, course_id, category)
    """
    try:
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
    except Exception as e:
        logger.error(f"Error searching courses: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=create_error_response(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message="Failed to search courses",
                details={"error": str(e), "query": query, "search_by": search_by}
            )
        )

@router.get("/by-category/{category_name}", response_model=List[Course],
          responses={
              404: {"description": "Category not found"}
          })
def get_courses_by_category(
    category_name: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all courses in a specific category
    
    - **category_name**: Name of the category to filter by
    - **skip**: Number of records to skip
    - **limit**: Maximum number of records to return
    """
    try:
        # Check if category exists
        from app.crud import category as category_crud
        category = category_crud.get_category_by_name(db, name=category_name)
        if not category:
            logger.warning(f"Category not found: {category_name}")
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content=create_error_response(
                    status_code=status.HTTP_404_NOT_FOUND,
                    message="Category not found",
                    details={"category_name": category_name}
                )
            )
        
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
    except Exception as e:
        logger.error(f"Error fetching courses by category {category_name}: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=create_error_response(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message=f"Failed to fetch courses by category {category_name}",
                details={"error": str(e)}
            )
        )

@router.get("/core/", response_model=List[Course])
def get_core_courses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all core courses
    
    - **skip**: Number of records to skip
    - **limit**: Maximum number of records to return
    """
    try:
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
    except Exception as e:
        logger.error(f"Error fetching core courses: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=create_error_response(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message="Failed to fetch core courses",
                details={"error": str(e)}
            )
        )

@router.get("/by-level/{level}", response_model=List[Course],
           responses={
               422: {"description": "Invalid level value"}
           })
def get_courses_by_level(
    level: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Get all courses at a specific level
    
    - **level**: Course level (e.g., 100, 200, etc.)
    - **skip**: Number of records to skip
    - **limit**: Maximum number of records to return
    """
    try:
        # Validate level
        if level <= 0:
            logger.warning(f"Invalid level value: {level}")
            return JSONResponse(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                content=create_error_response(
                    status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                    message="Invalid level value",
                    details={"level": level, "error": "Level must be a positive integer"}
                )
            )
        
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
    except Exception as e:
        logger.error(f"Error fetching courses by level {level}: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=create_error_response(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message=f"Failed to fetch courses by level {level}",
                details={"error": str(e)}
            )
        )

@router.get("/{course_id}/dependencies", response_model=Dict[str, Any],
          responses={
              404: {"description": "Course not found"}
          })
def get_course_dependencies(course_id: str, db: Session = Depends(get_db)):
    """
    Get the dependency tree for a course
    
    - **course_id**: ID of the course to get dependencies for
    """
    try:
        # First check if course exists
        db_course = course_crud.get_course(db, course_id=course_id)
        if db_course is None:
            logger.warning(f"Course not found while fetching dependencies: {course_id}")
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content=create_error_response(
                    status_code=status.HTTP_404_NOT_FOUND,
                    message="Course not found",
                    details={"course_id": course_id}
                )
            )
        
        # Resolve dependencies
        dependencies = course_crud.resolve_dependencies(db, course_id=course_id)
        
        return {
            "course_id": db_course.course_id,
            "title": db_course.title,
            "prerequisites": dependencies or []
        }
    except Exception as e:
        logger.error(f"Error fetching dependencies for course {course_id}: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=create_error_response(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message=f"Failed to fetch dependencies for course {course_id}",
                details={"error": str(e)}
            )
        )

@router.post("/{course_id}/check-prerequisites", response_model=Dict[str, Any],
           responses={
               404: {"description": "Course not found"},
               422: {"description": "Invalid input"}
           })
def check_prerequisites(
    course_id: str,
    completed_courses: List[str],
    db: Session = Depends(get_db)
):
    """
    Check if all prerequisites for a course have been met
    
    - **course_id**: ID of the course to check prerequisites for
    - **completed_courses**: List of completed course IDs
    """
    try:
        # First check if course exists
        db_course = course_crud.get_course(db, course_id=course_id)
        if db_course is None:
            logger.warning(f"Course not found while checking prerequisites: {course_id}")
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content=create_error_response(
                    status_code=status.HTTP_404_NOT_FOUND,
                    message="Course not found",
                    details={"course_id": course_id}
                )
            )
        
        # Check prerequisites
        result = course_crud.check_prerequisites_met(db, course_id=course_id, completed_courses=completed_courses)
        
        return result
    except Exception as e:
        logger.error(f"Error checking prerequisites for course {course_id}: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=create_error_response(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message=f"Failed to check prerequisites for course {course_id}",
                details={"error": str(e)}
            )
        ) 

@router.get("/catalog", response_model=List[Course])
async def get_all_courses_from_catalog():
    client = CatalogClient()
    try:
        courses = await client.get_all_courses()
        await client.close()
        return courses
    except Exception as e:
        await client.close()
        raise HTTPException(status_code=500, detail=f"Catalog service error: {str(e)}")

@router.get("/catalog/{course_id}", response_model=Course)
async def get_course_from_catalog(course_id: str):
    client = CatalogClient()
    try:
        course = await client.get_course(course_id)
        await client.close()
        return course
    except Exception as e:
        await client.close()
        raise HTTPException(status_code=500, detail=f"Catalog service error: {str(e)}")