from pydantic import BaseModel
from typing import List

class Course(BaseModel):
    id: int
    code: str
    title: str
    credits: int
    description: str
    prerequisites: List[str]

    class Config:
        from_attributes = True

class SemesterBase(BaseModel):
    name: str
    academic_plan_id: int

class SemesterCreate(SemesterBase):
    pass

class Semester(SemesterBase):
    id: int
    courses: List[Course] = []  # List of course IDs

    class Config:
        from_attributes = True