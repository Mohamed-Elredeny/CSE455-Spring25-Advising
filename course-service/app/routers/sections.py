from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from fastapi.responses import JSONResponse
import logging

from app.schemas.schemas import Section, SectionCreate
from app.crud import section as section_crud
from app.crud import course as course_crud
from app.database.database import get_db
from app.utils.error_handling import create_error_response

# Configure logger
logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/courses/{course_id}/sections",
    tags=["sections"],
    responses={
        404: {"description": "Not found", "model": Dict[str, Any]},
        422: {"description": "Validation error", "model": Dict[str, Any]},
        409: {"description": "Conflict", "model": Dict[str, Any]},
        500: {"description": "Internal server error", "model": Dict[str, Any]}
    },
)

@router.post("/", response_model=Section, status_code=status.HTTP_201_CREATED,
            responses={
                404: {"description": "Course not found"},
                409: {"description": "Section already exists"},
                422: {"description": "Validation error"}
            })
def create_section(
    course_id: str, 
    section: SectionCreate, 
    db: Session = Depends(get_db)
):
    """
    Create a new section for a course
    
    - **course_id**: ID of the course to add section to
    - **section_id**: Unique identifier for the section
    - **instructor**: Section instructor
    - **schedule_day**: Day of the week (Monday, Tuesday, etc.)
    - **schedule_time**: Time of the class
    - **capacity**: Maximum number of students
    """
    try:
        # Verify course exists
        db_course = course_crud.get_course(db, course_id=course_id)
        if db_course is None:
            logger.warning(f"Attempted to create section for non-existent course: {course_id}")
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content=create_error_response(
                    status_code=status.HTTP_404_NOT_FOUND,
                    message="Course not found",
                    details={"course_id": course_id}
                )
            )
        
        # Check if section already exists
        existing_section = section_crud.get_section(db, section_id=section.section_id, course_id=course_id)
        if existing_section:
            logger.warning(f"Attempted to create duplicate section: {section.section_id} for course {course_id}")
            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                content=create_error_response(
                    status_code=status.HTTP_409_CONFLICT,
                    message=f"Section with ID {section.section_id} already exists for this course",
                    details={"section_id": section.section_id, "course_id": course_id}
                )
            )
        
        return section_crud.create_section(db=db, section=section, course_id=course_id)
    except Exception as e:
        logger.error(f"Error creating section for course {course_id}: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=create_error_response(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message=f"Failed to create section for course {course_id}",
                details={"error": str(e)}
            )
        )

@router.get("/", response_model=List[Section],
          responses={
              404: {"description": "Course not found"}
          })
def read_sections(
    course_id: str, 
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    """
    Get all sections for a course with pagination
    
    - **course_id**: ID of the course to get sections for
    - **skip**: Number of records to skip
    - **limit**: Maximum number of records to return
    """
    try:
        # Verify course exists
        db_course = course_crud.get_course(db, course_id=course_id)
        if db_course is None:
            logger.warning(f"Attempted to get sections for non-existent course: {course_id}")
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content=create_error_response(
                    status_code=status.HTTP_404_NOT_FOUND,
                    message="Course not found",
                    details={"course_id": course_id}
                )
            )
        
        sections = section_crud.get_sections(db, course_id=course_id, skip=skip, limit=limit)
        return sections
    except Exception as e:
        logger.error(f"Error fetching sections for course {course_id}: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=create_error_response(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message=f"Failed to fetch sections for course {course_id}",
                details={"error": str(e)}
            )
        )

@router.get("/{section_id}", response_model=Section,
          responses={
              404: {"description": "Section or course not found"}
          })
def read_section(
    course_id: str, 
    section_id: str, 
    db: Session = Depends(get_db)
):
    """
    Get a specific section by ID
    
    - **course_id**: ID of the course
    - **section_id**: ID of the section to retrieve
    """
    try:
        db_section = section_crud.get_section(db, section_id=section_id, course_id=course_id)
        if db_section is None:
            logger.warning(f"Section not found: {section_id} for course {course_id}")
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content=create_error_response(
                    status_code=status.HTTP_404_NOT_FOUND,
                    message="Section not found",
                    details={"section_id": section_id, "course_id": course_id}
                )
            )
        return db_section
    except Exception as e:
        logger.error(f"Error fetching section {section_id} for course {course_id}: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=create_error_response(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message=f"Failed to fetch section {section_id} for course {course_id}",
                details={"error": str(e)}
            )
        )

