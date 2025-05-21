from pydantic import BaseModel
from typing import List, Optional

class Course(BaseModel):
    course_id: str
    title: str
    credits: int
    description: Optional[str] = None
    prerequisites: List[str] = []  

    class Config:
        from_attributes = True

class SemesterBase(BaseModel):
    name: str
    academic_plan_id: int

class SemesterCreate(SemesterBase):
    pass

class Semester(SemesterBase):
    id: int
    courses: List[Course] = []  # List of Course objects

    class Config:
        from_attributes = True