from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from sqlalchemy import delete, or_

from app.models.models import Course, Section, prerequisite_association
from app.schemas.schemas import CourseCreate, SectionCreate

# Create a new course
def create_course(db: Session, course: CourseCreate):
    # Create the course instance
    db_course = Course(
        course_id=course.course_id,
        title=course.title,
        description=course.description,
        instructor=course.instructor,
        credits=course.credits,
        department=course.department
    )
    
    db.add(db_course)
    db.commit()
    
    # Add prerequisites if any
    if course.prerequisites:
        add_prerequisites(db, course.course_id, course.prerequisites)
    
    # Add sections if any
    for section in course.sections:
        db_section = Section(
            section_id=section.section_id,
            instructor=section.instructor,
            schedule_day=section.schedule_day,
            schedule_time=section.schedule_time,
            capacity=section.capacity,
            course_id=course.course_id
        )
        db.add(db_section)
    
    db.commit()
    db.refresh(db_course)
    return db_course

# Get course by ID
def get_course(db: Session, course_id: str):
    # Use joinedload to ensure prerequisites are loaded
    return db.query(Course).options(
        joinedload(Course.prerequisites),
        joinedload(Course.sections)
    ).filter(Course.course_id == course_id).first()

# Get all courses
def get_courses(db: Session, skip: int = 0, limit: int = 100):
    # Use joinedload to ensure prerequisites are loaded
    return db.query(Course).options(
        joinedload(Course.prerequisites),
        joinedload(Course.sections)
    ).offset(skip).limit(limit).all()

# Update a course
def update_course(db: Session, course_id: str, course_data: CourseCreate):
    db_course = db.query(Course).filter(Course.course_id == course_id).first()
    
    if db_course:
        # Update course attributes
        update_data = course_data.model_dump(exclude={'prerequisites', 'sections'})
        for key, value in update_data.items():
            setattr(db_course, key, value)
        
        # Handle prerequisites update
        # Clear existing prerequisites
        db.execute(
            delete(prerequisite_association).where(
                prerequisite_association.c.course_id == course_id
            )
        )
        
        # Add new prerequisites
        if course_data.prerequisites:
            add_prerequisites(db, course_id, course_data.prerequisites)
        
        # Handle sections update
        # Delete existing sections
        db.query(Section).filter(Section.course_id == course_id).delete()
        
        # Add new sections
        for section in course_data.sections:
            db_section = Section(
                section_id=section.section_id,
                instructor=section.instructor,
                schedule_day=section.schedule_day,
                schedule_time=section.schedule_time,
                capacity=section.capacity,
                course_id=course_id
            )
            db.add(db_section)
        
        db.commit()
        db.refresh(db_course)
    
    return db_course

# Delete a course
def delete_course(db: Session, course_id: str):
    db_course = db.query(Course).filter(Course.course_id == course_id).first()
    
    if db_course:
        db.delete(db_course)
        db.commit()
        return True
    
    return False

# Helper function to add prerequisites
def add_prerequisites(db: Session, course_id: str, prerequisite_ids: List[str]):
    for prereq_id in prerequisite_ids:
        # Check if prerequisite course exists
        prereq_course = db.query(Course).filter(Course.course_id == prereq_id).first()
        if prereq_course:
            # Insert into association table
            db.execute(
                prerequisite_association.insert().values(
                    course_id=course_id,
                    prerequisite_id=prereq_id
                )
            )
    db.commit()

# Search for courses
def search_courses(db: Session, query: str, search_by: str = "all"):
    """
    Search for courses based on different criteria
    
    Args:
        db: Database session
        query: Search query string
        search_by: Field to search in (all, title, description, instructor, department, course_id)
        
    Returns:
        List of courses that match the search criteria
    """
    # Create base query with eager loading of relationships
    base_query = db.query(Course).options(
        joinedload(Course.prerequisites),
        joinedload(Course.sections)
    )
    
    # Apply search filter based on search_by parameter
    search_term = f"%{query}%"  # Add wildcards for LIKE query
    
    if search_by == "all":
        # Search in all text fields
        filtered_query = base_query.filter(
            or_(
                Course.title.ilike(search_term),
                Course.description.ilike(search_term),
                Course.instructor.ilike(search_term),
                Course.department.ilike(search_term),
                Course.course_id.ilike(search_term)
            )
        )
    elif search_by == "title":
        filtered_query = base_query.filter(Course.title.ilike(search_term))
    elif search_by == "description":
        filtered_query = base_query.filter(Course.description.ilike(search_term))
    elif search_by == "instructor":
        filtered_query = base_query.filter(Course.instructor.ilike(search_term))
    elif search_by == "department":
        filtered_query = base_query.filter(Course.department.ilike(search_term))
    elif search_by == "course_id":
        filtered_query = base_query.filter(Course.course_id.ilike(search_term))
    else:
        # Default to search all if an invalid search_by value is provided
        filtered_query = base_query.filter(
            or_(
                Course.title.ilike(search_term),
                Course.description.ilike(search_term),
                Course.instructor.ilike(search_term),
                Course.department.ilike(search_term),
                Course.course_id.ilike(search_term)
            )
        )
    
    return filtered_query.all() 