@router.put("/{section_id}", response_model=Section,
          responses={
              404: {"description": "Section or course not found"},
              422: {"description": "Validation error"}
          })
def update_section(
    course_id: str, 
    section_id: str, 
    section: SectionCreate, 
    db: Session = Depends(get_db)
):
    """
    Update a section
    
    - **course_id**: ID of the course
    - **section_id**: ID of the section to update
    - **section**: Updated section data
    """
    try:
        # Verify section exists
        existing_section = section_crud.get_section(db, section_id=section_id, course_id=course_id)
        if not existing_section:
            logger.warning(f"Attempted to update non-existent section: {section_id} for course {course_id}")
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content=create_error_response(
                    status_code=status.HTTP_404_NOT_FOUND,
                    message="Section not found",
                    details={"section_id": section_id, "course_id": course_id}
                )
            )
            
        # Check if the section_id is being changed to an existing one
        if section_id != section.section_id:
            potential_conflict = section_crud.get_section(db, section_id=section.section_id, course_id=course_id)
            if potential_conflict:
                logger.warning(f"Section ID conflict when updating section: {section_id} -> {section.section_id}")
                return JSONResponse(
                    status_code=status.HTTP_409_CONFLICT,
                    content=create_error_response(
                        status_code=status.HTTP_409_CONFLICT,
                        message=f"Section with ID {section.section_id} already exists for this course",
                        details={"section_id": section.section_id, "course_id": course_id}
                    )
                )
        
        db_section = section_crud.update_section(
            db, 
            section_id=section_id, 
            course_id=course_id, 
            section_data=section
        )
        
        if db_section is None:
            logger.error(f"Failed to update section: {section_id} for course {course_id}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content=create_error_response(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    message=f"Failed to update section {section_id}",
                    details={"section_id": section_id, "course_id": course_id}
                )
            )
            
        return db_section
    except Exception as e:
        logger.error(f"Error updating section {section_id} for course {course_id}: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=create_error_response(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message=f"Failed to update section {section_id} for course {course_id}",
                details={"error": str(e)}
            )
        )

@router.delete("/{section_id}", status_code=status.HTTP_204_NO_CONTENT,
             responses={
                 404: {"description": "Section or course not found"}
             })
def delete_section(
    course_id: str, 
    section_id: str, 
    db: Session = Depends(get_db)
):
    """
    Delete a section
    
    - **course_id**: ID of the course
    - **section_id**: ID of the section to delete
    """
    try:
        # Verify section exists
        existing_section = section_crud.get_section(db, section_id=section_id, course_id=course_id)
        if not existing_section:
            logger.warning(f"Attempted to delete non-existent section: {section_id} for course {course_id}")
            return JSONResponse(
                status_code=status.HTTP_404_NOT_FOUND,
                content=create_error_response(
                    status_code=status.HTTP_404_NOT_FOUND,
                    message="Section not found",
                    details={"section_id": section_id, "course_id": course_id}
                )
            )
            
        success = section_crud.delete_section(db, section_id=section_id, course_id=course_id)
        if not success:
            logger.error(f"Failed to delete section: {section_id} for course {course_id}")
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content=create_error_response(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    message=f"Failed to delete section {section_id}",
                    details={"section_id": section_id, "course_id": course_id}
                )
            )
            
        return JSONResponse(
            status_code=status.HTTP_204_NO_CONTENT,
            content=None
        )
    except Exception as e:
        logger.error(f"Error deleting section {section_id} for course {course_id}: {str(e)}", exc_info=True)
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=create_error_response(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                message=f"Failed to delete section {section_id} for course {course_id}",
                details={"error": str(e)}
            )
        ) 