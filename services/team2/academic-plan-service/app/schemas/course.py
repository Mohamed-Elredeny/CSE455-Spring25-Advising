from pydantic import BaseModel
from typing import List, Optional

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

    class Config:
        orm_mode = True  # Enable serialization of SQLAlchemy objects

    @classmethod
    def from_orm_with_prerequisites(cls, course):
        return cls(
            id=course.id,  \
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

class CourseCreate(CourseCreate):
    pass

class Course(CourseCreate):
    id: int

    class Config:
        from_attributes = True