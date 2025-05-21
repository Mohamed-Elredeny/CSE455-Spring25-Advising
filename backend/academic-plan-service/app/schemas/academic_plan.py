from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum

class CourseCreate(BaseModel):
    course_id: str
    title: str
    description: Optional[str] = None
    instructor: Optional[str] = None
    credits: int
    department: str
    is_core: bool = False
    level: Optional[int] = None
    prerequisites: List[str] = []  # List of prerequisite course IDs

class Course(BaseModel):
    course_id: str
    title: str
    credits: int
    description: Optional[str] = None
    instructor: Optional[str] = None
    department: str
    is_core: bool = False
    level: Optional[int] = None
    prerequisites: List[str] = []  # List of prerequisite course IDs
    

    class Config:
        orm_mode = True  # Enable serialization of SQLAlchemy objects

    @classmethod
    def from_orm_with_prerequisites(cls, course):
        return cls(
            course_id=course.course_id,
            title=course.title,
            credits=course.credits,
            description=course.description,
            instructor=course.instructor,
            department=course.department,
            is_core=course.is_core,
            level=course.level,
            prerequisites=[prerequisite.course_id for prerequisite in course.prerequisites]
        )

class SemesterCreate(BaseModel):
    name: str
    courses: List[CourseCreate]

class Semester(BaseModel):
    id: int
    name: str
    courses: List[Course] = []

    class Config:
        from_attributes = True

class PlanGenerationRequest(BaseModel):
    student_id: int
    program: str
    preferences: Optional[Dict[str, int]] = None  # Optional preferences (e.g., max credits per semester)


class AcademicPlanCreate(BaseModel):
    university: str = Field(..., description="University name (e.g., 'University of XYZ')")
    department: str = Field(..., description="Department name (e.g., 'Computer Science')")
    program: str  # Add the program field
    semesters: List[SemesterCreate] = Field(..., description="List of semesters with courses")

class PlanStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class AcademicPlan(BaseModel):
    id: int
    university: str = Field(..., description="University name (e.g., 'University of XYZ')")
    department: str = Field(..., description="Department name (e.g., 'Computer Science')")
    program: str  
    version: int  
    status: PlanStatus  
    semesters: List[Semester] = []  

    class Config:
        from_attributes = True