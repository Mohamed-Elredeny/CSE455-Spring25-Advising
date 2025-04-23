from sqlalchemy.orm import Session, joinedload
from typing import List, Optional, Dict, Any
from sqlalchemy import delete, or_

from app.models.models import Course, Section, prerequisite_association, Category, program_category
from app.schemas.schemas import CourseCreate, SectionCreate
from app.crud import category as category_crud

# Create a new course
def create_course(db: Session, course: CourseCreate):
    # Create the course instance
    db_course = Course(
        course_id=course.course_id,
        title=course.title,
        description=course.description,
        instructor=course.instructor,
        credits=course.credits,
        department=course.department,
        is_core=course.is_core,
        level=course.level
    )
    
    db.add(db_course)
    db.commit()
    
    # Add prerequisites if any
    if course.prerequisites:
        add_prerequisites(db, course.course_id, course.prerequisites)
    
    # Add categories if any
    if course.categories:
        add_categories_to_course(db, course.course_id, course.categories)
    
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
        joinedload(Course.sections),
        joinedload(Course.categories)
    ).filter(Course.course_id == course_id).first()

# Get all courses
def get_courses(db: Session, skip: int = 0, limit: int = 100):
    # Use joinedload to ensure prerequisites are loaded
    return db.query(Course).options(
        joinedload(Course.prerequisites),
        joinedload(Course.sections),
        joinedload(Course.categories)
    ).offset(skip).limit(limit).all()

# Update a course
def update_course(db: Session, course_id: str, course_data: CourseCreate):
    db_course = db.query(Course).filter(Course.course_id == course_id).first()
    
    if db_course:
        # Update course attributes
        update_data = course_data.model_dump(exclude={'prerequisites', 'sections', 'categories'})
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
        
        # Handle categories update
        # Clear existing categories
        db.execute(
            delete(program_category).where(
                program_category.c.course_id == course_id
            )
        )
        
        # Add new categories
        if course_data.categories:
            add_categories_to_course(db, course_id, course_data.categories)
        
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

# Helper function to add categories to a course
def add_categories_to_course(db: Session, course_id: str, category_names: List[str]):
    for category_name in category_names:
        # First, check if category exists
        db_category = category_crud.get_category_by_name(db, name=category_name)
        
        # If category doesn't exist, create it
        if not db_category:
            from app.schemas.schemas import CategoryCreate
            db_category = category_crud.create_category(
                db, 
                CategoryCreate(name=category_name, description=f"Auto-created category for {category_name}")
            )
            
        # Add relationship between course and category
        db.execute(
            program_category.insert().values(
                course_id=course_id,
                category_id=db_category.id
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
        joinedload(Course.sections),
        joinedload(Course.categories)
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
    elif search_by == "category":
        # Filter by category name
        filtered_query = base_query.join(Course.categories).filter(Category.name.ilike(search_term))
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

# Get courses by category
def get_courses_by_category(db: Session, category_name: str, skip: int = 0, limit: int = 100):
    """Get all courses in a specific category"""
    return db.query(Course).options(
        joinedload(Course.prerequisites),
        joinedload(Course.sections),
        joinedload(Course.categories)
    ).join(Course.categories).filter(
        Category.name == category_name
    ).offset(skip).limit(limit).all()

# Get core courses
def get_core_courses(db: Session, skip: int = 0, limit: int = 100):
    """Get all core courses"""
    return db.query(Course).options(
        joinedload(Course.prerequisites),
        joinedload(Course.sections),
        joinedload(Course.categories)
    ).filter(
        Course.is_core == True
    ).offset(skip).limit(limit).all()

# Get courses by level
def get_courses_by_level(db: Session, level: int, skip: int = 0, limit: int = 100):
    """Get all courses at a specific level"""
    return db.query(Course).options(
        joinedload(Course.prerequisites),
        joinedload(Course.sections),
        joinedload(Course.categories)
    ).filter(
        Course.level == level
    ).offset(skip).limit(limit).all()

# Resolve course dependencies
def resolve_dependencies(db: Session, course_id: str, visited=None) -> Dict:
    """
    Recursively resolve all prerequisites for a course
    
    Args:
        db: Database session
        course_id: The course ID to resolve dependencies for
        visited: Set of visited course IDs (to prevent cycles)
        
    Returns:
        Dictionary representing the dependency tree
    """
    if visited is None:
        visited = set()
        
    # Prevent infinite recursion due to circular dependencies
    if course_id in visited:
        return None
        
    visited.add(course_id)
    
    # Get the course
    course = get_course(db, course_id)
    if not course:
        return None
        
    # Build dependency tree
    prereq_tree = []
    for prereq in course.prerequisites:
        prereq_data = {
            "course_id": prereq.course_id,
            "title": prereq.title,
            "prerequisites": []
        }
        
        # Recursively get prerequisites of this prerequisite
        sub_prereqs = resolve_dependencies(db, prereq.course_id, visited.copy())
        if sub_prereqs:
            prereq_data["prerequisites"] = sub_prereqs
            
        prereq_tree.append(prereq_data)
        
    return prereq_tree

# Check if a student has met all prerequisites for a course
def check_prerequisites_met(db: Session, course_id: str, completed_courses: List[str]) -> Dict[str, Any]:
    """
    Check if all prerequisites for a course have been met
    
    Args:
        db: Database session
        course_id: The course ID to check prerequisites for
        completed_courses: List of course IDs the student has completed
        
    Returns:
        Dictionary with 'met' boolean and 'missing' list of missing prerequisites
    """
    course = get_course(db, course_id)
    if not course:
        return {"met": False, "error": "Course not found"}
        
    if not course.prerequisites:
        return {"met": True, "missing": []}
        
    # Check if all prerequisites are in completed_courses
    missing_prereqs = []
    for prereq in course.prerequisites:
        if prereq.course_id not in completed_courses:
            missing_prereqs.append({
                "course_id": prereq.course_id,
                "title": prereq.title
            })
            
    return {
        "met": len(missing_prereqs) == 0,
        "missing": missing_prereqs
    } 