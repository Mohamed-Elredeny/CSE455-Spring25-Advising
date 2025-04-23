from pydantic import BaseModel
from typing import List, Optional

class CourseBase(BaseModel):
    code: str
    title: str
    credits: int
    description: Optional[str] = None
    prerequisites: List[str]
    semester_id: int

class CourseCreate(CourseBase):
    pass

class Course(CourseBase):
    id: int

    class Config:
        from_attributes = True