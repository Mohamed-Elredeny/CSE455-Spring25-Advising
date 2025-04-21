from typing import List, Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, model_validator

# Section schemas
class SectionBase(BaseModel):
    section_id: str
    instructor: str
    capacity: int
    schedule_day: str
    schedule_time: str

class SectionCreate(SectionBase):
    pass

class Section(SectionBase):
    id: int
    course_id: str

    model_config = ConfigDict(from_attributes=True)

# Category schemas
class CategoryBase(BaseModel):
    name: str
    description: str

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)

# Course schemas
class CourseBase(BaseModel):
    course_id: str
    title: str
    description: str
    instructor: str
    credits: int
    department: str
    is_core: bool = False
    level: Optional[int] = None

class CourseCreate(CourseBase):
    prerequisites: List[str] = []
    sections: List[SectionCreate] = []
    categories: List[str] = []  # List of category names

class PrerequisiteCourse(BaseModel):
    course_id: str
    title: str
    
    model_config = ConfigDict(from_attributes=True)

class Course(CourseBase):
    # For displaying prerequisites, we'll show the IDs
    prerequisites: List[str] = []
    sections: List[Section] = []
    categories: List[str] = []  # List of category names

    model_config = ConfigDict(from_attributes=True)
    
    @model_validator(mode='before')
    @classmethod
    def process_prerequisites(cls, data):
        if not isinstance(data, dict):
            return data
            
        # Handle prerequisites if present
        if 'prerequisites' in data and data['prerequisites']:
            # If prerequisites is a list of objects with course_id attribute
            processed_prereqs = []
            for prereq in data['prerequisites']:
                if hasattr(prereq, 'course_id'):
                    processed_prereqs.append(prereq.course_id)
                elif isinstance(prereq, str):
                    processed_prereqs.append(prereq)
            data['prerequisites'] = processed_prereqs
            
        # Process categories if present
        if 'categories' in data and data['categories']:
            processed_categories = []
            for category in data['categories']:
                if hasattr(category, 'name'):
                    processed_categories.append(category.name)
                elif isinstance(category, str):
                    processed_categories.append(category)
            data['categories'] = processed_categories
            
        return data

# For listing courses
class CourseList(BaseModel):
    courses: List[Course]

    model_config = ConfigDict(from_attributes=True)

# Dependency resolution response
class DependencyResolution(BaseModel):
    course_id: str
    title: str
    prerequisites: List[Dict[str, Any]]  # Recursive structure for prereq tree
    
    model_config = ConfigDict(from_attributes=True) 