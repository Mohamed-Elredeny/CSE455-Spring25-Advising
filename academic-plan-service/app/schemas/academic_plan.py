from pydantic import BaseModel, Field
from typing import List, Optional, Dict
from enum import Enum

class CourseCreate(BaseModel):
    code: str
    title: str
    credits: int
    description: Optional[str] = None
    prerequisites: List[str] = []

class Course(BaseModel):
    id: int
    code: str
    title: str
    credits: int
    description: Optional[str] = None
    prerequisites: List[str] = []

    class Config:
        from_attributes = True

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
    student_id: int = Field(..., description="ID of the student")
    program: str  # Add the program field
    semesters: List[SemesterCreate] = Field(..., description="List of semesters with courses")

class PlanStatus(str, Enum):
    PENDING = "PENDING"
    APPROVED = "APPROVED"
    REJECTED = "REJECTED"

class AcademicPlan(BaseModel):
    id: int
    student_id: int
    program: str  # Add the program field
    version: int  # Add the version field
    status: PlanStatus  # Add the status field 
    semesters: List[Semester] = []  # List of semesters with courses

    class Config:
        from_attributes = True